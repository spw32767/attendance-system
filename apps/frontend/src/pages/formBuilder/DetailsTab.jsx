import { AlertTriangle } from "lucide-react";
import { Button } from "../../components/ui";
import { FORM_STATUSES, FORM_TYPES } from "../../constants/formBuilder";
import { toSlugOrFallback } from "./helpers";

// Inline-styled amber banner. The design system only ships --danger
// (red) tokens today, so we keep the warning palette local until a
// proper --warning token lands.
const WARNING_BANNER_STYLE = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #f5c97a",
  background: "#fff7e3",
  color: "#7a5300",
  marginBottom: 16,
  fontSize: 14,
  lineHeight: 1.55
};

function DetailsTab({ draft, availableProjects, onChange }) {
  // The submission/check-in email features and the "one submission per
  // person" rule all key on a field tagged field_usage='email'. If that
  // field is missing, those features silently misbehave (emails fly off
  // to unknown@example.com, dup-check never blocks). Warn the admin
  // before they leave the builder thinking it works.
  const fields = Array.isArray(draft.fields) ? draft.fields : [];
  const hasEmailField = fields.some((field) => field?.field_usage === "email");

  const wantsSubmissionEmail = draft.send_submission_email !== false;
  const wantsCheckinEmail = draft.send_checkin_email !== false;
  const enforcesOneSubmissionPerEmail = draft.allow_multiple_submissions === false;

  const missingEmailReasons = !hasEmailField
    ? [
        wantsSubmissionEmail
          ? "ส่งอีเมลยืนยันการลงทะเบียนเปิดอยู่ — ระบบจะไม่รู้ว่าจะส่งไปที่ไหน"
          : null,
        wantsCheckinEmail
          ? 'อนุญาตให้แอดมินส่งอีเมลยืนยันเช็กอินเปิดอยู่ — กดปุ่ม "ส่งอีเมล" ในหน้า Submissions แล้วจะส่งไปไม่ถึงผู้รับ'
          : null,
        enforcesOneSubmissionPerEmail
          ? "ปิด \"อนุญาตให้ตอบได้หลายครั้ง\" ไว้ — แต่ระบบจะไม่มีอะไรเทียบว่าคนนี้เคยตอบไปแล้วหรือยัง"
          : null
      ].filter(Boolean)
    : [];

  return (
    <section className="builder-meta-card builder-page-width">
      <h2>รายละเอียดแบบฟอร์ม</h2>

      {missingEmailReasons.length > 0 ? (
        <div role="alert" style={WARNING_BANNER_STYLE}>
          <AlertTriangle
            size={18}
            strokeWidth={2}
            aria-hidden="true"
            style={{ flex: "0 0 auto", marginTop: 2, color: "#b3741a" }}
          />
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>
              ฟอร์มนี้ยังไม่มีฟิลด์ที่ตั้ง "การใช้งาน" เป็น{" "}
              <strong>อีเมล</strong>
            </p>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              {missingEmailReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <p style={{ margin: "8px 0 0" }}>
              วิธีแก้: ไปแท็บ <strong>คำถาม</strong> เพิ่มฟิลด์{" "}
              <em>ข้อความสั้น</em> แล้วเลือกหัวข้อ "การใช้งาน" เป็น{" "}
              <strong>อีเมล</strong>
            </p>
          </div>
        </div>
      ) : null}

      <div className="builder-meta-grid">
        <label>
          <span>โครงการ</span>
          <select
            className="select-control"
            value={draft.project_id}
            onChange={(event) => onChange("project_id", Number(event.target.value))}
          >
            {availableProjects.map((project) => (
              <option key={project.project_id} value={project.project_id}>
                {project.project_name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>ชื่อแบบฟอร์ม</span>
          <input
            className="input-control"
            value={draft.form_name}
            placeholder="เช่น ฟอร์มลงทะเบียนกิจกรรม"
            onChange={(event) => onChange("form_name", event.target.value)}
          />
        </label>

        <label className="full-width">
          <span>คำอธิบายแบบฟอร์ม</span>
          <textarea
            className="textarea-control"
            rows={3}
            value={draft.form_description}
            placeholder="อธิบายสั้นๆ เพื่อให้ผู้ตอบเข้าใจแบบฟอร์มนี้"
            onChange={(event) => onChange("form_description", event.target.value)}
          />
        </label>

        <label>
          <span>ลิงก์แบบฟอร์ม</span>
          <div className="inline-input-action">
            <input
              className="input-control"
              value={draft.public_path}
              placeholder="ลิงก์ของแบบฟอร์ม"
              onChange={(event) => onChange("public_path", event.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange("public_path", toSlugOrFallback(draft.form_name || ""))}
            >
              <span>สร้างอัตโนมัติ</span>
            </Button>
          </div>
        </label>

        <label>
          <span>ประเภทแบบฟอร์ม</span>
          <select
            className="select-control"
            value={draft.form_type}
            onChange={(event) => onChange("form_type", event.target.value)}
          >
            {FORM_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>สถานะ</span>
          <select
            className="select-control"
            value={draft.status}
            onChange={(event) => onChange("status", event.target.value)}
          >
            {FORM_STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={draft.allow_multiple_submissions}
            onChange={(event) =>
              onChange("allow_multiple_submissions", event.target.checked)
            }
          />
          <span>อนุญาตให้ตอบได้หลายครั้ง</span>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={draft.send_submission_email !== false}
            onChange={(event) =>
              onChange("send_submission_email", event.target.checked)
            }
          />
          <span>ส่งอีเมลยืนยันการลงทะเบียนให้ผู้กรอกอัตโนมัติ (พร้อม QR ของรางวัล)</span>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={draft.send_checkin_email !== false}
            onChange={(event) =>
              onChange("send_checkin_email", event.target.checked)
            }
          />
          <span>อนุญาตให้แอดมินส่งอีเมลยืนยันเช็กอินจากหน้า Submissions / Pre-register</span>
        </label>

        <label>
          <span>เริ่มใช้งาน</span>
          <input
            className="input-control"
            type="datetime-local"
            value={draft.start_at || ""}
            onChange={(event) => onChange("start_at", event.target.value)}
          />
        </label>

        <label>
          <span>สิ้นสุดการใช้งาน</span>
          <input
            className="input-control"
            type="datetime-local"
            value={draft.end_at || ""}
            onChange={(event) => onChange("end_at", event.target.value)}
          />
        </label>

        <label>
          <span>หัวข้อข้อความยืนยัน</span>
          <input
            className="input-control"
            value={draft.success_title}
            onChange={(event) => onChange("success_title", event.target.value)}
          />
        </label>

        <label className="full-width">
          <span>ข้อความยืนยัน</span>
          <textarea
            className="textarea-control"
            rows={3}
            value={draft.success_message}
            onChange={(event) => onChange("success_message", event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}

export default DetailsTab;
