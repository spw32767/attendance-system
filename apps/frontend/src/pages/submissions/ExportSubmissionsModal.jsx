import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button, Modal } from "../../components/ui";
import { EMPTY_EXPORT_FILTERS, toSqlDateTime } from "./constants";

function ExportSubmissionsModal({
  open,
  onClose,
  forms,
  defaultFormId,
  onExport,
  onSuccess,
  onError
}) {
  const [formId, setFormId] = useState(defaultFormId ? String(defaultFormId) : "");
  const [filters, setFilters] = useState(EMPTY_EXPORT_FILTERS);
  const [useSubmittedRange, setUseSubmittedRange] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setFormId((current) => {
      if (current) {
        return current;
      }
      if (defaultFormId) {
        return String(defaultFormId);
      }
      return forms.length > 0 ? String(forms[0].form_id) : "";
    });
  }, [open, defaultFormId, forms]);

  const handleReset = () => {
    setFilters(EMPTY_EXPORT_FILTERS);
    setUseSubmittedRange(false);
    setFromDate("");
    setToDate("");
  };

  const handleExport = async () => {
    if (!formId) {
      onError?.("กรุณาเลือกฟอร์มสำหรับ export");
      return;
    }

    setIsExporting(true);
    try {
      const params = {
        ...filters,
        submitted_from: useSubmittedRange ? toSqlDateTime(fromDate) : undefined,
        submitted_to: useSubmittedRange ? toSqlDateTime(toDate) : undefined
      };
      await onExport?.(Number(formId), params);
      onSuccess?.();
      onClose?.();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "ไม่สามารถ export ข้อมูลได้");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ส่งออกข้อมูล submissions เป็น Excel"
      description="เลือกฟอร์มและตัวกรองที่ต้องการ"
      size="lg"
    >
      <div className="submissions-export-panel">
        <p className="submissions-export-panel-title">ตั้งค่าการส่งออกข้อมูล</p>
        <div className="submissions-modal-form-row submissions-export-grid">
          <label>
            <span>เลือกฟอร์ม</span>
            <select
              className="select-control"
              value={formId}
              onChange={(event) => setFormId(event.target.value)}
            >
              <option value="">เลือกฟอร์ม</option>
              {forms.map((form) => (
                <option key={form.form_id} value={form.form_id}>
                  {form.project_name ? `${form.project_name} / ` : ""}
                  {form.form_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>สถานะ attendance</span>
            <select
              className="select-control"
              value={filters.attendance_status}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, attendance_status: event.target.value }))
              }
            >
              <option value="">ทั้งหมด</option>
              <option value="submitted">submitted</option>
              <option value="present">present</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
          <label>
            <span>ที่มา (source)</span>
            <select
              className="select-control"
              value={filters.source_type}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, source_type: event.target.value }))
              }
            >
              <option value="">ทั้งหมด</option>
              <option value="public_form">public_form</option>
              <option value="import_excel">import_excel</option>
            </select>
          </label>
          <label className="submissions-export-range-toggle">
            <span>กำหนดช่วงวันที่/เวลา</span>
            <input
              type="checkbox"
              checked={useSubmittedRange}
              onChange={(event) => {
                const enabled = event.target.checked;
                setUseSubmittedRange(enabled);
                if (!enabled) {
                  setFromDate("");
                  setToDate("");
                }
              }}
            />
          </label>
        </div>

        {useSubmittedRange ? (
          <div className="submissions-export-datetime-grid">
            <label className="submissions-export-datetime-field">
              <span>วันที่ส่ง จาก</span>
              <input
                type="datetime-local"
                className="input-control"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </label>
            <label className="submissions-export-datetime-field">
              <span>วันที่ส่ง ถึง</span>
              <input
                type="datetime-local"
                className="input-control"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => setToDate(event.target.value)}
              />
            </label>
          </div>
        ) : (
          <p className="submissions-modal-hint">หากไม่ติ๊ก ระบบจะ export ทุกช่วงเวลา</p>
        )}
      </div>

      <div className="submissions-modal-actions">
        <Button variant="ghost" onClick={handleReset} disabled={isExporting}>
          รีเซ็ต Filter
        </Button>
        <Button
          variant="primary"
          disabled={!formId || isExporting}
          loading={isExporting}
          onClick={handleExport}
        >
          <Download size={13} strokeWidth={2} aria-hidden="true" />
          <span>{isExporting ? "กำลัง export..." : "Export ข้อมูล"}</span>
        </Button>
      </div>
    </Modal>
  );
}

export default ExportSubmissionsModal;
