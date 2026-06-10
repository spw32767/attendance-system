import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button, PageHead } from "../components/ui";

// Two flows currently emit emails. Keep these in sync with the backend
// constants in admin.data.ts (DEFAULT_SUBMISSION_EMAIL_TEMPLATE / DEFAULT_CHECKIN_EMAIL_TEMPLATE).
const NOTIFICATION_PRESETS = {
  submission_confirmation: {
    label: "ยืนยันการลงทะเบียน",
    templateName: "เทมเพลตยืนยันการลงทะเบียน",
    subject: "ยืนยันการลงทะเบียน {{form_name}} - {{submission_code}}",
    body:
      "<p>สวัสดีคุณ {{full_name}}</p>\n" +
      "<p>ระบบได้รับการลงทะเบียนของคุณสำหรับงาน <strong>{{form_name}}</strong> เรียบร้อยแล้ว</p>\n" +
      "<p>รหัสการลงทะเบียน: <strong>{{submission_code}}</strong></p>"
  },
  checkin_confirmation: {
    label: "ยืนยันเช็กอิน",
    templateName: "เทมเพลตยืนยันเช็กอิน",
    subject: "ยืนยันเช็กอิน {{form_name}} - {{submission_code}}",
    body:
      "<p>สวัสดีคุณ {{full_name}}</p>\n" +
      "<p>ระบบได้ยืนยันการเช็กอินของคุณสำหรับงาน <strong>{{form_name}}</strong> เรียบร้อยแล้ว</p>\n" +
      "<p>รหัสการลงทะเบียน: <strong>{{submission_code}}</strong></p>"
  }
};

const NOTIFICATION_OPTIONS = Object.entries(NOTIFICATION_PRESETS).map(
  ([value, preset]) => ({ value, label: preset.label })
);

const notificationLabel = (code) =>
  NOTIFICATION_PRESETS[code]?.label || code || "-";

function EmailCenterPage({
  templates,
  logs,
  projects,
  forms,
  onSaveTemplate,
  onCreateTemplate,
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

  const [showCreate, setShowCreate] = useState(false);
  const [createFormId, setCreateFormId] = useState("");
  const [createNotificationCode, setCreateNotificationCode] = useState(
    "submission_confirmation"
  );
  const [createName, setCreateName] = useState(
    NOTIFICATION_PRESETS.submission_confirmation.templateName
  );
  const [createSubject, setCreateSubject] = useState(
    NOTIFICATION_PRESETS.submission_confirmation.subject
  );
  const [createBody, setCreateBody] = useState(
    NOTIFICATION_PRESETS.submission_confirmation.body
  );
  const [createError, setCreateError] = useState("");
  const [createBusy, setCreateBusy] = useState(false);

  const applyNotificationPreset = (code) => {
    setCreateNotificationCode(code);
    const preset = NOTIFICATION_PRESETS[code];
    if (preset) {
      setCreateName(preset.templateName);
      setCreateSubject(preset.subject);
      setCreateBody(preset.body);
    }
  };

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

  const handleSubmitCreate = async () => {
    setCreateError("");
    if (!createFormId) {
      setCreateError("กรุณาเลือกฟอร์ม");
      return;
    }
    if (!createName.trim()) {
      setCreateError("กรุณากรอกชื่อเทมเพลต");
      return;
    }
    setCreateBusy(true);
    try {
      await onCreateTemplate?.({
        form_id: Number(createFormId),
        notification_code: createNotificationCode,
        template_name: createName.trim(),
        email_subject: createSubject,
        email_body: createBody
      });
      setShowCreate(false);
      setCreateFormId("");
      // Reset the form back to the submission-confirmation preset.
      applyNotificationPreset("submission_confirmation");
    } catch (err) {
      setCreateError(err?.message || "สร้างเทมเพลตไม่สำเร็จ");
    } finally {
      setCreateBusy(false);
    }
  };

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
      <PageHead
        title="อีเมลยืนยันและประวัติการส่ง"
        meta={`${templates.length} เทมเพลต · ${activeTemplateCount} ใช้งาน · ${logs.length} ประวัติการส่ง`}
      />

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
          {activeTab === "templates" ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setShowCreate((value) => !value);
                setCreateError("");
              }}
            >
              <Plus size={13} strokeWidth={2} aria-hidden="true" />
              <span>เพิ่มเทมเพลต</span>
            </Button>
          ) : null}
        </div>

        {activeTab === "templates" && showCreate ? (
          <section className="module-placeholder-card templates-card-inset">
            <p>สร้างเทมเพลตใหม่</p>
            <div className="builder-meta-grid" style={{ marginTop: 12 }}>
              <label className="full-width">
                <span>ฟอร์ม</span>
                <select
                  className="select-control"
                  value={createFormId}
                  onChange={(event) => setCreateFormId(event.target.value)}
                >
                  <option value="">เลือกฟอร์ม</option>
                  {forms.map((form) => (
                    <option key={form.form_id} value={form.form_id}>
                      {form.project_name
                        ? `${form.project_name} / ${form.form_name}`
                        : form.form_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full-width">
                <span>ประเภทอีเมล</span>
                <select
                  className="select-control"
                  value={createNotificationCode}
                  onChange={(event) => applyNotificationPreset(event.target.value)}
                >
                  {NOTIFICATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full-width">
                <span>ชื่อเทมเพลต</span>
                <input
                  className="input-control"
                  value={createName}
                  onChange={(event) => setCreateName(event.target.value)}
                />
              </label>
              <label className="full-width">
                <span>หัวข้ออีเมล</span>
                <input
                  className="input-control"
                  value={createSubject}
                  onChange={(event) => setCreateSubject(event.target.value)}
                />
              </label>
              <label className="full-width">
                <span>เนื้อหาอีเมล</span>
                <textarea
                  className="textarea-control"
                  rows={6}
                  value={createBody}
                  onChange={(event) => setCreateBody(event.target.value)}
                />
              </label>
            </div>
            <p className="templates-search-meta" style={{ marginTop: 8 }}>
              ตัวแปรที่ใช้ได้: {"{{full_name}}"} · {"{{form_name}}"} · {"{{submission_code}}"}
            </p>
            {createError ? (
              <p style={{ color: "var(--danger)", marginTop: 8 }}>{createError}</p>
            ) : null}
            <div className="inline-action-row" style={{ marginTop: 12 }}>
              <button
                className="primary-button"
                type="button"
                disabled={createBusy}
                onClick={handleSubmitCreate}
              >
                {createBusy ? "กำลังสร้าง…" : "สร้างเทมเพลต"}
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  setCreateError("");
                }}
              >
                ยกเลิก
              </button>
            </div>
          </section>
        ) : null}

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
                    <td className="table-col-secondary">
                      <div className="table-primary-cell">
                        <p>{notificationLabel(template.notification_code)}</p>
                        <small>{template.notification_code}</small>
                      </div>
                    </td>
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
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setEditingTemplateId(template.email_template_id);
                            setDraftSubject(template.email_subject || "");
                            setDraftBody(template.email_body || "");
                          }}
                        >
                          <Pencil size={13} strokeWidth={2} aria-hidden="true" />
                          <span>แก้ไขข้อความ</span>
                        </Button>
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
                    <td className="table-col-secondary">
                      <div className="table-primary-cell">
                        <p>{notificationLabel(log.notification_code)}</p>
                        <small>{log.notification_code}</small>
                      </div>
                    </td>
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
