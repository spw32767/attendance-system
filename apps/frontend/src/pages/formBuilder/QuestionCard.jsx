import { Copy, Trash2 } from "lucide-react";
import { FIELD_TYPES, FIELD_USAGES } from "../../constants/formBuilder";
import {
  applyFieldTypePreset,
  isChoiceType,
  normalizeFileSettings,
  normalizeRatingSettings,
  supportsUniqueValue
} from "./helpers";

const TEXT_PLACEHOLDER_HINT = {
  short_text: "คำตอบสั้น",
  long_text: "คำตอบยาว"
};

function QuestionCard({
  field,
  fieldIndex,
  isActive,
  isDragOver,
  onActivate,
  onUpdate,
  onDuplicate,
  onRemove,
  onAddOption,
  onUpdateOptionLabel,
  onRemoveOption,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}) {
  const updatePartial = (patch) =>
    onUpdate(field.id, (current) => ({ ...current, ...patch }));

  const updateSettings = (patch) =>
    onUpdate(field.id, (current) => ({
      ...current,
      settings_json: { ...current.settings_json, ...patch }
    }));

  const className = [
    "question-card",
    isActive ? "question-card-active" : "",
    isDragOver ? "question-card-drag-over" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={className}
      onClick={() => onActivate(field.id)}
      onDragOver={(event) => onDragOver(event, field.id)}
      onDrop={(event) => onDrop(event, field.id)}
    >
      <div className="question-drag-top">
        <button
          className="question-drag-handle"
          type="button"
          draggable
          onDragStart={(event) => onDragStart(event, field.id)}
          onDragEnd={onDragEnd}
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
            onChange={(event) => updatePartial({ field_label: event.target.value })}
          />
          <select
            className="question-type-select"
            value={field.field_type}
            onChange={(event) =>
              onUpdate(field.id, (current) =>
                applyFieldTypePreset(current, event.target.value)
              )
            }
          >
            {FIELD_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {isActive ? (
          <textarea
            className="question-desc-input"
            rows={1}
            value={field.field_description}
            placeholder="คำอธิบาย (ถ้ามี)"
            onChange={(event) =>
              updatePartial({ field_description: event.target.value })
            }
          />
        ) : field.field_description ? (
          <p className="question-desc-static">{field.field_description}</p>
        ) : null}

        {isActive ? (
          <div className="inline-two-cols question-card-usage">
            <label>
              <span>การใช้งานของข้อมูล</span>
              <select
                className="select-control"
                value={field.field_usage}
                onChange={(event) => updatePartial({ field_usage: event.target.value })}
              >
                {FIELD_USAGES.map((usage) => (
                  <option key={usage.value} value={usage.value}>
                    {usage.label}
                  </option>
                ))}
              </select>
            </label>

            {supportsUniqueValue(field.field_type) ? (
              <label className="checkbox-row question-card-unique">
                <input
                  type="checkbox"
                  checked={field.is_unique_value}
                  onChange={(event) =>
                    updatePartial({ is_unique_value: event.target.checked })
                  }
                />
                <span>บังคับไม่ให้ข้อมูลซ้ำ</span>
              </label>
            ) : (
              <div />
            )}
          </div>
        ) : null}

        {/* Text placeholder editor (short / long) */}
        {(field.field_type === "short_text" || field.field_type === "long_text") ? (
          isActive ? (
            <label className="question-placeholder-edit">
              <span className="question-placeholder-label">ข้อความตัวอย่าง</span>
              <input
                className="question-title-input question-title-input-sm"
                value={field.placeholder}
                placeholder={TEXT_PLACEHOLDER_HINT[field.field_type]}
                onChange={(event) => updatePartial({ placeholder: event.target.value })}
              />
            </label>
          ) : (
            <div
              className={`question-placeholder-field${
                field.field_type === "long_text" ? " question-placeholder-field-multiline" : ""
              }`}
            >
              {field.placeholder || TEXT_PLACEHOLDER_HINT[field.field_type]}
            </div>
          )
        ) : null}

        {/* Choice editor */}
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
                    onUpdateOptionLabel(field.id, option.id, event.target.value)
                  }
                />
                <button
                  className="choice-remove-btn"
                  type="button"
                  onClick={() => onRemoveOption(field.id, option.id)}
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

            <div className="choice-add-row">
              {field.field_type === "multiple_choice" ? (
                <span className="choice-add-indicator" />
              ) : field.field_type === "checkboxes" ? (
                <span className="choice-add-indicator choice-add-indicator-checkbox" />
              ) : (
                <span className="choice-indicator-dropdown">
                  {field.options.length + 1}.
                </span>
              )}
              <button
                className="choice-add-button"
                type="button"
                onClick={() => onAddOption(field.id)}
              >
                เพิ่มตัวเลือก
              </button>
            </div>

            {field.field_type !== "dropdown" ? (
              <div className="choice-other-toggle">
                <label className="checkbox-row compact">
                  <input
                    type="checkbox"
                    checked={field.allow_other_option}
                    onChange={(event) =>
                      updatePartial({ allow_other_option: event.target.checked })
                    }
                  />
                  <span>เพิ่มตัวเลือก &quot;อื่นๆ&quot;</span>
                </label>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Rating editor */}
        {field.field_type === "rating" ? (
          <>
            <div className="rating-editor-preview">
              {Array.from({
                length:
                  (field.settings_json.rating_max || 5) -
                  (field.settings_json.rating_min || 1) +
                  1
              }).map((_, index) => {
                const value = (field.settings_json.rating_min || 1) + index;
                return (
                  <span key={value} className="rating-number">
                    {value}
                  </span>
                );
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
                    updateSettings(
                      normalizeRatingSettings({
                        rating_min: nextMin,
                        rating_max: field.settings_json.rating_max || 5
                      })
                    );
                  }}
                >
                  {Array.from({ length: 9 }).map((_, i) => {
                    const number = i + 1;
                    return (
                      <option key={number} value={number}>
                        {number}
                      </option>
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
                    updateSettings(
                      normalizeRatingSettings({
                        rating_min: field.settings_json.rating_min || 1,
                        rating_max: nextMax
                      })
                    );
                  }}
                >
                  {Array.from({ length: 9 }).map((_, i) => {
                    const number = i + 2;
                    return (
                      <option key={number} value={number}>
                        {number}
                      </option>
                    );
                  })}
                </select>
              </label>
            </div>
          </>
        ) : null}

        {/* Date / time placeholders */}
        {field.field_type === "date" ? (
          <div className="question-placeholder-field">วัน / เดือน / ปี</div>
        ) : null}
        {field.field_type === "time" ? (
          <div className="question-placeholder-field">เวลา</div>
        ) : null}

        {/* File upload editor */}
        {field.field_type === "file_upload" ? (
          isActive ? (
            <div className="inline-two-cols question-card-usage">
              <label>
                <span>ขนาดไฟล์สูงสุด (MB)</span>
                <input
                  className="input-control"
                  type="number"
                  min={1}
                  max={50}
                  value={field.settings_json.max_file_size_mb || 10}
                  onChange={(event) =>
                    updateSettings(
                      normalizeFileSettings({
                        ...field.settings_json,
                        max_file_size_mb: Number(event.target.value)
                      })
                    )
                  }
                />
              </label>
              <label>
                <span>จำนวนไฟล์สูงสุด</span>
                <input
                  className="input-control"
                  type="number"
                  min={1}
                  max={5}
                  value={field.settings_json.max_file_count || 1}
                  onChange={(event) =>
                    updateSettings(
                      normalizeFileSettings({
                        ...field.settings_json,
                        max_file_count: Number(event.target.value)
                      })
                    )
                  }
                />
              </label>
              <label className="full-width">
                <span>ประเภทไฟล์ที่อนุญาต</span>
                <input
                  className="input-control"
                  value={field.settings_json.allowed_file_types || ""}
                  placeholder="เช่น pdf,jpg,jpeg,png"
                  onChange={(event) =>
                    updateSettings(
                      normalizeFileSettings({
                        ...field.settings_json,
                        allowed_file_types: event.target.value
                      })
                    )
                  }
                />
              </label>
            </div>
          ) : (
            <div className="question-placeholder-field">
              รองรับไฟล์{" "}
              {field.settings_json.allowed_file_types || "pdf,jpg,jpeg,png"}
            </div>
          )
        ) : null}

        {/* Footer */}
        <div className="question-footer">
          <label className="question-switch">
            <input
              type="checkbox"
              checked={field.is_required}
              onChange={(event) => updatePartial({ is_required: event.target.checked })}
            />
            <span className="question-switch-slider" />
            <span className="question-switch-text">บังคับตอบ</span>
          </label>

          <span className="question-footer-divider" />

          <div className="question-actions">
            <button
              className="icon-only-button icon-neutral-button"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDuplicate(field.id);
              }}
              title="ทำสำเนาคำถาม"
              aria-label="ทำสำเนาคำถาม"
            >
              <Copy size={16} aria-hidden="true" />
            </button>
            <button
              className="icon-only-button icon-danger-button"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRemove(field.id);
              }}
              title="ลบคำถาม"
              aria-label="ลบคำถาม"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default QuestionCard;
