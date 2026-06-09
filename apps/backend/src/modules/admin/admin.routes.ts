import { FastifyPluginAsync } from "fastify";
import fastifyMultipart from "@fastify/multipart";
import {
  createUser,
  destroyAllSessionsForUser,
  setUserPassword,
  verifyUserPassword
} from "../auth/auth.data";
import { readStoredFile, StagedFile } from "../../lib/uploads";
import {
  buildImportTemplateExcel,
  createEmailTemplate,
  createItem,
  createManualSubmission,
  deleteItem,
  deleteSubmission,
  exportFormSubmissionsExcel,
  getFormDraft,
  getSubmissionDetail,
  getSubmissionFile,
  queueCheckinEmail,
  updateItem,
  updateSubmissionAnswers,
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
  await fastify.register(fastifyMultipart, {
    limits: {
      // Wire-level cap. Per-field caps (max_file_size_mb in form_fields
      // settings_json) are enforced by validateAndFormatFileError after parse.
      fileSize: 25 * 1024 * 1024,
      files: 20
    }
  });

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

  // Manually add a pre-registered entry (VIP roster) to a form.
  fastify.post("/admin/forms/:formId/submissions", async (request, reply) => {
    const formId = toNumber((request.params as Record<string, string>).formId);
    if (!formId) {
      return reply.code(400).send({ error: "formId ไม่ถูกต้อง" });
    }
    const body = (request.body || {}) as Record<string, any>;
    const result = await createManualSubmission(Number(formId), body.answers || {});
    if (!result.ok) {
      const msgs: Record<string, string> = {
        form_not_found: "ไม่พบฟอร์ม"
      };
      return reply
        .code(result.reason === "form_not_found" ? 404 : 400)
        .send({ error: msgs[result.reason] || "เพิ่มรายชื่อไม่สำเร็จ", reason: result.reason });
    }
    return { submissionId: result.submissionId, submissionCode: result.submissionCode };
  });

  // Edit the answers of a pre-registered submission (import_excel / manual only).
  fastify.patch("/admin/submissions/:submissionId/answers", async (request, reply) => {
    const submissionId = toNumber((request.params as Record<string, string>).submissionId);
    if (!submissionId) {
      return reply.code(400).send({ error: "submissionId ไม่ถูกต้อง" });
    }
    const body = (request.body || {}) as Record<string, any>;
    const result = await updateSubmissionAnswers(Number(submissionId), body.answers || {});
    if (!result.ok) {
      const msgs: Record<string, string> = {
        not_found: "ไม่พบรายการ",
        not_editable: "แก้ไขได้เฉพาะรายชื่อล่วงหน้า (ไม่ใช่คำตอบที่ผู้ใช้กรอกเอง)"
      };
      return reply
        .code(result.reason === "not_found" ? 404 : 400)
        .send({ error: msgs[result.reason] || "แก้ไขไม่สำเร็จ", reason: result.reason });
    }
    return { ok: true };
  });

  // Soft-delete a pre-registered submission.
  fastify.delete("/admin/submissions/:submissionId", async (request, reply) => {
    const submissionId = toNumber((request.params as Record<string, string>).submissionId);
    if (!submissionId) {
      return reply.code(400).send({ error: "submissionId ไม่ถูกต้อง" });
    }
    const result = await deleteSubmission(Number(submissionId));
    if (!result.ok) {
      const msgs: Record<string, string> = {
        not_found: "ไม่พบรายการ",
        not_deletable: "ลบได้เฉพาะรายชื่อล่วงหน้า"
      };
      return reply
        .code(result.reason === "not_found" ? 404 : 400)
        .send({ error: msgs[result.reason] || "ลบไม่สำเร็จ", reason: result.reason });
    }
    return { ok: true };
  });

  // Send the check-in (souvenir QR) email on demand — decoupled from check-in.
  fastify.post("/admin/submissions/:submissionId/checkin-email", async (request, reply) => {
    const submissionId = toNumber((request.params as Record<string, string>).submissionId);
    if (!submissionId) {
      return reply.code(400).send({ error: "submissionId ไม่ถูกต้อง" });
    }
    const result = await queueCheckinEmail(Number(submissionId));
    if (result.status === "not_found") {
      return reply.code(404).send({ error: "ไม่พบรายการ", status: result.status });
    }
    return { status: result.status };
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

  fastify.post("/public/forms/:publicPath/submissions", async (request, reply) => {
    const { publicPath } = request.params as Record<string, string>;
    const contentType = String(request.headers["content-type"] || "");

    let body: Record<string, any> = {};

    if (contentType.startsWith("multipart/")) {
      // Multipart submission: text answers travel as a single "answers" field
      // containing JSON (the same payload shape as the JSON endpoint), files
      // as "file_<fieldId>" parts (one part per file; field can repeat).
      const parts = request.parts();
      const filesByField: Record<string, StagedFile[]> = {};
      let answersPayload: Record<string, any> = {};

      for await (const part of parts) {
        if (part.type === "file") {
          const match = /^file_(.+)$/.exec(part.fieldname);
          if (!match) {
            // Unknown file field — drain & ignore.
            await part.toBuffer();
            continue;
          }
          const fieldId = match[1];
          const buffer = await part.toBuffer();
          const staged: StagedFile = {
            originalName: part.filename || "file",
            buffer,
            mimetype: part.mimetype || "application/octet-stream",
            size: buffer.length
          };
          (filesByField[fieldId] = filesByField[fieldId] || []).push(staged);
        } else if (part.fieldname === "answers") {
          try {
            answersPayload = JSON.parse(String((part as any).value || "{}"));
          } catch {
            return reply.code(400).send({ ok: false, error: "answers payload is not valid JSON" });
          }
        }
      }

      body = { ...answersPayload, files: filesByField };
    } else {
      body = (request.body || {}) as Record<string, any>;
    }

    const result = (await submitPublicForm(publicPath, body)) as Record<string, any>;

    // Map validation outcomes (required / unique / multi-submission / file) to 400.
    // Closed / not_started / ended / not_found stay as 200 with status so
    // the public form UI can render the right "not open" message.
    if (
      result?.ok === false &&
      (result.status === "validation_error" ||
        result.status === "duplicate_value" ||
        result.status === "already_submitted" ||
        result.status === "file_invalid")
    ) {
      return reply.code(400).send(result);
    }
    return result;
  });

  fastify.get("/admin/submissions/:submissionId/files/:fileId", async (request, reply) => {
    const submissionId = toNumber((request.params as Record<string, string>).submissionId);
    const fileId = toNumber((request.params as Record<string, string>).fileId);
    if (!submissionId || !fileId) {
      return reply.code(400).send({ error: "missing id" });
    }
    const fileRow = await getSubmissionFile(Number(submissionId), Number(fileId));
    if (!fileRow) {
      return reply.code(404).send({ error: "file not found" });
    }
    const buffer = await readStoredFile(fileRow.storage_path);
    if (!buffer) {
      return reply.code(410).send({ error: "file no longer on disk" });
    }
    reply.header(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(fileRow.original_file_name)}`
    );
    reply.type("application/octet-stream");
    return reply.send(buffer);
  });

  fastify.get("/admin/items", async () => ({ data: await listItems() }));

  fastify.post("/admin/forms/:formId/items", async (request, reply) => {
    const formId = toNumber((request.params as Record<string, string>).formId);
    if (!formId) {
      return reply.code(400).send({ error: "missing formId" });
    }
    const body = (request.body || {}) as Record<string, any>;
    const result = await createItem(Number(formId), {
      item_code: body.item_code,
      item_name: body.item_name,
      item_type: body.item_type,
      default_qty: body.default_qty,
      description: body.description
    });
    if (!result.ok) {
      const msgs: Record<string, string> = {
        missing_name: "กรุณากรอกชื่อรายการ",
        invalid_qty: "จำนวนต้องเป็นตัวเลขที่ถูกต้อง",
        duplicate_code: "รหัสรายการนี้มีอยู่แล้วในฟอร์ม",
        form_not_found: "ไม่พบฟอร์ม"
      };
      return reply
        .code(result.reason === "form_not_found" ? 404 : 400)
        .send({ error: msgs[result.reason] || "สร้างรายการไม่สำเร็จ", reason: result.reason });
    }
    return { itemId: result.itemId };
  });

  fastify.patch("/admin/items/:itemId", async (request, reply) => {
    const itemId = toNumber((request.params as Record<string, string>).itemId);
    if (!itemId) {
      return reply.code(400).send({ error: "missing itemId" });
    }
    const body = (request.body || {}) as Record<string, any>;
    const result = await updateItem(Number(itemId), {
      item_code: body.item_code,
      item_name: body.item_name,
      item_type: body.item_type,
      default_qty: body.default_qty,
      is_active: body.is_active,
      description: body.description
    });
    if (!result.ok) {
      const msgs: Record<string, string> = {
        missing_name: "กรุณากรอกชื่อรายการ",
        invalid_qty: "จำนวนต้องเป็นตัวเลขที่ถูกต้อง",
        duplicate_code: "รหัสรายการนี้มีอยู่แล้วในฟอร์ม",
        not_found: "ไม่พบรายการ"
      };
      return reply
        .code(result.reason === "not_found" ? 404 : 400)
        .send({ error: msgs[result.reason] || "แก้ไขรายการไม่สำเร็จ", reason: result.reason });
    }
    return { ok: true };
  });

  fastify.delete("/admin/items/:itemId", async (request, reply) => {
    const itemId = toNumber((request.params as Record<string, string>).itemId);
    if (!itemId) {
      return reply.code(400).send({ error: "missing itemId" });
    }
    const ok = await deleteItem(Number(itemId));
    if (!ok) {
      return reply.code(404).send({ error: "ไม่พบรายการ" });
    }
    return { ok: true };
  });

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

  fastify.post("/admin/email/templates", async (request, reply) => {
    const body = (request.body || {}) as Record<string, any>;
    const result = await createEmailTemplate({
      form_id: body.form_id,
      notification_code: body.notification_code,
      template_name: body.template_name,
      email_subject: body.email_subject,
      email_body: body.email_body,
      is_active: body.is_active
    });
    if (!result.ok) {
      const msgs: Record<string, string> = {
        invalid_form: "กรุณาเลือกฟอร์ม",
        missing_name: "กรุณากรอกชื่อเทมเพลต",
        missing_subject: "กรุณากรอกหัวข้ออีเมล",
        missing_body: "กรุณากรอกเนื้อหาอีเมล",
        form_not_found: "ไม่พบฟอร์ม",
        duplicate: "ฟอร์มนี้มีเทมเพลตประเภทนี้อยู่แล้ว"
      };
      return reply
        .code(result.reason === "form_not_found" ? 404 : 400)
        .send({ error: msgs[result.reason] || "สร้างเทมเพลตไม่สำเร็จ", reason: result.reason });
    }
    return { templateId: result.templateId };
  });

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

  // ---- user create / password reset (admin-only via middleware role rule) ----

  fastify.post("/admin/users", async (request, reply) => {
    const body = (request.body || {}) as Record<string, any>;
    const result = await createUser({
      email: body.email,
      display_name: body.display_name,
      role_code: body.role_code,
      password: body.password,
      first_name: body.first_name ?? null,
      last_name: body.last_name ?? null,
      allow_local_login: body.allow_local_login !== false,
      allow_sso_login: body.allow_sso_login === true
    });

    if (!result.ok) {
      const messageByReason: Record<string, string> = {
        invalid_email: "อีเมลไม่ถูกต้อง",
        missing_display_name: "กรุณากรอกชื่อแสดง",
        invalid_role: "ระบุบทบาทไม่ถูกต้อง",
        weak_password: "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร",
        email_taken: "อีเมลนี้ถูกใช้งานแล้ว"
      };
      return reply.code(400).send({
        error: messageByReason[result.reason] || "สร้างผู้ใช้งานไม่สำเร็จ",
        reason: result.reason
      });
    }
    return { userId: result.userId };
  });

  fastify.post("/admin/users/:userId/reset-password", async (request, reply) => {
    const userId = toNumber((request.params as Record<string, string>).userId);
    if (!userId) {
      return reply.code(400).send({ error: "missing userId" });
    }
    const body = (request.body || {}) as Record<string, any>;
    const result = await setUserPassword(Number(userId), String(body.password || ""));
    if (!result.ok) {
      if (result.reason === "weak_password") {
        return reply.code(400).send({ error: "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร" });
      }
      return reply.code(404).send({ error: "ไม่พบผู้ใช้งาน" });
    }
    // Drop existing sessions so the user is forced to re-login with the new password.
    await destroyAllSessionsForUser(Number(userId));
    return { ok: true };
  });

  // ---- self-service password change (any authed user) ----
  fastify.post("/admin/me/password", async (request, reply) => {
    const user = request.sessionUser;
    if (!user) {
      return reply.code(401).send({ error: "unauthenticated" });
    }
    const body = (request.body || {}) as Record<string, any>;
    const currentOk = await verifyUserPassword(user.user_id, String(body.current_password || ""));
    if (!currentOk) {
      return reply.code(400).send({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
    }
    const result = await setUserPassword(user.user_id, String(body.new_password || ""));
    if (!result.ok) {
      return reply.code(400).send({ error: "รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร" });
    }
    return { ok: true };
  });
};

export default adminRoutes;
