import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  Folder,
  ExternalLink,
  Pencil
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";

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

  const activeProjectsCount = useMemo(
    () => projects.filter((project) => project.is_active).length,
    [projects]
  );

  const publishedFormsCount = useMemo(
    () => forms.filter((form) => form.status === "published").length,
    [forms]
  );

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
        <div className="page-head-body">
          <p className="page-kicker">Overview</p>
          <h1>แดชบอร์ดโครงการและฟอร์ม</h1>
          <p className="page-summary">
            มองภาพรวมการเปิดใช้งานโครงการและฟอร์มทั้งหมดในหน้าเดียว เพื่อไล่ตรวจสอบสถานะได้เร็วขึ้น
          </p>
          <div className="page-stats">
            <div className="page-stat">
              <strong>{projects.length}</strong>
              <span>โครงการทั้งหมด</span>
            </div>
            <div className="page-stat">
              <strong>{activeProjectsCount}</strong>
              <span>โครงการที่เปิดใช้งาน</span>
            </div>
            <div className="page-stat">
              <strong>{publishedFormsCount}</strong>
              <span>ฟอร์มที่เผยแพร่</span>
            </div>
          </div>
        </div>
      </section>

      <section className="templates-card dashboard-matrix-card">
        <div className="templates-table-wrap">
          <table className="templates-table dashboard-tree-table">
            <thead>
              <tr>
                <th className="table-col-primary table-col-left">ชื่อโครงการ / ฟอร์ม</th>
                <th className="table-col-secondary">ประเภท</th>
                <th className="table-col-status">สถานะ / เปิดใช้งาน</th>
                <th className="table-col-actions">จัดการ</th>
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
                      <td className="table-col-primary table-col-left">
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
                      <td className="table-col-secondary">{project.project_type_label || project.project_type}</td>
                      <td className="table-col-status">
                        <div className="dashboard-status-cell">
                          <div
                            className="table-status-control"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <label className="toggle-switch-label table-status-switch">
                              <input
                                type="checkbox"
                                checked={Boolean(project.is_active)}
                                onClick={(event) => event.stopPropagation()}
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
                          </div>
                        </div>
                      </td>
                      <td className="table-col-actions">
                        <button
                          className="table-action-button table-action-button-primary"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenProjectForms(project.project_id);
                          }}
                        >
                          <ExternalLink size={14} strokeWidth={2} />
                          <span>ดูฟอร์ม</span>
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
                              <td className="table-col-primary table-col-left">
                                <div className="dashboard-tree-cell dashboard-tree-form-cell">
                                  <div>
                                    <p>{form.form_name}</p>
                                    <small>/forms/{form.public_path}</small>
                                  </div>
                                </div>
                              </td>
                              <td className="table-col-secondary">{form.form_type}</td>
                              <td className="table-col-status">
                                <div className="dashboard-status-cell">
                                  <div className="table-status-control">
                                    <label className="toggle-switch-label table-status-switch">
                                      <input
                                        type="checkbox"
                                        checked={isEnabled}
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
                                  </div>
                                </div>
                              </td>
                              <td className="table-col-actions">
                                <button
                                  className="table-action-button table-action-button-primary"
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
