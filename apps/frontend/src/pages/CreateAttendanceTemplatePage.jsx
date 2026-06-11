import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Button, PageHead, useToast } from "../components/ui";
import DetailsTab from "./formBuilder/DetailsTab";
import QuestionsTab from "./formBuilder/QuestionsTab";
import {
  createChoiceOption,
  createField,
  createInitialDraft,
  isChoiceType,
  resequenceFields,
  sequenceOptions,
  toOptionValue
} from "./formBuilder/helpers";

function CreateAttendanceTemplatePage({
  selectedTemplateId,
  selectedProjectId,
  projectRecords,
  editingTemplate,
  onLoadDraft,
  onSaveForm,
  onBack,
  onLogout,
  theme,
  onToggleTheme,
  navItems,
  activePath,
  onNavigate,
  currentRole,
  onRoleChange
}) {
  const availableProjects = useMemo(() => projectRecords || [], [projectRecords]);
  const [draft, setDraft] = useState(() =>
    createInitialDraft(null, selectedProjectId, availableProjects)
  );
  const [activeFieldId, setActiveFieldId] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [showPreview, setShowPreview] = useState(false);
  const [draggingFieldId, setDraggingFieldId] = useState(null);
  const [dragOverFieldId, setDragOverFieldId] = useState(null);
  // "draft" vs "published" or null when idle. Used so the right button shows
  // a spinner — and the other one stays clickable but visually muted.
  const [savingAs, setSavingAs] = useState(null);
  const toast = useToast();

  const activeProject = useMemo(
    () =>
      availableProjects.find(
        (project) => Number(project.project_id) === Number(draft.project_id)
      ) || null,
    [availableProjects, draft.project_id]
  );

  useEffect(() => {
    const loadDraft = async () => {
      const loadedDraft = await onLoadDraft(selectedTemplateId, selectedProjectId);
      const nextDraft = createInitialDraft(
        loadedDraft,
        selectedProjectId,
        availableProjects
      );
      setDraft(nextDraft);
      setActiveFieldId(nextDraft.fields[0]?.id || null);
      setActiveTab("details");
      setShowPreview(false);
    };

    void loadDraft();
  }, [availableProjects, onLoadDraft, selectedProjectId, selectedTemplateId]);

  useEffect(() => {
    if (!draft.fields.length) {
      setActiveFieldId(null);
      return;
    }
    const exists = draft.fields.some((field) => field.id === activeFieldId);
    if (!exists) {
      setActiveFieldId(draft.fields[0].id);
    }
  }, [draft.fields, activeFieldId]);

  const updateFormValue = (key, value) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const updateField = (fieldId, updater) => {
    setDraft((current) => ({
      ...current,
      fields: resequenceFields(
        current.fields.map((field) => (field.id === fieldId ? updater(field) : field))
      )
    }));
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
      if (sourceIndex < 0) return current;
      const source = current.fields[sourceIndex];
      const duplicate = {
        ...source,
        id: `${source.id}_copy_${Date.now().toString(36)}`,
        field_code: `${source.field_code}_copy`,
        field_label: source.field_label
          ? `${source.field_label} (สำเนา)`
          : "คำถามใหม่",
        settings_json: { ...source.settings_json },
        options: sequenceOptions(
          (source.options || []).map((option) => ({
            ...option,
            id: `${option.id}_copy_${Date.now().toString(36)}`
          }))
        )
      };
      createdId = duplicate.id;
      const nextFields = [...current.fields];
      nextFields.splice(sourceIndex + 1, 0, duplicate);
      return { ...current, fields: resequenceFields(nextFields) };
    });
    if (createdId) setActiveFieldId(createdId);
  };

  const removeField = (fieldId) => {
    setDraft((current) => {
      if (current.fields.length <= 1) {
        return { ...current, fields: [createField("short_text", 1)] };
      }
      return {
        ...current,
        fields: resequenceFields(current.fields.filter((field) => field.id !== fieldId))
      };
    });
  };

  const reorderField = (sourceFieldId, targetFieldId) => {
    if (!sourceFieldId || !targetFieldId || sourceFieldId === targetFieldId) return;
    setDraft((current) => {
      const sourceIndex = current.fields.findIndex((f) => f.id === sourceFieldId);
      const targetIndex = current.fields.findIndex((f) => f.id === targetFieldId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const nextFields = [...current.fields];
      const [moved] = nextFields.splice(sourceIndex, 1);
      nextFields.splice(targetIndex, 0, moved);
      return { ...current, fields: resequenceFields(nextFields) };
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
    updateField(fieldId, (field) => ({
      ...field,
      options: sequenceOptions([...field.options, createChoiceOption(field.options.length)])
    }));
  };

  const updateOptionLabel = (fieldId, optionId, optionLabel) => {
    updateField(fieldId, (field) => ({
      ...field,
      options: sequenceOptions(
        field.options.map((option, optionIndex) => {
          if (option.id !== optionId) return option;
          return {
            ...option,
            option_label: optionLabel,
            option_value: toOptionValue(optionLabel, optionIndex)
          };
        })
      )
    }));
  };

  const removeOption = (fieldId, optionId) => {
    updateField(fieldId, (field) => {
      if (field.options.length <= 1) return field;
      return {
        ...field,
        options: sequenceOptions(field.options.filter((option) => option.id !== optionId))
      };
    });
  };

  const handleSave = async (targetStatus) => {
    if (savingAs) {
      return;
    }
    setSavingAs(targetStatus);
    const payload = { ...draft, status: targetStatus };
    try {
      const saveResult = await onSaveForm(selectedTemplateId, payload, targetStatus);

      if (!selectedTemplateId && saveResult?.formId) {
        toast.success("บันทึกฟอร์มใหม่แล้ว กำลังเปิดหน้าแก้ไข");
        onNavigate(
          `/admin/forms/editor?project=${payload.project_id}&template=${saveResult.formId}`
        );
        return;
      }

      setDraft((current) => ({ ...current, status: targetStatus }));
      toast.success(
        targetStatus === "published"
          ? "เผยแพร่แบบฟอร์มแล้ว ทีมงานเริ่มใช้งานได้ทันที"
          : "บันทึกฉบับร่างแล้ว กลับมาแก้ไขต่อได้ทุกเมื่อ"
      );
    } catch (err) {
      toast.error(
        err instanceof Error && err.message ? err.message : "บันทึกฟอร์มไม่สำเร็จ"
      );
    } finally {
      setSavingAs(null);
    }
  };

  return (
    <AdminLayout
      breadcrumbs={[
        "แอดมิน",
        "โครงการ",
        activeProject?.project_name || "ฟอร์ม",
        editingTemplate ? "แก้ไขฟอร์ม" : "สร้างฟอร์ม"
      ]}
      onLogout={onLogout}
      onBack={onBack}
      theme={theme}
      onToggleTheme={onToggleTheme}
      navItems={navItems}
      activePath={activePath}
      onNavigate={onNavigate}
      currentRole={currentRole}
      onRoleChange={onRoleChange}
    >
      <div className="builder-page-width">
        <PageHead
          title={editingTemplate ? "แก้ไขเทมเพลต" : "สร้างเทมเพลต"}
          meta={
            editingTemplate
              ? `กำลังแก้ไข: ${editingTemplate.form_name}${
                  editingTemplate.project_name ? ` · ${editingTemplate.project_name}` : ""
                }`
              : "สร้างแบบฟอร์มได้ง่ายในรูปแบบที่คุ้นเคย คล้าย Google Forms"
          }
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => handleSave("draft")}
                loading={savingAs === "draft"}
                disabled={savingAs !== null}
              >
                <span>
                  {savingAs === "draft" ? "กำลังบันทึก..." : "บันทึกฉบับร่าง"}
                </span>
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSave("published")}
                loading={savingAs === "published"}
                disabled={savingAs !== null}
              >
                <span>
                  {savingAs === "published" ? "กำลังเผยแพร่..." : "เผยแพร่"}
                </span>
              </Button>
            </>
          }
        />
      </div>

      <div className="builder-page-width">
        <nav className="builder-tabs" aria-label="แท็บจัดการแบบฟอร์ม">
          <button
            className={`builder-tab-button${
              activeTab === "details" ? " builder-tab-button-active" : ""
            }`}
            type="button"
            onClick={() => setActiveTab("details")}
          >
            รายละเอียดแบบฟอร์ม
          </button>
          <button
            className={`builder-tab-button${
              activeTab === "questions" ? " builder-tab-button-active" : ""
            }`}
            type="button"
            onClick={() => setActiveTab("questions")}
          >
            คำถาม
          </button>
        </nav>
      </div>

      {activeTab === "details" ? (
        <DetailsTab
          draft={draft}
          availableProjects={availableProjects}
          onChange={updateFormValue}
        />
      ) : null}

      {activeTab === "questions" ? (
        <QuestionsTab
          draft={draft}
          activeFieldId={activeFieldId}
          dragOverFieldId={dragOverFieldId}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview((current) => !current)}
          onEditDetails={() => setActiveTab("details")}
          onActivateField={setActiveFieldId}
          onUpdateField={updateField}
          onAddField={addField}
          onDuplicateField={duplicateField}
          onRemoveField={removeField}
          onAddOption={addOption}
          onUpdateOptionLabel={updateOptionLabel}
          onRemoveOption={removeOption}
          onFieldDragStart={handleFieldDragStart}
          onFieldDragOver={handleFieldDragOver}
          onFieldDrop={handleFieldDrop}
          onFieldDragEnd={handleFieldDragEnd}
        />
      ) : null}
    </AdminLayout>
  );
}

export default CreateAttendanceTemplatePage;
