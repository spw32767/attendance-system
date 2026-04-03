import { useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";

const STATUS_META = {
  present: {
    label: "เข้างานแล้ว",
    className: "status-pill status-pill-active"
  },
  submitted: {
    label: "ส่งข้อมูลแล้ว",
    className: "status-pill status-pill-draft"
  },
  cancelled: {
    label: "ยกเลิก",
    className: "status-pill status-pill-inactive"
  }
};

function SubmissionsPage({
  submissions,
  projects,
  forms,
  filterProjectId,
  filterFormId,
  onChangeFilter,
  onOpenSubmission,
  onLogout,
  theme,
  onToggleTheme,
  navItems,
  activePath,
  onNavigate
}) {
  const [searchText, setSearchText] = useState("");

  const projectForms = useMemo(
    () =>
      filterProjectId
        ? forms.filter((form) => Number(form.project_id) === Number(filterProjectId))
        : forms,
    [filterProjectId, forms]
  );

  const filteredRows = useMemo(() => {
    return submissions.filter((submission) => {
      if (
        filterProjectId &&
        Number(submission.project_id) !== Number(filterProjectId)
      ) {
        return false;
      }

      if (filterFormId && String(submission.form_id) !== String(filterFormId)) {
        return false;
      }

      const keyword = searchText.trim().toLowerCase();
      if (!keyword) {
        return true;
      }

      const searchable = [
        submission.submission_code,
        submission.respondent_name,
        submission.respondent_email,
        submission.form_name,
        submission.project_name,
        submission.attendance_status
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [submissions, filterProjectId, filterFormId, searchText]);

  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", "คำตอบแบบฟอร์ม"]}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
      navItems={navItems}
      activePath={activePath}
      onNavigate={onNavigate}
    >
      <section className="templates-head">
        <h1>คำตอบแบบฟอร์ม</h1>
      </section>

      <section className="templates-card">
        <div className="templates-search-row submissions-filters">
          <select
            className="select-control"
            value={filterProjectId || ""}
            onChange={(event) => {
              const nextProjectId = Number(event.target.value) || null;
              onChangeFilter(nextProjectId, null);
            }}
          >
            <option value="">ทุกโครงการ</option>
            {projects.map((project) => (
              <option key={project.project_id} value={project.project_id}>
                {project.project_name}
              </option>
            ))}
          </select>

          <select
            className="select-control"
            value={filterFormId || ""}
            onChange={(event) =>
              onChangeFilter(filterProjectId || null, event.target.value || null)
            }
          >
            <option value="">ทุกฟอร์ม</option>
            {projectForms.map((form) => (
              <option key={form.form_id} value={form.form_id}>
                {form.form_name}
              </option>
            ))}
          </select>

          <input
            className="input-control"
            value={searchText}
            placeholder="ค้นหาโค้ด, ชื่อ, อีเมล"
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>

        <div className="templates-table-wrap">
          <table className="templates-table submissions-table">
            <thead>
              <tr>
                <th>Submission Code</th>
                <th>ผู้ตอบ</th>
                <th>โครงการ/ฟอร์ม</th>
                <th>เวลา</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={5}>
                    ไม่พบข้อมูลคำตอบ
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const statusMeta =
                    STATUS_META[row.attendance_status] || STATUS_META.submitted;

                  return (
                    <tr key={row.submission_id}>
                      <td>
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => onOpenSubmission(row.submission_id)}
                        >
                          {row.submission_code}
                        </button>
                      </td>
                      <td>
                        <div className="project-title-cell">
                          <p>{row.respondent_name}</p>
                          <small>{row.respondent_email}</small>
                        </div>
                      </td>
                      <td>
                        <div className="project-title-cell">
                          <p>{row.project_name}</p>
                          <small>{row.form_name}</small>
                        </div>
                      </td>
                      <td>
                        <div className="project-title-cell">
                          <p>{new Date(row.submitted_at).toLocaleString("th-TH")}</p>
                          <small>
                            {row.check_in_at
                              ? `เช็กอิน: ${new Date(row.check_in_at).toLocaleString("th-TH")}`
                              : "ยังไม่เช็กอิน"}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className={statusMeta.className}>{statusMeta.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}

export default SubmissionsPage;
