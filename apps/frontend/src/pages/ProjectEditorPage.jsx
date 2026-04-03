import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

const PROJECT_TYPES = [
  { value: "event", label: "กิจกรรม / อีเวนต์" },
  { value: "website", label: "เว็บไซต์" },
  { value: "organization", label: "หน่วยงาน" }
];

const toProjectCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);

const createInitialDraft = (project) => {
  if (project) {
    return {
      project_name: project.project_name || "",
      project_code: project.project_code || "",
      project_type: project.project_type || "event",
      source_url: project.source_url || "",
      description: project.description || "",
      is_active: Boolean(project.is_active)
    };
  }

  return {
    project_name: "",
    project_code: "",
    project_type: "event",
    source_url: "",
    description: "",
    is_active: true
  };
};

function ProjectEditorPage({
  editingProject,
  onSave,
  onBack,
  onLogout,
  theme,
  onToggleTheme,
  navItems,
  activePath,
  onNavigate
}) {
  const [draft, setDraft] = useState(() => createInitialDraft(editingProject));
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setDraft(createInitialDraft(editingProject));
    setNotice("");
  }, [editingProject]);

  const updateValue = (key, value) => {
    setDraft((current) => ({
      ...current,
      [key]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!draft.project_name.trim()) {
      setNotice("กรุณากรอกชื่อโครงการก่อนบันทึก");
      return;
    }

    const preparedProject = {
      ...draft,
      project_name: draft.project_name.trim(),
      project_code:
        draft.project_code.trim() || toProjectCode(draft.project_name) || "PROJECT"
    };

    onSave(preparedProject);
  };

  return (
    <AdminLayout
      breadcrumbs={[
        "แอดมิน",
        "โครงการ",
        editingProject ? "แก้ไขโครงการ" : "สร้างโครงการ"
      ]}
      onBack={onBack}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
      navItems={navItems}
      activePath={activePath}
      onNavigate={onNavigate}
    >
      <section className="builder-header builder-page-width">
        <div>
          <h1>{editingProject ? "แก้ไขโครงการ" : "สร้างโครงการใหม่"}</h1>
          <p>กำหนดข้อมูลโครงการก่อน แล้วค่อยไปสร้างฟอร์มภายใต้โครงการนี้</p>
        </div>
        <div className="builder-header-actions">
          <button className="ghost-button" type="button" onClick={onBack}>
            ยกเลิก
          </button>
          <button className="primary-button" type="submit" form="project-editor-form">
            บันทึกโครงการ
          </button>
        </div>
      </section>

      {notice ? <p className="notice-banner builder-page-width">{notice}</p> : null}

      <section className="builder-meta-card builder-page-width page-enter">
        <form id="project-editor-form" className="builder-meta-grid" onSubmit={handleSubmit}>
          <label>
            <span>ชื่อโครงการ</span>
            <input
              className="input-control"
              value={draft.project_name}
              placeholder="เช่น งานปฐมนิเทศปีการศึกษา 2569"
              onChange={(event) => updateValue("project_name", event.target.value)}
              required
            />
          </label>

          <label>
            <span>รหัสโครงการ</span>
            <div className="inline-input-action">
              <input
                className="input-control"
                value={draft.project_code}
                placeholder="เช่น ORIENT_2026"
                onChange={(event) => updateValue("project_code", event.target.value)}
              />
              <button
                className="ghost-button"
                type="button"
                onClick={() => updateValue("project_code", toProjectCode(draft.project_name))}
              >
                สร้างอัตโนมัติ
              </button>
            </div>
          </label>

          <label>
            <span>ประเภทโครงการ</span>
            <select
              className="select-control"
              value={draft.project_type}
              onChange={(event) => updateValue("project_type", event.target.value)}
            >
              {PROJECT_TYPES.map((projectType) => (
                <option key={projectType.value} value={projectType.value}>
                  {projectType.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>ลิงก์อ้างอิง (ถ้ามี)</span>
            <input
              className="input-control"
              type="url"
              value={draft.source_url}
              placeholder="https://example.com"
              onChange={(event) => updateValue("source_url", event.target.value)}
            />
          </label>

          <label className="full-width">
            <span>รายละเอียดเพิ่มเติม</span>
            <textarea
              className="textarea-control"
              rows={4}
              value={draft.description}
              placeholder="อธิบายวัตถุประสงค์หรือขอบเขตการใช้งานของโครงการนี้"
              onChange={(event) => updateValue("description", event.target.value)}
            />
          </label>

          <label className="checkbox-row full-width">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(event) => updateValue("is_active", event.target.checked)}
            />
            <span>เปิดใช้งานโครงการนี้</span>
          </label>
        </form>
      </section>
    </AdminLayout>
  );
}

export default ProjectEditorPage;
