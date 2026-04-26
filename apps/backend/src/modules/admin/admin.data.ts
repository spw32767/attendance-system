import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../../db/mysql";
import { sendEmailWithQr } from "./email.service";

type AnyRow = RowDataPacket & { [key: string]: any };
type AnyPayload = Record<string, any>;

type ClaimQrToken = {
  label: string;
  token: string;
};

type PendingEmailDispatch = {
  emailLogId: number;
  recipientEmail: string;
  subject: string;
  html: string;
  qrTokens: ClaimQrToken[];
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  event: "กิจกรรม / อีเวนต์",
  website: "เว็บไซต์",
  organization: "หน่วยงาน"
};

const parseJson = <T>(value: unknown, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  if (typeof value === "object") {
    return value as T;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const toDateTime = (value: unknown): string => {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 19);
  }

  return String(value).replace(" ", "T");
};

const toNullableDateTime = (value: unknown): string | null => {
  const normalized = toDateTime(value);
  return normalized || null;
};

const toBoolean = (value: unknown): boolean => Boolean(Number(value));

const toShareKey = () => Math.random().toString(36).slice(2, 14);

const toFormCode = (formName: unknown, fallbackId: number) => {
  const normalized = String(formName || "FORM")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);

  return normalized || `FORM_${fallbackId}`;
};

const queryRows = async <T extends AnyRow>(sql: string, params: any[] = [], connection?: PoolConnection) => {
  const executor = connection || pool;
  const [rows] = await executor.query<T[]>(sql, params);
  return rows;
};

const execute = async (sql: string, params: any[] = [], connection?: PoolConnection) => {
  const executor = connection || pool;
  const [result] = await executor.execute<ResultSetHeader>(sql, params);
  return result;
};

const withTransaction = async <T>(handler: (connection: PoolConnection) => Promise<T>) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await handler(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getNextId = async (tableName: string, idColumn: string, connection?: PoolConnection) => {
  const rows = await queryRows<AnyRow>(
    `SELECT COALESCE(MAX(${idColumn}), 0) + 1 AS next_id FROM ${tableName}`,
    [],
    connection
  );

  return Number(rows[0]?.next_id || 1);
};

const listProjectsQuery = `
  SELECT
    project_id,
    project_code,
    project_name,
    project_type,
    source_url,
    description,
    is_active,
    created_at,
    updated_at
  FROM proj_projects
  WHERE deleted_at IS NULL
  ORDER BY project_id ASC
`;

const getFormRows = async (projectId?: number | null, connection?: PoolConnection) => {
  const params: unknown[] = [];
  const whereProject = projectId ? "AND f.project_id = ?" : "";

  if (projectId) {
    params.push(projectId);
  }

  return queryRows<AnyRow>(
    `
      SELECT
        f.form_id,
        f.project_id,
        p.project_name,
        f.form_name,
        f.public_path,
        f.form_type,
        f.status,
        f.allow_multiple_submissions,
        f.start_at,
        f.end_at,
        f.success_title,
        f.success_message,
        f.settings_json,
        f.created_at,
        f.updated_at
      FROM form_forms f
      INNER JOIN proj_projects p ON p.project_id = f.project_id
      WHERE f.deleted_at IS NULL
        AND p.deleted_at IS NULL
        ${whereProject}
      ORDER BY f.form_id ASC
    `,
    params,
    connection
  );
};

const mapFormSummary = (row: AnyRow) => {
  const settings = parseJson<Record<string, any>>(row.settings_json, {});

  return {
    form_id: String(row.form_id),
    project_id: Number(row.project_id),
    project_name: row.project_name || "",
    form_name: row.form_name || "",
    form_description: settings.form_description || "",
    public_path: row.public_path || "",
    form_type: row.form_type || "attendance",
    status: row.status || "draft",
    allow_multiple_submissions: toBoolean(row.allow_multiple_submissions),
    start_at: toDateTime(row.start_at),
    end_at: toDateTime(row.end_at),
    share_key: settings.share_key || toShareKey(),
    success_title: row.success_title || "",
    success_message: row.success_message || "",
    created_at: toDateTime(row.created_at),
    updated_at: toDateTime(row.updated_at)
  };
};

const getFieldRows = async (formId: number, connection?: PoolConnection) =>
  queryRows<AnyRow>(
    `
      SELECT
        field_id,
        field_code,
        field_label,
        field_description,
        placeholder,
        field_type,
        field_usage,
        is_required,
        is_unique_value,
        sort_order,
        allow_other_option,
        settings_json,
        is_active
      FROM form_fields
      WHERE form_id = ?
        AND deleted_at IS NULL
      ORDER BY sort_order ASC, field_id ASC
    `,
    [formId],
    connection
  );

const getOptionRows = async (fieldIds: number[], connection?: PoolConnection) => {
  if (!fieldIds.length) {
    return [];
  }

  const placeholders = fieldIds.map(() => "?").join(", ");
  return queryRows<AnyRow>(
    `
      SELECT
        option_id,
        field_id,
        option_label,
        option_value,
        sort_order,
        is_active
      FROM form_field_options
      WHERE field_id IN (${placeholders})
        AND deleted_at IS NULL
      ORDER BY sort_order ASC, option_id ASC
    `,
    fieldIds,
    connection
  );
};

const loadDraftFields = async (formId: number, connection?: PoolConnection) => {
  const fieldRows = await getFieldRows(formId, connection);
  const optionRows = await getOptionRows(
    fieldRows.map((row) => Number(row.field_id)),
    connection
  );

  const optionsByFieldId = optionRows.reduce<Record<number, AnyPayload[]>>((lookup, optionRow) => {
    const fieldId = Number(optionRow.field_id);
    if (!lookup[fieldId]) {
      lookup[fieldId] = [];
    }

    lookup[fieldId].push({
      id: String(optionRow.option_id),
      option_label: optionRow.option_label || "",
      option_value: optionRow.option_value || "",
      sort_order: Number(optionRow.sort_order || 0)
    });

    return lookup;
  }, {});

  return fieldRows.map((row) => ({
    id: String(row.field_id),
    field_code: row.field_code || "",
    field_label: row.field_label || "",
    field_description: row.field_description || "",
    placeholder: row.placeholder || "",
    field_type: row.field_type || "short_text",
    field_usage: row.field_usage || "general",
    is_required: toBoolean(row.is_required),
    is_unique_value: toBoolean(row.is_unique_value),
    allow_other_option: toBoolean(row.allow_other_option),
    sort_order: Number(row.sort_order || 0),
    settings_json: parseJson<Record<string, any>>(row.settings_json, {}),
    options: optionsByFieldId[Number(row.field_id)] || []
  }));
};

const getFormStatus = (form: AnyPayload | null) => {
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

const getSubmissionAnswerRows = async (submissionIds: number[], connection?: PoolConnection) => {
  if (!submissionIds.length) {
    return [];
  }

  const placeholders = submissionIds.map(() => "?").join(", ");
  return queryRows<AnyRow>(
    `
      SELECT
        a.answer_id,
        a.submission_id,
        a.field_id,
        a.answer_text,
        a.answer_number,
        a.answer_date,
        a.answer_time,
        a.selected_option_id,
        f.field_label,
        f.field_type,
        f.field_usage,
        f.is_required,
        o.option_label AS selected_option_label
      FROM entry_submission_answers a
      INNER JOIN form_fields f ON f.field_id = a.field_id
      LEFT JOIN form_field_options o ON o.option_id = a.selected_option_id
      WHERE a.submission_id IN (${placeholders})
        AND a.deleted_at IS NULL
        AND f.deleted_at IS NULL
      ORDER BY a.answer_id ASC
    `,
    submissionIds,
    connection
  );
};

const getAnswerOptionRows = async (answerIds: number[], connection?: PoolConnection) => {
  if (!answerIds.length) {
    return [];
  }

  const placeholders = answerIds.map(() => "?").join(", ");
  return queryRows<AnyRow>(
    `
      SELECT
        ao.answer_id,
        o.option_label,
        o.option_value
      FROM entry_submission_answer_options ao
      INNER JOIN form_field_options o ON o.option_id = ao.option_id
      WHERE ao.answer_id IN (${placeholders})
        AND ao.deleted_at IS NULL
        AND o.deleted_at IS NULL
      ORDER BY ao.answer_option_id ASC
    `,
    answerIds,
    connection
  );
};

const getAnswerFileRows = async (answerIds: number[], connection?: PoolConnection) => {
  if (!answerIds.length) {
    return [];
  }

  const placeholders = answerIds.map(() => "?").join(", ");
  return queryRows<AnyRow>(
    `
      SELECT
        answer_id,
        original_file_name
      FROM entry_submission_files
      WHERE answer_id IN (${placeholders})
        AND deleted_at IS NULL
      ORDER BY answer_file_id ASC
    `,
    answerIds,
    connection
  );
};

const mapAnswerValue = (
  answerRow: AnyRow,
  checkboxValues: string[],
  fileValues: string[]
) => {
  if (answerRow.field_type === "checkboxes") {
    return checkboxValues.join(", ") || "-";
  }

  if (answerRow.field_type === "multiple_choice" || answerRow.field_type === "dropdown") {
    return answerRow.selected_option_label || answerRow.answer_text || "-";
  }

  if (answerRow.field_type === "rating") {
    return answerRow.answer_number != null ? String(answerRow.answer_number) : "-";
  }

  if (answerRow.field_type === "date") {
    return toDateTime(answerRow.answer_date).slice(0, 10) || "-";
  }

  if (answerRow.field_type === "time") {
    return String(answerRow.answer_time || "-");
  }

  if (answerRow.field_type === "file_upload") {
    return fileValues.join(", ") || "-";
  }

  return answerRow.answer_text || "-";
};

const toRespondentIdentity = (answerRows: AnyRow[]) => {
  const getByUsage = (usage: string) =>
    answerRows.find((row) => row.field_usage === usage)?.answer_text?.trim() || "";

  const fullName = getByUsage("full_name");
  const firstName = getByUsage("first_name");
  const lastName = getByUsage("last_name");
  const respondentName = fullName || [firstName, lastName].filter(Boolean).join(" ") || "-";
  const respondentEmail = getByUsage("email") || "-";

  return {
    respondentName,
    respondentEmail
  };
};

const renderTemplate = (template: string, replacements: Record<string, string>) => {
  let output = String(template || "");
  Object.entries(replacements).forEach(([key, value]) => {
    output = output.replace(new RegExp(`{{${key}}}`, "g"), value);
  });
  return output;
};

const buildClaimLinesHtml = (qrTokens: ClaimQrToken[]) => {
  if (!qrTokens.length) {
    return "<p>ไม่มีรายการของรางวัลสำหรับการสแกนในครั้งนี้</p>";
  }

  const itemsHtml = qrTokens
    .map(
      (row) =>
        `<li><strong>${row.label}</strong><br/><small>Token: <code>${row.token}</code></small></li>`
    )
    .join("");

  return `<p>รายการของรางวัลที่สามารถสแกนรับของได้:</p><ul>${itemsHtml}</ul>`;
};

const dispatchPendingEmail = async (pendingEmail: PendingEmailDispatch | null) => {
  if (!pendingEmail) {
    return;
  }

  try {
    if (!pendingEmail.recipientEmail || pendingEmail.recipientEmail === "-") {
      throw new Error("Recipient email is missing");
    }

    const result = await sendEmailWithQr({
      to: pendingEmail.recipientEmail,
      subject: pendingEmail.subject,
      html: pendingEmail.html,
      qrTokens: pendingEmail.qrTokens
    });

    await execute(
      `
        UPDATE email_send_logs
        SET send_status = 'sent',
            provider_message_id = ?,
            error_message = NULL,
            sent_at = CURRENT_TIMESTAMP
        WHERE email_log_id = ?
      `,
      [result.messageId, pendingEmail.emailLogId]
    );
  } catch (error) {
    await execute(
      `
        UPDATE email_send_logs
        SET send_status = 'failed',
            error_message = ?
        WHERE email_log_id = ?
      `,
      [error instanceof Error ? error.message : "Unknown email error", pendingEmail.emailLogId]
    );
  }
};

export const listProjects = async () => {
  const rows = await queryRows<AnyRow>(listProjectsQuery);
  return rows.map((row) => ({
    project_id: Number(row.project_id),
    project_code: row.project_code || "",
    project_name: row.project_name || "",
    project_type: row.project_type || "event",
    project_type_label: PROJECT_TYPE_LABELS[row.project_type] || row.project_type,
    source_url: row.source_url || "",
    description: row.description || "",
    is_active: toBoolean(row.is_active),
    created_at: toDateTime(row.created_at),
    updated_at: toDateTime(row.updated_at)
  }));
};

export const upsertProject = async (projectId: number | null, payload: AnyPayload) => {
  if (projectId) {
    await execute(
      `
        UPDATE proj_projects
        SET project_code = ?,
            project_name = ?,
            project_type = ?,
            source_url = ?,
            description = ?,
            is_active = ?
        WHERE project_id = ?
      `,
      [
        payload.project_code || "PROJECT",
        payload.project_name || "",
        payload.project_type || "event",
        payload.source_url || null,
        payload.description || null,
        payload.is_active ? 1 : 0,
        projectId
      ]
    );

    return { projectId };
  }

  const result = await execute(
    `
      INSERT INTO proj_projects (
        project_code,
        project_name,
        project_type,
        source_url,
        description,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      payload.project_code || "PROJECT",
      payload.project_name || "",
      payload.project_type || "event",
      payload.source_url || null,
      payload.description || null,
      payload.is_active === false ? 0 : 1
    ]
  );

  return { projectId: Number(result.insertId) };
};

export const setProjectUsage = async (projectId: number, isActive: boolean) => {
  await execute(
    `UPDATE proj_projects SET is_active = ? WHERE project_id = ? AND deleted_at IS NULL`,
    [isActive ? 1 : 0, projectId]
  );
};

export const listForms = async () => {
  const rows = await getFormRows();
  return rows.map(mapFormSummary);
};

export const listFormsByProject = async (projectId: number) => {
  const rows = await getFormRows(projectId);
  return rows.map(mapFormSummary);
};

export const getFormDraft = async (formId: number | null, projectId: number | null) => {
  if (!formId) {
    return {
      project_id: projectId || 1,
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
    };
  }

  const rows = await queryRows<AnyRow>(
    `
      SELECT
        form_id,
        project_id,
        form_name,
        public_path,
        form_type,
        status,
        allow_multiple_submissions,
        start_at,
        end_at,
        success_title,
        success_message,
        settings_json
      FROM form_forms
      WHERE form_id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [formId]
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  const settings = parseJson<Record<string, any>>(row.settings_json, {});
  const fields = await loadDraftFields(Number(formId));

  return {
    project_id: Number(row.project_id),
    form_name: row.form_name || "",
    form_description: settings.form_description || "",
    public_path: row.public_path || "",
    form_type: row.form_type || "attendance",
    status: row.status || "draft",
    allow_multiple_submissions: toBoolean(row.allow_multiple_submissions),
    start_at: toDateTime(row.start_at),
    end_at: toDateTime(row.end_at),
    success_title: row.success_title || "",
    success_message: row.success_message || "",
    fields
  };
};

const saveFieldOptions = async (
  connection: PoolConnection,
  fieldId: number,
  options: AnyPayload[]
) => {
  const existingOptionRows = await queryRows<AnyRow>(
    `SELECT option_id FROM form_field_options WHERE field_id = ? AND deleted_at IS NULL`,
    [fieldId],
    connection
  );

  const retainedIds = new Set<number>();

  for (let index = 0; index < options.length; index += 1) {
    const option = options[index];
    const numericOptionId = Number(option.id);
    const isExisting = Number.isFinite(numericOptionId) && numericOptionId > 0;
    const payload = [
      option.option_label || `ตัวเลือก ${index + 1}`,
      option.option_value || option.option_label || `option_${index + 1}`,
      index + 1,
      1,
      fieldId
    ];

    if (isExisting) {
      await execute(
        `
          UPDATE form_field_options
          SET option_label = ?,
              option_value = ?,
              sort_order = ?,
              is_active = ?,
              deleted_at = NULL
          WHERE option_id = ?
        `,
        [payload[0], payload[1], payload[2], payload[3], numericOptionId],
        connection
      );
      retainedIds.add(numericOptionId);
      continue;
    }

    const insertResult = await execute(
      `
        INSERT INTO form_field_options (
          field_id,
          option_label,
          option_value,
          sort_order,
          is_active
        ) VALUES (?, ?, ?, ?, ?)
      `,
      [fieldId, payload[0], payload[1], payload[2], payload[3]],
      connection
    );
    retainedIds.add(Number(insertResult.insertId));
  }

  for (const row of existingOptionRows) {
    const optionId = Number(row.option_id);
    if (!retainedIds.has(optionId)) {
      await execute(
        `UPDATE form_field_options SET deleted_at = CURRENT_TIMESTAMP WHERE option_id = ?`,
        [optionId],
        connection
      );
    }
  }
};

export const saveFormDraft = async (
  formId: number | null,
  draft: AnyPayload,
  targetStatus: string | null
) =>
  withTransaction(async (connection) => {
    const existingFormRows = formId
      ? await queryRows<AnyRow>(
          `SELECT form_id, settings_json FROM form_forms WHERE form_id = ? AND deleted_at IS NULL LIMIT 1`,
          [formId],
          connection
        )
      : [];

    const existingForm = existingFormRows[0] || null;
    const existingSettings = parseJson<Record<string, any>>(existingForm?.settings_json, {});
    const nextSettings = {
      ...existingSettings,
      form_description: draft.form_description || "",
      share_key: existingSettings.share_key || toShareKey()
    };

    let resolvedFormId = formId;

    if (existingForm) {
      await execute(
        `
          UPDATE form_forms
          SET project_id = ?,
              form_name = ?,
              public_path = ?,
              form_type = ?,
              status = ?,
              allow_multiple_submissions = ?,
              start_at = ?,
              end_at = ?,
              success_title = ?,
              success_message = ?,
              settings_json = ?,
              deleted_at = NULL
          WHERE form_id = ?
        `,
        [
          draft.project_id,
          draft.form_name || "แบบฟอร์มใหม่",
          draft.public_path || `form-${formId}`,
          draft.form_type || "attendance",
          targetStatus || draft.status || "draft",
          draft.allow_multiple_submissions ? 1 : 0,
          toNullableDateTime(draft.start_at),
          toNullableDateTime(draft.end_at),
          draft.success_title || null,
          draft.success_message || null,
          JSON.stringify(nextSettings),
          formId
        ],
        connection
      );
    } else {
      const insertResult = await execute(
        `
          INSERT INTO form_forms (
            project_id,
            form_code,
            form_name,
            public_path,
            form_type,
            status,
            allow_multiple_submissions,
            start_at,
            end_at,
            success_title,
            success_message,
            settings_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          draft.project_id,
          toFormCode(draft.form_name, 0),
          draft.form_name || "แบบฟอร์มใหม่",
          draft.public_path || `form-${Date.now()}`,
          draft.form_type || "attendance",
          targetStatus || draft.status || "draft",
          draft.allow_multiple_submissions ? 1 : 0,
          toNullableDateTime(draft.start_at),
          toNullableDateTime(draft.end_at),
          draft.success_title || null,
          draft.success_message || null,
          JSON.stringify(nextSettings)
        ],
        connection
      );

      resolvedFormId = Number(insertResult.insertId);

      await execute(
        `UPDATE form_forms SET form_code = ? WHERE form_id = ?`,
        [toFormCode(draft.form_name, resolvedFormId), resolvedFormId],
        connection
      );
    }

    const activeFieldRows = await queryRows<AnyRow>(
      `SELECT field_id FROM form_fields WHERE form_id = ? AND deleted_at IS NULL`,
      [resolvedFormId],
      connection
    );
    const retainedFieldIds = new Set<number>();

    const fields = Array.isArray(draft.fields) ? draft.fields : [];

    for (let index = 0; index < fields.length; index += 1) {
      const field = fields[index];
      const numericFieldId = Number(field.id);
      const isExistingField = Number.isFinite(numericFieldId) && numericFieldId > 0;
      let resolvedFieldId = numericFieldId;

      if (isExistingField) {
        await execute(
          `
            UPDATE form_fields
            SET field_code = ?,
                field_label = ?,
                field_description = ?,
                placeholder = ?,
                field_type = ?,
                field_usage = ?,
                is_required = ?,
                is_unique_value = ?,
                sort_order = ?,
                allow_other_option = ?,
                settings_json = ?,
                is_active = 1,
                deleted_at = NULL
            WHERE field_id = ?
              AND form_id = ?
          `,
          [
            field.field_code || `field_${index + 1}`,
            field.field_label || `คำถาม ${index + 1}`,
            field.field_description || null,
            field.placeholder || null,
            field.field_type || "short_text",
            field.field_usage || "general",
            field.is_required ? 1 : 0,
            field.is_unique_value ? 1 : 0,
            index + 1,
            field.allow_other_option ? 1 : 0,
            JSON.stringify(field.settings_json || {}),
            numericFieldId,
            resolvedFormId
          ],
          connection
        );
      } else {
        const insertResult = await execute(
          `
            INSERT INTO form_fields (
              form_id,
              field_code,
              field_label,
              field_description,
              placeholder,
              field_type,
              field_usage,
              is_required,
              is_unique_value,
              sort_order,
              allow_other_option,
              settings_json,
              is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            resolvedFormId,
            field.field_code || `field_${index + 1}`,
            field.field_label || `คำถาม ${index + 1}`,
            field.field_description || null,
            field.placeholder || null,
            field.field_type || "short_text",
            field.field_usage || "general",
            field.is_required ? 1 : 0,
            field.is_unique_value ? 1 : 0,
            index + 1,
            field.allow_other_option ? 1 : 0,
            JSON.stringify(field.settings_json || {}),
            1
          ],
          connection
        );
        resolvedFieldId = Number(insertResult.insertId);
      }

      retainedFieldIds.add(resolvedFieldId);
      await saveFieldOptions(connection, resolvedFieldId, Array.isArray(field.options) ? field.options : []);
    }

    for (const row of activeFieldRows) {
      const existingFieldId = Number(row.field_id);
      if (!retainedFieldIds.has(existingFieldId)) {
        await execute(
          `UPDATE form_fields SET deleted_at = CURRENT_TIMESTAMP WHERE field_id = ?`,
          [existingFieldId],
          connection
        );
      }
    }

    return { formId: String(resolvedFormId) };
  });

export const setFormUsage = async (formId: number, isEnabled: boolean) => {
  await execute(
    `UPDATE form_forms SET status = ? WHERE form_id = ? AND deleted_at IS NULL`,
    [isEnabled ? "published" : "closed", formId]
  );
};

export const listSubmissions = async () => {
  const rows = await queryRows<AnyRow>(
    `
      SELECT
        s.submission_id,
        f.project_id,
        s.form_id,
        s.submission_code,
        s.attendance_status,
        s.submitted_at,
        s.check_in_at,
        s.check_out_at,
        s.source_type,
        s.notes,
        f.form_name,
        p.project_name
      FROM entry_submissions s
      INNER JOIN form_forms f ON f.form_id = s.form_id
      INNER JOIN proj_projects p ON p.project_id = f.project_id
      WHERE s.deleted_at IS NULL
        AND f.deleted_at IS NULL
        AND p.deleted_at IS NULL
      ORDER BY s.submission_id ASC
    `
  );

  const answerRows = await getSubmissionAnswerRows(
    rows.map((row) => Number(row.submission_id))
  );

  const answersBySubmissionId = answerRows.reduce<Record<number, AnyRow[]>>((lookup, row) => {
    const submissionId = Number(row.submission_id);
    if (!lookup[submissionId]) {
      lookup[submissionId] = [];
    }
    lookup[submissionId].push(row);
    return lookup;
  }, {});

  return rows.map((row) => {
    const identity = toRespondentIdentity(answersBySubmissionId[Number(row.submission_id)] || []);
    return {
      submission_id: Number(row.submission_id),
      project_id: Number(row.project_id),
      form_id: String(row.form_id),
      submission_code: row.submission_code || "",
      respondent_name: identity.respondentName,
      respondent_email: identity.respondentEmail,
      attendance_status: row.attendance_status || "submitted",
      submitted_at: toDateTime(row.submitted_at),
      check_in_at: toDateTime(row.check_in_at),
      check_out_at: toDateTime(row.check_out_at),
      note: row.notes || "",
      source_type: row.source_type || "public_form",
      form_name: row.form_name || "-",
      project_name: row.project_name || "-"
    };
  });
};

export const getSubmissionDetail = async (submissionId: number) => {
  const rows = await queryRows<AnyRow>(
    `
      SELECT
        s.submission_id,
        f.project_id,
        s.form_id,
        s.submission_code,
        s.attendance_status,
        s.submitted_at,
        s.check_in_at,
        s.check_out_at,
        s.source_type,
        s.notes,
        f.form_name,
        p.project_name
      FROM entry_submissions s
      INNER JOIN form_forms f ON f.form_id = s.form_id
      INNER JOIN proj_projects p ON p.project_id = f.project_id
      WHERE s.submission_id = ?
        AND s.deleted_at IS NULL
        AND f.deleted_at IS NULL
        AND p.deleted_at IS NULL
      LIMIT 1
    `,
    [submissionId]
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  const answerRows = await getSubmissionAnswerRows([submissionId]);
  const checkboxOptionRows = await getAnswerOptionRows(
    answerRows.map((answerRow) => Number(answerRow.answer_id))
  );
  const fileRows = await getAnswerFileRows(
    answerRows.map((answerRow) => Number(answerRow.answer_id))
  );

  const checkboxValuesByAnswerId = checkboxOptionRows.reduce<Record<number, string[]>>(
    (lookup, checkboxRow) => {
      const answerId = Number(checkboxRow.answer_id);
      if (!lookup[answerId]) {
        lookup[answerId] = [];
      }
      lookup[answerId].push(checkboxRow.option_label || checkboxRow.option_value || "");
      return lookup;
    },
    {}
  );

  const filesByAnswerId = fileRows.reduce<Record<number, string[]>>((lookup, fileRow) => {
    const answerId = Number(fileRow.answer_id);
    if (!lookup[answerId]) {
      lookup[answerId] = [];
    }
    lookup[answerId].push(fileRow.original_file_name || "");
    return lookup;
  }, {});

  const identity = toRespondentIdentity(answerRows);

  return {
    submission_id: Number(row.submission_id),
    project_id: Number(row.project_id),
    form_id: String(row.form_id),
    submission_code: row.submission_code || "",
    respondent_name: identity.respondentName,
    respondent_email: identity.respondentEmail,
    attendance_status: row.attendance_status || "submitted",
    submitted_at: toDateTime(row.submitted_at),
    check_in_at: toDateTime(row.check_in_at),
    check_out_at: toDateTime(row.check_out_at),
    note: row.notes || "",
    source_type: row.source_type || "public_form",
    form_name: row.form_name || "-",
    project_name: row.project_name || "-",
    answers: answerRows.map((answerRow) => ({
      field_id: String(answerRow.field_id),
      field_label: answerRow.field_label || "",
      field_type: answerRow.field_type || "short_text",
      is_required: toBoolean(answerRow.is_required),
      value: mapAnswerValue(
        answerRow,
        checkboxValuesByAnswerId[Number(answerRow.answer_id)] || [],
        filesByAnswerId[Number(answerRow.answer_id)] || []
      )
    }))
  };
};

export const updateSubmission = async (submissionId: number, payload: AnyPayload) => {
  let pendingEmail: PendingEmailDispatch | null = null;

  await withTransaction(async (connection) => {
    const rows = await queryRows<AnyRow>(
      `
        SELECT
          s.submission_id,
          s.form_id,
          s.submission_code,
          s.attendance_status,
          s.check_in_at,
          s.check_out_at,
          s.notes,
          f.form_name
        FROM entry_submissions s
        INNER JOIN form_forms f ON f.form_id = s.form_id
        WHERE s.submission_id = ?
          AND s.deleted_at IS NULL
          AND f.deleted_at IS NULL
        LIMIT 1
      `,
      [submissionId],
      connection
    );

    const current = rows[0];
    if (!current) {
      return;
    }

    const hasCheckIn = Object.prototype.hasOwnProperty.call(payload, "check_in_at");
    const hasCheckOut = Object.prototype.hasOwnProperty.call(payload, "check_out_at");
    const hasNote =
      Object.prototype.hasOwnProperty.call(payload, "note") ||
      Object.prototype.hasOwnProperty.call(payload, "notes");

    const nextAttendanceStatus = payload.attendance_status || current.attendance_status || "submitted";
    const nextCheckInAt = hasCheckIn
      ? toNullableDateTime(payload.check_in_at)
      : toNullableDateTime(current.check_in_at);
    const nextCheckOutAt = hasCheckOut
      ? toNullableDateTime(payload.check_out_at)
      : toNullableDateTime(current.check_out_at);
    const nextNote = hasNote ? payload.note || payload.notes || null : current.notes || null;

    await execute(
      `
        UPDATE entry_submissions
        SET attendance_status = ?,
            check_in_at = ?,
            check_out_at = ?,
            notes = ?
        WHERE c.submission_id = ?
          AND deleted_at IS NULL
      `,
      [nextAttendanceStatus, nextCheckInAt, nextCheckOutAt, nextNote, submissionId],
      connection
    );

    const transitionedToPresent =
      String(current.attendance_status || "submitted") !== "present" &&
      nextAttendanceStatus === "present";

    if (!transitionedToPresent) {
      return;
    }

    const existingCheckInEmails = await queryRows<AnyRow>(
      `
        SELECT email_log_id
        FROM email_send_logs
        WHERE submission_id = ?
          AND notification_code = 'checkin_confirmation'
          AND deleted_at IS NULL
        LIMIT 1
      `,
      [submissionId],
      connection
    );

    if (existingCheckInEmails.length > 0) {
      return;
    }

    const answerRows = await getSubmissionAnswerRows([submissionId], connection);
    const identity = toRespondentIdentity(answerRows);

    const claimRows = await queryRows<AnyRow>(
      `
        SELECT c.claim_token, i.item_name
        FROM item_claims c
        INNER JOIN item_catalogs i ON i.item_id = c.item_id
        WHERE submission_id = ?
          AND c.deleted_at IS NULL
          AND i.deleted_at IS NULL
        ORDER BY c.claim_id ASC
      `,
      [submissionId],
      connection
    );

    const claimQrTokens = claimRows
      .map((row, index) => ({
        label: String(row.item_name || `รายการที่ ${index + 1}`),
        token: String(row.claim_token || "").trim()
      }))
      .filter((row) => row.token);

    const emailSubject = `ยืนยันเช็กอิน ${current.form_name || "-"} - ${current.submission_code || ""}`.slice(0, 255);
    const emailBody = `<p>สวัสดี ${identity.respondentName || "ผู้เข้าร่วม"}</p><p>ระบบได้ยืนยันการเช็กอินของคุณสำหรับฟอร์ม <strong>${current.form_name || "-"}</strong> แล้ว</p><p>รหัสการลงทะเบียน: <strong>${current.submission_code || "-"}</strong></p>${buildClaimLinesHtml(claimQrTokens)}`;

    const insertResult = await execute(
      `
        INSERT INTO email_send_logs (
          email_template_id,
          form_id,
          submission_id,
          recipient_email,
          notification_code,
          email_subject,
          send_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        null,
        current.form_id,
        submissionId,
        identity.respondentEmail && identity.respondentEmail !== "-"
          ? identity.respondentEmail
          : "unknown@example.com",
        "checkin_confirmation",
        emailSubject,
        "queued"
      ],
      connection
    );

    pendingEmail = {
      emailLogId: Number(insertResult.insertId),
      recipientEmail:
        identity.respondentEmail && identity.respondentEmail !== "-"
          ? identity.respondentEmail
          : "unknown@example.com",
      subject: emailSubject,
      html: emailBody,
      qrTokens: claimQrTokens
    };
  });

  await dispatchPendingEmail(pendingEmail);
};

export const getPublicForm = async (publicPath: string) => {
  const rows = await queryRows<AnyRow>(
    `
      SELECT
        form_id,
        project_id,
        form_name,
        public_path,
        form_type,
        status,
        allow_multiple_submissions,
        start_at,
        end_at,
        success_title,
        success_message,
        settings_json
      FROM form_forms
      WHERE public_path = ?
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [publicPath]
  );

  const row = rows[0];
  if (!row) {
    return { status: "not_found" };
  }

  const mappedForm = mapFormSummary({
    ...row,
    project_name: ""
  });
  const status = getFormStatus(mappedForm);
  if (status !== "open") {
    return { status };
  }

  const fields = await loadDraftFields(Number(row.form_id));

  return {
    status,
    form: {
      form_id: mappedForm.form_id,
      public_path: mappedForm.public_path,
      form_name: mappedForm.form_name,
      form_description: mappedForm.form_description,
      success_title: mappedForm.success_title,
      success_message: mappedForm.success_message,
      fields
    }
  };
};

const buildSubmissionCode = async (formId: number, connection: PoolConnection) => {
  const nextSubmissionId = await getNextId("entry_submissions", "submission_id", connection);
  return {
    nextSubmissionId,
    submissionCode: `SUB-F${String(formId).padStart(3, "0")}-${String(nextSubmissionId).padStart(4, "0")}`
  };
};

type SubmitFormOptions = {
  sourceType: "public_form";
  note?: string | null;
  markPresent?: boolean;
};

const resolveAnswerValue = (
  fieldType: string,
  rawValue: unknown,
  optionsByValue: Record<string, AnyPayload>
) => {
  if (fieldType === "checkboxes") {
    return Array.isArray(rawValue)
      ? rawValue.map((value) => String(value)).filter(Boolean)
      : [];
  }

  if (fieldType === "file_upload") {
    return Array.isArray(rawValue)
      ? rawValue.map((value) => String(value)).filter(Boolean)
      : [];
  }

  if (fieldType === "multiple_choice" || fieldType === "dropdown") {
    const option = optionsByValue[String(rawValue || "")];
    return option || null;
  }

  if (fieldType === "rating") {
    return rawValue ? Number(rawValue) : null;
  }

  return rawValue == null ? "" : String(rawValue);
};

const submitFormForRow = async (
  formRow: AnyRow,
  payload: AnyPayload,
  options: SubmitFormOptions,
  connection: PoolConnection
) => {
    const formSummary = mapFormSummary({ ...formRow, project_name: "" });
    const status = getFormStatus(formSummary);
    if (status !== "open") {
      return { ok: false, status };
    }

    const fields = await loadDraftFields(Number(formRow.form_id), connection);
    const optionsByFieldId = fields.reduce<Record<string, Record<string, AnyPayload>>>((lookup, field) => {
      lookup[String(field.id)] = (field.options || []).reduce<Record<string, AnyPayload>>(
        (optionLookup, option) => {
          optionLookup[String(option.option_value || option.option_label)] = option;
          optionLookup[String(option.option_label)] = option;
          return optionLookup;
        },
        {}
      );
      return lookup;
    }, {});

    const answers = payload.answers || {};
    const { nextSubmissionId, submissionCode } = await buildSubmissionCode(
      Number(formRow.form_id),
      connection
    );
    const shouldMarkPresent = options.markPresent === true;
    const attendanceStatus = shouldMarkPresent ? "present" : "submitted";

    let respondentName = "ผู้ตอบแบบฟอร์ม";
    let respondentEmail = "unknown@example.com";

    const fieldByUsage = fields.reduce<Record<string, AnyPayload>>((lookup, field) => {
      lookup[String(field.field_usage || "general")] = field;
      return lookup;
    }, {});

    const fullNameValue = answers[fieldByUsage.full_name?.id];
    const firstNameValue = answers[fieldByUsage.first_name?.id];
    const lastNameValue = answers[fieldByUsage.last_name?.id];
    const emailValue = answers[fieldByUsage.email?.id];

    if (typeof fullNameValue === "string" && fullNameValue.trim()) {
      respondentName = fullNameValue.trim();
    } else {
      const composedName = [firstNameValue, lastNameValue]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .join(" ");
      if (composedName) {
        respondentName = composedName;
      }
    }

    if (typeof emailValue === "string" && emailValue.trim()) {
      respondentEmail = emailValue.trim();
    }

    await execute(
      `
        INSERT INTO entry_submissions (
          submission_id,
          form_id,
          submission_code,
          submitted_at,
          attendance_status,
          check_in_at,
          source_type,
          notes
        ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)
      `,
      [
        nextSubmissionId,
        formRow.form_id,
        submissionCode,
        attendanceStatus,
        shouldMarkPresent ? new Date() : null,
        options.sourceType,
        options.note || null
      ],
      connection
    );

    for (const field of fields) {
      const rawValue = answers[field.id];
      const resolvedValue = resolveAnswerValue(
        field.field_type,
        rawValue,
        optionsByFieldId[String(field.id)] || {}
      );

      const answerInsert = await execute(
        `
          INSERT INTO entry_submission_answers (
            submission_id,
            field_id,
            answer_text,
            answer_number,
            answer_date,
            answer_time,
            selected_option_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          nextSubmissionId,
          Number(field.id),
          field.field_type === "short_text" || field.field_type === "long_text"
            ? (resolvedValue as string) || null
            : null,
          field.field_type === "rating" ? resolvedValue || null : null,
          field.field_type === "date" ? (resolvedValue as string) || null : null,
          field.field_type === "time" ? (resolvedValue as string) || null : null,
          field.field_type === "multiple_choice" || field.field_type === "dropdown"
            ? Number((resolvedValue as AnyPayload | null)?.id || 0) || null
            : null
        ],
        connection
      );

      const answerId = Number(answerInsert.insertId);

      if (field.field_type === "checkboxes") {
        for (const checkboxValue of resolvedValue as string[]) {
          const option = optionsByFieldId[String(field.id)]?.[checkboxValue];
          if (!option?.id) {
            continue;
          }

          await execute(
            `
              INSERT INTO entry_submission_answer_options (answer_id, option_id)
              VALUES (?, ?)
            `,
            [answerId, Number(option.id)],
            connection
          );
        }
      }

      if (field.field_type === "file_upload") {
        let fileIndex = 0;
        for (const fileName of resolvedValue as string[]) {
          fileIndex += 1;
          await execute(
            `
              INSERT INTO entry_submission_files (
                answer_id,
                original_file_name,
                stored_file_name,
                storage_disk,
                storage_path,
                file_extension,
                uploaded_at
              ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `,
            [
              answerId,
              fileName,
              `${Date.now()}_${fileIndex}_${fileName}`,
              "local",
              `uploads/forms/${formSummary.public_path}/${submissionCode}/${fileName}`,
              fileName.includes(".") ? fileName.split(".").pop() : null
            ],
            connection
          );
        }
      }
    }

    const formSettings = parseJson<Record<string, any>>(formRow.settings_json, {});
    const claimQrTokens: ClaimQrToken[] = [];
    if (formSettings.auto_create_item_claims !== false) {
      const itemRows = await queryRows<AnyRow>(
        `
          SELECT item_id, item_name, default_qty
          FROM item_catalogs
          WHERE form_id = ?
            AND is_active = 1
            AND deleted_at IS NULL
          ORDER BY sort_order ASC, item_id ASC
        `,
        [formRow.form_id],
        connection
      );

      for (let index = 0; index < itemRows.length; index += 1) {
        const itemRow = itemRows[index];
        const claimToken = `CLAIM-${String(formRow.form_id).padStart(3, "0")}-${String(nextSubmissionId).padStart(4, "0")}-${index + 1}`;
        claimQrTokens.push({
          label: String(itemRow.item_name || `รายการที่ ${index + 1}`),
          token: claimToken
        });
        await execute(
          `
            INSERT INTO item_claims (
              submission_id,
              item_id,
              claim_token,
              receive_status,
              qr_issued_at,
              qty,
              notes
            ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
          `,
          [
            nextSubmissionId,
            itemRow.item_id,
            claimToken,
            "pending",
            Number(itemRow.default_qty || 1),
            null
          ],
          connection
        );
      }
    }

    const emailTemplateRows = await queryRows<AnyRow>(
      `
        SELECT email_template_id, notification_code, email_subject_template, email_body_template
        FROM email_notification_templates
        WHERE form_id = ?
          AND is_active = 1
          AND deleted_at IS NULL
        ORDER BY email_template_id ASC
        LIMIT 1
      `,
      [formRow.form_id],
      connection
    );

    let pendingEmail: PendingEmailDispatch | null = null;

    const activeTemplate = emailTemplateRows[0];
    if (activeTemplate) {
      const renderedSubject = renderTemplate(String(activeTemplate.email_subject_template || ""), {
        form_name: formSummary.form_name,
        submission_code: submissionCode,
        full_name: respondentName
      });
      const renderedBody = renderTemplate(String(activeTemplate.email_body_template || ""), {
        form_name: formSummary.form_name,
        submission_code: submissionCode,
        full_name: respondentName
      });

      const insertResult = await execute(
        `
          INSERT INTO email_send_logs (
            email_template_id,
            form_id,
            submission_id,
            recipient_email,
            notification_code,
            email_subject,
            send_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          activeTemplate.email_template_id,
          formRow.form_id,
          nextSubmissionId,
          respondentEmail,
          activeTemplate.notification_code,
          renderedSubject,
          "queued"
        ],
        connection
      );

      pendingEmail = {
        emailLogId: Number(insertResult.insertId),
        recipientEmail: respondentEmail,
        subject: renderedSubject,
        html: `${renderedBody}${buildClaimLinesHtml(claimQrTokens)}`,
        qrTokens: claimQrTokens
      };
    }

    return {
      ok: true,
      status: attendanceStatus,
      submissionId: nextSubmissionId,
      submissionCode,
      successTitle: formSummary.success_title,
      successMessage: formSummary.success_message,
      pendingEmail
    };
};

export const submitPublicForm = async (publicPath: string, payload: AnyPayload) => {
  const result = await withTransaction(async (connection) => {
    const formRows = await queryRows<AnyRow>(
      `
        SELECT
          form_id,
          project_id,
          form_name,
          public_path,
          form_type,
          status,
          start_at,
          end_at,
          success_title,
          success_message,
          settings_json
        FROM form_forms
        WHERE public_path = ?
          AND deleted_at IS NULL
        LIMIT 1
      `,
      [publicPath],
      connection
    );

    const formRow = formRows[0];
    if (!formRow) {
      return { ok: false, status: "not_found" };
    }

    return submitFormForRow(
      formRow,
      payload,
      {
        sourceType: "public_form",
        note: null,
        markPresent: false
      },
      connection
    );
  });

  await dispatchPendingEmail((result as AnyPayload).pendingEmail || null);
  const { pendingEmail, ...publicResult } = result as AnyPayload;
  return publicResult;
};

export const listItems = async () => {
  const rows = await queryRows<AnyRow>(
    `
      SELECT
        i.item_id,
        f.project_id,
        i.form_id,
        i.item_code,
        i.item_name,
        i.item_type,
        i.default_qty,
        i.is_active,
        f.form_name,
        p.project_name
      FROM item_catalogs i
      INNER JOIN form_forms f ON f.form_id = i.form_id
      INNER JOIN proj_projects p ON p.project_id = f.project_id
      WHERE i.deleted_at IS NULL
        AND f.deleted_at IS NULL
        AND p.deleted_at IS NULL
      ORDER BY i.item_id ASC
    `
  );

  return rows.map((row) => ({
    item_id: Number(row.item_id),
    project_id: Number(row.project_id),
    form_id: String(row.form_id),
    item_code: row.item_code || "",
    item_name: row.item_name || "",
    item_type: row.item_type || "reward",
    default_qty: Number(row.default_qty || 1),
    is_active: toBoolean(row.is_active),
    form_name: row.form_name || "-",
    project_name: row.project_name || "-"
  }));
};

export const listClaims = async () => {
  const rows = await queryRows<AnyRow>(
    `
      SELECT
        c.claim_id,
        f.project_id,
        s.form_id,
        c.item_id,
        s.submission_code,
        c.claim_token,
        c.receive_status,
        c.received_at,
        i.item_name,
        f.form_name,
        p.project_name
      FROM item_claims c
      INNER JOIN entry_submissions s ON s.submission_id = c.submission_id
      INNER JOIN item_catalogs i ON i.item_id = c.item_id
      INNER JOIN form_forms f ON f.form_id = s.form_id
      INNER JOIN proj_projects p ON p.project_id = f.project_id
      WHERE c.deleted_at IS NULL
        AND s.deleted_at IS NULL
        AND i.deleted_at IS NULL
        AND f.deleted_at IS NULL
        AND p.deleted_at IS NULL
      ORDER BY c.claim_id ASC
    `
  );

  return rows.map((row) => ({
    claim_id: Number(row.claim_id),
    project_id: Number(row.project_id),
    form_id: String(row.form_id),
    item_id: Number(row.item_id),
    submission_code: row.submission_code || "",
    claim_token: row.claim_token || "",
    receive_status: row.receive_status || "pending",
    received_at: toDateTime(row.received_at),
    item_name: row.item_name || "-",
    form_name: row.form_name || "-",
    project_name: row.project_name || "-"
  }));
};

export const updateClaimStatus = async (claimId: number, receiveStatus: string) => {
  await execute(
    `
      UPDATE item_claims
      SET receive_status = ?,
          received_at = ?
      WHERE claim_id = ?
        AND deleted_at IS NULL
    `,
    [receiveStatus, receiveStatus === "received" ? new Date() : null, claimId]
  );
};

export const scanClaimToken = async (token: string) => {
  const rows = await queryRows<AnyRow>(
    `
      SELECT claim_id, claim_token, receive_status, received_at
      FROM item_claims
      WHERE claim_token = ?
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [token]
  );

  const claim = rows[0];
  if (!claim) {
    return {
      status: "not_found",
      message: "ไม่พบโทเคนนี้ในระบบ"
    };
  }

  if (claim.receive_status === "received") {
    return {
      status: "already_used",
      message: "โทเคนนี้ถูกใช้รับของแล้ว",
      claim: {
        claim_id: Number(claim.claim_id),
        claim_token: claim.claim_token,
        receive_status: claim.receive_status,
        received_at: toDateTime(claim.received_at)
      }
    };
  }

  await updateClaimStatus(Number(claim.claim_id), "received");

  return {
    status: "received",
    message: "ยืนยันรับของเรียบร้อยแล้ว",
    claim: {
      claim_id: Number(claim.claim_id),
      claim_token: claim.claim_token,
      receive_status: "received",
      received_at: new Date().toISOString().slice(0, 19)
    }
  };
};

export const listEmailTemplates = async () => {
  const rows = await queryRows<AnyRow>(
    `
      SELECT
        t.email_template_id,
        f.project_id,
        t.form_id,
        t.template_name,
        t.notification_code,
        t.email_subject_template,
        t.email_body_template,
        t.is_active,
        f.form_name,
        p.project_name
      FROM email_notification_templates t
      INNER JOIN form_forms f ON f.form_id = t.form_id
      INNER JOIN proj_projects p ON p.project_id = f.project_id
      WHERE t.deleted_at IS NULL
        AND f.deleted_at IS NULL
        AND p.deleted_at IS NULL
      ORDER BY t.email_template_id ASC
    `
  );

  return rows.map((row) => ({
    email_template_id: Number(row.email_template_id),
    project_id: Number(row.project_id),
    form_id: String(row.form_id),
    template_name: row.template_name || "",
    notification_code: row.notification_code || "submission_confirmation",
    email_subject: row.email_subject_template || "",
    email_body: row.email_body_template || "",
    is_active: toBoolean(row.is_active),
    form_name: row.form_name || "-",
    project_name: row.project_name || "-"
  }));
};

export const updateEmailTemplate = async (templateId: number, payload: AnyPayload) => {
  await execute(
    `
      UPDATE email_notification_templates
      SET email_subject_template = ?,
          email_body_template = ?,
          is_active = COALESCE(?, is_active)
      WHERE email_template_id = ?
        AND deleted_at IS NULL
    `,
    [
      payload.email_subject || null,
      payload.email_body || null,
      payload.is_active === undefined ? null : payload.is_active ? 1 : 0,
      templateId
    ]
  );
};

export const listEmailLogs = async () => {
  const rows = await queryRows<AnyRow>(
    `
      SELECT
        l.email_log_id,
        f.project_id,
        l.form_id,
        l.recipient_email,
        l.notification_code,
        l.send_status,
        l.created_at,
        f.form_name,
        p.project_name
      FROM email_send_logs l
      INNER JOIN form_forms f ON f.form_id = l.form_id
      INNER JOIN proj_projects p ON p.project_id = f.project_id
      WHERE l.deleted_at IS NULL
        AND f.deleted_at IS NULL
        AND p.deleted_at IS NULL
      ORDER BY l.email_log_id ASC
    `
  );

  return rows.map((row) => ({
    email_log_id: Number(row.email_log_id),
    project_id: Number(row.project_id),
    form_id: String(row.form_id),
    recipient_email: row.recipient_email || "",
    notification_code: row.notification_code || "",
    send_status: row.send_status || "queued",
    created_at: toDateTime(row.created_at),
    form_name: row.form_name || "-",
    project_name: row.project_name || "-"
  }));
};

export const listUsers = async () => {
  const rows = await queryRows<AnyRow>(
    `
      SELECT user_id, email, display_name, role_code, is_active, allow_local_login, allow_sso_login
      FROM auth_users
      WHERE deleted_at IS NULL
      ORDER BY user_id ASC
    `
  );

  return rows.map((row) => ({
    user_id: Number(row.user_id),
    email: row.email || "",
    display_name: row.display_name || "",
    role_code: row.role_code || "staff",
    is_active: toBoolean(row.is_active),
    login_method: toBoolean(row.allow_local_login)
      ? "local"
      : toBoolean(row.allow_sso_login)
        ? "sso"
        : "disabled"
  }));
};

export const updateUser = async (userId: number, payload: AnyPayload) => {
  await execute(
    `
      UPDATE auth_users
      SET role_code = COALESCE(?, role_code),
          is_active = COALESCE(?, is_active)
      WHERE user_id = ?
        AND deleted_at IS NULL
    `,
    [
      payload.role_code || null,
      payload.is_active === undefined ? null : payload.is_active ? 1 : 0,
      userId
    ]
  );
};

export const listSsoAccounts = async () => {
  const rows = await queryRows<AnyRow>(
    `
      SELECT
        s.sso_account_id,
        s.user_id,
        s.provider_email,
        s.provider_code,
        s.provider_subject,
        s.linked_at,
        u.display_name,
        u.is_active
      FROM auth_sso_accounts s
      INNER JOIN auth_users u ON u.user_id = s.user_id
      WHERE s.deleted_at IS NULL
        AND u.deleted_at IS NULL
      ORDER BY s.sso_account_id ASC
    `
  );

  return rows.map((row) => ({
    sso_account_id: Number(row.sso_account_id),
    user_id: Number(row.user_id),
    email: row.provider_email || "",
    provider_name: row.provider_code || "",
    provider_user_id: row.provider_subject || "",
    is_active: toBoolean(row.is_active),
    linked_at: toDateTime(row.linked_at),
    display_name: row.display_name || "-"
  }));
};

export const listAdminLoginLogs = async () => {
  const rows = await queryRows<AnyRow>(
    `
      SELECT
        login_log_id,
        login_identifier,
        login_method,
        login_status,
        failure_reason,
        ip_address,
        user_agent,
        created_at
      FROM auth_login_logs
      ORDER BY login_log_id ASC
    `
  );

  return rows.map((row) => ({
    login_log_id: Number(row.login_log_id),
    email: row.login_identifier || "",
    login_method: row.login_method || "",
    login_status: row.login_status || "",
    reject_reason: row.failure_reason || "",
    ip_address: row.ip_address || "",
    user_agent: row.user_agent || "",
    logged_at: toDateTime(row.created_at)
  }));
};
