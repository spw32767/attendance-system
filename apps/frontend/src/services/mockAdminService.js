import {
  getTemplateDraftById,
  projectOptions,
  templateRecords
} from "../mock/templates";

const clone = (value) => JSON.parse(JSON.stringify(value));

const PROJECT_TYPE_LABELS = {
  event: "กิจกรรม / อีเวนต์",
  website: "เว็บไซต์",
  organization: "หน่วยงาน"
};

const toShareKey = () => Math.random().toString(36).slice(2, 14);

const createDefaultDraft = (projectId) => ({
  project_id: projectId,
  form_name: "",
  form_description: "",
  public_path: "",
  form_type: "attendance",
  status: "draft",
  allow_multiple_submissions: false,
  start_at: "",
  end_at: "",
  success_title: "ส่งแบบฟอร์มสำเร็จ",
  success_message: "ขอบคุณ ระบบได้บันทึกคำตอบของคุณเรียบร้อยแล้ว",
  fields: []
});

const baseProjects = projectOptions.map((project, index) => ({
  project_id: project.project_id,
  project_code: `PROJECT_${String(project.project_id).padStart(3, "0")}`,
  project_name: project.project_name,
  project_type: index % 2 === 0 ? "event" : "website",
  source_url: "",
  description: "",
  is_active: true
}));

const baseForms = templateRecords.map((template) => ({ ...template }));

const baseDrafts = baseForms.reduce((lookup, form) => {
  const existingDraft = getTemplateDraftById(form.form_id);
  lookup[String(form.form_id)] = existingDraft
    ? clone(existingDraft)
    : createDefaultDraft(form.project_id);
  return lookup;
}, {});

const state = {
  projects: baseProjects,
  forms: baseForms,
  formDrafts: baseDrafts,
  submissions: [
    {
      submission_id: 1,
      project_id: 1,
      form_id: "1",
      submission_code: "SUB-HACK26-0001",
      respondent_name: "ศิริพร ใจดี",
      respondent_email: "siriporn@example.com",
      attendance_status: "present",
      submitted_at: "2026-07-03T08:12:33",
      check_in_at: "2026-07-03T08:45:10",
      check_out_at: "",
      note: "",
      source_type: "public_form"
    },
    {
      submission_id: 2,
      project_id: 1,
      form_id: "1",
      submission_code: "SUB-HACK26-0002",
      respondent_name: "Nattapon Deechai",
      respondent_email: "nattapon@example.com",
      attendance_status: "submitted",
      submitted_at: "2026-07-03T09:20:45",
      check_in_at: "",
      check_out_at: "",
      note: "",
      source_type: "public_form"
    },
    {
      submission_id: 3,
      project_id: 2,
      form_id: "2",
      submission_code: "SUB-OH26-0001",
      respondent_name: "Ploy Sukanya",
      respondent_email: "ploy.sukanya@example.com",
      attendance_status: "submitted",
      submitted_at: "2026-08-10T10:05:15",
      check_in_at: "",
      check_out_at: "",
      note: "",
      source_type: "public_form"
    }
  ],
  items: [
    {
      item_id: 1,
      project_id: 1,
      form_id: "1",
      item_code: "LUNCH_BOX",
      item_name: "ข้าวกล่อง",
      item_type: "meal",
      default_qty: 1,
      is_active: true
    },
    {
      item_id: 2,
      project_id: 1,
      form_id: "1",
      item_code: "SOUVENIR_BAG",
      item_name: "ชุดของที่ระลึก",
      item_type: "souvenir",
      default_qty: 1,
      is_active: true
    },
    {
      item_id: 3,
      project_id: 2,
      form_id: "2",
      item_code: "OPENHOUSE_BADGE",
      item_name: "บัตรคล้องคอ",
      item_type: "badge",
      default_qty: 1,
      is_active: true
    }
  ],
  claims: [
    {
      claim_id: 1,
      project_id: 1,
      form_id: "1",
      item_id: 1,
      submission_code: "SUB-HACK26-0001",
      claim_token: "CLAIM-HACK26-SUB1-LUNCH-001",
      receive_status: "received",
      received_at: "2026-07-03T11:00:12"
    },
    {
      claim_id: 2,
      project_id: 1,
      form_id: "1",
      item_id: 2,
      submission_code: "SUB-HACK26-0001",
      claim_token: "CLAIM-HACK26-SUB1-SOUVENIR-001",
      receive_status: "pending",
      received_at: ""
    },
    {
      claim_id: 3,
      project_id: 2,
      form_id: "2",
      item_id: 3,
      submission_code: "SUB-OH26-0001",
      claim_token: "CLAIM-OH26-SUB1-BADGE-001",
      receive_status: "pending",
      received_at: ""
    }
  ],
  emailTemplates: [
    {
      email_template_id: 1,
      project_id: 1,
      form_id: "1",
      template_name: "อีเมลยืนยันลงทะเบียน Hackathon",
      notification_code: "submission_confirmation",
      email_subject: "ยืนยันการลงทะเบียน Hackathon 2026",
      email_body:
        "สวัสดี {{respondent_name}}\n\nขอบคุณที่ลงทะเบียนเข้าร่วมกิจกรรม ระบบได้บันทึกข้อมูลของคุณเรียบร้อยแล้ว",
      is_active: true
    },
    {
      email_template_id: 2,
      project_id: 2,
      form_id: "2",
      template_name: "อีเมลยืนยัน Open House",
      notification_code: "submission_confirmation",
      email_subject: "ยืนยันการลงทะเบียน Open House 2026",
      email_body:
        "สวัสดี {{respondent_name}}\n\nขอบคุณสำหรับการลงทะเบียนเข้าร่วม Open House แล้วพบกันในวันงาน",
      is_active: true
    }
  ],
  emailLogs: [
    {
      email_log_id: 1,
      project_id: 1,
      form_id: "1",
      recipient_email: "siriporn@example.com",
      notification_code: "submission_confirmation",
      send_status: "sent",
      created_at: "2026-07-03T08:12:34"
    },
    {
      email_log_id: 2,
      project_id: 1,
      form_id: "1",
      recipient_email: "nattapon@example.com",
      notification_code: "submission_confirmation",
      send_status: "sent",
      created_at: "2026-07-03T09:20:50"
    },
    {
      email_log_id: 3,
      project_id: 2,
      form_id: "2",
      recipient_email: "ploy.sukanya@example.com",
      notification_code: "submission_confirmation",
      send_status: "sent",
      created_at: "2026-08-10T10:05:16"
    }
  ],
  submissionAnswersById: {},
  users: [
    {
      user_id: 1,
      email: "admin@attendance.com",
      display_name: "System Admin",
      role_code: "admin",
      is_active: true,
      login_method: "local"
    },
    {
      user_id: 2,
      email: "staff@attendance.com",
      display_name: "Event Staff",
      role_code: "staff",
      is_active: true,
      login_method: "local"
    },
    {
      user_id: 3,
      email: "scanner@attendance.com",
      display_name: "Claim Scanner",
      role_code: "scanner",
      is_active: true,
      login_method: "local"
    }
  ],
  ssoAccounts: [
    {
      sso_account_id: 1,
      user_id: 1,
      email: "admin@attendance.com",
      provider_name: "google",
      provider_user_id: "google-10001",
      is_active: true,
      linked_at: "2026-02-10T08:00:00"
    }
  ],
  adminLoginLogs: [
    {
      login_log_id: 1,
      email: "admin@attendance.com",
      login_method: "local",
      login_status: "success",
      reject_reason: "",
      ip_address: "10.1.1.10",
      user_agent: "Mozilla/5.0",
      logged_at: "2026-04-03T08:10:00"
    },
    {
      login_log_id: 2,
      email: "staff@attendance.com",
      login_method: "sso",
      login_status: "success",
      reject_reason: "",
      ip_address: "10.1.1.12",
      user_agent: "Mozilla/5.0",
      logged_at: "2026-04-03T08:12:00"
    },
    {
      login_log_id: 3,
      email: "unknown@attendance.com",
      login_method: "sso",
      login_status: "failed",
      reject_reason: "user_not_found",
      ip_address: "10.1.1.22",
      user_agent: "Mozilla/5.0",
      logged_at: "2026-04-03T08:15:00"
    }
  ]
};

const withProjectName = (form) => {
  const project = state.projects.find(
    (projectItem) => Number(projectItem.project_id) === Number(form.project_id)
  );

  return {
    ...form,
    project_name: project?.project_name || form.project_name
  };
};

const toPublicFormStatus = (form) => {
  if (!form) {
    return "not_found";
  }

  if (form.status !== "published") {
    return "closed";
  }

  const now = new Date();
  const startAt = form.start_at ? new Date(form.start_at) : null;
  const endAt = form.end_at ? new Date(form.end_at) : null;

  if (startAt && now < startAt) {
    return "not_started";
  }

  if (endAt && now > endAt) {
    return "ended";
  }

  return "open";
};

const toSubmissionCode = (formId, sequence) =>
  `SUB-F${String(formId).padStart(3, "0")}-${String(sequence).padStart(4, "0")}`;

const toFormSummary = (formId, draft) => {
  const existing = state.forms.find((form) => String(form.form_id) === String(formId));

  return {
    form_id: String(formId),
    project_id: Number(draft.project_id),
    project_name: "",
    form_name: draft.form_name || "แบบฟอร์มใหม่",
    form_description: draft.form_description || "",
    public_path: draft.public_path || `form-${formId}`,
    form_type: draft.form_type || "attendance",
    status: draft.status || "draft",
    allow_multiple_submissions: Boolean(draft.allow_multiple_submissions),
    start_at: draft.start_at || "",
    end_at: draft.end_at || "",
    share_key: existing?.share_key || toShareKey(),
    success_title: draft.success_title || "",
    success_message: draft.success_message || ""
  };
};

export const mockAdminService = {
  async listProjects() {
    return clone(
      state.projects.map((project) => ({
        ...project,
        project_type_label: PROJECT_TYPE_LABELS[project.project_type] || project.project_type
      }))
    );
  },

  async listForms() {
    return clone(state.forms.map(withProjectName));
  },

  async listFormsByProject(projectId) {
    return clone(
      state.forms
        .filter((form) => Number(form.project_id) === Number(projectId))
        .map(withProjectName)
    );
  },

  async getFormDraft(formId, projectId) {
    if (formId && state.formDrafts[String(formId)]) {
      return clone(state.formDrafts[String(formId)]);
    }

    return clone(createDefaultDraft(Number(projectId) || state.projects[0]?.project_id || 1));
  },

  async saveFormDraft(formId, draft, targetStatus) {
    const preparedDraft = {
      ...draft,
      status: targetStatus || draft.status || "draft"
    };

    const resolvedFormId =
      formId ||
      String(
        state.forms.length > 0
          ? Math.max(...state.forms.map((form) => Number(form.form_id))) + 1
          : 1
      );

    state.formDrafts[String(resolvedFormId)] = clone(preparedDraft);

    const summary = toFormSummary(resolvedFormId, preparedDraft);
    const existingIndex = state.forms.findIndex(
      (form) => String(form.form_id) === String(resolvedFormId)
    );

    if (existingIndex >= 0) {
      state.forms[existingIndex] = {
        ...state.forms[existingIndex],
        ...summary
      };
    } else {
      state.forms.push(summary);
    }

    return clone({ formId: String(resolvedFormId) });
  },

  async setProjectUsage(projectId, isActive) {
    state.projects = state.projects.map((project) =>
      Number(project.project_id) === Number(projectId)
        ? {
            ...project,
            is_active: Boolean(isActive)
          }
        : project
    );
  },

  async setFormUsage(formId, isEnabled) {
    const nextStatus = isEnabled ? "published" : "closed";

    state.forms = state.forms.map((form) =>
      String(form.form_id) === String(formId)
        ? {
            ...form,
            status: nextStatus
          }
        : form
    );

    if (state.formDrafts[String(formId)]) {
      state.formDrafts[String(formId)] = {
        ...state.formDrafts[String(formId)],
        status: nextStatus
      };
    }
  },

  async listSubmissions() {
    return clone(
      state.submissions.map((submission) => {
        const form = state.forms.find(
          (formItem) => String(formItem.form_id) === String(submission.form_id)
        );
        const project = state.projects.find(
          (projectItem) => Number(projectItem.project_id) === Number(submission.project_id)
        );

        return {
          ...submission,
          form_name: form?.form_name || "-",
          project_name: project?.project_name || "-"
        };
      })
    );
  },

  async getSubmissionDetail(submissionId) {
    const submission = state.submissions.find(
      (item) => Number(item.submission_id) === Number(submissionId)
    );

    if (!submission) {
      return null;
    }

    const form = state.forms.find(
      (formItem) => String(formItem.form_id) === String(submission.form_id)
    );
    const project = state.projects.find(
      (projectItem) => Number(projectItem.project_id) === Number(submission.project_id)
    );

    const draft =
      state.formDrafts[String(submission.form_id)] ||
      createDefaultDraft(submission.project_id);
    const existingAnswers = state.submissionAnswersById[String(submission.submission_id)];

    const answers = existingAnswers || (draft.fields || []).map((field, index) => {
      let answerValue = "-";

      if (field.field_type === "short_text" || field.field_type === "long_text") {
        answerValue = `${field.field_label || `คำถาม ${index + 1}`} - ตัวอย่างคำตอบ`;
      }

      if (field.field_type === "multiple_choice" || field.field_type === "dropdown") {
        answerValue = field.options?.[0]?.option_label || "-";
      }

      if (field.field_type === "checkboxes") {
        answerValue = (field.options || []).slice(0, 2).map((option) => option.option_label).join(", ") || "-";
      }

      if (field.field_type === "date") {
        answerValue = "2026-07-03";
      }

      if (field.field_type === "time") {
        answerValue = "08:30";
      }

      if (field.field_type === "rating") {
        answerValue = String(field.settings_json?.rating_max || 5);
      }

      if (field.field_type === "file_upload") {
        answerValue = "sample-file.pdf";
      }

      return {
        field_id: field.id,
        field_label: field.field_label || `คำถาม ${index + 1}`,
        field_type: field.field_type,
        is_required: Boolean(field.is_required),
        value: answerValue
      };
    });

    return clone({
      ...submission,
      form_name: form?.form_name || "-",
      project_name: project?.project_name || "-",
      answers
    });
  },

  async getPublicForm(publicPath) {
    const form = state.forms.find((item) => item.public_path === String(publicPath));
    const status = toPublicFormStatus(form);

    if (!form) {
      return { status };
    }

    const draft = state.formDrafts[String(form.form_id)] || createDefaultDraft(form.project_id);

    return clone({
      status,
      form: {
        form_id: form.form_id,
        public_path: form.public_path,
        form_name: draft.form_name || form.form_name,
        form_description: draft.form_description || form.form_description,
        success_title: draft.success_title || form.success_title,
        success_message: draft.success_message || form.success_message,
        fields: draft.fields || []
      }
    });
  },

  async submitPublicForm(publicPath, payload) {
    const form = state.forms.find((item) => item.public_path === String(publicPath));
    const status = toPublicFormStatus(form);

    if (!form || status !== "open") {
      return { ok: false, status };
    }

    const draft = state.formDrafts[String(form.form_id)] || createDefaultDraft(form.project_id);
    const answers = payload?.answers || {};

    const fullNameField = draft.fields.find((field) => field.field_usage === "full_name");
    const firstNameField = draft.fields.find((field) => field.field_usage === "first_name");
    const lastNameField = draft.fields.find((field) => field.field_usage === "last_name");
    const emailField = draft.fields.find((field) => field.field_usage === "email");

    const respondentName =
      answers[fullNameField?.id] ||
      [answers[firstNameField?.id], answers[lastNameField?.id]].filter(Boolean).join(" ") ||
      "ผู้ตอบแบบฟอร์ม";

    const respondentEmail = answers[emailField?.id] || "unknown@example.com";

    const nextSubmissionId =
      state.submissions.length > 0
        ? Math.max(...state.submissions.map((item) => Number(item.submission_id))) + 1
        : 1;
    const submissionCode = toSubmissionCode(form.form_id, nextSubmissionId);

    const normalizedAnswers = (draft.fields || []).map((field, index) => {
      const rawValue = answers[field.id];
      let value = "-";

      if (Array.isArray(rawValue)) {
        value = rawValue.join(", ") || "-";
      } else if (rawValue instanceof FileList) {
        value = rawValue.length ? Array.from(rawValue).map((file) => file.name).join(", ") : "-";
      } else if (rawValue !== undefined && rawValue !== null && rawValue !== "") {
        value = String(rawValue);
      }

      return {
        field_id: field.id,
        field_label: field.field_label || `คำถาม ${index + 1}`,
        field_type: field.field_type,
        is_required: Boolean(field.is_required),
        value
      };
    });

    state.submissionAnswersById[String(nextSubmissionId)] = normalizedAnswers;

    state.submissions.push({
      submission_id: nextSubmissionId,
      project_id: form.project_id,
      form_id: String(form.form_id),
      submission_code: submissionCode,
      respondent_name: respondentName,
      respondent_email: respondentEmail,
      attendance_status: "submitted",
      submitted_at: new Date().toISOString(),
      check_in_at: "",
      check_out_at: "",
      note: "",
      source_type: "public_form"
    });

    const relatedItems = state.items.filter(
      (item) => String(item.form_id) === String(form.form_id) && Boolean(item.is_active)
    );

    relatedItems.forEach((item, itemIndex) => {
      const nextClaimId =
        state.claims.length > 0
          ? Math.max(...state.claims.map((claim) => Number(claim.claim_id))) + 1
          : 1;

      state.claims.push({
        claim_id: nextClaimId,
        project_id: form.project_id,
        form_id: String(form.form_id),
        item_id: item.item_id,
        submission_code: submissionCode,
        claim_token: `CLAIM-${String(form.form_id).padStart(3, "0")}-${String(nextSubmissionId).padStart(4, "0")}-${itemIndex + 1}`,
        receive_status: "pending",
        received_at: ""
      });
    });

    const activeTemplate = state.emailTemplates.find(
      (template) =>
        String(template.form_id) === String(form.form_id) && Boolean(template.is_active)
    );

    if (activeTemplate) {
      const nextEmailLogId =
        state.emailLogs.length > 0
          ? Math.max(...state.emailLogs.map((log) => Number(log.email_log_id))) + 1
          : 1;

      state.emailLogs.push({
        email_log_id: nextEmailLogId,
        project_id: form.project_id,
        form_id: String(form.form_id),
        recipient_email: respondentEmail,
        notification_code: activeTemplate.notification_code,
        send_status: "sent",
        created_at: new Date().toISOString()
      });
    }

    return {
      ok: true,
      status: "submitted",
      submissionCode,
      successTitle: draft.success_title || form.success_title,
      successMessage: draft.success_message || form.success_message
    };
  },

  async listItems() {
    return clone(
      state.items.map((item) => {
        const form = state.forms.find(
          (formItem) => String(formItem.form_id) === String(item.form_id)
        );
        const project = state.projects.find(
          (projectItem) => Number(projectItem.project_id) === Number(item.project_id)
        );

        return {
          ...item,
          form_name: form?.form_name || "-",
          project_name: project?.project_name || "-"
        };
      })
    );
  },

  async updateSubmission(submissionId, payload) {
    state.submissions = state.submissions.map((submission) =>
      Number(submission.submission_id) === Number(submissionId)
        ? {
            ...submission,
            ...payload
          }
        : submission
    );
  },

  async listClaims() {
    return clone(
      state.claims.map((claim) => {
        const form = state.forms.find(
          (formItem) => String(formItem.form_id) === String(claim.form_id)
        );
        const project = state.projects.find(
          (projectItem) => Number(projectItem.project_id) === Number(claim.project_id)
        );
        const item = state.items.find(
          (itemItem) => Number(itemItem.item_id) === Number(claim.item_id)
        );

        return {
          ...claim,
          form_name: form?.form_name || "-",
          project_name: project?.project_name || "-",
          item_name: item?.item_name || "-"
        };
      })
    );
  },

  async updateClaimStatus(claimId, receiveStatus) {
    state.claims = state.claims.map((claim) =>
      Number(claim.claim_id) === Number(claimId)
        ? {
            ...claim,
            receive_status: receiveStatus,
            received_at: receiveStatus === "received" ? new Date().toISOString() : ""
          }
        : claim
    );
  },

  async scanClaimToken(token) {
    const normalizedToken = String(token || "").trim();
    const targetClaim = state.claims.find((claim) => claim.claim_token === normalizedToken);

    if (!targetClaim) {
      return {
        status: "not_found",
        message: "ไม่พบโทเคนนี้ในระบบ"
      };
    }

    if (targetClaim.receive_status === "received") {
      return {
        status: "already_used",
        message: "โทเคนนี้ถูกใช้รับของแล้ว",
        claim: clone(targetClaim)
      };
    }

    await this.updateClaimStatus(targetClaim.claim_id, "received");
    const updatedClaim = state.claims.find(
      (claim) => Number(claim.claim_id) === Number(targetClaim.claim_id)
    );

    return {
      status: "received",
      message: "ยืนยันรับของเรียบร้อยแล้ว",
      claim: clone(updatedClaim)
    };
  },

  async listEmailTemplates() {
    return clone(
      state.emailTemplates.map((template) => {
        const form = state.forms.find(
          (formItem) => String(formItem.form_id) === String(template.form_id)
        );
        const project = state.projects.find(
          (projectItem) => Number(projectItem.project_id) === Number(template.project_id)
        );

        return {
          ...template,
          form_name: form?.form_name || "-",
          project_name: project?.project_name || "-"
        };
      })
    );
  },

  async updateEmailTemplate(templateId, payload) {
    state.emailTemplates = state.emailTemplates.map((template) =>
      Number(template.email_template_id) === Number(templateId)
        ? {
            ...template,
            ...payload
          }
        : template
    );
  },

  async listEmailLogs() {
    return clone(
      state.emailLogs.map((log) => {
        const form = state.forms.find(
          (formItem) => String(formItem.form_id) === String(log.form_id)
        );
        const project = state.projects.find(
          (projectItem) => Number(projectItem.project_id) === Number(log.project_id)
        );

        return {
          ...log,
          form_name: form?.form_name || "-",
          project_name: project?.project_name || "-"
        };
      })
    );
  },

  async listUsers() {
    return clone(state.users);
  },

  async updateUser(userId, payload) {
    state.users = state.users.map((user) =>
      Number(user.user_id) === Number(userId)
        ? {
            ...user,
            ...payload
          }
        : user
    );
  },

  async listSsoAccounts() {
    const usersById = state.users.reduce((lookup, user) => {
      lookup[user.user_id] = user;
      return lookup;
    }, {});

    return clone(
      state.ssoAccounts.map((account) => ({
        ...account,
        display_name: usersById[account.user_id]?.display_name || "-"
      }))
    );
  },

  async listAdminLoginLogs() {
    return clone(state.adminLoginLogs);
  },

  async upsertProject(projectId, payload) {
    if (projectId) {
      state.projects = state.projects.map((project) =>
        Number(project.project_id) === Number(projectId)
          ? {
              ...project,
              ...payload
            }
          : project
      );
      return;
    }

    const nextProjectId =
      state.projects.length > 0
        ? Math.max(...state.projects.map((project) => Number(project.project_id))) + 1
        : 1;

    state.projects.push({
      project_id: nextProjectId,
      ...payload
    });
  }
};
