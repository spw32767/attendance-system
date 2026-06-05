import { Button } from "../../components/ui";
import { FORM_STATUSES, FORM_TYPES } from "../../constants/formBuilder";
import { toSlug } from "./helpers";

function DetailsTab({ draft, availableProjects, onChange }) {
  return (
    <section className="builder-meta-card builder-page-width">
      <h2>รายละเอียดแบบฟอร์ม</h2>

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
              onClick={() => onChange("public_path", toSlug(draft.form_name || ""))}
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
