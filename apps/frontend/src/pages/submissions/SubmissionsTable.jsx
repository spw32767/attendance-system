import { CheckCircle2, ExternalLink, Mail, MailCheck, Pencil, Trash2, Inbox } from "lucide-react";
import { Button, TableEmpty } from "../../components/ui";
import { STATUS_META, SOURCE_TYPE_LABELS } from "./constants";

const CHECKIN_ROLES = ["super_admin", "admin", "staff"];

function SubmissionsTable({
  rows,
  currentRole,
  mode = "responses",
  quickCheckInId,
  onQuickCheckIn,
  sendingEmailId,
  onSendEmail,
  onOpenSubmission,
  onEditEntry,
  onDeleteEntry
}) {
  const canCheckIn = CHECKIN_ROLES.includes(currentRole);
  const isPreRegister = mode === "preregister";

  return (
    <div className="templates-table-wrap">
      <table className="templates-table submissions-table table-cards">
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
            <TableEmpty
              colSpan={7}
              icon={<Inbox size={20} aria-hidden="true" />}
              title={isPreRegister ? "ยังไม่มีรายชื่อล่วงหน้า" : "ยังไม่มีคำตอบ"}
              description={
                isPreRegister
                  ? "กด “+ เพิ่มรายชื่อ” หรือนำเข้าจาก Excel เพื่อเริ่มต้น"
                  : "ยังไม่มีคำตอบที่ผู้เข้าร่วมกรอกเอง"
              }
            />
          ) : (
            rows.map((row) => {
              const statusMeta = STATUS_META[row.attendance_status] || STATUS_META.submitted;
              const showCheckIn =
                canCheckIn &&
                row.attendance_status !== "present" &&
                row.attendance_status !== "completed";
              return (
                <tr key={row.submission_id}>
                  <td className="table-col-secondary" data-label="รหัส">
                    <span className="table-code">{row.submission_code}</span>
                  </td>
                  <td className="table-col-primary table-col-left" data-label="ผู้ตอบ">
                    <div className="table-primary-cell">
                      <p>{row.respondent_name}</p>
                      <small>{row.respondent_email}</small>
                    </div>
                  </td>
                  <td className="table-col-meta" data-label="โครงการ/ฟอร์ม">
                    <div className="table-primary-cell">
                      <p>{row.project_name}</p>
                      <small>{row.form_name}</small>
                    </div>
                  </td>
                  <td className="table-col-date" data-label="เวลา">
                    <div className="table-primary-cell">
                      <p>{new Date(row.submitted_at).toLocaleString("th-TH")}</p>
                      <small>
                        {row.check_in_at
                          ? `เช็กอิน: ${new Date(row.check_in_at).toLocaleString("th-TH")}`
                          : "ยังไม่เช็กอิน"}
                      </small>
                    </div>
                  </td>
                  <td className="table-col-status" data-label="สถานะ">
                    <div className="table-status-readout">
                      <span className={statusMeta.className}>{statusMeta.label}</span>
                    </div>
                  </td>
                  <td className="table-col-status" data-label="ที่มา">
                    {SOURCE_TYPE_LABELS[row.source_type] || row.source_type || "-"}
                  </td>
                  <td className="table-col-actions" data-label="การจัดการ">
                    <div className="table-actions">
                      {showCheckIn ? (
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

                      {canCheckIn && onSendEmail ? (
                        row.checkin_email_sent ? (
                          <Button variant="ghost" size="sm" disabled>
                            <MailCheck size={13} strokeWidth={2} aria-hidden="true" />
                            <span>ส่งเมลแล้ว</span>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={sendingEmailId === row.submission_id}
                            onClick={() => onSendEmail(row.submission_id)}
                          >
                            <Mail size={13} strokeWidth={2} aria-hidden="true" />
                            <span>
                              {sendingEmailId === row.submission_id ? "กำลังส่ง..." : "ส่งอีเมล"}
                            </span>
                          </Button>
                        )
                      ) : null}

                      {isPreRegister ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => onEditEntry?.(row)}>
                            <Pencil size={13} strokeWidth={2} aria-hidden="true" />
                            <span>แก้ไข</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onDeleteEntry?.(row)}>
                            <Trash2 size={13} strokeWidth={2} aria-hidden="true" />
                            <span>ลบ</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenSubmission(row.submission_id)}
                          >
                            <ExternalLink size={13} strokeWidth={2} aria-hidden="true" />
                            <span>ดูรายละเอียด</span>
                          </Button>
                          {onDeleteEntry ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteEntry?.(row)}
                            >
                              <Trash2 size={13} strokeWidth={2} aria-hidden="true" />
                              <span>ลบ</span>
                            </Button>
                          ) : null}
                        </>
                      )}
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
