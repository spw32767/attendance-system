import { CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "../../components/ui";
import { STATUS_META, SOURCE_TYPE_LABELS } from "./constants";

function SubmissionsTable({
  rows,
  currentRole,
  quickCheckInId,
  onQuickCheckIn,
  onOpenSubmission
}) {
  return (
    <div className="templates-table-wrap">
      <table className="templates-table submissions-table">
        <thead>
          <tr>
            <th className="table-col-secondary">Submission Code</th>
            <th className="table-col-primary table-col-left">ผู้ตอบ</th>
            <th className="table-col-meta">โครงการ/ฟอร์ม</th>
            <th className="table-col-date">เวลา</th>
            <th className="table-col-status">สถานะ</th>
            <th className="table-col-status">ที่มา</th>
            <th className="table-col-actions">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="empty-row" colSpan={7}>
                ไม่พบข้อมูลคำตอบ
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const statusMeta = STATUS_META[row.attendance_status] || STATUS_META.submitted;
              const canQuickCheckIn =
                ["super_admin", "admin", "staff"].includes(currentRole) &&
                row.attendance_status !== "present" &&
                row.attendance_status !== "completed";
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
                  <td className="table-col-status">
                    {SOURCE_TYPE_LABELS[row.source_type] || row.source_type || "-"}
                  </td>
                  <td className="table-col-actions">
                    <div className="table-actions">
                      {canQuickCheckIn ? (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={quickCheckInId === row.submission_id}
                          onClick={() => onQuickCheckIn(row.submission_id)}
                        >
                          <CheckCircle2 size={13} strokeWidth={2} aria-hidden="true" />
                          <span>
                            {quickCheckInId === row.submission_id ? "กำลังบันทึก..." : "ติ๊กมาแล้ว"}
                          </span>
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenSubmission(row.submission_id)}
                      >
                        <ExternalLink size={13} strokeWidth={2} aria-hidden="true" />
                        <span>ดูรายละเอียด</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SubmissionsTable;
