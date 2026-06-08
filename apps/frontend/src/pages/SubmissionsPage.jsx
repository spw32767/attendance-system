import { useMemo, useState } from "react";
import { Download, Upload } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button, PageHead, useToast } from "../components/ui";
import SubmissionsFilters from "./submissions/SubmissionsFilters";
import SubmissionsTable from "./submissions/SubmissionsTable";
import ImportSubmissionsModal from "./submissions/ImportSubmissionsModal";
import ExportSubmissionsModal from "./submissions/ExportSubmissionsModal";

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
  const [quickCheckInId, setQuickCheckInId] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const toast = useToast();

  const filteredRows = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return submissions.filter((submission) => {
      if (filterProjectId && Number(submission.project_id) !== Number(filterProjectId)) {
        return false;
      }
      if (filterFormId && String(submission.form_id) !== String(filterFormId)) {
        return false;
      }
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

  const handleQuickCheckIn = async (submissionId) => {
    setQuickCheckInId(submissionId);
    try {
      await onUpdateSubmission?.(submissionId, {
        attendance_status: "present",
        check_in_at: new Date().toISOString()
      });
      toast.success("บันทึกเช็กอินเรียบร้อยแล้ว");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ไม่สามารถอัปเดตสถานะเช็กอินได้"
      );
    } finally {
      setQuickCheckInId(null);
    }
  };

  const handleImportSuccess = (result) => {
    setImportResult(result || null);
    toast.success(
      `นำเข้ารายชื่อสำเร็จ เพิ่มใหม่ ${result?.summary?.inserted || 0} รายการ ข้ามซ้ำ ${result?.summary?.skipped_duplicates || 0} รายการ`
    );
  };

  const handleNoticeError = (text) => {
    toast.error(text);
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
      <PageHead
        title="คำตอบแบบฟอร์ม"
        meta={`${submissions.length} คำตอบ · ${checkedInCount} เช็กอิน · ${completedCount} เสร็จสิ้น`}
        actions={
          <>
            <Button variant="ghost" onClick={() => setIsImportModalOpen(true)}>
              <Upload size={14} aria-hidden="true" />
              <span>Import</span>
            </Button>
            <Button variant="primary" onClick={() => setIsExportModalOpen(true)}>
              <Download size={14} aria-hidden="true" />
              <span>Export</span>
            </Button>
          </>
        }
      />

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

        <SubmissionsFilters
          projects={projects}
          forms={forms}
          filterProjectId={filterProjectId}
          filterFormId={filterFormId}
          searchText={searchText}
          onSearchChange={setSearchText}
          onChangeFilter={onChangeFilter}
          filteredCount={filteredRows.length}
          totalCount={submissions.length}
        />

        <SubmissionsTable
          rows={filteredRows}
          currentRole={currentRole}
          quickCheckInId={quickCheckInId}
          onQuickCheckIn={handleQuickCheckIn}
          onOpenSubmission={onOpenSubmission}
        />
      </section>

      <ImportSubmissionsModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        forms={forms}
        defaultFormId={filterFormId}
        onPreview={onPreviewImportSubmissionsExcel}
        onImport={onImportSubmissionsExcel}
        onSuccess={handleImportSuccess}
        onError={handleNoticeError}
      />

      <ExportSubmissionsModal
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        forms={forms}
        defaultFormId={filterFormId}
        onExport={onExportSubmissionsExcel}
        onSuccess={() => toast.success("Export ข้อมูลสำเร็จ")}
        onError={handleNoticeError}
      />
    </AdminLayout>
  );
}

export default SubmissionsPage;
