import { FastifyPluginAsync } from "fastify";
import {
  createAdminSubmission,
  getFormDraft,
  getSubmissionDetail,
  listAdminLoginLogs,
  listClaims,
  listEmailLogs,
  listEmailTemplates,
  listForms,
  listFormsByProject,
  listItems,
  listProjects,
  listSsoAccounts,
  listSubmissions,
  listUsers,
  saveFormDraft,
  scanClaimToken,
  setFormUsage,
  setProjectUsage,
  submitPublicForm,
  updateClaimStatus,
  updateEmailTemplate,
  updateSubmission,
  updateUser,
  upsertProject,
  getPublicForm
} from "./admin.data";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const adminRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get("/admin/projects", async () => ({ data: await listProjects() }));

  fastify.post("/admin/projects", async (request) => {
    const body = (request.body || {}) as Record<string, any>;
    return upsertProject(null, body);
  });

  fastify.patch("/admin/projects/:projectId", async (request) => {
    const projectId = toNumber((request.params as Record<string, string>).projectId);
    const body = (request.body || {}) as Record<string, any>;
    return upsertProject(projectId, body);
  });

  fastify.patch("/admin/projects/:projectId/usage", async (request) => {
    const projectId = toNumber((request.params as Record<string, string>).projectId);
    const body = (request.body || {}) as Record<string, any>;
    await setProjectUsage(Number(projectId), Boolean(body.is_active));
    return { ok: true };
  });

  fastify.get("/admin/forms", async () => ({ data: await listForms() }));

  fastify.get("/admin/projects/:projectId/forms", async (request) => {
    const projectId = toNumber((request.params as Record<string, string>).projectId);
    return { data: await listFormsByProject(Number(projectId)) };
  });

  fastify.get("/admin/forms/:formId/draft", async (request) => {
    const formId = toNumber((request.params as Record<string, string>).formId);
    return getFormDraft(Number(formId), null);
  });

  fastify.get("/admin/forms/draft", async (request) => {
    const projectId = toNumber((request.query as Record<string, string>).projectId);
    return getFormDraft(null, projectId);
  });

  fastify.post("/admin/forms/save", async (request) => {
    const body = (request.body || {}) as Record<string, any>;
    return saveFormDraft(toNumber(body.formId), body.draft || {}, body.targetStatus || null);
  });

  fastify.patch("/admin/forms/:formId/usage", async (request) => {
    const formId = toNumber((request.params as Record<string, string>).formId);
    const body = (request.body || {}) as Record<string, any>;
    await setFormUsage(Number(formId), Boolean(body.is_enabled));
    return { ok: true };
  });

  fastify.get("/admin/submissions", async () => ({ data: await listSubmissions() }));

  fastify.get("/admin/submissions/:submissionId", async (request) => {
    const submissionId = toNumber((request.params as Record<string, string>).submissionId);
    return getSubmissionDetail(Number(submissionId));
  });

  fastify.patch("/admin/submissions/:submissionId", async (request) => {
    const submissionId = toNumber((request.params as Record<string, string>).submissionId);
    const body = (request.body || {}) as Record<string, any>;
    await updateSubmission(Number(submissionId), body);
    return { ok: true };
  });

  fastify.post("/admin/forms/:formId/submissions", async (request) => {
    const formId = toNumber((request.params as Record<string, string>).formId);
    const body = (request.body || {}) as Record<string, any>;
    return createAdminSubmission(Number(formId), body);
  });

  fastify.get("/public/forms/:publicPath", async (request) => {
    const { publicPath } = request.params as Record<string, string>;
    return getPublicForm(publicPath);
  });

  fastify.post("/public/forms/:publicPath/submissions", async (request) => {
    const { publicPath } = request.params as Record<string, string>;
    const body = (request.body || {}) as Record<string, any>;
    return submitPublicForm(publicPath, body);
  });

  fastify.get("/admin/items", async () => ({ data: await listItems() }));
  fastify.get("/admin/claims", async () => ({ data: await listClaims() }));

  fastify.patch("/admin/claims/:claimId/status", async (request) => {
    const claimId = toNumber((request.params as Record<string, string>).claimId);
    const body = (request.body || {}) as Record<string, any>;
    await updateClaimStatus(Number(claimId), String(body.receive_status || "pending"));
    return { ok: true };
  });

  fastify.post("/admin/claims/scan", async (request) => {
    const body = (request.body || {}) as Record<string, any>;
    return scanClaimToken(String(body.token || ""));
  });

  fastify.get("/admin/email/templates", async () => ({ data: await listEmailTemplates() }));
  fastify.get("/admin/email/logs", async () => ({ data: await listEmailLogs() }));

  fastify.patch("/admin/email/templates/:templateId", async (request) => {
    const templateId = toNumber((request.params as Record<string, string>).templateId);
    const body = (request.body || {}) as Record<string, any>;
    await updateEmailTemplate(Number(templateId), body);
    return { ok: true };
  });

  fastify.get("/admin/users", async () => ({ data: await listUsers() }));
  fastify.get("/admin/sso-accounts", async () => ({ data: await listSsoAccounts() }));
  fastify.get("/admin/login-logs", async () => ({ data: await listAdminLoginLogs() }));

  fastify.patch("/admin/users/:userId", async (request) => {
    const userId = toNumber((request.params as Record<string, string>).userId);
    const body = (request.body || {}) as Record<string, any>;
    await updateUser(Number(userId), body);
    return { ok: true };
  });
};

export default adminRoutes;
