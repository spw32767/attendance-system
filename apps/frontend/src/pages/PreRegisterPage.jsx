import { useMemo, useState } from "react";
import { Download, Plus, Upload } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button, ConfirmDialog, PageHead, useToast } from "../components/ui";
import SubmissionsFilters from "./submissions/SubmissionsFilters";
import SubmissionsTable from "./submissions/SubmissionsTable";
import ImportSubmissionsModal from "./submissions/ImportSubmissionsModal";
import ExportSubmissionsModal from "./submissions/ExportSubmissionsModal";
import AddEditEntryModal from "./submissions/AddEditEntryModal";

const PRE_REGISTER_SOURCES = new Set(["import_excel", "manual"]);

function PreRegisterPage({
  submissions,
  projects,
  forms,
  filterProjectId,
  filterFormId,
  onChangeFilter,
  onUpdateSubmission,
  onSendCheckinEmail,
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry,
  onPreviewImportSubmissionsExcel,
  onImportSubmissionsExcel,
  onDownloadImportTemplate,
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
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const toast = useToast();

  const roster = useMemo(
    () => submissions.filter((submission) => PRE_REGISTER_SOURCES.has(submission.source_type)),
    [submissions]
  );

  const filteredRows = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return roster.filter((submission) => {
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
        submission.attendance_status
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(keyword);
    });
  }, [roster, filterProjectId, filterFormId, searchText]);

  const checkedInCount = useMemo(
    () => roster.filter((submission) => submission.attendance_status === "present").length,
    [roster]
  );

  const handleQuickCheckIn = async (submissionId) => {
    setQuickCheckInId(submissionId);
    try {
      await onUpdateSubmission?.(submissionId, {
        attendance_status: "present",
        check_in_at: new Date().toISOString()
      });
      toast.success("ติ๊กเช็กอินแล้ว (ยังไม่ส่งอีเมล)");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถอัปเดตสถานะเช็กอินได้");
    } finally {
      setQuickCheckInId(null);
    }
  };

  const handleSendEmail = async (submissionId) => {
    setSendingEmailId(submissionId);
    try {
      const result = await onSendCheckinEmail?.(submissionId);
      if (result?.status === "already_sent") {
        toast.info("เคยส่งอีเมลให้รายการนี้ไปแล้ว");
      } else {
        toast.success("ส่งอีเมลของรางวัลแล้ว");
      }
    } catch (error) {
      // Per-form opt-out: backend returns 409 status="disabled" when the
      // form's send_checkin_email toggle is off — calm info toast, not red.
      if (error?.data?.status === "disabled") {
        toast.info("ฟอร์มนี้ปิดการส่งอีเมลเช็กอินไว้");
      } else {
        toast.error(error instanceof Error ? error.message : "ส่งอีเมลไม่สำเร็จ");
      }
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleAdd = async (formId, answers) => {
    await onCreateEntry(formId, answers);
    toast.success("เพิ่มรายชื่อแล้ว");
  };

  const handleEdit = async (submissionId, answers) => {
    await onUpdateEntry(submissionId, answers);
    toast.success("บันทึกการแก้ไขแล้ว");
  };

  const handleConfirmDelete = async () => {
    if (!deletingEntry) {
      return;
    }
    setDeleteBusy(true);
    try {
      await onDeleteEntry(deletingEntry.submission_id);
      toast.success("ลบรายชื่อแล้ว");
      setDeletingEntry(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ลบไม่สำเร็จ");
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", "รายชื่อล่วงหน้า"]}
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
        title="รายชื่อล่วงหน้า"
        meta={`${roster.length} รายชื่อ · ${checkedInCount} เช็กอินแล้ว — เพิ่มเอง/นำเข้า สำหรับผู้ที่มีรายชื่ออยู่แล้ว (ไม่ต้องกรอกเอง)`}
        actions={
          <>
            <Button variant="ghost" onClick={() => setIsImportModalOpen(true)}>
              <Upload size={14} aria-hidden="true" />
              <span>นำเข้า Excel</span>
            </Button>
            <Button variant="ghost" onClick={() => setIsExportModalOpen(true)}>
              <Download size={14} aria-hidden="true" />
              <span>Export</span>
            </Button>
            <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={14} aria-hidden="true" />
              <span>เพิ่มรายชื่อ</span>
            </Button>
          </>
        }
      />

      <section className="templates-card">
        <SubmissionsFilters
          projects={projects}
          forms={forms}
          filterProjectId={filterProjectId}
          filterFormId={filterFormId}
          searchText={searchText}
          onSearchChange={setSearchText}
          onChangeFilter={onChangeFilter}
          filteredCount={filteredRows.length}
          totalCount={roster.length}
        />

        <SubmissionsTable
          rows={filteredRows}
          currentRole={currentRole}
          mode="preregister"
          quickCheckInId={quickCheckInId}
          onQuickCheckIn={handleQuickCheckIn}
          sendingEmailId={sendingEmailId}
          onSendEmail={handleSendEmail}
          onEditEntry={(row) => setEditingEntry(row)}
          onDeleteEntry={(row) => setDeletingEntry(row)}
        />
      </section>

      <AddEditEntryModal
        open={isAddModalOpen}
        mode="add"
        forms={forms}
        defaultFormId={filterFormId}
        onAdd={handleAdd}
        onClose={() => setIsAddModalOpen(false)}
      />

      <AddEditEntryModal
        open={Boolean(editingEntry)}
        mode="edit"
        forms={forms}
        submission={editingEntry || undefined}
        onEdit={handleEdit}
        onClose={() => setEditingEntry(null)}
      />

      <ConfirmDialog
        open={Boolean(deletingEntry)}
        onClose={() => (deleteBusy ? null : setDeletingEntry(null))}
        onConfirm={handleConfirmDelete}
        title="ลบรายชื่อนี้?"
        confirmLabel="ลบรายชื่อ"
        busy={deleteBusy}
      >
        {deletingEntry
          ? `“${deletingEntry.respondent_name || deletingEntry.submission_code}” จะถูกลบออกจากรายชื่อ`
          : ""}
      </ConfirmDialog>

      <ImportSubmissionsModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        forms={forms}
        defaultFormId={filterFormId}
        onPreview={onPreviewImportSubmissionsExcel}
        onImport={onImportSubmissionsExcel}
        onDownloadTemplate={onDownloadImportTemplate}
        onSuccess={(result) =>
          toast.success(
            `นำเข้ารายชื่อสำเร็จ เพิ่มใหม่ ${result?.summary?.inserted || 0} ข้ามซ้ำ ${result?.summary?.skipped_duplicates || 0}`
          )
        }
        onError={(text) => toast.error(text)}
      />

      <ExportSubmissionsModal
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        forms={forms}
        defaultFormId={filterFormId}
        onExport={onExportSubmissionsExcel}
        onSuccess={() => toast.success("Export ข้อมูลสำเร็จ")}
        onError={(text) => toast.error(text)}
      />
    </AdminLayout>
  );
}

export default PreRegisterPage;
