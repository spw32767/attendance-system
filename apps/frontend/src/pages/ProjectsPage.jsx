import { useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";

const PAGE_SIZE = 10;

function ProjectsPage({
  projects,
  onCreateProject,
  onEditProject,
  onOpenProjectForms,
  onLogout,
  theme,
  onToggleTheme,
  navItems,
  activePath,
  onNavigate,
  currentRole,
  onRoleChange
}) {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);

  const filteredProjects = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) {
      return projects;
    }

    return projects.filter((project) => {
      const searchable = [
        project.project_code,
        project.project_name,
        project.project_type,
        project.source_url
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [projects, searchText]);

  const totalRows = filteredProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const normalizedPage = Math.min(page, totalPages);
  const startIndex = (normalizedPage - 1) * PAGE_SIZE;
  const pagedProjects = filteredProjects.slice(startIndex, startIndex + PAGE_SIZE);
  const showingStart = totalRows === 0 ? 0 : startIndex + 1;
  const showingEnd = totalRows === 0 ? 0 : startIndex + pagedProjects.length;

  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", "โครงการ"]}
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
        <h1>จัดการโครงการ</h1>
        <button className="primary-button" type="button" onClick={onCreateProject}>
          สร้างโครงการ
        </button>
      </section>

      <section className="templates-card">
        <div className="templates-search-row">
          <input
            className="input-control templates-search"
            type="text"
            value={searchText}
            placeholder="ค้นหาโครงการ"
            onChange={(event) => {
              setSearchText(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="templates-table-wrap">
          <table className="templates-table project-table">
            <thead>
              <tr>
                <th>#</th>
                <th>โครงการ</th>
                <th>ประเภท</th>
                <th>สถานะ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {pagedProjects.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={5}>
                    ไม่พบโครงการ
                  </td>
                </tr>
              ) : (
                pagedProjects.map((project, index) => (
                  <tr key={project.project_id}>
                    <td>{startIndex + index + 1}</td>
                    <td>
                      <div className="project-title-cell">
                        <p>{project.project_name}</p>
                        <small>{project.project_code}</small>
                      </div>
                    </td>
                    <td>{project.project_type_label || project.project_type}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          project.is_active
                            ? "status-pill-active"
                            : "status-pill-inactive"
                        }`}
                      >
                        {project.is_active ? "ใช้งาน" : "ปิดใช้งาน"}
                      </span>
                    </td>
                    <td>
                      <div className="inline-action-row">
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => onOpenProjectForms(project.project_id)}
                        >
                          ฟอร์ม
                        </button>
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => onEditProject(project.project_id)}
                        >
                          แก้ไข
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="templates-footer">
          <p>
            แสดง {showingStart} ถึง {showingEnd} จากทั้งหมด {totalRows} รายการ
          </p>

          <div className="pagination-actions">
            <button
              className="ghost-button"
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={normalizedPage <= 1}
            >
              ก่อนหน้า
            </button>
            <span className="pagination-current">{normalizedPage}</span>
            <button
              className="ghost-button"
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={normalizedPage >= totalPages}
            >
              ถัดไป
            </button>
          </div>
        </footer>
      </section>
    </AdminLayout>
  );
}

export default ProjectsPage;
