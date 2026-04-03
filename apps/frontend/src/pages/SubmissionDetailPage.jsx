import AdminLayout from "../components/AdminLayout";

const FIELD_TYPE_LABELS = {
  short_text: "คำตอบสั้น",
  long_text: "คำตอบยาว",
  multiple_choice: "ตัวเลือกเดียว",
  checkboxes: "หลายตัวเลือก",
  dropdown: "รายการแบบเลื่อนลง",
  rating: "ให้คะแนน",
  date: "วันที่",
  time: "เวลา",
  file_upload: "อัปโหลดไฟล์"
};

function SubmissionDetailPage({
  submission,
  onBack,
  onLogout,
  theme,
  onToggleTheme,
  navItems,
  activePath,
  onNavigate
}) {
  if (!submission) {
    return (
      <AdminLayout
        breadcrumbs={["แอดมิน", "คำตอบแบบฟอร์ม", "ไม่พบข้อมูล"]}
        onBack={onBack}
        onLogout={onLogout}
        theme={theme}
        onToggleTheme={onToggleTheme}
        navItems={navItems}
        activePath={activePath}
        onNavigate={onNavigate}
      >
        <section className="module-placeholder-card">
          <p>ไม่พบข้อมูลคำตอบที่ต้องการดูรายละเอียด</p>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", "คำตอบแบบฟอร์ม", submission.submission_code]}
      onBack={onBack}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
      navItems={navItems}
      activePath={activePath}
      onNavigate={onNavigate}
    >
      <section className="templates-head">
        <h1>รายละเอียดคำตอบ</h1>
      </section>

      <section className="builder-meta-card">
        <div className="builder-meta-grid">
          <label>
            <span>Submission Code</span>
            <input className="input-control" value={submission.submission_code} disabled />
          </label>
          <label>
            <span>สถานะ</span>
            <input className="input-control" value={submission.attendance_status} disabled />
          </label>
          <label>
            <span>ผู้ตอบ</span>
            <input
              className="input-control"
              value={`${submission.respondent_name} (${submission.respondent_email})`}
              disabled
            />
          </label>
          <label>
            <span>โครงการ/ฟอร์ม</span>
            <input
              className="input-control"
              value={`${submission.project_name} / ${submission.form_name}`}
              disabled
            />
          </label>
        </div>
      </section>

      <section className="templates-card" style={{ marginTop: 14 }}>
        <div className="templates-table-wrap">
          <table className="templates-table">
            <thead>
              <tr>
                <th>คำถาม</th>
                <th>ชนิดข้อมูล</th>
                <th>บังคับ</th>
                <th>คำตอบ</th>
              </tr>
            </thead>
            <tbody>
              {submission.answers.map((answer) => (
                <tr key={answer.field_id}>
                  <td>{answer.field_label}</td>
                  <td>{FIELD_TYPE_LABELS[answer.field_type] || answer.field_type}</td>
                  <td>{answer.is_required ? "ใช่" : "ไม่"}</td>
                  <td>{answer.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}

export default SubmissionDetailPage;
