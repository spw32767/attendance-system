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

const request = async (path, options = {}) => {
  const response = await fetch(buildUrl(path, options.params), {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || `Request failed: ${response.status}`);
  }

  return data;
};

const requestFormData = async (path, formData, options = {}) => {
  const response = await fetch(buildUrl(path, options.params), {
    method: options.method || "POST",
    headers: {
      ...(options.headers || {})
    },
    body: formData
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || `Request failed: ${response.status}`);
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
  const response = await fetch(buildUrl(path, params));

  if (!response.ok) {
    const text = await response.text();
    let message = `Request failed: ${response.status}`;
    if (text) {
      try {
        const data = JSON.parse(text);
        message = data?.message || message;
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

  submitPublicForm: (publicPath, payload) =>
    request(`/public/forms/${encodeURIComponent(publicPath)}/submissions`, {
      method: "POST",
      body: normalizePublicPayload(payload)
    }),

  listItems: () => readCollection("/admin/items"),
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
  listAdminLoginLogs: () => readCollection("/admin/login-logs")
};
