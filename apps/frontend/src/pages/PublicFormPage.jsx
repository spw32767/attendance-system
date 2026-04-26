import { useEffect, useMemo, useState } from "react";

const EMPTY_MESSAGES = {
  not_found: {
    title: "ไม่พบแบบฟอร์ม",
    description: "ลิงก์นี้อาจไม่ถูกต้อง หรือแบบฟอร์มถูกย้าย/ลบแล้ว"
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

function PublicFormPage({
  publicPath,
  onLoadPublicForm,
  onSubmitPublicForm,
  onNavigateSuccess,
  onGoLogin
}) {
  const [loading, setLoading] = useState(true);
  const [formStatus, setFormStatus] = useState("not_found");
  const [formData, setFormData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const result = await onLoadPublicForm(publicPath);
      setFormStatus(result.status);
      setFormData(result.form || null);

      const nextAnswers = {};
      (result.form?.fields || []).forEach((field) => {
        if (field.field_type === "checkboxes") {
          nextAnswers[field.id] = [];
          return;
        }

        nextAnswers[field.id] = "";
      });

      setAnswers(nextAnswers);
      setErrors({});
      setLoading(false);
    };

    void load();
  }, [onLoadPublicForm, publicPath]);

  const orderedFields = useMemo(
    () => [...(formData?.fields || [])].sort((a, b) => a.sort_order - b.sort_order),
    [formData]
  );

  const setAnswer = (fieldId, value) => {
    setAnswers((current) => ({
      ...current,
      [fieldId]: value
    }));
  };

  const validate = () => {
    const nextErrors = {};

    orderedFields.forEach((field) => {
      if (!field.is_required) {
        return;
      }

      if (isEmptyAnswer(answers[field.id])) {
        nextErrors[field.id] = "กรุณากรอกข้อมูลช่องนี้";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const result = await onSubmitPublicForm(publicPath, { answers });
    if (!result.ok) {
      setFormStatus(result.status || "closed");
      return;
    }

    if (onNavigateSuccess) {
      onNavigateSuccess(result);
    }
  };

  if (loading) {
    return (
      <div className="public-form-shell page-enter">
        <section className="public-form-card">
          <p>กำลังโหลดแบบฟอร์ม...</p>
        </section>
      </div>
    );
  }

  if (formStatus !== "open" || !formData) {
    const message = EMPTY_MESSAGES[formStatus] || EMPTY_MESSAGES.closed;
    return (
      <div className="public-form-shell page-enter">
        <section className="public-form-card">
          <p className="public-form-chip">Public Form</p>
          <h1>{message.title}</h1>
          <p>{message.description}</p>
          <button className="ghost-button" type="button" onClick={onGoLogin}>
            กลับหน้าเข้าสู่ระบบ
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="public-form-shell page-enter">
      <section className="google-preview-surface">
        <article className="google-preview-form-card">
          <div className="google-preview-form-accent" />
          <div className="google-preview-form-body">
            <h3>{formData.form_name || "แบบฟอร์ม"}</h3>
            <p>{formData.form_description || "กรุณากรอกข้อมูลให้ครบถ้วน"}</p>
          </div>
        </article>

        <form className="public-live-google-form" onSubmit={handleSubmit}>
          {orderedFields.map((field) => (
            <article key={field.id} className="google-preview-question-card">
              <p className="google-preview-question-title">
                {field.field_label || "คำถาม"}
                {field.is_required ? <strong className="required-mark">*</strong> : null}
              </p>

              {field.field_description ? <small>{field.field_description}</small> : null}

              {field.field_type === "short_text" ? (
                <input
                  className="input-control"
                  value={answers[field.id] || ""}
                  placeholder={field.placeholder || "คำตอบสั้น"}
                  onChange={(event) => setAnswer(field.id, event.target.value)}
                />
              ) : null}

              {field.field_type === "long_text" ? (
                <textarea
                  className="textarea-control"
                  rows={3}
                  value={answers[field.id] || ""}
                  placeholder={field.placeholder || "คำตอบยาว"}
                  onChange={(event) => setAnswer(field.id, event.target.value)}
                />
              ) : null}

              {field.field_type === "multiple_choice" ? (
                <div className="preview-options">
                  {(field.options || []).map((option) => {
                    const optionValue = option.option_value || option.option_label;
                    return (
                      <label key={option.id}>
                        <input
                          type="radio"
                          name={`field_${field.id}`}
                          checked={(answers[field.id] || "") === optionValue}
                          onChange={() => setAnswer(field.id, optionValue)}
                        />
                        <span>{option.option_label}</span>
                      </label>
                    );
                  })}
                </div>
              ) : null}

              {field.field_type === "checkboxes" ? (
                <div className="preview-options">
                  {(field.options || []).map((option) => {
                    const optionValue = option.option_value || option.option_label;
                    const currentValues = answers[field.id] || [];
                    const checked = currentValues.includes(optionValue);

                    return (
                      <label key={option.id}>
                        <input
                          type="checkbox"
                          checked={checked}
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
                  value={answers[field.id] || ""}
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
                  value={answers[field.id] || ""}
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
                  type="date"
                  value={answers[field.id] || ""}
                  onChange={(event) => setAnswer(field.id, event.target.value)}
                />
              ) : null}

              {field.field_type === "time" ? (
                <input
                  className="input-control"
                  type="time"
                  value={answers[field.id] || ""}
                  onChange={(event) => setAnswer(field.id, event.target.value)}
                />
              ) : null}

              {field.field_type === "file_upload" ? (
                <div className="file-upload-preview">
                  <input
                    className="input-control"
                    type="file"
                    multiple={(field.settings_json?.max_file_count || 1) > 1}
                    onChange={(event) => setAnswer(field.id, event.target.files)}
                  />
                </div>
              ) : null}

              {errors[field.id] ? <small className="public-form-error">{errors[field.id]}</small> : null}
            </article>
          ))}

          <article className="google-preview-question-card">
            <button className="primary-button" type="submit">
              ส่งข้อมูล
            </button>
          </article>
        </form>
      </section>
    </div>
  );
}

export default PublicFormPage;
