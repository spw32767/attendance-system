import { useEffect, useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { Button, Modal } from "../../components/ui";
import { PREVIEW_STATUS_META } from "./constants";

function ImportSubmissionsModal({
  open,
  onClose,
  forms,
  defaultFormId,
  onPreview,
  onImport,
  onDownloadTemplate,
  onSuccess,
  onError
}) {
  const [formId, setFormId] = useState(defaultFormId ? String(defaultFormId) : "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setFile(null);
    setPreview(null);
    setIsPreviewing(false);
    setIsImporting(false);
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

  useEffect(() => {
    if (!open || !formId || !file) {
      return undefined;
    }

    let cancelled = false;
    setIsPreviewing(true);

    const loadPreview = async () => {
      try {
        const next = await onPreview?.(Number(formId), file);
        if (!cancelled) {
          setPreview(next || null);
        }
      } catch (error) {
        if (!cancelled) {
          setPreview(null);
          onError?.(error instanceof Error ? error.message : "ไม่สามารถพรีวิวไฟล์ import ได้");
        }
      } finally {
        if (!cancelled) {
          setIsPreviewing(false);
        }
      }
    };

    void loadPreview();
    return () => {
      cancelled = true;
    };
  }, [open, formId, file, onPreview, onError]);

  const previewColumns = useMemo(() => {
    const headers = preview?.preview?.headers || [];
    return headers.slice(0, 4);
  }, [preview]);

  const handleClose = () => {
    if (isImporting) {
      return;
    }
    onClose?.();
  };

  const handleConfirm = async () => {
    if (!formId || !file) {
      return;
    }
    setIsImporting(true);
    try {
      const result = await onImport?.(Number(formId), file, {
        mode: "sync",
        duplicatePolicy: "skip"
      });
      onSuccess?.(result || null);
      onClose?.();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "ไม่สามารถนำเข้าไฟล์รายชื่อได้");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="นำเข้ารายชื่อจากไฟล์ Excel/CSV"
      description="แนบไฟล์แล้วระบบจะพรีวิวให้อัตโนมัติ ก่อนกด Confirm Import"
      size="lg"
      closeOnBackdrop={!isImporting}
    >
      <div className="submissions-modal-form-row">
        <label>
          <span>เลือกฟอร์มปลายทาง</span>
          <select
            className="select-control"
            value={formId}
            onChange={(event) => {
              setFormId(event.target.value);
              setPreview(null);
            }}
            disabled={isImporting}
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
          <span>เลือกไฟล์</span>
          <input
            className="input-control"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setPreview(null);
            }}
            disabled={isImporting}
          />
        </label>
      </div>

      <div className="submissions-modal-actions">
        <p className="submissions-modal-hint">
          ไม่รู้ว่าไฟล์ต้องมีคอลัมน์อะไร? ดาวน์โหลด template แล้วกรอกตามหัวคอลัมน์
          {onDownloadTemplate ? (
            <>
              {" "}
              <button
                type="button"
                className="text-button"
                disabled={!formId || isImporting}
                onClick={() => onDownloadTemplate(Number(formId))}
              >
                ดาวน์โหลด template (.xlsx)
              </button>
            </>
          ) : null}
        </p>
        <Button
          variant="primary"
          disabled={!preview || isImporting || isPreviewing}
          loading={isImporting}
          onClick={handleConfirm}
        >
          <Upload size={13} strokeWidth={2} aria-hidden="true" />
          <span>{isImporting ? "กำลังนำเข้า..." : "Confirm Import"}</span>
        </Button>
      </div>

      {isPreviewing ? <p className="submissions-modal-hint">กำลังสร้างตัวอย่างข้อมูล...</p> : null}

      {preview?.summary ? (
        <div className="import-panel-summary submissions-modal-summary">
          <span>แถวทั้งหมด: {preview.summary.total_rows}</span>
          <span>พร้อมนำเข้า: {preview.summary.ready_to_insert}</span>
          <span>re-activate: {preview.summary.reactivate_count}</span>
          <span>ข้ามซ้ำ: {preview.summary.skipped_duplicates}</span>
          <span>จะยกเลิกจาก sync: {preview.summary.cancelled_missing}</span>
          <span>ผิดพลาด: {preview.summary.failed_rows}</span>
        </div>
      ) : null}

      {preview?.preview?.rows?.length ? (
        <div className="templates-table-wrap submissions-modal-table-wrap">
          <table className="templates-table table-first-col-left">
            <thead>
              <tr>
                <th>แถว</th>
                <th>Email</th>
                {previewColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
                <th>สถานะ</th>
                <th>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {preview.preview.rows.map((row) => {
                const statusMeta = PREVIEW_STATUS_META[row.status] || PREVIEW_STATUS_META.error;
                return (
                  <tr key={`${row.row}-${row.email}-${row.message}`}>
                    <td>{row.row}</td>
                    <td>{row.email || "-"}</td>
                    {previewColumns.map((column) => (
                      <td key={`${row.row}_${column}`}>{row.values?.[column] || "-"}</td>
                    ))}
                    <td>
                      <span className={statusMeta.className}>{statusMeta.label}</span>
                    </td>
                    <td>{row.message}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </Modal>
  );
}

export default ImportSubmissionsModal;
