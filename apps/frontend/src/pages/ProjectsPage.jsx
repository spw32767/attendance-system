import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Pencil,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
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
        <button className="primary-button icon-text-button" type="button" onClick={onCreateProject}>
          <Plus size={16} strokeWidth={2.4} />
          <span>สร้างโครงการ</span>
        </button>
      </section>

      <section className="templates-card">
        <div className="templates-search-row">
          <div className="search-input-wrapper">
            <Search size={16} strokeWidth={2} className="search-input-icon" />
            <input
              className="input-control templates-search search-with-icon"
              type="text"
              value={searchText}
              placeholder="ค้นหาโครงการ..."
              onChange={(event) => {
                setSearchText(event.target.value);
                setPage(1);
              }}
            />
          </div>
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
                          className="text-button icon-text-button"
                          type="button"
                          onClick={() => onOpenProjectForms(project.project_id)}
                        >
                          <FileText size={13} strokeWidth={2} />
                          <span>ฟอร์ม</span>
                        </button>
                        <button
                          className="text-button icon-text-button"
                          type="button"
                          onClick={() => onEditProject(project.project_id)}
                        >
                          <Pencil size={13} strokeWidth={2} />
                          <span>แก้ไข</span>
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
              className="ghost-button icon-text-button"
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={normalizedPage <= 1}
            >
              <ChevronLeft size={15} strokeWidth={2} />
              <span>ก่อนหน้า</span>
            </button>
            <span className="pagination-current">{normalizedPage}</span>
            <button
              className="ghost-button icon-text-button"
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={normalizedPage >= totalPages}
            >
              <span>ถัดไป</span>
              <ChevronRight size={15} strokeWidth={2} />
            </button>
          </div>
        </footer>
      </section>
    </AdminLayout>
  );
}

export default ProjectsPage;
