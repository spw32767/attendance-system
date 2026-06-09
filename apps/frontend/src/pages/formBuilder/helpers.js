import { CHOICE_FIELD_TYPES } from "../../constants/formBuilder";

let idCounter = 0;

export const createClientId = (prefix) => {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
};

export const toSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

// toSlug strips non-ASCII, so a Thai-only name yields "". Fall back to a
// short random slug so the "auto-generate" button always produces a usable
// (and editable) value instead of looking like it did nothing.
export const toSlugOrFallback = (value) =>
  toSlug(value) || `form-${Math.random().toString(36).slice(2, 8)}`;

export const toOptionValue = (value, index) => {
  const cleaned = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned || `option_${index + 1}`;
};

export const isChoiceType = (fieldType) => CHOICE_FIELD_TYPES.has(fieldType);
export const supportsUniqueValue = (fieldType) =>
  ["short_text", "long_text", "date", "time"].includes(fieldType);
export const supportsPlaceholder = (fieldType) =>
  ["short_text", "long_text"].includes(fieldType);

export const normalizeFileSettings = (settings) => {
  const maxSize = Number(settings?.max_file_size_mb || 10);
  const maxCount = Number(settings?.max_file_count || 1);
  return {
    max_file_size_mb: Math.max(1, Math.min(maxSize, 50)),
    max_file_count: Math.max(1, Math.min(maxCount, 5)),
    allowed_file_types: settings?.allowed_file_types || "pdf,jpg,jpeg,png"
  };
};

export const sequenceOptions = (options = []) =>
  options.map((option, index) => ({
    ...option,
    sort_order: index + 1
  }));

export const normalizeRatingSettings = (settings) => {
  const rawMin = Number(settings?.rating_min || 1);
  const rawMax = Number(settings?.rating_max || 5);
  const safeMin = Math.max(1, Math.min(rawMin, 9));
  const safeMax = Math.max(safeMin + 1, Math.min(rawMax, 10));
  return {
    rating_min: safeMin,
    rating_max: safeMax
  };
};

export const createChoiceOption = (index) => {
  const optionLabel = `ตัวเลือก ${index + 1}`;
  return {
    id: createClientId("opt"),
    option_label: optionLabel,
    option_value: toOptionValue(optionLabel, index),
    sort_order: index + 1
  };
};

export const createField = (fieldType = "short_text", sortOrder = 1) => {
  const baseField = {
    id: createClientId("fld"),
    field_code: `field_${sortOrder}`,
    field_label: "",
    field_description: "",
    placeholder: "",
    field_type: fieldType,
    field_usage: "general",
    is_required: false,
    is_unique_value: false,
    allow_other_option: false,
    sort_order: sortOrder,
    settings_json: {},
    options: []
  };

  if (isChoiceType(fieldType)) {
    return {
      ...baseField,
      options: [createChoiceOption(0), createChoiceOption(1)]
    };
  }

  if (fieldType === "rating") {
    return {
      ...baseField,
      settings_json: { rating_min: 1, rating_max: 5 }
    };
  }

  if (fieldType === "file_upload") {
    return {
      ...baseField,
      settings_json: normalizeFileSettings()
    };
  }

  return baseField;
};

export const applyFieldTypePreset = (field, fieldType) => {
  const nextField = { ...field, field_type: fieldType };

  if (isChoiceType(fieldType)) {
    nextField.options =
      field.options && field.options.length > 0
        ? sequenceOptions(field.options)
        : [createChoiceOption(0), createChoiceOption(1)];
  } else {
    nextField.options = [];
    nextField.allow_other_option = false;
  }

  if (fieldType === "rating") {
    nextField.settings_json = normalizeRatingSettings(field.settings_json);
  } else if (fieldType === "file_upload") {
    nextField.settings_json = normalizeFileSettings(field.settings_json);
  } else {
    nextField.settings_json = {};
  }

  if (!supportsUniqueValue(fieldType)) {
    nextField.is_unique_value = false;
  }
  if (!supportsPlaceholder(fieldType)) {
    nextField.placeholder = "";
  }

  return nextField;
};

export const normalizeField = (field, index) => {
  const fieldType = field.field_type || "short_text";
  const normalizedField = {
    id: field.id || createClientId("fld"),
    field_code: field.field_code || `field_${index + 1}`,
    field_label: field.field_label || "",
    field_description: field.field_description || "",
    placeholder: field.placeholder || "",
    field_type: fieldType,
    field_usage: field.field_usage || "general",
    is_required: Boolean(field.is_required),
    is_unique_value: Boolean(field.is_unique_value),
    allow_other_option: Boolean(field.allow_other_option),
    sort_order: index + 1,
    settings_json: {},
    options: []
  };

  if (isChoiceType(fieldType)) {
    const inputOptions = field.options || [];
    normalizedField.options = sequenceOptions(
      inputOptions.length > 0
        ? inputOptions.map((option, optionIndex) => ({
            id: option.id || createClientId("opt"),
            option_label: option.option_label || `ตัวเลือก ${optionIndex + 1}`,
            option_value:
              option.option_value || toOptionValue(option.option_label, optionIndex),
            sort_order: optionIndex + 1
          }))
        : [createChoiceOption(0), createChoiceOption(1)]
    );
  }

  if (fieldType === "rating") {
    normalizedField.settings_json = normalizeRatingSettings(field.settings_json);
  } else if (fieldType === "file_upload") {
    normalizedField.settings_json = normalizeFileSettings(field.settings_json);
  }

  return normalizedField;
};

export const resequenceFields = (fields) =>
  fields.map((field, index) => ({
    ...field,
    sort_order: index + 1,
    options: isChoiceType(field.field_type) ? sequenceOptions(field.options) : []
  }));

export const createInitialDraft = (
  existingDraft,
  defaultProjectId = null,
  availableProjects = []
) => {
  if (existingDraft) {
    return {
      ...existingDraft,
      form_description: existingDraft.form_description || "",
      fields: resequenceFields(existingDraft.fields.map(normalizeField))
    };
  }

  const fallbackProjectId =
    Number(defaultProjectId) || availableProjects[0]?.project_id || 1;

  return {
    project_id: fallbackProjectId,
    form_name: "",
    form_description: "",
    public_path: "",
    form_type: "attendance",
    status: "draft",
    allow_multiple_submissions: false,
    start_at: "",
    end_at: "",
    success_title: "ส่งแบบฟอร์มสำเร็จ",
    success_message: "ขอบคุณ ระบบได้บันทึกคำตอบของคุณเรียบร้อยแล้ว",
    fields: [createField("short_text", 1)]
  };
};
