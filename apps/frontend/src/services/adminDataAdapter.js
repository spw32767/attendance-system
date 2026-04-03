import { mockAdminService } from "./mockAdminService";

const provider = mockAdminService;

export const adminDataAdapter = {
  listProjects: (...args) => provider.listProjects(...args),
  upsertProject: (...args) => provider.upsertProject(...args),

  listForms: (...args) => provider.listForms(...args),
  listFormsByProject: (...args) => provider.listFormsByProject(...args),
  getFormDraft: (...args) => provider.getFormDraft(...args),
  saveFormDraft: (...args) => provider.saveFormDraft(...args),

  listSubmissions: (...args) => provider.listSubmissions(...args),
  getSubmissionDetail: (...args) => provider.getSubmissionDetail(...args),
  updateSubmission: (...args) => provider.updateSubmission(...args),

  getPublicForm: (...args) => provider.getPublicForm(...args),
  submitPublicForm: (...args) => provider.submitPublicForm(...args),

  listItems: (...args) => provider.listItems(...args),
  listClaims: (...args) => provider.listClaims(...args),
  updateClaimStatus: (...args) => provider.updateClaimStatus(...args),
  scanClaimToken: (...args) => provider.scanClaimToken(...args),

  listEmailTemplates: (...args) => provider.listEmailTemplates(...args),
  updateEmailTemplate: (...args) => provider.updateEmailTemplate(...args),
  listEmailLogs: (...args) => provider.listEmailLogs(...args),

  listUsers: (...args) => provider.listUsers(...args),
  updateUser: (...args) => provider.updateUser(...args),
  listSsoAccounts: (...args) => provider.listSsoAccounts(...args),
  listAdminLoginLogs: (...args) => provider.listAdminLoginLogs(...args)
};
