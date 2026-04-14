import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
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
  completed: {
    label: "เสร็จสิ้น",
    className: "status-pill status-pill-active"
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
  onNavigate,
  currentRole,
  onRoleChange
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

  const checkedInCount = useMemo(
    () => submissions.filter((submission) => submission.attendance_status === "present").length,
    [submissions]
  );

  const completedCount = useMemo(
    () => submissions.filter((submission) => submission.attendance_status === "completed").length,
    [submissions]
  );

  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", "คำตอบแบบฟอร์ม"]}
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
          <p className="page-kicker">Submissions</p>
          <h1>คำตอบแบบฟอร์ม</h1>
          <p className="page-summary">
            ติดตามการส่งคำตอบ การเช็กอิน และสถานะการเข้าร่วมจากทุกโครงการในมุมมองเดียว
          </p>
          <div className="page-stats">
            <div className="page-stat">
              <strong>{submissions.length}</strong>
              <span>คำตอบทั้งหมด</span>
            </div>
            <div className="page-stat">
              <strong>{checkedInCount}</strong>
              <span>เช็กอินแล้ว</span>
            </div>
            <div className="page-stat">
              <strong>{completedCount}</strong>
              <span>เสร็จสิ้น</span>
            </div>
          </div>
        </div>
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

          <div className="search-input-wrapper">
            <Search size={16} strokeWidth={2} className="search-input-icon" />
            <input
              className="input-control search-with-icon"
              value={searchText}
              placeholder="ค้นหาโค้ด, ชื่อ, อีเมล"
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>
          <p className="templates-search-meta submissions-search-meta">
            แสดง {filteredRows.length} จาก {submissions.length} คำตอบ
          </p>
        </div>

        <div className="templates-table-wrap">
          <table className="templates-table submissions-table">
            <thead>
              <tr>
                <th className="table-col-secondary">Submission Code</th>
                <th className="table-col-primary table-col-left">ผู้ตอบ</th>
                <th className="table-col-meta">โครงการ/ฟอร์ม</th>
                <th className="table-col-date">เวลา</th>
                <th className="table-col-status">สถานะ</th>
                <th className="table-col-actions">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={6}>
                    ไม่พบข้อมูลคำตอบ
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const statusMeta =
                    STATUS_META[row.attendance_status] || STATUS_META.submitted;

                  return (
                    <tr key={row.submission_id}>
                      <td className="table-col-secondary">
                        <span className="table-code">{row.submission_code}</span>
                      </td>
                      <td className="table-col-primary table-col-left">
                        <div className="table-primary-cell">
                          <p>{row.respondent_name}</p>
                          <small>{row.respondent_email}</small>
                        </div>
                      </td>
                      <td className="table-col-meta">
                        <div className="table-primary-cell">
                          <p>{row.project_name}</p>
                          <small>{row.form_name}</small>
                        </div>
                      </td>
                      <td className="table-col-date">
                        <div className="table-primary-cell">
                          <p>{new Date(row.submitted_at).toLocaleString("th-TH")}</p>
                          <small>
                            {row.check_in_at
                              ? `เช็กอิน: ${new Date(row.check_in_at).toLocaleString("th-TH")}`
                              : "ยังไม่เช็กอิน"}
                          </small>
                        </div>
                      </td>
                      <td className="table-col-status">
                        <div className="table-status-readout">
                          <span className={statusMeta.className}>{statusMeta.label}</span>
                        </div>
                      </td>
                      <td className="table-col-actions">
                        <div className="table-actions">
                          <button
                            className="table-action-button table-action-button-primary"
                            type="button"
                            onClick={() => onOpenSubmission(row.submission_id)}
                          >
                            <ExternalLink size={13} strokeWidth={2} />
                            <span>ดูรายละเอียด</span>
                          </button>
                        </div>
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
