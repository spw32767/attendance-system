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

    const draft = state.formDrafts[String(submission.form_id)] || createDefaultDraft(submission.project_id);

    const answers = (draft.fields || []).map((field, index) => {
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
