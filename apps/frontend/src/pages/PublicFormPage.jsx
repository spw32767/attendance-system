import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Moon, Send, Sun } from "lucide-react";
import { Button, EmptyState, Spinner } from "../components/ui";

const EMPTY_MESSAGES = {
  not_found: {
    title: "ไม่พบแบบฟอร์ม",
    description: "ลิงก์นี้อาจไม่ถูกต้อง หรือแบบฟอร์มถูกย้าย/ลบแล้ว"
  },
  error: {
    title: "โหลดแบบฟอร์มไม่สำเร็จ",
    description: "เกิดปัญหาในการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง"
  },
  closed: {
    title: "แบบฟอร์มปิดใช้งาน",
    description: "ฟอร์มนี้ยังไม่เปิดให้ตอบในขณะนี้"
  },
  not_started: {
    title: "ยังไม่ถึงเวลาเปิดรับ",
    description: "ฟอร์มนี้ถูกตั้งเวลาไว้ โปรดลองใหม่อีกครั้งเมื่อถึงเวลา"
  },
  ended: {
    title: "หมดเวลาตอบแบบฟอร์ม",
    description: "แบบฟอร์มนี้สิ้นสุดการรับข้อมูลแล้ว"
  }
};

const isEmptyAnswer = (value) => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "string") {
    return !value.trim();
  }

  if (value instanceof FileList) {
    return value.length === 0;
  }

  return value === null || value === undefined || value === "";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Format checks for a non-empty answer (required-ness is handled separately).
// Returns an error message, or null when the value is acceptable.
const validateFieldFormat = (field, value) => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (field.field_usage === "email" && !EMAIL_RE.test(trimmed)) {
    return "กรุณากรอกอีเมลให้ถูกต้อง";
  }
  if (field.field_usage === "phone") {
    const digits = trimmed.replace(/[\s-]/g, "");
    if (!/^\+?\d{9,15}$/.test(digits)) {
      return "กรุณากรอกเบอร์โทรให้ถูกต้อง";
    }
  }
  const maxLength = Number(field.settings_json?.max_length) || 0;
  if (maxLength > 0 && trimmed.length > maxLength) {
    return `กรอกได้ไม่เกิน ${maxLength} ตัวอักษร`;
  }
  return null;
};

function PublicFormPage({
  publicPath,
  onLoadPublicForm,
  onSubmitPublicForm,
  onNavigateSuccess,
  onGoLogin,
  theme,
  onToggleTheme
}) {
  const [loading, setLoading] = useState(true);
  const [formStatus, setFormStatus] = useState("not_found");
  const [formData, setFormData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parent's onLoadPublicForm is recreated on every App render (e.g. when
  // the theme toggle flips). If loadForm depended on that callback, the
  // effect below would re-fire on theme change, reset `answers` to the
  // empty seed, and wipe whatever the respondent had typed. Keep the
  // latest callback in a ref so the effect only depends on publicPath.
  const onLoadPublicFormRef = useRef(onLoadPublicForm);
  onLoadPublicFormRef.current = onLoadPublicForm;

  const loadForm = useCallback(async () => {
    setLoading(true);
    try {
      const result = await onLoadPublicFormRef.current(publicPath);
      if (!result) {
        setFormStatus("error");
        setFormData(null);
      } else {
        setFormStatus(result.status);
        setFormData(result.form || null);

        const nextAnswers = {};
        (result.form?.fields || []).forEach((field) => {
          nextAnswers[field.id] = field.field_type === "checkboxes" ? [] : "";
        });
        setAnswers(nextAnswers);
      }
      setErrors({});
    } catch {
      // Network failure / unexpected error — show a retryable error state
      // instead of a blank screen.
      setFormStatus("error");
      setFormData(null);
    } finally {
      setLoading(false);
    }
  }, [publicPath]);

  useEffect(() => {
    void loadForm();
  }, [loadForm]);

  const orderedFields = useMemo(
    () => [...(formData?.fields || [])].sort((a, b) => a.sort_order - b.sort_order),
    [formData]
  );

  const setAnswer = (fieldId, value) => {
    setAnswers((current) => ({
      ...current,
      [fieldId]: value
    }));
    // Clear this field's error the moment the user types — the banner near
    // the submit button reflects whether *any* errors remain, so dropping
    // the fixed entry calms it down without forcing a re-validate.
    setErrors((current) => {
      if (!current[fieldId]) {
        return current;
      }
      const next = { ...current };
      delete next[fieldId];
      if (Object.keys(next).length === 0) {
        setHasValidationErrors(false);
      }
      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};
    let firstErrorFieldId = null;

    orderedFields.forEach((field) => {
      const value = answers[field.id];

      if (field.is_required && isEmptyAnswer(value)) {
        nextErrors[field.id] = "กรุณากรอกข้อมูลช่องนี้";
      } else {
        const formatError = validateFieldFormat(field, value);
        if (formatError) {
          nextErrors[field.id] = formatError;
        }
      }

      if (nextErrors[field.id] && firstErrorFieldId == null) {
        firstErrorFieldId = field.id;
      }
    });

    setErrors(nextErrors);
    return { ok: Object.keys(nextErrors).length === 0, firstErrorFieldId };
  };

  // Pull the user's eyes to the field that needs attention. Without this the
  // error renders far above the submit button and tapping "ส่งข้อมูล"
  // appears to do nothing — users think the page is frozen.
  const focusFieldById = (fieldId) => {
    if (fieldId == null) {
      return;
    }
    const node = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (!node) {
      return;
    }
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = node.querySelector(
      "input:not([type='hidden']):not([disabled]), textarea:not([disabled]), select:not([disabled])"
    );
    if (focusable && typeof focusable.focus === "function") {
      // Delay focus until after the scroll starts so iOS Safari doesn't
      // fight us and zoom back to the bottom of the page.
      window.setTimeout(() => focusable.focus({ preventScroll: true }), 80);
    }
  };

  const [submitError, setSubmitError] = useState("");
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const { ok, firstErrorFieldId } = validate();
    if (!ok) {
      // Surface BOTH a banner near the button AND a focused jump to the
      // first offending field. The banner stops the "did my click work?"
      // confusion when the bad field is offscreen.
      setHasValidationErrors(true);
      setSubmitError("");
      focusFieldById(firstErrorFieldId);
      return;
    }
    setHasValidationErrors(false);

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const result = await onSubmitPublicForm(publicPath, { answers });
      if (!result.ok) {
        // 200 responses with ok:false: closed / not_started / ended /
        // not_found. Flip to the empty-state screen.
        setFormStatus(result.status || "closed");
        return;
      }

      if (onNavigateSuccess) {
        onNavigateSuccess(result, Boolean(formData?.allow_multiple_submissions));
      }
    } catch (err) {
      // 4xx (validation_error / duplicate_value / already_submitted) lands
      // here because apiAdminService throws on !response.ok. Pin the message
      // to the offending field if the backend told us which one; otherwise
      // surface it as a banner above the submit button.
      const data = err?.data || null;
      const message = err?.message || "ส่งแบบฟอร์มไม่สำเร็จ";
      if (data?.fieldId) {
        setErrors({ [data.fieldId]: message });
        setSubmitError("");
        setHasValidationErrors(true);
        focusFieldById(data.fieldId);
      } else {
        setSubmitError(message);
        setHasValidationErrors(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="public-form-shell">
        <section className="public-form-card public-form-card-status">
          <Spinner size={28} label="กำลังโหลดแบบฟอร์ม" />
          <p>กำลังโหลดแบบฟอร์ม...</p>
        </section>
      </div>
    );
  }

  if (formStatus !== "open" || !formData) {
    const message = EMPTY_MESSAGES[formStatus] || EMPTY_MESSAGES.closed;
    return (
      <div className="public-form-shell">
        <section className="public-form-card public-form-card-status">
          <EmptyState
            title={message.title}
            description={message.description}
            action={
              formStatus === "error" ? (
                <Button variant="ghost" onClick={() => loadForm()}>
                  <span>ลองใหม่อีกครั้ง</span>
                </Button>
              ) : null
            }
          />
        </section>
      </div>
    );
  }

  return (
    <div className={`public-form-shell${isSubmitting ? " is-submitting" : ""}`}>
      {onToggleTheme ? (
        <button
          type="button"
          className="public-form-theme-toggle"
          onClick={onToggleTheme}
          aria-pressed={theme === "dark"}
          title={theme === "dark" ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
          aria-label={theme === "dark" ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
        >
          {theme === "dark" ? (
            <Sun size={16} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Moon size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      ) : null}
      <section className="google-preview-surface">
        <article className="google-preview-form-card">
          <div className="google-preview-form-accent" />
          <div className="google-preview-form-body">
            <h3>{formData.form_name || "แบบฟอร์ม"}</h3>
            <p>{formData.form_description || "กรุณากรอกข้อมูลให้ครบถ้วน"}</p>
          </div>
        </article>

        <form className="public-live-google-form" onSubmit={handleSubmit}>
          {orderedFields.map((field) => {
            const fieldError = errors[field.id];
            const errorId = fieldError ? `err-${field.id}` : undefined;
            const fieldAria = {
              "aria-label": field.field_label || "คำถาม",
              "aria-required": field.is_required || undefined,
              "aria-invalid": fieldError ? true : undefined,
              "aria-describedby": errorId
            };
            return (
            <article
              key={field.id}
              className={`google-preview-question-card${fieldError ? " google-preview-question-card-error" : ""}`}
              data-field-id={field.id}
            >
              <p className="google-preview-question-title">
                {field.field_label || "คำถาม"}
                {field.is_required ? <strong className="required-mark">*</strong> : null}
              </p>

              {field.field_description ? <small>{field.field_description}</small> : null}

              {field.field_type === "short_text" ? (
                <input
                  className="input-control"
                  {...fieldAria}
                  value={answers[field.id] || ""}
                  placeholder={field.placeholder || "คำตอบสั้น"}
                  disabled={isSubmitting}
                  onChange={(event) => setAnswer(field.id, event.target.value)}
                />
              ) : null}

              {field.field_type === "long_text" ? (
                <textarea
                  className="textarea-control"
                  {...fieldAria}
                  rows={3}
                  value={answers[field.id] || ""}
                  placeholder={field.placeholder || "คำตอบยาว"}
                  disabled={isSubmitting}
                  onChange={(event) => setAnswer(field.id, event.target.value)}
                />
              ) : null}

              {field.field_type === "multiple_choice" ? (
                <div
                  className="preview-options"
                  role="group"
                  aria-label={field.field_label || "คำถาม"}
                >
                  {(field.options || []).map((option) => {
                    const optionValue = option.option_value || option.option_label;
                    return (
                      <label key={option.id}>
                        <input
                          type="radio"
                          name={`field_${field.id}`}
                          checked={(answers[field.id] || "") === optionValue}
                          disabled={isSubmitting}
                          onChange={() => setAnswer(field.id, optionValue)}
                        />
                        <span>{option.option_label}</span>
                      </label>
                    );
                  })}
                </div>
              ) : null}

              {field.field_type === "checkboxes" ? (
                <div
                  className="preview-options"
                  role="group"
                  aria-label={field.field_label || "คำถาม"}
                >
                  {(field.options || []).map((option) => {
                    const optionValue = option.option_value || option.option_label;
                    const currentValues = answers[field.id] || [];
                    const checked = currentValues.includes(optionValue);

                    return (
                      <label key={option.id}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isSubmitting}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setAnswer(field.id, [...currentValues, optionValue]);
                              return;
                            }

                            setAnswer(
                              field.id,
                              currentValues.filter((value) => value !== optionValue)
                            );
                          }}
                        />
                        <span>{option.option_label}</span>
                      </label>
                    );
                  })}
                </div>
              ) : null}

              {field.field_type === "dropdown" ? (
                <select
                  className="select-control"
                  {...fieldAria}
                  value={answers[field.id] || ""}
                  disabled={isSubmitting}
                  onChange={(event) => setAnswer(field.id, event.target.value)}
                >
                  <option value="">เลือกคำตอบ</option>
                  {(field.options || []).map((option) => (
                    <option key={option.id} value={option.option_value || option.option_label}>
                      {option.option_label}
                    </option>
                  ))}
                </select>
              ) : null}

              {field.field_type === "rating" ? (
                <select
                  className="select-control"
                  {...fieldAria}
                  value={answers[field.id] || ""}
                  disabled={isSubmitting}
                  onChange={(event) => setAnswer(field.id, event.target.value)}
                >
                  <option value="">เลือกคะแนน</option>
                  {Array.from({
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
                  })}
                </select>
              ) : null}

              {field.field_type === "date" ? (
                <input
                  className="input-control"
                  {...fieldAria}
                  type="date"
                  value={answers[field.id] || ""}
                  disabled={isSubmitting}
                  onChange={(event) => setAnswer(field.id, event.target.value)}
                />
              ) : null}

              {field.field_type === "time" ? (
                <input
                  className="input-control"
                  {...fieldAria}
                  type="time"
                  value={answers[field.id] || ""}
                  disabled={isSubmitting}
                  onChange={(event) => setAnswer(field.id, event.target.value)}
                />
              ) : null}

              {field.field_type === "file_upload" ? (
                <div className="file-upload-preview">
                  <input
                    className="input-control"
                  {...fieldAria}
                    type="file"
                    disabled={isSubmitting}
                    multiple={(field.settings_json?.max_file_count || 1) > 1}
                    onChange={(event) => setAnswer(field.id, event.target.files)}
                  />
                </div>
              ) : null}

              {fieldError ? (
                <small id={errorId} role="alert" className="public-form-error">
                  {fieldError}
                </small>
              ) : null}
            </article>
            );
          })}

          {submitError ? (
            <p className="public-form-submit-error" role="alert">
              {submitError}
            </p>
          ) : null}

          {hasValidationErrors && Object.keys(errors).length > 0 ? (
            <div className="public-form-error-summary" role="alert">
              <ul className="public-form-error-summary-list">
                {orderedFields
                  .filter((field) => errors[field.id])
                  .map((field) => (
                    <li key={field.id}>
                      <button
                        type="button"
                        className="public-form-error-summary-link"
                        onClick={() => focusFieldById(field.id)}
                      >
                        <span className="public-form-error-summary-field">
                          {field.field_label || "คำถาม"}
                        </span>
                        <span className="public-form-error-summary-sep">—</span>
                        <span>{errors[field.id]}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}

          <div className="public-form-submit-row">
            <Button variant="primary" type="submit" loading={isSubmitting}>
              <Send size={14} aria-hidden="true" />
              <span>{isSubmitting ? "กำลังส่งข้อมูล..." : "ส่งข้อมูล"}</span>
            </Button>
          </div>
        </form>
      </section>
      {isSubmitting ? <div className="public-form-submit-overlay" role="presentation" /> : null}
    </div>
  );
}

export default PublicFormPage;
