/**
 * Renders a disabled preview of a single field — used in both the form builder
 * preview mode and the dashboard quick-preview modal.
 */
function FieldPreview({ field }) {
  const options = Array.isArray(field.options) ? field.options : [];

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
        {options.map((option) => (
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
        {options.map((option) => (
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
        {options.map((option) => (
          <option key={option.id}>{option.option_label || "ตัวเลือก"}</option>
        ))}
      </select>
    );
  }

  if (field.field_type === "rating") {
    const min = Number(field.settings_json?.rating_min || 1);
    const max = Number(field.settings_json?.rating_max || 5);
    const numbers = [];
    for (let value = min; value <= max; value += 1) {
      numbers.push(value);
    }
    return (
      <div className="preview-rating">
        {numbers.map((value) => (
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

  if (field.field_type === "file_upload") {
    const maxFileCount = Number(field.settings_json?.max_file_count || 1);
    return (
      <div className="file-upload-preview">
        <button className="ghost-button" type="button" disabled>
          เลือกไฟล์
        </button>
        <small>อัปโหลดได้สูงสุด {maxFileCount} ไฟล์</small>
      </div>
    );
  }

  return null;
}

export default FieldPreview;
