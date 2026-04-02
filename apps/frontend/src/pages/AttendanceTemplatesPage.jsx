import { useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { templateRecords } from "../mock/templates";

const PAGE_SIZE = 10;

const STATUS_META = {
  published: {
    label: "Active",
    className: "status-pill status-pill-active"
  },
  draft: {
    label: "Draft",
    className: "status-pill status-pill-draft"
  },
  closed: {
    label: "Inactive",
    className: "status-pill status-pill-inactive"
  }
};

function AttendanceTemplatesPage({ onCreateTemplate, onEditTemplate, onLogout }) {
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
      breadcrumbs={["Admin", "Attendance Templates"]}
      onLogout={onLogout}
    >
      <section className="templates-head">
        <h1>Attendance Templates</h1>
        <button className="primary-button" type="button" onClick={onCreateTemplate}>
          Create Att Template
        </button>
      </section>

      <section className="templates-card">
        <div className="templates-search-row">
          <input
            className="input-control templates-search"
            type="text"
            value={searchText}
            placeholder="Search templates"
            onChange={handleSearch}
          />
        </div>

        <div className="templates-table-wrap">
          <table className="templates-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Template URL</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedTemplates.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={4}>
                    No template found.
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
                          Edit
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
            Showing {showingStart} to {showingEnd} of {totalRows} results
          </p>

          <div className="pagination-actions">
            <button
              className="ghost-button"
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={normalizedPage <= 1}
            >
              Previous
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
              Next
            </button>
          </div>
        </footer>
      </section>
    </AdminLayout>
  );
}

export default AttendanceTemplatesPage;
