import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, ExternalLink, Search, Upload, X } from "lucide-react";
import moment from "moment";
import { EuiDatePicker, EuiDatePickerRange } from "@elastic/eui";
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

const SOURCE_TYPE_LABELS = {
  public_form: "ผู้เข้าร่วมกรอกเอง",
  import_excel: "นำเข้าจาก Excel"
};

const PREVIEW_STATUS_META = {
  ready_insert: { label: "พร้อมนำเข้า", className: "status-pill status-pill-active" },
  reactivate: { label: "จะเปิดใช้งาน", className: "status-pill status-pill-draft" },
  skip_duplicate: { label: "ข้ามซ้ำ", className: "status-pill status-pill-inactive" },
  error: { label: "ผิดพลาด", className: "status-pill status-pill-inactive" }
};

const EMPTY_EXPORT_FILTERS = {
  attendance_status: "",
  source_type: ""
};

const toSqlDateTime = (value) => {
  if (!value) {
    return undefined;
  }

  return value.format("YYYY-MM-DD HH:mm:ss");
};

function SubmissionsPage({
  submissions,
  projects,
  forms,
  filterProjectId,
  filterFormId,
  onChangeFilter,
  onOpenSubmission,
  onUpdateSubmission,
  onPreviewImportSubmissionsExcel,
  onImportSubmissionsExcel,
  onExportSubmissionsExcel,
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
  const [pageNotice, setPageNotice] = useState(null);
  const [quickCheckInId, setQuickCheckInId] = useState(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [importFormId, setImportFormId] = useState(filterFormId || "");
  const [importFile, setImportFile] = useState(null);
  const [isPreviewingImport, setIsPreviewingImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const [exportFormId, setExportFormId] = useState(filterFormId || "");
  const [exportFilters, setExportFilters] = useState(EMPTY_EXPORT_FILTERS);
  const [exportUseSubmittedRange, setExportUseSubmittedRange] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFromDate, setExportFromDate] = useState(null);
  const [exportToDate, setExportToDate] = useState(null);

  const projectForms = useMemo(
    () =>
      filterProjectId
        ? forms.filter((form) => Number(form.project_id) === Number(filterProjectId))
        : forms,
    [filterProjectId, forms]
  );

  const previewColumns = useMemo(() => {
    const headers = importPreview?.preview?.headers || [];
    return headers.slice(0, 4);
  }, [importPreview]);

  const filteredRows = useMemo(() => {
    return submissions.filter((submission) => {
      if (filterProjectId && Number(submission.project_id) !== Number(filterProjectId)) {
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
        submission.attendance_status,
        submission.source_type
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

  useEffect(() => {
    if (!pageNotice) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPageNotice(null);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [pageNotice]);

  useEffect(() => {
    if (!importFormId && forms.length > 0) {
      setImportFormId(String(filterFormId || forms[0].form_id));
    }

    if (!exportFormId && forms.length > 0) {
      setExportFormId(String(filterFormId || forms[0].form_id));
    }
  }, [forms, filterFormId, importFormId, exportFormId]);

  const handleQuickCheckIn = async (submissionId) => {
    setQuickCheckInId(submissionId);
    try {
      await onUpdateSubmission?.(submissionId, {
        attendance_status: "present",
        check_in_at: new Date().toISOString()
      });
      setPageNotice({
        type: "success",
        text: "บันทึกเช็กอินเรียบร้อยแล้ว"
      });
    } catch (error) {
      setPageNotice({
        type: "error",
        text: error instanceof Error ? error.message : "ไม่สามารถอัปเดตสถานะเช็กอินได้"
      });
    } finally {
      setQuickCheckInId(null);
    }
  };

  const closeImportModal = () => {
    if (isImporting) {
      return;
    }

    setIsImportModalOpen(false);
    setImportFile(null);
    setImportPreview(null);
    setIsPreviewingImport(false);
    setIsImporting(false);
  };

  const handleConfirmImport = async () => {
    if (!importFormId || !importFile) {
      return;
    }

    setIsImporting(true);
    try {
      const result = await onImportSubmissionsExcel?.(Number(importFormId), importFile, {
        mode: "sync",
        duplicatePolicy: "skip"
      });
      setImportResult(result || null);
      setPageNotice({
        type: "success",
        text: `นำเข้ารายชื่อสำเร็จ เพิ่มใหม่ ${result?.summary?.inserted || 0} รายการ ข้ามซ้ำ ${result?.summary?.skipped_duplicates || 0} รายการ`
      });
      closeImportModal();
    } catch (error) {
      setPageNotice({
        type: "error",
        text: error instanceof Error ? error.message : "ไม่สามารถนำเข้าไฟล์รายชื่อได้"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    if (!exportFormId) {
      setPageNotice({ type: "error", text: "กรุณาเลือกฟอร์มสำหรับ export" });
      return;
    }

    setIsExporting(true);
    try {
      const params = {
        ...exportFilters,
        submitted_from: exportUseSubmittedRange ? toSqlDateTime(exportFromDate) : undefined,
        submitted_to: exportUseSubmittedRange ? toSqlDateTime(exportToDate) : undefined
      };
      await onExportSubmissionsExcel?.(Number(exportFormId), params);
      setPageNotice({ type: "success", text: "Export ข้อมูลสำเร็จ" });
      setIsExportModalOpen(false);
    } catch (error) {
      setPageNotice({
        type: "error",
        text: error instanceof Error ? error.message : "ไม่สามารถ export ข้อมูลได้"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const openImportModal = () => {
    if (!importFormId && forms.length > 0) {
      setImportFormId(String(forms[0].form_id));
    }
    setImportFile(null);
    setImportPreview(null);
    setIsImportModalOpen(true);
  };

  useEffect(() => {
    if (!isImportModalOpen || !importFormId || !importFile) {
      return undefined;
    }

    let cancelled = false;
    setIsPreviewingImport(true);

    const loadPreview = async () => {
      try {
        const preview = await onPreviewImportSubmissionsExcel?.(Number(importFormId), importFile);
        if (!cancelled) {
          setImportPreview(preview || null);
        }
      } catch (error) {
        if (!cancelled) {
          setImportPreview(null);
          setPageNotice({
            type: "error",
            text: error instanceof Error ? error.message : "ไม่สามารถพรีวิวไฟล์ import ได้"
          });
        }
      } finally {
        if (!cancelled) {
          setIsPreviewingImport(false);
        }
      }
    };

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [isImportModalOpen, importFormId, importFile, onPreviewImportSubmissionsExcel]);

  const openExportModal = () => {
    if (!exportFormId && forms.length > 0) {
      setExportFormId(String(forms[0].form_id));
    }
    setIsExportModalOpen(true);
  };

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
        <div className="page-head-actions">
          <button className="table-action-button table-action-button-secondary" type="button" onClick={openImportModal}>
            <Download size={13} strokeWidth={2} />
            <span>Import</span>
          </button>
          <button className="table-action-button table-action-button-primary" type="button" onClick={openExportModal}>
            <Upload size={13} strokeWidth={2} />
            <span>Export</span>
          </button>
        </div>
      </section>

      {pageNotice ? (
        <p className={`notice-banner${pageNotice.type === "error" ? " notice-banner-error" : ""}`}>
          {pageNotice.text}
        </p>
      ) : null}

      <section className="templates-card">
        {importResult?.summary ? (
          <div className="import-panel-summary submissions-import-summary">
            <span>แถวทั้งหมด: {importResult.summary.total_rows}</span>
            <span>เพิ่มใหม่: {importResult.summary.inserted}</span>
            <span>ข้ามซ้ำ: {importResult.summary.skipped_duplicates}</span>
            <span>ยกเลิกจาก sync: {importResult.summary.cancelled_missing}</span>
            <span>ผิดพลาด: {importResult.summary.failed_rows}</span>
          </div>
        ) : null}
        {Array.isArray(importResult?.errors) && importResult.errors.length > 0 ? (
          <div className="import-errors-wrap submissions-import-errors">
            <p className="import-errors-title">รายการแถวที่ผิดพลาดล่าสุด</p>
            <table className="templates-table table-first-col-left import-errors-table">
              <thead>
                <tr>
                  <th>แถว</th>
                  <th>Email</th>
                  <th>สาเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {importResult.errors.map((row) => (
                  <tr key={`${row.row}-${row.email}-${row.message}`}>
                    <td>{row.row}</td>
                    <td>{row.email || "-"}</td>
                    <td>{row.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

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
            onChange={(event) => onChangeFilter(filterProjectId || null, event.target.value || null)}
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
                <th className="table-col-status">ที่มา</th>
                <th className="table-col-actions">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={7}>
                    ไม่พบข้อมูลคำตอบ
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const statusMeta = STATUS_META[row.attendance_status] || STATUS_META.submitted;
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
                          {currentRole === "admin" &&
                          row.attendance_status !== "present" &&
                          row.attendance_status !== "completed" ? (
                            <button
                              className="table-action-button table-action-button-secondary"
                              type="button"
                              disabled={quickCheckInId === row.submission_id}
                              onClick={() => handleQuickCheckIn(row.submission_id)}
                            >
                              <CheckCircle2 size={13} strokeWidth={2} />
                              <span>{quickCheckInId === row.submission_id ? "กำลังบันทึก..." : "ติ๊กมาแล้ว"}</span>
                            </button>
                          ) : null}
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

      {isImportModalOpen ? (
        <div className="dashboard-preview-overlay" role="presentation" onClick={closeImportModal}>
          <section
            className="dashboard-preview-dialog submissions-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Import submissions"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="dashboard-preview-header">
              <div>
                <p className="dashboard-preview-kicker">Import</p>
                <h2>นำเข้ารายชื่อจากไฟล์ Excel/CSV</h2>
              </div>
              <button
                className="icon-only-button icon-neutral-button"
                type="button"
                onClick={closeImportModal}
                disabled={isImporting}
              >
                <X size={17} strokeWidth={2.2} />
              </button>
            </header>
            <div className="dashboard-preview-body submissions-modal-body">
              <div className="submissions-modal-form-row">
                <label>
                  <span>เลือกฟอร์มปลายทาง</span>
                  <select
                    className="select-control"
                    value={importFormId}
                    onChange={(event) => {
                      setImportFormId(event.target.value);
                      setImportPreview(null);
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
                      setImportFile(event.target.files?.[0] || null);
                      setImportPreview(null);
                    }}
                    disabled={isImporting}
                  />
                </label>
              </div>
              <div className="submissions-modal-actions">
                <p className="submissions-modal-hint">
                  แนบไฟล์แล้วระบบจะพรีวิวให้อัตโนมัติ ก่อนกด Confirm Import
                </p>
                <button
                  className="table-action-button table-action-button-primary"
                  type="button"
                  disabled={!importPreview || isImporting || isPreviewingImport}
                  onClick={handleConfirmImport}
                >
                  <Upload size={13} strokeWidth={2} />
                  <span>{isImporting ? "กำลังนำเข้า..." : "Confirm Import"}</span>
                </button>
              </div>

              {isPreviewingImport ? <p className="submissions-modal-hint">กำลังสร้างตัวอย่างข้อมูล...</p> : null}

              {importPreview?.summary ? (
                <div className="import-panel-summary submissions-modal-summary">
                  <span>แถวทั้งหมด: {importPreview.summary.total_rows}</span>
                  <span>พร้อมนำเข้า: {importPreview.summary.ready_to_insert}</span>
                  <span>re-activate: {importPreview.summary.reactivate_count}</span>
                  <span>ข้ามซ้ำ: {importPreview.summary.skipped_duplicates}</span>
                  <span>จะยกเลิกจาก sync: {importPreview.summary.cancelled_missing}</span>
                  <span>ผิดพลาด: {importPreview.summary.failed_rows}</span>
                </div>
              ) : null}

              {importPreview?.preview?.rows?.length ? (
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
                      {importPreview.preview.rows.map((row) => {
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
            </div>
          </section>
        </div>
      ) : null}

      {isExportModalOpen ? (
        <div
          className="dashboard-preview-overlay"
          role="presentation"
          onClick={() => setIsExportModalOpen(false)}
        >
          <section
            className="dashboard-preview-dialog submissions-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Export submissions"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="dashboard-preview-header">
              <div>
                <p className="dashboard-preview-kicker">Export</p>
                <h2>ส่งออกข้อมูล submissions เป็น Excel</h2>
              </div>
              <button
                className="icon-only-button icon-neutral-button"
                type="button"
                onClick={() => setIsExportModalOpen(false)}
              >
                <X size={17} strokeWidth={2.2} />
              </button>
            </header>
            <div className="dashboard-preview-body submissions-modal-body">
              <div className="submissions-export-panel">
                <p className="submissions-export-panel-title">ตั้งค่าการส่งออกข้อมูล</p>
                <div className="submissions-modal-form-row submissions-export-grid">
                  <label>
                  <span>เลือกฟอร์ม</span>
                  <select
                    className="select-control"
                    value={exportFormId}
                    onChange={(event) => setExportFormId(event.target.value)}
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
                      value={exportFilters.attendance_status}
                      onChange={(event) =>
                        setExportFilters((prev) => ({ ...prev, attendance_status: event.target.value }))
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
                      value={exportFilters.source_type}
                      onChange={(event) =>
                        setExportFilters((prev) => ({ ...prev, source_type: event.target.value }))
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
                      checked={exportUseSubmittedRange}
                      onChange={(event) => {
                        const enabled = event.target.checked;
                        setExportUseSubmittedRange(enabled);
                        if (!enabled) {
                          setExportFromDate(null);
                          setExportToDate(null);
                        }
                      }}
                    />
                  </label>
                </div>

                {exportUseSubmittedRange ? (
                  <div className="submissions-export-datetime-grid">
                    <div className="submissions-eui-range-wrap">
                      <EuiDatePickerRange
                        fullWidth
                        startDateControl={
                          <EuiDatePicker
                            selected={exportFromDate}
                            onChange={(date) => setExportFromDate(date)}
                            showTimeSelect
                            dateFormat="YYYY-MM-DD HH:mm"
                            timeFormat="HH:mm"
                            placeholder="วันที่ส่ง จาก"
                            fullWidth
                          />
                        }
                        endDateControl={
                          <EuiDatePicker
                            selected={exportToDate}
                            onChange={(date) => setExportToDate(date)}
                            showTimeSelect
                            dateFormat="YYYY-MM-DD HH:mm"
                            timeFormat="HH:mm"
                            placeholder="วันที่ส่ง ถึง"
                            fullWidth
                          />
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <p className="submissions-modal-hint">หากไม่ติ๊ก ระบบจะ export ทุกช่วงเวลา</p>
                )}
              </div>
              <div className="submissions-modal-actions">
                <button
                  className="table-action-button table-action-button-secondary"
                  type="button"
                  onClick={() => {
                    setExportFilters(EMPTY_EXPORT_FILTERS);
                    setExportUseSubmittedRange(false);
                    setExportFromDate(null);
                    setExportToDate(null);
                  }}
                >
                  รีเซ็ต Filter
                </button>
                <button
                  className="table-action-button table-action-button-primary"
                  type="button"
                  disabled={!exportFormId || isExporting}
                  onClick={handleExport}
                >
                  <Download size={13} strokeWidth={2} />
                  <span>{isExporting ? "กำลัง export..." : "Export ข้อมูล"}</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </AdminLayout>
  );
}

export default SubmissionsPage;
