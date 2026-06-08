const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

const buildUrl = (path, params) => {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return `${url.pathname}${url.search}`;
};

const normalizeAnswerValue = (value) => {
  if (value instanceof FileList) {
    return Array.from(value).map((file) => file.name);
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeAnswerValue(item));
  }

  return value;
};

const normalizePublicPayload = (payload) => ({
  ...payload,
  answers: Object.fromEntries(
    Object.entries(payload?.answers || {}).map(([fieldId, value]) => [
      fieldId,
      normalizeAnswerValue(value)
    ])
  )
});

// All admin requests carry the session cookie. Server-side @fastify/cookie
// reads it; frontend never touches the token directly.
const handleAuthFailure = (status) => {
  if (status !== 401) {
    return;
  }
  // If we're already on the login page don't bounce.
  if (window.location.pathname === "/login") {
    return;
  }
  window.location.assign("/login");
};

const parseError = (data, status) => {
  const message = data?.error || data?.message || `Request failed: ${status}`;
  const err = new Error(message);
  err.status = status;
  // Expose full body to callers that need extra fields (e.g. fieldId,
  // status='validation_error' / 'duplicate_value' / 'already_submitted').
  err.data = data || null;
  return err;
};

const request = async (path, options = {}) => {
  const response = await fetch(buildUrl(path, options.params), {
    method: options.method || "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    handleAuthFailure(response.status);
    throw parseError(data, response.status);
  }

  return data;
};

const requestFormData = async (path, formData, options = {}) => {
  const response = await fetch(buildUrl(path, options.params), {
    method: options.method || "POST",
    credentials: "include",
    headers: {
      ...(options.headers || {})
    },
    body: formData
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    handleAuthFailure(response.status);
    throw parseError(data, response.status);
  }

  return data;
};

const parseFileNameFromDisposition = (value) => {
  if (!value) {
    return "template.xlsx";
  }

  const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(value);
  const encoded = match?.[1];
  const plain = match?.[2];

  if (encoded) {
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded;
    }
  }

  return plain || "template.xlsx";
};

const downloadFile = async (path, params) => {
  const response = await fetch(buildUrl(path, params), {
    credentials: "include"
  });

  if (!response.ok) {
    handleAuthFailure(response.status);
    const text = await response.text();
    let message = `Request failed: ${response.status}`;
    if (text) {
      try {
        const data = JSON.parse(text);
        message = data?.error || data?.message || message;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const fileName = parseFileNameFromDisposition(response.headers.get("content-disposition"));
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const readCollection = async (path, params) => {
  const result = await request(path, { params });
  return result?.data || [];
};

export const apiAdminService = {
  listProjects: () => readCollection("/admin/projects"),

  upsertProject: (projectId, payload) =>
    projectId
      ? request(`/admin/projects/${projectId}`, { method: "PATCH", body: payload })
      : request("/admin/projects", { method: "POST", body: payload }),

  setProjectUsage: (projectId, isActive) =>
    request(`/admin/projects/${projectId}/usage`, {
      method: "PATCH",
      body: { is_active: isActive }
    }),

  listForms: () => readCollection("/admin/forms"),

  listFormsByProject: (projectId) => readCollection(`/admin/projects/${projectId}/forms`),

  getFormDraft: (formId, projectId) =>
    formId
      ? request(`/admin/forms/${formId}/draft`)
      : request("/admin/forms/draft", { params: { projectId } }),

  saveFormDraft: (formId, draft, targetStatus) =>
    request("/admin/forms/save", {
      method: "POST",
      body: {
        formId,
        draft,
        targetStatus
      }
    }),

  setFormUsage: (formId, isEnabled) =>
    request(`/admin/forms/${formId}/usage`, {
      method: "PATCH",
      body: { is_enabled: isEnabled }
    }),

  listSubmissions: () => readCollection("/admin/submissions"),

  getSubmissionDetail: (submissionId) => request(`/admin/submissions/${submissionId}`),

  updateSubmission: (submissionId, payload) =>
    request(`/admin/submissions/${submissionId}`, {
      method: "PATCH",
      body: payload
    }),

  importFormSubmissionsExcel: (formId, file, options = {}) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", options.mode || "sync");
    formData.append("duplicate_policy", options.duplicatePolicy || "skip");

    return requestFormData(`/admin/forms/${formId}/submissions/import-excel`, formData, {
      method: "POST"
    });
  },

  previewImportFormSubmissionsExcel: (formId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return requestFormData(`/admin/forms/${formId}/submissions/import-excel/preview`, formData, {
      method: "POST"
    });
  },

  downloadFormImportTemplate: (formId) =>
    downloadFile(`/admin/forms/${formId}/submissions/import-template`),

  exportFormSubmissionsExcel: (formId, params = {}) =>
    downloadFile(`/admin/forms/${formId}/submissions/export-excel`, params),

  getPublicForm: (publicPath) => request(`/public/forms/${encodeURIComponent(publicPath)}`),

  submitPublicForm: (publicPath, payload) => {
    // If any answer carries actual File objects (file_upload field), we
    // must use multipart. Otherwise the JSON path is cheaper.
    const answers = payload?.answers || {};
    const fileEntries = Object.entries(answers).filter(
      ([, value]) =>
        value instanceof FileList ||
        (Array.isArray(value) && value.some((item) => item instanceof File))
    );

    if (fileEntries.length === 0) {
      return request(`/public/forms/${encodeURIComponent(publicPath)}/submissions`, {
        method: "POST",
        body: normalizePublicPayload(payload)
      });
    }

    // Strip files from the JSON answers payload; send the rest as a JSON
    // "answers" multipart field, attach files as "file_<fieldId>".
    const textAnswers = { ...answers };
    const formData = new FormData();
    for (const [fieldId, value] of fileEntries) {
      delete textAnswers[fieldId];
      const list =
        value instanceof FileList
          ? Array.from(value)
          : value.filter((v) => v instanceof File);
      for (const file of list) {
        formData.append(`file_${fieldId}`, file, file.name);
      }
    }
    formData.append(
      "answers",
      JSON.stringify({ ...payload, answers: textAnswers })
    );
    return requestFormData(
      `/public/forms/${encodeURIComponent(publicPath)}/submissions`,
      formData
    );
  },

  downloadSubmissionFile: (submissionId, fileId) =>
    downloadFile(`/admin/submissions/${submissionId}/files/${fileId}`),

  listItems: () => readCollection("/admin/items"),

  createItem: (formId, payload) =>
    request(`/admin/forms/${formId}/items`, { method: "POST", body: payload }),

  updateItem: (itemId, payload) =>
    request(`/admin/items/${itemId}`, { method: "PATCH", body: payload }),

  deleteItem: (itemId) =>
    request(`/admin/items/${itemId}`, { method: "DELETE" }),

  listClaims: () => readCollection("/admin/claims"),

  updateClaimStatus: (claimId, receiveStatus) =>
    request(`/admin/claims/${claimId}/status`, {
      method: "PATCH",
      body: { receive_status: receiveStatus }
    }),

  scanClaimToken: (token) =>
    request("/admin/claims/scan", {
      method: "POST",
      body: { token }
    }),

  listEmailTemplates: () => readCollection("/admin/email/templates"),

  createEmailTemplate: (payload) =>
    request("/admin/email/templates", {
      method: "POST",
      body: payload
    }),

  updateEmailTemplate: (templateId, payload) =>
    request(`/admin/email/templates/${templateId}`, {
      method: "PATCH",
      body: payload
    }),

  listEmailLogs: () => readCollection("/admin/email/logs"),

  listUsers: () => readCollection("/admin/users"),

  updateUser: (userId, payload) =>
    request(`/admin/users/${userId}`, {
      method: "PATCH",
      body: payload
    }),

  listSsoAccounts: () => readCollection("/admin/sso-accounts"),
  listAdminLoginLogs: () => readCollection("/admin/login-logs"),

  // ---- user create + password ----
  createUser: (payload) =>
    request("/admin/users", { method: "POST", body: payload }),

  resetUserPassword: (userId, password) =>
    request(`/admin/users/${userId}/reset-password`, {
      method: "POST",
      body: { password }
    }),

  changeOwnPassword: (currentPassword, newPassword) =>
    request("/admin/me/password", {
      method: "POST",
      body: { current_password: currentPassword, new_password: newPassword }
    }),

  // ---- auth ----
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: { email, password }
    }),

  logout: () => request("/auth/logout", { method: "POST" }),

  me: () => request("/auth/me")
};
