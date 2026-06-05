import { useMemo, useState } from "react";
import { ChevronRight, Eye, Folder, Pencil, Plus } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button, EmptyState, Modal, PageHead } from "../components/ui";

function AdminDashboardPage({
  onLogout,
  theme,
  onToggleTheme,
  navItems,
  activePath,
  onNavigate,
  currentRole,
  onRoleChange,
  projects,
  forms,
  onToggleProjectUsage,
  onToggleFormUsage,
  onLoadFormDraft,
  onOpenProjectForms,
  onOpenFormEditor
}) {
  const [previewForm, setPreviewForm] = useState(null);
  const [previewDraft, setPreviewDraft] = useState(null);
  const [previewError, setPreviewError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const formsByProjectId = useMemo(() => {
    return forms.reduce((lookup, form) => {
      const key = Number(form.project_id);
      if (!lookup[key]) {
        lookup[key] = [];
      }
      lookup[key].push(form);
      return lookup;
    }, {});
  }, [forms]);

  const activeProjectsCount = useMemo(
    () => projects.filter((project) => project.is_active).length,
    [projects]
  );

  const publishedFormsCount = useMemo(
    () => forms.filter((form) => form.status === "published").length,
    [forms]
  );

  const closePreviewModal = () => {
    setPreviewForm(null);
    setPreviewDraft(null);
    setPreviewError("");
    setPreviewLoading(false);
  };

  const openPreviewModal = async (form) => {
    setPreviewForm(form);
    setPreviewDraft(null);
    setPreviewError("");
    setPreviewLoading(true);

    try {
      const draft = await onLoadFormDraft(form.form_id, form.project_id);
      setPreviewDraft(draft);
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "โหลดตัวอย่างฟอร์มไม่สำเร็จ");
    } finally {
      setPreviewLoading(false);
    }
  };

  const renderFieldPreviewInput = (field) => {
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
  };

  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", "แดชบอร์ด"]}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
      navItems={navItems}
      activePath={activePath}
      onNavigate={onNavigate}
      currentRole={currentRole}
      onRoleChange={onRoleChange}
    >
      <PageHead
        title="โครงการและฟอร์ม"
        meta={`${projects.length} โครงการ · ${activeProjectsCount} เปิดใช้งาน · ${forms.length} ฟอร์ม · ${publishedFormsCount} เผยแพร่`}
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={<Folder size={22} aria-hidden="true" />}
          title="ยังไม่มีโครงการ"
          description="สร้างโครงการแรกเพื่อเริ่มเก็บข้อมูลการเข้าร่วม"
          action={
            <Button onClick={() => onNavigate?.("/admin/projects/create")}>
              <Plus size={14} aria-hidden="true" />
              <span>สร้างโครงการ</span>
            </Button>
          }
        />
      ) : (
        <div className="dashboard-project-list">
          {projects.map((project) => {
            const projectForms = formsByProjectId[project.project_id] || [];
            const projectActive = Boolean(project.is_active);
            return (
              <article key={project.project_id} className="dashboard-project-card">
                <header className="dashboard-project-head">
                  <div className="dashboard-project-title">
                    <Folder size={18} strokeWidth={1.8} aria-hidden="true" />
                    <div>
                      <h2>{project.project_name}</h2>
                      <p>
                        {project.project_code} · {project.project_type_label || project.project_type} · {projectForms.length} ฟอร์ม
                      </p>
                    </div>
                  </div>
                  <div className="dashboard-project-controls">
                    <label
                      className="toggle-switch-label table-status-switch"
                      title={projectActive ? "ปิดใช้งานโครงการ" : "เปิดใช้งานโครงการ"}
                    >
                      <input
                        type="checkbox"
                        checked={projectActive}
                        onChange={(event) =>
                          onToggleProjectUsage(project.project_id, event.target.checked)
                        }
                      />
                      <span
                        className="toggle-switch-track"
                        data-off-label="ปิด"
                        data-on-label="เปิด"
                      >
                        <span className="toggle-switch-thumb" />
                      </span>
                    </label>
                    <Button
                      variant="ghost"
                      onClick={() => onOpenProjectForms(project.project_id)}
                    >
                      <span>เปิดโครงการ</span>
                      <ChevronRight size={14} aria-hidden="true" />
                    </Button>
                  </div>
                </header>

                {projectForms.length === 0 ? (
                  <p className="dashboard-form-empty">ยังไม่มีฟอร์มในโครงการนี้</p>
                ) : (
                  <ul className="dashboard-form-list">
                    {projectForms.map((form) => {
                      const isPublished = form.status === "published";
                      return (
                        <li key={form.form_id} className="dashboard-form-row">
                          <div className="dashboard-form-info">
                            <p className="dashboard-form-name">{form.form_name}</p>
                            <p className="dashboard-form-meta">
                              <span
                                className={`status-pill ${
                                  isPublished ? "status-pill-active" : "status-pill-draft"
                                }`}
                              >
                                {isPublished ? "เผยแพร่" : "ฉบับร่าง"}
                              </span>
                              <span className="dashboard-form-type">{form.form_type}</span>
                              <span className="dashboard-form-path">/forms/{form.public_path}</span>
                            </p>
                          </div>
                          <div className="dashboard-form-actions">
                            <label
                              className="toggle-switch-label table-status-switch"
                              title={isPublished ? "ปิดการเผยแพร่" : "เผยแพร่ฟอร์ม"}
                            >
                              <input
                                type="checkbox"
                                checked={isPublished}
                                onChange={(event) =>
                                  onToggleFormUsage(form.form_id, event.target.checked)
                                }
                              />
                              <span
                                className="toggle-switch-track"
                                data-off-label="ปิด"
                                data-on-label="เปิด"
                              >
                                <span className="toggle-switch-thumb" />
                              </span>
                            </label>
                            <Button variant="ghost" onClick={() => openPreviewModal(form)}>
                              <Eye size={14} aria-hidden="true" />
                              <span>ดูตัวอย่าง</span>
                            </Button>
                            <Button
                              variant="primary"
                              onClick={() => onOpenFormEditor(form.project_id, form.form_id)}
                            >
                              <Pencil size={14} aria-hidden="true" />
                              <span>แก้ไข</span>
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(previewForm)}
        onClose={closePreviewModal}
        title={previewForm?.form_name || ""}
        description="ตัวอย่างแบบฟอร์ม"
        size="lg"
      >
        {previewLoading ? (
          <p className="dashboard-preview-note">กำลังโหลดตัวอย่างฟอร์ม...</p>
        ) : null}
        {previewError ? (
          <p className="dashboard-preview-note dashboard-preview-note-error">{previewError}</p>
        ) : null}
        {!previewLoading && !previewError && previewDraft ? (
          <div className="google-preview-surface dashboard-preview-surface">
            <article className="google-preview-form-card">
              <div className="google-preview-form-accent" />
              <div className="google-preview-form-body">
                <h3>{previewDraft.form_name || "แบบฟอร์มใหม่"}</h3>
                <p>{previewDraft.form_description || "คำอธิบายแบบฟอร์ม"}</p>
              </div>
            </article>
            {(previewDraft.fields || []).length ? (
              previewDraft.fields.map((field, fieldIndex) => (
                <article
                  key={field.id || `${field.field_code || "field"}_${fieldIndex}`}
                  className="google-preview-question-card"
                >
                  <p className="google-preview-question-title">
                    {field.field_label || `คำถาม ${fieldIndex + 1}`}
                    {field.is_required ? <span className="required-mark">*</span> : null}
                  </p>
                  {field.field_description ? <small>{field.field_description}</small> : null}
                  {renderFieldPreviewInput(field)}
                </article>
              ))
            ) : (
              <article className="google-preview-question-card">
                <p className="google-preview-question-title">ยังไม่มีคำถามในฟอร์มนี้</p>
              </article>
            )}
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}

export default AdminDashboardPage;
