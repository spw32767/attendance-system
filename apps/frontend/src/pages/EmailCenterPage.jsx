import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import AdminLayout from "../components/AdminLayout";

function EmailCenterPage({
  templates,
  logs,
  projects,
  forms,
  onSaveTemplate,
  onLogout,
  theme,
  onToggleTheme,
  navItems,
  activePath,
  onNavigate,
  currentRole,
  onRoleChange
}) {
  const [activeTab, setActiveTab] = useState("templates");
  const [projectFilter, setProjectFilter] = useState("");
  const [formFilter, setFormFilter] = useState("");
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");

  const projectForms = useMemo(
    () =>
      projectFilter
        ? forms.filter((form) => Number(form.project_id) === Number(projectFilter))
        : forms,
    [projectFilter, forms]
  );

  const visibleTemplates = useMemo(
    () =>
      templates.filter((row) => {
        if (projectFilter && Number(row.project_id) !== Number(projectFilter)) {
          return false;
        }
        if (formFilter && String(row.form_id) !== String(formFilter)) {
          return false;
        }
        return true;
      }),
    [templates, projectFilter, formFilter]
  );

  const visibleLogs = useMemo(
    () =>
      logs.filter((row) => {
        if (projectFilter && Number(row.project_id) !== Number(projectFilter)) {
          return false;
        }
        if (formFilter && String(row.form_id) !== String(formFilter)) {
          return false;
        }
        return true;
      }),
    [logs, projectFilter, formFilter]
  );

  const editingTemplate =
    visibleTemplates.find(
      (template) => Number(template.email_template_id) === Number(editingTemplateId)
    ) || null;

  const activeTemplateCount = useMemo(
    () => templates.filter((template) => template.is_active).length,
    [templates]
  );

  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", "อีเมล"]}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
      navItems={navItems}
      activePath={activePath}
      onNavigate={onNavigate}
      currentRole={currentRole}
      onRoleChange={onRoleChange}
    >
      <section className="templates-head">
        <div className="page-head-body">
          <p className="page-kicker">Email Center</p>
          <h1>อีเมลยืนยันและประวัติการส่ง</h1>
          <p className="page-summary">
            จัดการเทมเพลตแจ้งเตือนและตรวจสอบประวัติการส่งตามโครงการและฟอร์มได้จากหน้าจอเดียว
          </p>
          <div className="page-stats">
            <div className="page-stat">
              <strong>{templates.length}</strong>
              <span>เทมเพลตทั้งหมด</span>
            </div>
            <div className="page-stat">
              <strong>{activeTemplateCount}</strong>
              <span>เทมเพลตที่ใช้งาน</span>
            </div>
            <div className="page-stat">
              <strong>{logs.length}</strong>
              <span>ประวัติการส่ง</span>
            </div>
          </div>
        </div>
      </section>

      <nav className="builder-tabs" aria-label="แท็บอีเมล">
        <button
          className={`builder-tab-button${activeTab === "templates" ? " builder-tab-button-active" : ""}`}
          type="button"
          onClick={() => setActiveTab("templates")}
        >
          เทมเพลตอีเมล
        </button>
        <button
          className={`builder-tab-button${activeTab === "logs" ? " builder-tab-button-active" : ""}`}
          type="button"
          onClick={() => setActiveTab("logs")}
        >
          ประวัติการส่ง
        </button>
      </nav>

      <section className="templates-card section-stack-gap-sm">
        <div className="templates-search-row submissions-filters">
          <select
            className="select-control"
            value={projectFilter}
            onChange={(event) => {
              setProjectFilter(event.target.value);
              setFormFilter("");
            }}
          >
            <option value="">ทุกโครงการ</option>
            {projects.map((project) => (
              <option key={project.project_id} value={project.project_id}>
                {project.project_name}
              </option>
            ))}
          </select>

          <select
            className="select-control"
            value={formFilter}
            onChange={(event) => setFormFilter(event.target.value)}
          >
            <option value="">ทุกฟอร์ม</option>
            {projectForms.map((form) => (
              <option key={form.form_id} value={form.form_id}>
                {form.form_name}
              </option>
            ))}
          </select>
          <p className="templates-search-meta submissions-search-meta">
            {activeTab === "templates"
              ? `แสดง ${visibleTemplates.length} เทมเพลต`
              : `แสดง ${visibleLogs.length} รายการส่งอีเมล`}
          </p>
        </div>

        <div className="templates-table-wrap">
          {activeTab === "templates" ? (
            <table className="templates-table table-first-col-left">
              <thead>
                <tr>
                  <th className="table-col-primary table-col-left">Template</th>
                  <th className="table-col-secondary">Notification</th>
                  <th className="table-col-meta">โครงการ/ฟอร์ม</th>
                  <th className="table-col-status">สถานะ</th>
                  <th className="table-col-actions">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {visibleTemplates.map((template) => (
                  <tr key={template.email_template_id}>
                    <td className="table-col-primary table-col-left">
                      <div className="table-primary-cell">
                        <p>{template.template_name}</p>
                        <small>{template.is_active ? "พร้อมใช้งาน" : "ปิดใช้งานอยู่"}</small>
                      </div>
                    </td>
                    <td className="table-col-secondary">{template.notification_code}</td>
                    <td className="table-col-meta">
                      <div className="table-primary-cell">
                        <p>{template.project_name}</p>
                        <small>{template.form_name}</small>
                      </div>
                    </td>
                    <td className="table-col-status">
                      <div className="table-status-readout">
                        <span
                          className={`status-pill ${
                            template.is_active ? "status-pill-active" : "status-pill-inactive"
                          }`}
                        >
                          {template.is_active ? "ใช้งาน" : "ปิดใช้งาน"}
                        </span>
                      </div>
                    </td>
                    <td className="table-col-actions">
                      <div className="table-actions">
                        <button
                          className="table-action-button table-action-button-primary"
                          type="button"
                          onClick={() => {
                            setEditingTemplateId(template.email_template_id);
                            setDraftSubject(template.email_subject || "");
                            setDraftBody(template.email_body || "");
                          }}
                        >
                          <Pencil size={13} strokeWidth={2} />
                          <span>แก้ไขข้อความ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="templates-table table-first-col-left">
              <thead>
                <tr>
                  <th className="table-col-date">เวลา</th>
                  <th className="table-col-meta">ผู้รับ</th>
                  <th className="table-col-secondary">Notification</th>
                  <th className="table-col-meta">โครงการ/ฟอร์ม</th>
                  <th className="table-col-status">ผลการส่ง</th>
                </tr>
              </thead>
              <tbody>
                {visibleLogs.map((log) => (
                  <tr key={log.email_log_id}>
                    <td className="table-col-date">{new Date(log.created_at).toLocaleString("th-TH")}</td>
                    <td className="table-col-meta">{log.recipient_email}</td>
                    <td className="table-col-secondary">{log.notification_code}</td>
                    <td className="table-col-meta">
                      <div className="table-primary-cell">
                        <p>{log.project_name}</p>
                        <small>{log.form_name}</small>
                      </div>
                    </td>
                    <td className="table-col-status">
                      <div className="table-status-readout">
                        <span className="status-pill status-pill-active">{log.send_status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {activeTab === "templates" && editingTemplate ? (
          <section className="module-placeholder-card templates-card-inset">
            <p>
              กำลังแก้ไขเทมเพลต: <strong>{editingTemplate.template_name}</strong>
            </p>
            <div className="builder-meta-grid" style={{ marginTop: 12 }}>
              <label className="full-width">
                <span>หัวข้ออีเมล</span>
                <input
                  className="input-control"
                  value={draftSubject}
                  onChange={(event) => setDraftSubject(event.target.value)}
                />
              </label>
              <label className="full-width">
                <span>เนื้อหาอีเมล</span>
                <textarea
                  className="textarea-control"
                  rows={6}
                  value={draftBody}
                  onChange={(event) => setDraftBody(event.target.value)}
                />
              </label>
            </div>
            <div className="inline-action-row" style={{ marginTop: 12 }}>
              <button
                className="primary-button"
                type="button"
                onClick={() =>
                  onSaveTemplate?.(editingTemplate.email_template_id, {
                    email_subject: draftSubject,
                    email_body: draftBody
                  })
                }
              >
                บันทึกเทมเพลต
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => {
                  setEditingTemplateId(null);
                  setDraftSubject("");
                  setDraftBody("");
                }}
              >
                ยกเลิก
              </button>
            </div>
          </section>
        ) : null}
      </section>
    </AdminLayout>
  );
}

export default EmailCenterPage;
