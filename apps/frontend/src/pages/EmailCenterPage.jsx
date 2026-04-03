import { useMemo, useState } from "react";
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
  onNavigate
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

  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", "อีเมล"]}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
      navItems={navItems}
      activePath={activePath}
      onNavigate={onNavigate}
    >
      <section className="templates-head">
        <h1>อีเมลยืนยันและประวัติการส่ง</h1>
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

      <section className="templates-card" style={{ marginTop: 12 }}>
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
          <div />
        </div>

        <div className="templates-table-wrap">
          {activeTab === "templates" ? (
            <table className="templates-table">
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Notification</th>
                  <th>โครงการ/ฟอร์ม</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {visibleTemplates.map((template) => (
                  <tr key={template.email_template_id}>
                    <td>{template.template_name}</td>
                    <td>{template.notification_code}</td>
                    <td>
                      <div className="project-title-cell">
                        <p>{template.project_name}</p>
                        <small>{template.form_name}</small>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          template.is_active ? "status-pill-active" : "status-pill-inactive"
                        }`}
                      >
                        {template.is_active ? "ใช้งาน" : "ปิดใช้งาน"}
                      </span>
                      <div style={{ marginTop: 6 }}>
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => {
                            setEditingTemplateId(template.email_template_id);
                            setDraftSubject(template.email_subject || "");
                            setDraftBody(template.email_body || "");
                          }}
                        >
                          แก้ไขข้อความ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="templates-table">
              <thead>
                <tr>
                  <th>เวลา</th>
                  <th>ผู้รับ</th>
                  <th>Notification</th>
                  <th>โครงการ/ฟอร์ม</th>
                  <th>ผลการส่ง</th>
                </tr>
              </thead>
              <tbody>
                {visibleLogs.map((log) => (
                  <tr key={log.email_log_id}>
                    <td>{new Date(log.created_at).toLocaleString("th-TH")}</td>
                    <td>{log.recipient_email}</td>
                    <td>{log.notification_code}</td>
                    <td>
                      <div className="project-title-cell">
                        <p>{log.project_name}</p>
                        <small>{log.form_name}</small>
                      </div>
                    </td>
                    <td>
                      <span className="status-pill status-pill-active">
                        {log.send_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {activeTab === "templates" && editingTemplate ? (
          <section className="module-placeholder-card" style={{ margin: 14 }}>
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
