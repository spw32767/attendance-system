import { FastifyPluginAsync } from "fastify";
import fastifyMultipart from "@fastify/multipart";
import {
  buildImportTemplateExcel,
  exportFormSubmissionsExcel,
  getFormDraft,
  getSubmissionDetail,
  importFormSubmissionsFromExcel,
  previewImportFormSubmissionsFromExcel,
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
  await fastify.register(fastifyMultipart);

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

  fastify.get("/admin/forms/:formId/submissions/import-template", async (request, reply) => {
    const formId = toNumber((request.params as Record<string, string>).formId);
    if (!formId) {
      reply.code(400);
      return { message: "formId ไม่ถูกต้อง" };
    }

    try {
      const template = await buildImportTemplateExcel(Number(formId));
      reply.header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      reply.header("Content-Disposition", `attachment; filename="${template.fileName}"`);
      return reply.send(template.buffer);
    } catch (error) {
      reply.code(400);
      return {
        message: error instanceof Error ? error.message : "ไม่สามารถสร้าง template ได้"
      };
    }
  });

  fastify.post("/admin/forms/:formId/submissions/import-excel/preview", async (request, reply) => {
    const formId = toNumber((request.params as Record<string, string>).formId);
    if (!formId) {
      reply.code(400);
      return { message: "formId ไม่ถูกต้อง" };
    }

    const file = await request.file();
    if (!file) {
      reply.code(400);
      return { message: "ไม่พบไฟล์สำหรับพรีวิว" };
    }

    try {
      const fileBuffer = await file.toBuffer();
      return previewImportFormSubmissionsFromExcel(Number(formId), fileBuffer);
    } catch (error) {
      reply.code(400);
      return {
        message: error instanceof Error ? error.message : "ไม่สามารถพรีวิวไฟล์ได้"
      };
    }
  });

  fastify.post("/admin/forms/:formId/submissions/import-excel", async (request, reply) => {
    const formId = toNumber((request.params as Record<string, string>).formId);
    if (!formId) {
      reply.code(400);
      return { message: "formId ไม่ถูกต้อง" };
    }

    const file = await request.file();
    if (!file) {
      reply.code(400);
      return { message: "ไม่พบไฟล์สำหรับนำเข้า" };
    }

    const allowedMimeTypes = new Set([
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/csv"
    ]);

    const fileName = String(file.filename || "").toLowerCase();
    const fileExtensionValid =
      fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".csv");
    const mimeTypeValid = allowedMimeTypes.has(String(file.mimetype || "").toLowerCase());

    if (!fileExtensionValid && !mimeTypeValid) {
      reply.code(400);
      return { message: "รองรับเฉพาะไฟล์ .xlsx, .xls หรือ .csv" };
    }

    try {
      const fileBuffer = await file.toBuffer();
      return importFormSubmissionsFromExcel(Number(formId), fileBuffer);
    } catch (error) {
      reply.code(400);
      return {
        message: error instanceof Error ? error.message : "ไม่สามารถนำเข้าไฟล์ได้"
      };
    }
  });

  fastify.get("/admin/forms/:formId/submissions/export-excel", async (request, reply) => {
    const formId = toNumber((request.params as Record<string, string>).formId);
    if (!formId) {
      reply.code(400);
      return { message: "formId ไม่ถูกต้อง" };
    }

    const query = (request.query || {}) as Record<string, any>;

    try {
      const file = await exportFormSubmissionsExcel(Number(formId), {
        attendance_status: query.attendance_status ? String(query.attendance_status) : undefined,
        source_type: query.source_type ? String(query.source_type) : undefined,
        keyword: query.keyword ? String(query.keyword) : undefined,
        submitted_from: query.submitted_from ? String(query.submitted_from) : undefined,
        submitted_to: query.submitted_to ? String(query.submitted_to) : undefined
      });

      reply.header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      reply.header("Content-Disposition", `attachment; filename="${file.fileName}"`);
      return reply.send(file.buffer);
    } catch (error) {
      reply.code(400);
      return {
        message: error instanceof Error ? error.message : "ไม่สามารถ export ข้อมูลได้"
      };
    }
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
