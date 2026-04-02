import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import {
  CHOICE_FIELD_TYPES,
  FIELD_TYPES,
  FORM_STATUSES,
  FORM_TYPES
} from "../constants/formBuilder";
import {
  getTemplateById,
  getTemplateDraftById,
  projectOptions
} from "../mock/templates";

let idCounter = 0;

const createClientId = (prefix) => {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
};

const toSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const toOptionValue = (value, index) => {
  const cleaned = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return cleaned || `option_${index + 1}`;
};

const isChoiceType = (fieldType) => CHOICE_FIELD_TYPES.has(fieldType);

const sequenceOptions = (options = []) =>
  options.map((option, index) => ({
    ...option,
    sort_order: index + 1
  }));

const normalizeRatingSettings = (settings) => {
  const rawMin = Number(settings?.rating_min || 1);
  const rawMax = Number(settings?.rating_max || 5);
  const safeMin = Math.max(1, Math.min(rawMin, 9));
  const safeMax = Math.max(safeMin + 1, Math.min(rawMax, 10));

  return {
    rating_min: safeMin,
    rating_max: safeMax
  };
};

const createChoiceOption = (index) => {
  const optionLabel = `ตัวเลือก ${index + 1}`;
  return {
    id: createClientId("opt"),
    option_label: optionLabel,
    option_value: toOptionValue(optionLabel, index),
    sort_order: index + 1
  };
};

const createField = (fieldType = "short_text", sortOrder = 1) => {
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
      settings_json: {
        rating_min: 1,
        rating_max: 5
      }
    };
  }

  return baseField;
};

const applyFieldTypePreset = (field, fieldType) => {
  const nextField = {
    ...field,
    field_type: fieldType
  };

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
  } else {
    nextField.settings_json = {};
  }

  return nextField;
};

const normalizeField = (field, index) => {
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
            option.option_value ||
            toOptionValue(option.option_label, optionIndex),
          sort_order: optionIndex + 1
        }))
        : [createChoiceOption(0), createChoiceOption(1)]
    );
  }

  if (fieldType === "rating") {
    normalizedField.settings_json = normalizeRatingSettings(field.settings_json);
  }

  return normalizedField;
};

const resequenceFields = (fields) =>
  fields.map((field, index) => ({
    ...field,
    sort_order: index + 1,
    options: isChoiceType(field.field_type) ? sequenceOptions(field.options) : []
  }));

const createInitialDraft = (templateId) => {
  const existingDraft = getTemplateDraftById(templateId);

  if (existingDraft) {
    return {
      ...existingDraft,
      form_description: existingDraft.form_description || "",
      fields: resequenceFields(existingDraft.fields.map(normalizeField))
    };
  }

  return {
    project_id: projectOptions[0]?.project_id || 1,
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

function CreateAttendanceTemplatePage({
  selectedTemplateId,
  onBack,
  onLogout,
  theme,
  onToggleTheme
}) {
  const initialState = useMemo(() => {
    const initialDraft = createInitialDraft(selectedTemplateId);
    return {
      draft: initialDraft,
      activeFieldId: initialDraft.fields[0]?.id || null
    };
  }, []);

  const [draft, setDraft] = useState(initialState.draft);
  const [activeFieldId, setActiveFieldId] = useState(initialState.activeFieldId);
  const [activeTab, setActiveTab] = useState("details");
  const [showPreview, setShowPreview] = useState(false);
  const [draggingFieldId, setDraggingFieldId] = useState(null);
  const [dragOverFieldId, setDragOverFieldId] = useState(null);
  const [bannerText, setBannerText] = useState("");

  const editingTemplate = useMemo(
    () => getTemplateById(selectedTemplateId),
    [selectedTemplateId]
  );

  useEffect(() => {
    const nextDraft = createInitialDraft(selectedTemplateId);
    setDraft(nextDraft);
    setActiveFieldId(nextDraft.fields[0]?.id || null);
    setActiveTab("details");
    setShowPreview(false);
    setBannerText("");
  }, [selectedTemplateId]);

  useEffect(() => {
    if (!draft.fields.length) {
      setActiveFieldId(null);
      return;
    }

    const fieldExists = draft.fields.some((field) => field.id === activeFieldId);
    if (!fieldExists) {
      setActiveFieldId(draft.fields[0].id);
    }
  }, [draft.fields, activeFieldId]);

  const updateFormValue = (key, value) => {
    setDraft((current) => ({
      ...current,
      [key]: value
    }));
  };

  const updateField = (fieldId, updater) => {
    setDraft((current) => {
      const nextFields = resequenceFields(
        current.fields.map((field) =>
          field.id === fieldId ? updater(field) : field
        )
      );

      return {
        ...current,
        fields: nextFields
      };
    });
  };

  const addField = (fieldType = "short_text") => {
    const nextField = createField(fieldType, draft.fields.length + 1);

    setDraft((current) => ({
      ...current,
      fields: resequenceFields([...current.fields, nextField])
    }));
    setActiveFieldId(nextField.id);
  };

  const duplicateField = (fieldId) => {
    let createdId = null;

    setDraft((current) => {
      const sourceIndex = current.fields.findIndex((field) => field.id === fieldId);
      if (sourceIndex < 0) {
        return current;
      }

      const source = current.fields[sourceIndex];
      const duplicate = {
        ...source,
        id: createClientId("fld"),
        field_code: `${source.field_code}_copy`,
        field_label: source.field_label
          ? `${source.field_label} (สำเนา)`
          : "คำถามใหม่",
        settings_json: { ...source.settings_json },
        options: sequenceOptions(
          (source.options || []).map((option) => ({
            ...option,
            id: createClientId("opt")
          }))
        )
      };

      createdId = duplicate.id;

      const nextFields = [...current.fields];
      nextFields.splice(sourceIndex + 1, 0, duplicate);

      return {
        ...current,
        fields: resequenceFields(nextFields)
      };
    });

    if (createdId) {
      setActiveFieldId(createdId);
    }
  };

  const removeField = (fieldId) => {
    setDraft((current) => {
      if (current.fields.length <= 1) {
        return {
          ...current,
          fields: [createField("short_text", 1)]
        };
      }

      return {
        ...current,
        fields: resequenceFields(
          current.fields.filter((field) => field.id !== fieldId)
        )
      };
    });
  };

  const moveField = (fieldId, direction) => {
    setDraft((current) => {
      const sourceIndex = current.fields.findIndex((field) => field.id === fieldId);
      if (sourceIndex < 0) {
        return current;
      }

      const targetIndex = sourceIndex + direction;
      if (targetIndex < 0 || targetIndex >= current.fields.length) {
        return current;
      }

      const nextFields = [...current.fields];
      const [movedField] = nextFields.splice(sourceIndex, 1);
      nextFields.splice(targetIndex, 0, movedField);

      return {
        ...current,
        fields: resequenceFields(nextFields)
      };
    });
  };

  const reorderField = (sourceFieldId, targetFieldId) => {
    if (!sourceFieldId || !targetFieldId || sourceFieldId === targetFieldId) {
      return;
    }

    setDraft((current) => {
      const sourceIndex = current.fields.findIndex(
        (field) => field.id === sourceFieldId
      );
      const targetIndex = current.fields.findIndex(
        (field) => field.id === targetFieldId
      );

      if (sourceIndex < 0 || targetIndex < 0) {
        return current;
      }

      const nextFields = [...current.fields];
      const [sourceField] = nextFields.splice(sourceIndex, 1);
      nextFields.splice(targetIndex, 0, sourceField);

      return {
        ...current,
        fields: resequenceFields(nextFields)
      };
    });
  };

  const handleFieldDragStart = (event, fieldId) => {
    setDraggingFieldId(fieldId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", fieldId);
  };

  const handleFieldDragOver = (event, fieldId) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverFieldId(fieldId);
  };

  const handleFieldDrop = (event, fieldId) => {
    event.preventDefault();
    const sourceFieldId = event.dataTransfer.getData("text/plain") || draggingFieldId;
    reorderField(sourceFieldId, fieldId);
    setDraggingFieldId(null);
    setDragOverFieldId(null);
  };

  const handleFieldDragEnd = () => {
    setDraggingFieldId(null);
    setDragOverFieldId(null);
  };

  const addOption = (fieldId) => {
    updateField(fieldId, (field) => {
      const nextOptions = [...field.options, createChoiceOption(field.options.length)];
      return {
        ...field,
        options: sequenceOptions(nextOptions)
      };
    });
  };

  const updateOptionLabel = (fieldId, optionId, optionLabel) => {
    updateField(fieldId, (field) => {
      const nextOptions = field.options.map((option, optionIndex) => {
        if (option.id !== optionId) {
          return option;
        }

        return {
          ...option,
          option_label: optionLabel,
          option_value: toOptionValue(optionLabel, optionIndex)
        };
      });

      return {
        ...field,
        options: sequenceOptions(nextOptions)
      };
    });
  };

  const removeOption = (fieldId, optionId) => {
    updateField(fieldId, (field) => {
      if (field.options.length <= 1) {
        return field;
      }

      return {
        ...field,
        options: sequenceOptions(
          field.options.filter((option) => option.id !== optionId)
        )
      };
    });
  };

  const handleSave = (targetStatus) => {
    updateFormValue("status", targetStatus);
    if (targetStatus === "published") {
      setBannerText("เผยแพร่แบบฟอร์มแล้ว ทีมงานสามารถเริ่มใช้งานเทมเพลตนี้ได้ทันที");
      return;
    }

    setBannerText("บันทึกฉบับร่างแล้ว คุณสามารถกลับมาแก้ไขต่อได้ทุกเมื่อ");
  };

  const renderFieldPreviewInput = (field) => {
    if (field.field_type === "short_text") {
      return (
        <input
          className="input-control"
          placeholder={field.placeholder || "คำตอบสั้น"}
          disabled
        />
      );
    }

    if (field.field_type === "long_text") {
      return (
        <textarea
          className="textarea-control"
          rows={3}
          placeholder={field.placeholder || "คำตอบยาว"}
          disabled
        />
      );
    }

    if (field.field_type === "multiple_choice") {
      return (
        <div className="preview-options">
          {field.options.map((option) => (
            <label key={option.id}>
              <input type="radio" disabled />
              <span>{option.option_label || "ตัวเลือก"}</span>
            </label>
          ))}
          {field.allow_other_option ? (
            <label>
              <input type="radio" disabled />
              <span>อื่นๆ</span>
            </label>
          ) : null}
        </div>
      );
    }

    if (field.field_type === "checkboxes") {
      return (
        <div className="preview-options">
          {field.options.map((option) => (
            <label key={option.id}>
              <input type="checkbox" disabled />
              <span>{option.option_label || "ตัวเลือก"}</span>
            </label>
          ))}
          {field.allow_other_option ? (
            <label>
              <input type="checkbox" disabled />
              <span>อื่นๆ</span>
            </label>
          ) : null}
        </div>
      );
    }

    if (field.field_type === "dropdown") {
      return (
        <select className="select-control" disabled>
          <option>เลือกคำตอบ</option>
          {field.options.map((option) => (
            <option key={option.id}>{option.option_label || "ตัวเลือก"}</option>
          ))}
        </select>
      );
    }

    if (field.field_type === "rating") {
      const min = Number(field.settings_json?.rating_min || 1);
      const max = Number(field.settings_json?.rating_max || 5);
      const ratingNumbers = [];

      for (let value = min; value <= max; value += 1) {
        ratingNumbers.push(value);
      }

      return (
        <div className="preview-rating">
          {ratingNumbers.map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
      );
    }

    if (field.field_type === "date") {
      return <input className="input-control" type="date" disabled />;
    }

    if (field.field_type === "time") {
      return <input className="input-control" type="time" disabled />;
    }

    return null;
  };

  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", "เทมเพลตลงชื่อเข้าร่วม", "สร้างเทมเพลต"]}
      onLogout={onLogout}
      onBack={onBack}
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <section className="builder-header builder-page-width">
        <div>
          <h1>
            {editingTemplate ? "แก้ไขเทมเพลตลงชื่อเข้าร่วม" : "สร้างเทมเพลตลงชื่อเข้าร่วม"}
          </h1>
          <p>
            สร้างแบบฟอร์มได้ง่ายในรูปแบบที่คุ้นเคย คล้าย Google Forms
          </p>
          {editingTemplate ? (
            <p className="editing-note">
              กำลังแก้ไข: {editingTemplate.form_name} ({editingTemplate.project_name})
            </p>
          ) : null}
        </div>

        <div className="builder-header-actions">
          <button
            className="ghost-button"
            type="button"
            onClick={() => handleSave("draft")}
          >
            บันทึกฉบับร่าง
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => handleSave("published")}
          >
            เผยแพร่เทมเพลต
          </button>
        </div>
      </section>

      {bannerText ? <p className="notice-banner builder-page-width">{bannerText}</p> : null}

      <nav className="builder-tabs builder-page-width" aria-label="แท็บจัดการแบบฟอร์ม">
        <button
          className={`builder-tab-button${activeTab === "details" ? " builder-tab-button-active" : ""
            }`}
          type="button"
          onClick={() => setActiveTab("details")}
        >
          รายละเอียดแบบฟอร์ม
        </button>
        <button
          className={`builder-tab-button${activeTab === "questions" ? " builder-tab-button-active" : ""
            }`}
          type="button"
          onClick={() => setActiveTab("questions")}
        >
          คำถาม
        </button>
      </nav>

      {activeTab === "details" ? <section className="builder-meta-card builder-page-width page-enter">
        <h2>รายละเอียดแบบฟอร์ม</h2>

        <div className="builder-meta-grid">
          <label>
            <span>โครงการ</span>
            <select
              className="select-control"
              value={draft.project_id}
              onChange={(event) =>
                updateFormValue("project_id", Number(event.target.value))
              }
            >
              {projectOptions.map((project) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.project_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>ชื่อแบบฟอร์ม</span>
            <input
              className="input-control"
              value={draft.form_name}
              placeholder="เช่น ฟอร์มลงทะเบียนกิจกรรม"
              onChange={(event) => updateFormValue("form_name", event.target.value)}
            />
          </label>

          <label className="full-width">
            <span>คำอธิบายแบบฟอร์ม</span>
            <textarea
              className="textarea-control"
              rows={3}
              value={draft.form_description}
              placeholder="อธิบายสั้นๆ เพื่อให้ผู้ตอบเข้าใจแบบฟอร์มนี้"
              onChange={(event) =>
                updateFormValue("form_description", event.target.value)
              }
            />
          </label>

          <label>
            <span>ลิงก์แบบฟอร์ม</span>
            <div className="inline-input-action">
              <input
                className="input-control"
                value={draft.public_path}
                placeholder="ลิงก์ของแบบฟอร์ม"
                onChange={(event) =>
                  updateFormValue("public_path", event.target.value)
                }
              />
              <button
                className="ghost-button"
                type="button"
                onClick={() =>
                  updateFormValue("public_path", toSlug(draft.form_name || ""))
                }
              >
                สร้างอัตโนมัติ
              </button>
            </div>
          </label>

          <label>
            <span>ประเภทแบบฟอร์ม</span>
            <select
              className="select-control"
              value={draft.form_type}
              onChange={(event) => updateFormValue("form_type", event.target.value)}
            >
              {FORM_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>สถานะ</span>
            <select
              className="select-control"
              value={draft.status}
              onChange={(event) => updateFormValue("status", event.target.value)}
            >
              {FORM_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={draft.allow_multiple_submissions}
              onChange={(event) =>
                updateFormValue("allow_multiple_submissions", event.target.checked)
              }
            />
            <span>อนุญาตให้ตอบได้หลายครั้ง</span>
          </label>

          <label>
            <span>เริ่มใช้งาน</span>
            <input
              className="input-control"
              type="datetime-local"
              value={draft.start_at || ""}
              onChange={(event) => updateFormValue("start_at", event.target.value)}
            />
          </label>

          <label>
            <span>สิ้นสุดการใช้งาน</span>
            <input
              className="input-control"
              type="datetime-local"
              value={draft.end_at || ""}
              onChange={(event) => updateFormValue("end_at", event.target.value)}
            />
          </label>

          <label>
            <span>หัวข้อข้อความยืนยัน</span>
            <input
              className="input-control"
              value={draft.success_title}
              onChange={(event) =>
                updateFormValue("success_title", event.target.value)
              }
            />
          </label>

          <label className="full-width">
            <span>ข้อความยืนยัน</span>
            <textarea
              className="textarea-control"
              rows={3}
              value={draft.success_message}
              onChange={(event) =>
                updateFormValue("success_message", event.target.value)
              }
            />
          </label>
        </div>
      </section> : null}

      {activeTab === "questions" ? (
        <section className="questions-tab-shell builder-page-width page-enter">
          <div className="section-head">
            <h2>{showPreview ? "ตัวอย่างแบบฟอร์ม" : `คำถาม (${draft.fields.length})`}</h2>
            <div className="section-head-actions">
              <button
                className="ghost-button"
                type="button"
                onClick={() => setShowPreview((current) => !current)}
              >
                {showPreview ? "กลับไปแก้ไข" : "ดูตัวอย่าง"}
              </button>
              {!showPreview ? (
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => addField("short_text")}
                >
                  + เพิ่มคำถาม
                </button>
              ) : null}
            </div>
          </div>

          {showPreview ? (
            <div className="google-preview-surface">
              <article className="google-preview-form-card">
                <div className="google-preview-form-accent" />
                <div className="google-preview-form-body">
                  <h3>{draft.form_name || "แบบฟอร์มใหม่"}</h3>
                  <p>{draft.form_description || "คำอธิบายแบบฟอร์ม"}</p>
                </div>
              </article>

              {draft.fields.map((field, fieldIndex) => (
                <article key={field.id} className="google-preview-question-card">
                  <p className="google-preview-question-title">
                    {field.field_label || `คำถาม ${fieldIndex + 1}`}
                    {field.is_required ? <span className="required-mark">*</span> : null}
                  </p>

                  {field.field_description ? <small>{field.field_description}</small> : null}

                  {renderFieldPreviewInput(field)}
                </article>
              ))}
            </div>
          ) : (
            <div className="builder-editor-panel">
              <article className="question-form-summary">
                <p className="question-form-summary-title">
                  {draft.form_name || "แบบฟอร์มใหม่"}
                </p>
                <p className="question-form-summary-desc">
                  {draft.form_description || "ยังไม่มีคำอธิบาย"}
                </p>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setActiveTab("details")}
                >
                  แก้ไขรายละเอียดแบบฟอร์ม
                </button>
              </article>

              {draft.fields.map((field, fieldIndex) => (
                <article
                  key={field.id}
                  className={`question-card${activeFieldId === field.id ? " question-card-active" : ""
                    }${dragOverFieldId === field.id ? " question-card-drag-over" : ""}`}
                  onClick={() => setActiveFieldId(field.id)}
                  onDragOver={(event) => handleFieldDragOver(event, field.id)}
                  onDrop={(event) => handleFieldDrop(event, field.id)}
                >
                  <div className="question-drag-top">
                    <button
                      className="question-drag-handle"
                      type="button"
                      draggable
                      onDragStart={(event) => handleFieldDragStart(event, field.id)}
                      onDragEnd={handleFieldDragEnd}
                      title="ลากเพื่อจัดลำดับ"
                      aria-label="ลากเพื่อจัดลำดับ"
                    >
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </button>
                  </div>

                  <div className="question-card-inner">
                    <div className="question-card-top">
                      <input
                        className="question-title-input"
                        value={field.field_label}
                        placeholder={`คำถาม ${fieldIndex + 1}`}
                        onChange={(event) =>
                          updateField(field.id, (currentField) => ({
                            ...currentField,
                            field_label: event.target.value
                          }))
                        }
                      />
                      <select
                        className="question-type-select"
                        value={field.field_type}
                        onChange={(event) =>
                          updateField(field.id, (currentField) =>
                            applyFieldTypePreset(currentField, event.target.value)
                          )
                        }
                      >
                        {FIELD_TYPES.map((fieldTypeOption) => (
                          <option
                            key={fieldTypeOption.value}
                            value={fieldTypeOption.value}
                          >
                            {fieldTypeOption.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {activeFieldId === field.id ? (
                      <textarea
                        className="question-desc-input"
                        rows={1}
                        value={field.field_description}
                        placeholder="คำอธิบาย (ถ้ามี)"
                        onChange={(event) =>
                          updateField(field.id, (currentField) => ({
                            ...currentField,
                            field_description: event.target.value
                          }))
                        }
                      />
                    ) : field.field_description ? (
                      <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "#5f6368" }}>
                        {field.field_description}
                      </p>
                    ) : null}

                    {/* Short/Long text placeholder preview */}
                    {field.field_type === "short_text" ? (
                      activeFieldId === field.id ? (
                        <label style={{ marginTop: 12 }}>
                          <span style={{ fontSize: "0.82rem", color: "#5f6368", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>ข้อความตัวอย่าง</span>
                          <input
                            className="question-title-input"
                            style={{ fontSize: "0.92rem" }}
                            value={field.placeholder}
                            placeholder="คำตอบสั้น"
                            onChange={(event) =>
                              updateField(field.id, (currentField) => ({
                                ...currentField,
                                placeholder: event.target.value
                              }))
                            }
                          />
                        </label>
                      ) : (
                        <div className="question-placeholder-field" style={{ marginTop: 16 }}>
                          {field.placeholder || "คำตอบสั้น"}
                        </div>
                      )
                    ) : null}

                    {field.field_type === "long_text" ? (
                      activeFieldId === field.id ? (
                        <label style={{ marginTop: 12 }}>
                          <span style={{ fontSize: "0.82rem", color: "#5f6368", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>ข้อความตัวอย่าง</span>
                          <input
                            className="question-title-input"
                            style={{ fontSize: "0.92rem" }}
                            value={field.placeholder}
                            placeholder="คำตอบยาว"
                            onChange={(event) =>
                              updateField(field.id, (currentField) => ({
                                ...currentField,
                                placeholder: event.target.value
                              }))
                            }
                          />
                        </label>
                      ) : (
                        <div className="question-placeholder-field" style={{ marginTop: 16, borderBottomStyle: "dotted" }}>
                          {field.placeholder || "คำตอบยาว"}
                        </div>
                      )
                    ) : null}

                    {/* Choice-type option editor (Google Forms style) */}
                    {isChoiceType(field.field_type) ? (
                      <div className="choice-editor">
                        {field.options.map((option, optionIndex) => (
                          <div className="choice-row" key={option.id}>
                            {field.field_type === "multiple_choice" ? (
                              <span className="choice-indicator" />
                            ) : field.field_type === "checkboxes" ? (
                              <span className="choice-indicator choice-indicator-checkbox" />
                            ) : (
                              <span className="choice-indicator-dropdown">{optionIndex + 1}.</span>
                            )}
                            <input
                              className="choice-option-input"
                              value={option.option_label}
                              placeholder={`ตัวเลือก ${optionIndex + 1}`}
                              onChange={(event) =>
                                updateOptionLabel(
                                  field.id,
                                  option.id,
                                  event.target.value
                                )
                              }
                            />
                            <button
                              className="choice-remove-btn"
                              type="button"
                              onClick={() => removeOption(field.id, option.id)}
                              disabled={field.options.length <= 1}
                              title="ลบตัวเลือก"
                              aria-label="ลบตัวเลือก"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}

                        {/* Add option row (inline, Google Forms style) */}
                        <div className="choice-add-row">
                          {field.field_type === "multiple_choice" ? (
                            <span className="choice-add-indicator" />
                          ) : field.field_type === "checkboxes" ? (
                            <span className="choice-add-indicator choice-add-indicator-checkbox" />
                          ) : (
                            <span className="choice-indicator-dropdown">{field.options.length + 1}.</span>
                          )}
                          <button
                            className="choice-add-button"
                            type="button"
                            onClick={() => addOption(field.id)}
                          >
                            เพิ่มตัวเลือก
                          </button>
                        </div>

                        {/* Allow "Other" toggle */}
                        {field.field_type !== "dropdown" ? (
                          <div className="choice-other-toggle">
                            <label className="checkbox-row compact">
                              <input
                                type="checkbox"
                                checked={field.allow_other_option}
                                onChange={(event) =>
                                  updateField(field.id, (currentField) => ({
                                    ...currentField,
                                    allow_other_option: event.target.checked
                                  }))
                                }
                              />
                              <span>เพิ่มตัวเลือก "อื่นๆ"</span>
                            </label>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Rating editor with visual preview */}
                    {field.field_type === "rating" ? (
                      <>
                        <div className="rating-editor-preview">
                          {Array.from({ length: (field.settings_json.rating_max || 5) - (field.settings_json.rating_min || 1) + 1 }).map((_, i) => {
                            const val = (field.settings_json.rating_min || 1) + i;
                            return <span key={val} className="rating-number">{val}</span>;
                          })}
                        </div>
                        <div className="inline-two-cols">
                          <label>
                            <span>คะแนนต่ำสุด</span>
                            <select
                              className="select-control"
                              value={field.settings_json.rating_min || 1}
                              onChange={(event) => {
                                const nextMin = Number(event.target.value);
                                updateField(field.id, (currentField) => {
                                  const nextSettings = normalizeRatingSettings({
                                    rating_min: nextMin,
                                    rating_max: currentField.settings_json.rating_max || 5
                                  });
                                  return { ...currentField, settings_json: nextSettings };
                                });
                              }}
                            >
                              {Array.from({ length: 9 }).map((_, numberIndex) => {
                                const number = numberIndex + 1;
                                return (
                                  <option key={number} value={number}>{number}</option>
                                );
                              })}
                            </select>
                          </label>
                          <label>
                            <span>คะแนนสูงสุด</span>
                            <select
                              className="select-control"
                              value={field.settings_json.rating_max || 5}
                              onChange={(event) => {
                                const nextMax = Number(event.target.value);
                                updateField(field.id, (currentField) => {
                                  const nextSettings = normalizeRatingSettings({
                                    rating_min: currentField.settings_json.rating_min || 1,
                                    rating_max: nextMax
                                  });
                                  return { ...currentField, settings_json: nextSettings };
                                });
                              }}
                            >
                              {Array.from({ length: 9 }).map((_, numberIndex) => {
                                const number = numberIndex + 2;
                                return (
                                  <option key={number} value={number}>{number}</option>
                                );
                              })}
                            </select>
                          </label>
                        </div>
                      </>
                    ) : null}

                    {/* Date / Time placeholder preview */}
                    {field.field_type === "date" ? (
                      <div className="question-placeholder-field" style={{ marginTop: 16 }}>
                        วัน / เดือน / ปี
                      </div>
                    ) : null}

                    {field.field_type === "time" ? (
                      <div className="question-placeholder-field" style={{ marginTop: 16 }}>
                        เวลา
                      </div>
                    ) : null}

                    {/* Footer: Required toggle + action icons */}
                    <div className="question-footer">
                      <label className="question-switch">
                        <input
                          type="checkbox"
                          checked={field.is_required}
                          onChange={(event) =>
                            updateField(field.id, (currentField) => ({
                              ...currentField,
                              is_required: event.target.checked
                            }))
                          }
                        />
                        <span className="question-switch-slider" />
                        <span className="question-switch-text">บังคับตอบ</span>
                      </label>

                      <span className="question-footer-divider" />

                      <div className="question-actions">
                        <button
                          className="icon-only-button icon-neutral-button"
                          type="button"
                          onClick={() => duplicateField(field.id)}
                          title="ทำสำเนาคำถาม"
                          aria-label="ทำสำเนาคำถาม"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="question-action-icon">
                            <rect x="9" y="9" width="10" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                            <path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        </button>
                        <button
                          className="icon-only-button icon-danger-button"
                          type="button"
                          onClick={() => removeField(field.id)}
                          title="ลบคำถาม"
                          aria-label="ลบคำถาม"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="question-action-icon">
                            <path d="M4 7h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M9 4h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M7 7l1 12h8l1-12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                            <path d="M10 11v5M14 11v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </AdminLayout>
  );
}

export default CreateAttendanceTemplatePage;
