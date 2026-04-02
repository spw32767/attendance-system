import { useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { templateRecords } from "../mock/templates";

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
  onCreateTemplate,
  onEditTemplate,
  onLogout,
  theme,
  onToggleTheme
}) {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);

  const filteredTemplates = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) {
      return templateRecords;
    }

    return templateRecords.filter((template) => {
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
  }, [searchText]);

  const totalRows = filteredTemplates.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const normalizedPage = Math.min(page, totalPages);
  const startIndex = (normalizedPage - 1) * PAGE_SIZE;
  const pagedTemplates = filteredTemplates.slice(startIndex, startIndex + PAGE_SIZE);
  const showingStart = totalRows === 0 ? 0 : startIndex + 1;
  const showingEnd = totalRows === 0 ? 0 : startIndex + pagedTemplates.length;

  const handleSearch = (event) => {
    setSearchText(event.target.value);
    setPage(1);
  };

  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", "เทมเพลตลงชื่อเข้าร่วม"]}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <section className="templates-head">
        <h1>เทมเพลตลงชื่อเข้าร่วม</h1>
        <button className="primary-button" type="button" onClick={onCreateTemplate}>
          สร้างเทมเพลต
        </button>
      </section>

      <section className="templates-card">
        <div className="templates-search-row">
          <input
            className="input-control templates-search"
            type="text"
            value={searchText}
            placeholder="ค้นหาเทมเพลต"
            onChange={handleSearch}
          />
        </div>

        <div className="templates-table-wrap">
          <table className="templates-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ลิงก์แบบฟอร์ม</th>
                <th>สถานะ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {pagedTemplates.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={4}>
                    ไม่พบเทมเพลต
                  </td>
                </tr>
              ) : (
                pagedTemplates.map((template, index) => {
                  const statusMeta = STATUS_META[template.status] || STATUS_META.draft;
                  const rowNumber = startIndex + index + 1;

                  return (
                    <tr key={template.form_id}>
                      <td>{rowNumber}</td>
                      <td>
                        <div className="template-url">
                          attendance.com/{template.public_path}?={template.share_key}
                        </div>
                      </td>
                      <td>
                        <span className={statusMeta.className}>{statusMeta.label}</span>
                      </td>
                      <td>
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => onEditTemplate(template.form_id)}
                        >
                          แก้ไข
                        </button>
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
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
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

export default AttendanceTemplatesPage;
