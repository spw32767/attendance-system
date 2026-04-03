import { Fragment, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";

const STATUS_LABELS = {
  published: "เปิดใช้งาน",
  draft: "ฉบับร่าง",
  closed: "ปิดใช้งาน"
};

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
  onOpenProjectForms,
  onOpenFormEditor
}) {
  const [collapsedProjects, setCollapsedProjects] = useState({});

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
      <section className="templates-head">
        <h1>แดชบอร์ดโครงการและฟอร์ม</h1>
      </section>

      <section className="templates-card dashboard-matrix-card">
        <div className="templates-table-wrap">
          <table className="templates-table dashboard-tree-table">
            <thead>
              <tr>
                <th>ชื่อโครงการ / ฟอร์ม</th>
                <th>ประเภท</th>
                <th>สถานะ / เปิดใช้งาน</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const isCollapsed = Boolean(collapsedProjects[project.project_id]);
                const projectForms = formsByProjectId[project.project_id] || [];

                return (
                  <Fragment key={`project-group-${project.project_id}`}>
                    <tr key={`project-${project.project_id}`} className="dashboard-project-row">
                      <td>
                        <div className="dashboard-tree-cell dashboard-tree-project-cell">
                          <button
                            className="icon-only-button icon-neutral-button dashboard-collapse-button"
                            type="button"
                            onClick={() =>
                              setCollapsedProjects((current) => ({
                                ...current,
                                [project.project_id]: !current[project.project_id]
                              }))
                            }
                            aria-label={isCollapsed ? "ขยายฟอร์มในโครงการ" : "พับฟอร์มในโครงการ"}
                            title={isCollapsed ? "ขยายฟอร์มในโครงการ" : "พับฟอร์มในโครงการ"}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-collapse-icon">
                              <path
                                d={isCollapsed ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <div>
                            <p>{project.project_name}</p>
                            <small>
                              {project.project_code} • {projectForms.length} ฟอร์ม
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{project.project_type_label || project.project_type}</td>
                      <td>
                        <div className="dashboard-status-cell">
                          <span
                            className={`status-pill ${
                              project.is_active ? "status-pill-active" : "status-pill-inactive"
                            }`}
                          >
                            {project.is_active ? "ใช้งาน" : "ปิดใช้งาน"}
                          </span>
                          <label className="checkbox-row compact status-toggle-inline">
                            <span>เปิดใช้งาน</span>
                            <input
                              type="checkbox"
                              checked={Boolean(project.is_active)}
                              onChange={(event) =>
                                onToggleProjectUsage(project.project_id, event.target.checked)
                              }
                            />
                          </label>
                        </div>
                      </td>
                      <td>
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => onOpenProjectForms(project.project_id)}
                        >
                          เปิดหน้าฟอร์มโครงการ
                        </button>
                      </td>
                    </tr>

                    {!isCollapsed
                      ? projectForms.map((form) => {
                          const isEnabled = form.status === "published";
                          return (
                            <tr key={`form-${form.form_id}`} className="dashboard-form-row">
                              <td>
                                <div className="dashboard-tree-cell dashboard-tree-form-cell">
                                  <span className="dashboard-tree-connector" />
                                  <div>
                                    <p>{form.form_name}</p>
                                    <small>/forms/{form.public_path}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{form.form_type}</td>
                              <td>
                                <div className="dashboard-status-cell">
                                  <span
                                    className={`status-pill ${
                                      isEnabled ? "status-pill-active" : "status-pill-inactive"
                                    }`}
                                  >
                                    {STATUS_LABELS[form.status] || form.status}
                                  </span>
                                  <label className="checkbox-row compact status-toggle-inline">
                                    <span>เปิดใช้งาน</span>
                                    <input
                                      type="checkbox"
                                      checked={isEnabled}
                                      onChange={(event) =>
                                        onToggleFormUsage(form.form_id, event.target.checked)
                                      }
                                    />
                                  </label>
                                </div>
                              </td>
                              <td>
                                <button
                                  className="text-button"
                                  type="button"
                                  onClick={() =>
                                    onOpenFormEditor(form.project_id, form.form_id)
                                  }
                                >
                                  แก้ไขฟอร์ม
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboardPage;
