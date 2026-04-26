import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, Search, UserPlus, X } from "lucide-react";
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

const ADMIN_SUBMIT_STATUS_TEXT = {
  not_found: "ไม่พบฟอร์มที่เลือก",
  closed: "ฟอร์มนี้ปิดรับข้อมูลอยู่",
  not_started: "ฟอร์มนี้ยังไม่ถึงเวลาเปิดรับ",
  ended: "ฟอร์มนี้หมดเวลารับข้อมูลแล้ว"
};

const isEmptyAnswer = (value) => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "string") {
    return !value.trim();
  }

  if (value instanceof FileList) {
    return value.length === 0;
  }

  return value === null || value === undefined || value === "";
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
  onCreateAdminSubmission,
  onLoadFormDraft,
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCreateFormId, setSelectedCreateFormId] = useState("");
  const [createFormDraft, setCreateFormDraft] = useState(null);
  const [createAnswers, setCreateAnswers] = useState({});
  const [createErrors, setCreateErrors] = useState({});
  const [createNote, setCreateNote] = useState("");
  const [createMarkPresent, setCreateMarkPresent] = useState(true);
  const [createLoadingDraft, setCreateLoadingDraft] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createErrorText, setCreateErrorText] = useState("");
  const [pageNotice, setPageNotice] = useState(null);
  const [quickCheckInId, setQuickCheckInId] = useState(null);

  const projectForms = useMemo(
    () =>
      filterProjectId
        ? forms.filter((form) => Number(form.project_id) === Number(filterProjectId))
        : forms,
    [filterProjectId, forms]
  );

  const orderedCreateFields = useMemo(
    () => [...(createFormDraft?.fields || [])].sort((a, b) => a.sort_order - b.sort_order),
    [createFormDraft]
  );

  const initialCreateAnswers = (draft) => {
    const nextAnswers = {};
    (draft?.fields || []).forEach((field) => {
      if (field.field_type === "checkboxes") {
        nextAnswers[field.id] = [];
        return;
      }

      nextAnswers[field.id] = "";
    });
    return nextAnswers;
  };

  useEffect(() => {
    if (!isCreateOpen || !selectedCreateFormId) {
      return;
    }

    let isCancelled = false;

    const loadDraft = async () => {
      setCreateLoadingDraft(true);
      setCreateErrorText("");
      try {
        const draft = await onLoadFormDraft?.(selectedCreateFormId, null);
        if (isCancelled) {
          return;
        }

        setCreateFormDraft(draft || null);
        setCreateAnswers(initialCreateAnswers(draft));
        setCreateErrors({});
      } catch (error) {
        if (!isCancelled) {
          setCreateErrorText(error instanceof Error ? error.message : "โหลดฟอร์มไม่สำเร็จ");
        }
      } finally {
        if (!isCancelled) {
          setCreateLoadingDraft(false);
        }
      }
    };

    void loadDraft();

    return () => {
      isCancelled = true;
    };
  }, [isCreateOpen, onLoadFormDraft, selectedCreateFormId]);

  useEffect(() => {
    if (!pageNotice) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPageNotice(null);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [pageNotice]);

  const filteredRows = useMemo(() => {
    return submissions.filter((submission) => {
      if (
        filterProjectId &&
        Number(submission.project_id) !== Number(filterProjectId)
      ) {
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
        submission.attendance_status
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

  const openCreateModal = () => {
    const preferredFormId =
      filterFormId && projectForms.some((form) => String(form.form_id) === String(filterFormId))
        ? String(filterFormId)
        : String(projectForms[0]?.form_id || "");

    if (!preferredFormId) {
      setPageNotice({
        type: "error",
        text: "ยังไม่มีฟอร์มที่ใช้งานได้สำหรับการลงชื่อแทน"
      });
      return;
    }

    setCreateErrorText("");
    setPageNotice(null);
    setCreateNote("");
    setCreateMarkPresent(true);
    setSelectedCreateFormId(preferredFormId);
    setCreateFormDraft(null);
    setCreateAnswers({});
    setCreateErrors({});
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    if (createSubmitting) {
      return;
    }

    setIsCreateOpen(false);
  };

  const setCreateAnswer = (fieldId, value) => {
    setCreateAnswers((current) => ({
      ...current,
      [fieldId]: value
    }));
  };

  const submitCreateForm = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    orderedCreateFields.forEach((field) => {
      if (!field.is_required) {
        return;
      }

      if (isEmptyAnswer(createAnswers[field.id])) {
        nextErrors[field.id] = "กรุณากรอกข้อมูลช่องนี้";
      }
    });

    setCreateErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setCreateSubmitting(true);
    setCreateErrorText("");

    try {
      const result = await onCreateAdminSubmission?.(selectedCreateFormId, {
        answers: createAnswers,
        mark_present: createMarkPresent,
        note: createNote
      });

      if (!result?.ok) {
        setCreateErrorText(
          ADMIN_SUBMIT_STATUS_TEXT[result?.status] || "ไม่สามารถบันทึกการลงชื่อแทนได้"
        );
        return;
      }

      setPageNotice({
        type: "success",
        text: `บันทึกสำเร็จ ${result.submissionCode ? `(${result.submissionCode})` : ""}`.trim()
      });
      setIsCreateOpen(false);
    } catch (error) {
      setCreateErrorText(error instanceof Error ? error.message : "ไม่สามารถบันทึกการลงชื่อแทนได้");
    } finally {
      setCreateSubmitting(false);
    }
  };

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
        <div className="page-head-actions inline-action-row">
          <button className="primary-button icon-text-button" type="button" onClick={openCreateModal}>
            <UserPlus size={15} strokeWidth={2} />
            <span>ลงชื่อแทนผู้เข้าร่วม</span>
          </button>
        </div>
      </section>

      {pageNotice ? (
        <p
          className={`notice-banner${pageNotice.type === "error" ? " notice-banner-error" : ""}`}
        >
          {pageNotice.text}
        </p>
      ) : null}

      <section className="templates-card">
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
            onChange={(event) =>
              onChangeFilter(filterProjectId || null, event.target.value || null)
            }
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
                <th className="table-col-actions">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={6}>
                    ไม่พบข้อมูลคำตอบ
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const statusMeta =
                    STATUS_META[row.attendance_status] || STATUS_META.submitted;

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
                      <td className="table-col-actions">
                        <div className="table-actions">
                          {row.attendance_status !== "present" && row.attendance_status !== "completed" ? (
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

      {isCreateOpen ? (
        <div className="dashboard-preview-overlay" role="presentation" onClick={closeCreateModal}>
          <section
            className="dashboard-preview-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="ลงชื่อแทนผู้เข้าร่วม"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="dashboard-preview-header">
              <div>
                <p className="dashboard-preview-kicker">Admin Submission</p>
                <h2>ลงชื่อแทนผู้เข้าร่วม</h2>
              </div>
              <button
                className="icon-only-button icon-neutral-button"
                type="button"
                onClick={closeCreateModal}
                aria-label="ปิดฟอร์มลงชื่อแทน"
                title="ปิดฟอร์มลงชื่อแทน"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </header>

            <div className="dashboard-preview-body">
              {createLoadingDraft ? <p className="dashboard-preview-note">กำลังโหลดฟอร์ม...</p> : null}
              {createErrorText && isCreateOpen ? (
                <p className="dashboard-preview-note dashboard-preview-note-error">{createErrorText}</p>
              ) : null}

              {!createLoadingDraft && createFormDraft ? (
                <form className="public-form-grid" onSubmit={submitCreateForm}>
                  <label className="public-form-field">
                    <span>เลือกฟอร์ม</span>
                    <select
                      className="select-control"
                      value={selectedCreateFormId}
                      onChange={(event) => setSelectedCreateFormId(event.target.value)}
                    >
                      {projectForms.map((form) => (
                        <option key={form.form_id} value={form.form_id}>
                          {form.project_name} / {form.form_name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {orderedCreateFields.map((field) => (
                    <label key={field.id} className="public-form-field">
                      <span>
                        {field.field_label || "คำถาม"}
                        {field.is_required ? <strong className="required-mark">*</strong> : null}
                      </span>

                      {field.field_type === "short_text" ? (
                        <input
                          className="input-control"
                          value={createAnswers[field.id] || ""}
                          placeholder={field.placeholder || "คำตอบสั้น"}
                          onChange={(event) => setCreateAnswer(field.id, event.target.value)}
                        />
                      ) : null}

                      {field.field_type === "long_text" ? (
                        <textarea
                          className="textarea-control"
                          rows={3}
                          value={createAnswers[field.id] || ""}
                          placeholder={field.placeholder || "คำตอบยาว"}
                          onChange={(event) => setCreateAnswer(field.id, event.target.value)}
                        />
                      ) : null}

                      {(field.field_type === "multiple_choice" || field.field_type === "dropdown") && (
                        <select
                          className="select-control"
                          value={createAnswers[field.id] || ""}
                          onChange={(event) => setCreateAnswer(field.id, event.target.value)}
                        >
                          <option value="">เลือกคำตอบ</option>
                          {(field.options || []).map((option) => (
                            <option key={option.id} value={option.option_value || option.option_label}>
                              {option.option_label}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.field_type === "checkboxes" ? (
                        <div className="preview-options">
                          {(field.options || []).map((option) => {
                            const optionValue = option.option_value || option.option_label;
                            const currentValues = createAnswers[field.id] || [];
                            const checked = currentValues.includes(optionValue);

                            return (
                              <label key={option.id}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(event) => {
                                    if (event.target.checked) {
                                      setCreateAnswer(field.id, [...currentValues, optionValue]);
                                      return;
                                    }

                                    setCreateAnswer(
                                      field.id,
                                      currentValues.filter((value) => value !== optionValue)
                                    );
                                  }}
                                />
                                <span>{option.option_label}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : null}

                      {field.field_type === "rating" ? (
                        <select
                          className="select-control"
                          value={createAnswers[field.id] || ""}
                          onChange={(event) => setCreateAnswer(field.id, event.target.value)}
                        >
                          <option value="">เลือกคะแนน</option>
                          {Array.from({
                            length:
                              (field.settings_json?.rating_max || 5) -
                              (field.settings_json?.rating_min || 1) +
                              1
                          }).map((_, index) => {
                            const value = (field.settings_json?.rating_min || 1) + index;
                            return (
                              <option key={value} value={String(value)}>
                                {value}
                              </option>
                            );
                          })}
                        </select>
                      ) : null}

                      {field.field_type === "date" ? (
                        <input
                          className="input-control"
                          type="date"
                          value={createAnswers[field.id] || ""}
                          onChange={(event) => setCreateAnswer(field.id, event.target.value)}
                        />
                      ) : null}

                      {field.field_type === "time" ? (
                        <input
                          className="input-control"
                          type="time"
                          value={createAnswers[field.id] || ""}
                          onChange={(event) => setCreateAnswer(field.id, event.target.value)}
                        />
                      ) : null}

                      {field.field_type === "file_upload" ? (
                        <input
                          className="input-control"
                          type="file"
                          multiple={(field.settings_json?.max_file_count || 1) > 1}
                          onChange={(event) => setCreateAnswer(field.id, event.target.files)}
                        />
                      ) : null}

                      {createErrors[field.id] ? (
                        <small className="public-form-error">{createErrors[field.id]}</small>
                      ) : null}
                    </label>
                  ))}

                  <label className="public-form-field">
                    <span>หมายเหตุเพิ่มเติม</span>
                    <textarea
                      className="textarea-control"
                      rows={3}
                      value={createNote}
                      placeholder="เช่น ลงชื่อแทนแขกรับเชิญพิเศษ"
                      onChange={(event) => setCreateNote(event.target.value)}
                    />
                  </label>

                  <label className="checkbox-row compact">
                    <input
                      type="checkbox"
                      checked={createMarkPresent}
                      onChange={(event) => setCreateMarkPresent(event.target.checked)}
                    />
                    <span>เช็กอินทันทีหลังบันทึก</span>
                  </label>

                  <div className="inline-action-row">
                    <button className="primary-button" type="submit" disabled={createSubmitting}>
                      {createSubmitting ? "กำลังบันทึก..." : "บันทึกการลงชื่อแทน"}
                    </button>
                    <button className="ghost-button" type="button" onClick={closeCreateModal}>
                      ยกเลิก
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </AdminLayout>
  );
}

export default SubmissionsPage;
