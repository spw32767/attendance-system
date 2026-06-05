import { Eye, Pencil, Plus } from "lucide-react";
import { Button } from "../../components/ui";
import FieldPreview from "./FieldPreview";
import QuestionCard from "./QuestionCard";

function QuestionsTab({
  draft,
  activeFieldId,
  dragOverFieldId,
  showPreview,
  onTogglePreview,
  onEditDetails,
  onActivateField,
  onUpdateField,
  onAddField,
  onDuplicateField,
  onRemoveField,
  onAddOption,
  onUpdateOptionLabel,
  onRemoveOption,
  onFieldDragStart,
  onFieldDragOver,
  onFieldDrop,
  onFieldDragEnd
}) {
  return (
    <section className="questions-tab-shell builder-page-width">
      <div className="section-head">
        <h2>{showPreview ? "ตัวอย่างแบบฟอร์ม" : `คำถาม (${draft.fields.length})`}</h2>
        <div className="section-head-actions">
          <Button variant="ghost" size="sm" onClick={onTogglePreview}>
            {showPreview ? (
              <>
                <Pencil size={14} aria-hidden="true" />
                <span>กลับไปแก้ไข</span>
              </>
            ) : (
              <>
                <Eye size={14} aria-hidden="true" />
                <span>ดูตัวอย่าง</span>
              </>
            )}
          </Button>
          {!showPreview ? (
            <Button variant="primary" size="sm" onClick={() => onAddField("short_text")}>
              <Plus size={14} aria-hidden="true" />
              <span>เพิ่มคำถาม</span>
            </Button>
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
              <FieldPreview field={field} />
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
            <button className="text-button" type="button" onClick={onEditDetails}>
              แก้ไขรายละเอียดแบบฟอร์ม
            </button>
          </article>

          {draft.fields.map((field, fieldIndex) => (
            <QuestionCard
              key={field.id}
              field={field}
              fieldIndex={fieldIndex}
              isActive={activeFieldId === field.id}
              isDragOver={dragOverFieldId === field.id}
              onActivate={onActivateField}
              onUpdate={onUpdateField}
              onDuplicate={onDuplicateField}
              onRemove={onRemoveField}
              onAddOption={onAddOption}
              onUpdateOptionLabel={onUpdateOptionLabel}
              onRemoveOption={onRemoveOption}
              onDragStart={onFieldDragStart}
              onDragOver={onFieldDragOver}
              onDrop={onFieldDrop}
              onDragEnd={onFieldDragEnd}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default QuestionsTab;
