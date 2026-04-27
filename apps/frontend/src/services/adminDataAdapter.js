import { apiAdminService } from "./apiAdminService";

const provider = apiAdminService;

export const adminDataAdapter = {
  listProjects: (...args) => provider.listProjects(...args),
  upsertProject: (...args) => provider.upsertProject(...args),
  setProjectUsage: (...args) => provider.setProjectUsage(...args),

  listForms: (...args) => provider.listForms(...args),
  listFormsByProject: (...args) => provider.listFormsByProject(...args),
  getFormDraft: (...args) => provider.getFormDraft(...args),
  saveFormDraft: (...args) => provider.saveFormDraft(...args),
  setFormUsage: (...args) => provider.setFormUsage(...args),

  listSubmissions: (...args) => provider.listSubmissions(...args),
  getSubmissionDetail: (...args) => provider.getSubmissionDetail(...args),
  updateSubmission: (...args) => provider.updateSubmission(...args),
  previewImportFormSubmissionsExcel: (...args) => provider.previewImportFormSubmissionsExcel(...args),
  importFormSubmissionsExcel: (...args) => provider.importFormSubmissionsExcel(...args),
  downloadFormImportTemplate: (...args) => provider.downloadFormImportTemplate(...args),
  exportFormSubmissionsExcel: (...args) => provider.exportFormSubmissionsExcel(...args),

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
