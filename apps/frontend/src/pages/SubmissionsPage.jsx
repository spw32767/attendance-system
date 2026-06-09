import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button, PageHead, useToast } from "../components/ui";
import SubmissionsFilters from "./submissions/SubmissionsFilters";
import SubmissionsTable from "./submissions/SubmissionsTable";
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
  onSendCheckinEmail,
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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const toast = useToast();

  // This page shows ONLY responses people filled in themselves. Pre-registered
  // / imported entries live on the "รายชื่อล่วงหน้า" page.
  const selfFilled = useMemo(
    () => submissions.filter((submission) => submission.source_type === "public_form"),
    [submissions]
  );

  const filteredRows = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return selfFilled.filter((submission) => {
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
  }, [selfFilled, filterProjectId, filterFormId, searchText]);

  const checkedInCount = useMemo(
    () => selfFilled.filter((submission) => submission.attendance_status === "present").length,
    [selfFilled]
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
      toast.error(error instanceof Error ? error.message : "ส่งอีเมลไม่สำเร็จ");
    } finally {
      setSendingEmailId(null);
    }
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
        meta={`${selfFilled.length} คำตอบที่กรอกเอง · ${checkedInCount} เช็กอินแล้ว`}
        actions={
          <Button variant="primary" onClick={() => setIsExportModalOpen(true)}>
            <Download size={14} aria-hidden="true" />
            <span>Export</span>
          </Button>
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
          totalCount={selfFilled.length}
        />

        <SubmissionsTable
          rows={filteredRows}
          currentRole={currentRole}
          quickCheckInId={quickCheckInId}
          onQuickCheckIn={handleQuickCheckIn}
          sendingEmailId={sendingEmailId}
          onSendEmail={handleSendEmail}
          onOpenSubmission={onOpenSubmission}
        />
      </section>

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

export default SubmissionsPage;
