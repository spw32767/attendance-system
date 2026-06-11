import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Pencil,
  Archive,
  ArchiveRestore,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button, ConfirmDialog, PageHead, useToast } from "../components/ui";



const PAGE_SIZE = 10;

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("th-TH");
};

function ProjectsPage({
  projects,
  onCreateProject,
  onEditProject,
  onOpenProjectForms,
  onArchiveProject,
  onRestoreProject,
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
  const [showArchived, setShowArchived] = useState(false);
  const [pendingArchiveId, setPendingArchiveId] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const toast = useToast();

  const archivedCount = useMemo(
    () => projects.filter((project) => project.is_archived).length,
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    const visible = showArchived
      ? projects
      : projects.filter((project) => !project.is_archived);

    if (!keyword) {
      return visible;
    }

    return visible.filter((project) => {
      const searchable = [
        project.project_code,
        project.project_name,
        project.project_type,
        project.source_url,
        project.updated_at
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [projects, searchText, showArchived]);

  const handleArchiveClick = (project) => {
    if (pendingArchiveId) {
      return;
    }
    setArchiveTarget(project);
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) {
      return;
    }
    setPendingArchiveId(archiveTarget.project_id);
    try {
      await onArchiveProject?.(archiveTarget.project_id);
      setArchiveTarget(null);
    } catch (err) {
      toast.error(err?.message || "เก็บเข้าคลังไม่สำเร็จ");
    } finally {
      setPendingArchiveId(null);
    }
  };

  const handleRestoreClick = async (project) => {
    if (pendingArchiveId) {
      return;
    }
    setPendingArchiveId(project.project_id);
    try {
      await onRestoreProject?.(project.project_id);
    } catch (err) {
      toast.error(err?.message || "นำกลับไม่สำเร็จ");
    } finally {
      setPendingArchiveId(null);
    }
  };

  const totalRows = filteredProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const normalizedPage = Math.min(page, totalPages);
  const startIndex = (normalizedPage - 1) * PAGE_SIZE;
  const pagedProjects = filteredProjects.slice(startIndex, startIndex + PAGE_SIZE);
  const showingStart = totalRows === 0 ? 0 : startIndex + 1;
  const showingEnd = totalRows === 0 ? 0 : startIndex + pagedProjects.length;
  const activeProjects = useMemo(
    () => projects.filter((project) => project.is_active).length,
    [projects]
  );
  const projectTypes = useMemo(
    () => new Set(projects.map((project) => project.project_type)).size,
    [projects]
  );

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
      <PageHead
        title="จัดการโครงการ"
        meta={`${projects.length} โครงการ · ${activeProjects} เปิดใช้งาน · ${projectTypes} ประเภท`}
        actions={
          <Button variant="primary" onClick={onCreateProject}>
            <Plus size={14} aria-hidden="true" />
            <span>สร้างโครงการ</span>
          </Button>
        }
      />

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
          <p className="templates-search-meta">พบ {totalRows} โครงการตามเงื่อนไขปัจจุบัน</p>
          {archivedCount > 0 || showArchived ? (
            <label className="checkbox-row compact" style={{ marginLeft: "auto" }}>
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(event) => {
                  setShowArchived(event.target.checked);
                  setPage(1);
                }}
              />
              <span>แสดงที่เก็บเข้าคลัง ({archivedCount})</span>
            </label>
          ) : null}
        </div>

        <div className="templates-table-wrap">
          <table className="templates-table project-table">
            <thead>
              <tr>
                <th className="table-col-index">#</th>
                <th className="table-col-primary table-col-left">โครงการ</th>
                <th className="table-col-secondary">ประเภท</th>
                <th className="table-col-meta">เว็บไซต์</th>
                <th className="table-col-date">อัปเดตล่าสุด</th>
                <th className="table-col-status">สถานะ</th>
                <th className="table-col-actions">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {pagedProjects.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={7}>
                    ไม่พบโครงการ
                  </td>
                </tr>
              ) : (
                pagedProjects.map((project, index) => (
                  <tr
                    key={project.project_id}
                    style={project.is_archived ? { opacity: 0.55 } : undefined}
                  >
                    <td className="table-col-index">{startIndex + index + 1}</td>
                    <td className="table-col-primary table-col-left">
                      <div className="table-primary-cell">
                        <p>{project.project_name}</p>
                        <small>{project.project_code}</small>
                      </div>
                    </td>
                    <td className="table-col-secondary">{project.project_type_label || project.project_type}</td>
                    <td className="table-col-meta">
                      {project.source_url ? (
                        <a href={project.source_url} target="_blank" rel="noreferrer">
                          {project.source_url}
                        </a>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="table-col-date">{formatDateTime(project.updated_at)}</td>
                    <td className="table-col-status">
                      <div className="table-status-readout">
                        {project.is_archived ? (
                          <span className="status-pill status-pill-inactive">
                            อยู่ในคลัง
                          </span>
                        ) : (
                          <span
                            className={`status-pill ${
                              project.is_active
                                ? "status-pill-active"
                                : "status-pill-inactive"
                            }`}
                          >
                            {project.is_active ? "ใช้งาน" : "ปิดใช้งาน"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-col-actions">
                      <div className="table-actions table-actions-nowrap">
                        {project.is_archived ? (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={pendingArchiveId === project.project_id}
                            onClick={() => handleRestoreClick(project)}
                          >
                            <ArchiveRestore size={13} strokeWidth={2} aria-hidden="true" />
                            <span>นำกลับ</span>
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onOpenProjectForms(project.project_id)}
                            >
                              <FileText size={13} strokeWidth={2} aria-hidden="true" />
                              <span>ฟอร์ม</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditProject(project.project_id)}
                            >
                              <Pencil size={13} strokeWidth={2} aria-hidden="true" />
                              <span>แก้ไข</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={pendingArchiveId === project.project_id}
                              onClick={() => handleArchiveClick(project)}
                            >
                              <Archive size={13} strokeWidth={2} aria-hidden="true" />
                              <span>เก็บเข้าคลัง</span>
                            </Button>
                          </>
                        )}
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

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchiveConfirm}
        busy={pendingArchiveId === archiveTarget?.project_id}
        title="เก็บโครงการเข้าคลัง?"
        description={archiveTarget?.project_name}
        confirmLabel="เก็บเข้าคลัง"
        confirmVariant="danger"
      >
        โครงการ ฟอร์ม และคำตอบทั้งหมดในโครงการนี้จะถูกซ่อนจากระบบ
        แต่ข้อมูลยังคงอยู่ใน DB และสามารถกดปุ่ม "นำกลับ"
        เพื่อกู้คืนได้ตลอดเวลา
      </ConfirmDialog>
    </AdminLayout>
  );
}

export default ProjectsPage;
