import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  Folder,
  ExternalLink,
  Pencil
} from "lucide-react";
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
  const [closingProjects, setClosingProjects] = useState({});
  const collapseTimersRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(collapseTimersRef.current).forEach((timerId) => {
        window.clearTimeout(timerId);
      });
    };
  }, []);

  const toggleProjectCollapse = (projectId) => {
    const projectKey = Number(projectId);
    const isCollapsed = Boolean(collapsedProjects[projectKey]);
    const isClosing = Boolean(closingProjects[projectKey]);

    if (isCollapsed || isClosing) {
      if (collapseTimersRef.current[projectKey]) {
        window.clearTimeout(collapseTimersRef.current[projectKey]);
        delete collapseTimersRef.current[projectKey];
      }
      setClosingProjects((current) => {
        if (!current[projectKey]) {
          return current;
        }
        const next = { ...current };
        delete next[projectKey];
        return next;
      });
      setCollapsedProjects((current) => ({
        ...current,
        [projectKey]: false
      }));
      return;
    }

    setClosingProjects((current) => ({
      ...current,
      [projectKey]: true
    }));

    collapseTimersRef.current[projectKey] = window.setTimeout(() => {
      setCollapsedProjects((current) => ({
        ...current,
        [projectKey]: true
      }));
      setClosingProjects((current) => {
        const next = { ...current };
        delete next[projectKey];
        return next;
      });
      delete collapseTimersRef.current[projectKey];
    }, 190);
  };

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
                const isClosing = Boolean(closingProjects[project.project_id]);
                const isExpanded = !isCollapsed && !isClosing;
                const canExpand = isCollapsed || isClosing;
                const projectForms = formsByProjectId[project.project_id] || [];
                const shouldRenderForms = !isCollapsed || isClosing;

                return (
                  <Fragment key={`project-group-${project.project_id}`}>
                    <tr
                      key={`project-${project.project_id}`}
                      className="dashboard-project-row dashboard-project-row-clickable"
                      onClick={() => toggleProjectCollapse(project.project_id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleProjectCollapse(project.project_id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-expanded={isExpanded}
                      aria-label={`${canExpand ? "ขยาย" : "พับ"}โครงการ ${project.project_name}`}
                    >
                      <td>
                        <div className="dashboard-tree-cell dashboard-tree-project-cell">
                          <button
                            className="dashboard-collapse-btn"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleProjectCollapse(project.project_id);
                            }}
                            aria-label={canExpand ? "ขยายฟอร์มในโครงการ" : "พับฟอร์มในโครงการ"}
                            title={canExpand ? "ขยายฟอร์มในโครงการ" : "พับฟอร์มในโครงการ"}
                          >
                            <ChevronRight
                              size={16}
                              strokeWidth={2.2}
                              className={`dashboard-collapse-chevron${
                                isExpanded ? " dashboard-collapse-chevron-open" : ""
                              }`}
                            />
                          </button>
                          <Folder size={18} strokeWidth={1.8} className="dashboard-tree-icon" />
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
                          <label
                            className="toggle-switch-label"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(project.is_active)}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) =>
                                onToggleProjectUsage(project.project_id, event.target.checked)
                              }
                            />
                            <span className="toggle-switch-track">
                              <span className="toggle-switch-thumb" />
                            </span>
                          </label>
                        </div>
                      </td>
                      <td>
                        <button
                          className="text-button icon-text-button"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenProjectForms(project.project_id);
                          }}
                        >
                          <ExternalLink size={14} strokeWidth={2} />
                          <span>เปิดหน้าฟอร์ม</span>
                        </button>
                      </td>
                    </tr>

                    {shouldRenderForms
                      ? projectForms.map((form) => {
                          const isEnabled = form.status === "published";
                          return (
                            <tr
                              key={`form-${form.form_id}`}
                              className={`dashboard-form-row${
                                isClosing ? " dashboard-form-row-collapsing" : " dashboard-form-row-expanding"
                              }`}
                            >
                              <td>
                                <div className="dashboard-tree-cell dashboard-tree-form-cell">
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
                                  <label className="toggle-switch-label">
                                    <input
                                      type="checkbox"
                                      checked={isEnabled}
                                      onChange={(event) =>
                                        onToggleFormUsage(form.form_id, event.target.checked)
                                      }
                                    />
                                    <span className="toggle-switch-track">
                                      <span className="toggle-switch-thumb" />
                                    </span>
                                  </label>
                                </div>
                              </td>
                              <td>
                                <button
                                  className="text-button icon-text-button"
                                  type="button"
                                  onClick={() =>
                                    onOpenFormEditor(form.project_id, form.form_id)
                                  }
                                >
                                  <Pencil size={13} strokeWidth={2} />
                                  <span>แก้ไขฟอร์ม</span>
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
