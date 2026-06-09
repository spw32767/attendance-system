import { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "../../components/ui";
import { adminDataAdapter } from "../../services/adminDataAdapter";

const optionValueOf = (option) => String(option.option_value || option.option_label);

// Map a stored answer value (from getSubmissionDetail) back to the control's
// canonical value, matching by either option_value or option_label.
const resolvePrefill = (field, rawValue) => {
  if (field.field_type === "checkboxes") {
    const arr = Array.isArray(rawValue) ? rawValue : rawValue ? [rawValue] : [];
    return arr.map((value) => {
      const match = (field.options || []).find(
        (option) =>
          String(option.option_value) === String(value) ||
          String(option.option_label) === String(value)
      );
      return match ? optionValueOf(match) : String(value);
    });
  }
  if (field.field_type === "multiple_choice" || field.field_type === "dropdown") {
    const match = (field.options || []).find(
      (option) =>
        String(option.option_value) === String(rawValue) ||
        String(option.option_label) === String(rawValue)
    );
    return match ? optionValueOf(match) : rawValue ? String(rawValue) : "";
  }
  return rawValue == null ? "" : String(rawValue);
};

function AddEditEntryModal({ open, onClose, mode, forms, defaultFormId, submission, onAdd, onEdit }) {
  const isEdit = mode === "edit";
  const [formId, setFormId] = useState(defaultFormId ? String(defaultFormId) : "");
  const [fields, setFields] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const effectiveFormId = isEdit ? submission?.form_id : formId;

  // Load the form's field definitions (+ current values when editing).
  useEffect(() => {
    if (!open || !effectiveFormId) {
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError("");

    const load = async () => {
      try {
        const draft = await adminDataAdapter.getFormDraft(Number(effectiveFormId));
        const loadedFields = (draft?.fields || []).filter(
          (field) => field.field_type !== "file_upload"
        );

        let nextAnswers = {};
        if (isEdit && submission?.submission_id) {
          const detail = await adminDataAdapter.getSubmissionDetail(submission.submission_id);
          const byField = {};
          (detail?.answers || []).forEach((answer) => {
            byField[String(answer.field_id)] = answer.value;
          });
          loadedFields.forEach((field) => {
            nextAnswers[field.id] = resolvePrefill(field, byField[String(field.id)]);
          });
        } else {
          loadedFields.forEach((field) => {
            nextAnswers[field.id] = field.field_type === "checkboxes" ? [] : "";
          });
        }

        if (!cancelled) {
          setFields(loadedFields);
          setAnswers(nextAnswers);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "โหลดฟอร์มไม่สำเร็จ");
          setFields([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, effectiveFormId, isEdit, submission]);

  // Reset the form picker when (re)opening in add mode.
  useEffect(() => {
    if (!open) {
      return;
    }
    if (!isEdit) {
      setFormId(defaultFormId ? String(defaultFormId) : "");
    }
    setError("");
  }, [open, isEdit, defaultFormId]);

  const orderedFields = useMemo(
    () => [...fields].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    [fields]
  );

  const setAnswer = (fieldId, value) => {
    setAnswers((current) => ({ ...current, [fieldId]: value }));
  };

  const handleSave = async () => {
    if (!isEdit && !formId) {
      setError("กรุณาเลือกฟอร์ม");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await onEdit(submission.submission_id, answers);
      } else {
        await onAdd(Number(formId), answers);
      }
      onClose?.();
    } catch (err) {
      setError(err?.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={isEdit ? "แก้ไขรายชื่อ" : "เพิ่มรายชื่อล่วงหน้า"}
      description={
        isEdit
          ? "แก้ข้อมูลของรายชื่อที่นำเข้า/เพิ่มเอง"
          : "ใส่ข้อมูลของผู้เข้าร่วมที่มีรายชื่ออยู่แล้ว (เช่น VIP/อาจารย์) — จะไม่ส่งอีเมลอัตโนมัติ"
      }
      size="lg"
      closeOnBackdrop={!saving}
    >
      <div className="auth-form">
        {!isEdit ? (
          <label className="full-width">
            <span>เลือกฟอร์ม</span>
            <select
              className="select-control"
              value={formId}
              onChange={(event) => setFormId(event.target.value)}
              disabled={saving}
            >
              <option value="">เลือกฟอร์ม</option>
              {forms.map((form) => (
                <option key={form.form_id} value={form.form_id}>
                  {form.project_name ? `${form.project_name} / ` : ""}
                  {form.form_name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {loading ? <p className="auth-form-hint">กำลังโหลดฟอร์ม...</p> : null}

        {!loading && effectiveFormId
          ? orderedFields.map((field) => (
              <label className="full-width" key={field.id}>
                <span>
                  {field.field_label || "คำถาม"}
                  {field.is_required ? <strong className="required-mark"> *</strong> : null}
                </span>

                {field.field_type === "short_text" || field.field_type === "date" || field.field_type === "time" ? (
                  <input
                    className="input-control"
                    type={field.field_type === "date" ? "date" : field.field_type === "time" ? "time" : "text"}
                    value={answers[field.id] || ""}
                    disabled={saving}
                    onChange={(event) => setAnswer(field.id, event.target.value)}
                  />
                ) : null}

                {field.field_type === "long_text" ? (
                  <textarea
                    className="textarea-control"
                    rows={2}
                    value={answers[field.id] || ""}
                    disabled={saving}
                    onChange={(event) => setAnswer(field.id, event.target.value)}
                  />
                ) : null}

                {field.field_type === "dropdown" || field.field_type === "rating" ? (
                  <select
                    className="select-control"
                    value={answers[field.id] || ""}
                    disabled={saving}
                    onChange={(event) => setAnswer(field.id, event.target.value)}
                  >
                    <option value="">{field.field_type === "rating" ? "เลือกคะแนน" : "เลือกคำตอบ"}</option>
                    {field.field_type === "rating"
                      ? Array.from({
                          length:
                            (field.settings_json?.rating_max || 5) -
                            (field.settings_json?.rating_min || 1) +
                            1
                        }).map((_, index) => {
                          const value = (field.settings_json?.rating_min || 1) + index;
                          return (
                            <option key={value} value={String(value)}>
                              {value}
                            </option>
                          );
                        })
                      : (field.options || []).map((option) => (
                          <option key={option.id} value={optionValueOf(option)}>
                            {option.option_label}
                          </option>
                        ))}
                  </select>
                ) : null}

                {field.field_type === "multiple_choice" ? (
                  <div className="preview-options">
                    {(field.options || []).map((option) => (
                      <label key={option.id}>
                        <input
                          type="radio"
                          name={`entry_${field.id}`}
                          checked={(answers[field.id] || "") === optionValueOf(option)}
                          disabled={saving}
                          onChange={() => setAnswer(field.id, optionValueOf(option))}
                        />
                        <span>{option.option_label}</span>
                      </label>
                    ))}
                  </div>
                ) : null}

                {field.field_type === "checkboxes" ? (
                  <div className="preview-options">
                    {(field.options || []).map((option) => {
                      const value = optionValueOf(option);
                      const current = answers[field.id] || [];
                      const checked = current.includes(value);
                      return (
                        <label key={option.id}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={saving}
                            onChange={(event) =>
                              setAnswer(
                                field.id,
                                event.target.checked
                                  ? [...current, value]
                                  : current.filter((item) => item !== value)
                              )
                            }
                          />
                          <span>{option.option_label}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : null}
              </label>
            ))
          : null}

        {error ? <p style={{ color: "var(--danger)", margin: 0 }}>{error}</p> : null}

        <div className="auth-form-actions">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={saving}
            disabled={saving || loading || (!isEdit && !formId)}
            onClick={handleSave}
          >
            {isEdit ? "บันทึกการแก้ไข" : "เพิ่มรายชื่อ"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default AddEditEntryModal;
