import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  ArrowLeft,
  Pencil,
  ClipboardList,
  Package,
  Mail,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import TableActionMenu from "../components/TableActionMenu";

const PAGE_SIZE = 10;

const STATUS_META = {
  published: {
    label: "เปิดใช้งาน",
    className: "status-pill status-pill-active"
  },
  draft: {
    label: "ฉบับร่าง",
    className: "status-pill status-pill-draft"
  },
  closed: {
    label: "ปิดใช้งาน",
    className: "status-pill status-pill-inactive"
  }
};

function AttendanceTemplatesPage({
  project,
  templates,
  onCreateTemplate,
  onEditTemplate,
  onOpenSubmissions,
  onOpenItems,
  onOpenEmail,
  onBackToProjects,
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

  const filteredTemplates = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) {
      return templates;
    }

    return templates.filter((template) => {
      const searchable = [
        template.project_name,
        template.form_name,
        template.public_path,
        template.status,
        template.share_key
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [templates, searchText]);

  const totalRows = filteredTemplates.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const normalizedPage = Math.min(page, totalPages);
  const startIndex = (normalizedPage - 1) * PAGE_SIZE;
  const pagedTemplates = filteredTemplates.slice(startIndex, startIndex + PAGE_SIZE);
  const showingStart = totalRows === 0 ? 0 : startIndex + 1;
  const showingEnd = totalRows === 0 ? 0 : startIndex + pagedTemplates.length;
  const publishedCount = useMemo(
    () => templates.filter((template) => template.status === "published").length,
    [templates]
  );
  const draftCount = useMemo(
    () => templates.filter((template) => template.status === "draft").length,
    [templates]
  );

  const handleSearch = (event) => {
    setSearchText(event.target.value);
    setPage(1);
  };

  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", "โครงการ", project.project_name, "ฟอร์ม"]}
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
          <p className="page-kicker">Forms</p>
          <h1>ฟอร์มของโครงการ</h1>
          <p className="page-summary">
            {project.project_name} ({project.project_code})
          </p>
          <div className="page-stats">
            <div className="page-stat">
              <strong>{templates.length}</strong>
              <span>ฟอร์มทั้งหมด</span>
            </div>
            <div className="page-stat">
              <strong>{publishedCount}</strong>
              <span>พร้อมใช้งาน</span>
            </div>
            <div className="page-stat">
              <strong>{draftCount}</strong>
              <span>ฉบับร่าง</span>
            </div>
          </div>
        </div>
        <div className="page-head-actions inline-action-row">
          <button className="ghost-button icon-text-button" type="button" onClick={onBackToProjects}>
            <ArrowLeft size={15} strokeWidth={2} />
            <span>กลับไปหน้าโครงการ</span>
          </button>
          <button className="primary-button icon-text-button" type="button" onClick={onCreateTemplate}>
            <Plus size={16} strokeWidth={2.4} />
            <span>สร้างฟอร์ม</span>
          </button>
        </div>
      </section>

      <section className="templates-card">
        <div className="templates-search-row">
          <div className="search-input-wrapper">
            <Search size={16} strokeWidth={2} className="search-input-icon" />
            <input
              className="input-control templates-search search-with-icon"
              type="text"
              value={searchText}
              placeholder="ค้นหาเทมเพลต..."
              onChange={handleSearch}
            />
          </div>
          <p className="templates-search-meta">พบ {totalRows} ฟอร์มในโครงการนี้</p>
        </div>

        <div className="templates-table-wrap">
          <table className="templates-table forms-table">
            <thead>
              <tr>
                <th className="table-col-index">#</th>
                <th className="table-col-primary table-col-left">ชื่อฟอร์ม</th>
                <th className="table-col-meta">ลิงก์แบบฟอร์ม</th>
                <th className="table-col-status">สถานะ</th>
                <th className="table-col-actions-wide">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {pagedTemplates.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={5}>
                    ไม่พบเทมเพลต
                  </td>
                </tr>
              ) : (
                pagedTemplates.map((template, index) => {
                  const statusMeta = STATUS_META[template.status] || STATUS_META.draft;
                  const rowNumber = startIndex + index + 1;

                  return (
                    <tr key={template.form_id}>
                      <td className="table-col-index">{rowNumber}</td>
                      <td className="table-col-primary table-col-left">
                        <div className="table-primary-cell">
                          <p>{template.form_name}</p>
                          <small>{template.status === "published" ? "พร้อมเผยแพร่" : "ต้องตรวจสอบก่อนเปิดใช้งาน"}</small>
                        </div>
                      </td>
                      <td className="table-col-meta">
                        <div className="template-url">
                          attendance.com/{template.public_path}?={template.share_key}
                        </div>
                      </td>
                      <td className="table-col-status">
                        <div className="table-status-readout">
                          <span className={statusMeta.className}>{statusMeta.label}</span>
                        </div>
                      </td>
                      <td className="table-col-actions-wide">
                        <div className="table-actions">
                          <button
                            className="table-action-button table-action-button-primary"
                            type="button"
                            onClick={() => onEditTemplate(template.form_id)}
                          >
                            <Pencil size={13} strokeWidth={2} />
                            <span>แก้ไข</span>
                          </button>
                          <button
                            className="table-action-button table-action-button-secondary"
                            type="button"
                            onClick={() => onOpenSubmissions(template.form_id)}
                          >
                            <ClipboardList size={13} strokeWidth={2} />
                            <span>คำตอบ</span>
                          </button>
                          <TableActionMenu
                            label="การจัดการฟอร์มเพิ่มเติม"
                            items={[
                              {
                                label: "ของ/สิทธิ์",
                                icon: Package,
                                onClick: () => onOpenItems(template.form_id)
                              },
                              {
                                label: "อีเมล",
                                icon: Mail,
                                onClick: () => onOpenEmail(template.form_id)
                              }
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
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
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
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

export default AttendanceTemplatesPage;
