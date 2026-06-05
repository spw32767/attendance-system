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
import { Button, PageHead } from "../components/ui";
import AdminLayout from "../components/AdminLayout";
import TableActionMenu from "../components/TableActionMenu";

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

const buildPublicFormUrl = (publicPath) => {
  if (!publicPath) {
    return "";
  }

  if (typeof window === "undefined") {
    return `/forms/${publicPath}`;
  }

  return `${window.location.origin}/forms/${publicPath}`;
};

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
        template.share_key,
        template.start_at,
        template.end_at,
        template.updated_at
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
      <PageHead
        title="ฟอร์มของโครงการ"
        meta={`${project.project_name} · ${templates.length} ฟอร์ม · ${publishedCount} พร้อมใช้งาน · ${draftCount} ฉบับร่าง`}
        actions={
          <>
            <Button variant="ghost" onClick={onBackToProjects}>
              <ArrowLeft size={14} aria-hidden="true" />
              <span>กลับไปหน้าโครงการ</span>
            </Button>
            <Button variant="primary" onClick={onCreateTemplate}>
              <Plus size={14} aria-hidden="true" />
              <span>สร้างฟอร์ม</span>
            </Button>
          </>
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
                <th className="table-col-date">ช่วงเวลาเปิด-ปิด</th>
                <th className="table-col-date">อัปเดตล่าสุด</th>
                <th className="table-col-status">สถานะ</th>
                <th className="table-col-actions-wide">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {pagedTemplates.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={7}>
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
                          {template.public_path ? (
                            <a
                              href={buildPublicFormUrl(template.public_path)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {buildPublicFormUrl(template.public_path)}
                            </a>
                          ) : (
                            <span>-</span>
                          )}
                        </div>
                      </td>
                      <td className="table-col-date">
                        <div className="table-primary-cell">
                          <p>เริ่ม: {formatDateTime(template.start_at)}</p>
                          <small>สิ้นสุด: {formatDateTime(template.end_at)}</small>
                        </div>
                      </td>
                      <td className="table-col-date">{formatDateTime(template.updated_at)}</td>
                      <td className="table-col-status">
                        <div className="table-status-readout">
                          <span className={statusMeta.className}>{statusMeta.label}</span>
                        </div>
                      </td>
                      <td className="table-col-actions-wide">
                        <div className="table-actions">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onEditTemplate(template.form_id)}
                          >
                            <Pencil size={13} strokeWidth={2} aria-hidden="true" />
                            <span>แก้ไข</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenSubmissions(template.form_id)}
                          >
                            <ClipboardList size={13} strokeWidth={2} aria-hidden="true" />
                            <span>คำตอบ</span>
                          </Button>
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
