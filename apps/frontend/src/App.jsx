import { useEffect, useMemo, useState } from "react";
import { ConfigProvider } from "antd";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AttendanceTemplatesPage from "./pages/AttendanceTemplatesPage";
import CreateAttendanceTemplatePage from "./pages/CreateAttendanceTemplatePage";
import EmailCenterPage from "./pages/EmailCenterPage";
import ItemsClaimsPage from "./pages/ItemsClaimsPage";
import LoginPage from "./pages/LoginPage";
import LoginLogsPage from "./pages/LoginLogsPage";
import ModulePlaceholderPage from "./pages/ModulePlaceholderPage";
import ProjectEditorPage from "./pages/ProjectEditorPage";
import PublicFormPage from "./pages/PublicFormPage";
import PublicFormSuccessPage from "./pages/PublicFormSuccessPage";
import ProjectsPage from "./pages/ProjectsPage";
import ScannerClaimsPage from "./pages/ScannerClaimsPage";
import SubmissionDetailPage from "./pages/SubmissionDetailPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import UsersAdminPage from "./pages/UsersAdminPage";
import { adminDataAdapter } from "./services/adminDataAdapter";

const ROUTE_ID_LOGIN = "login";
const ROUTE_ID_DASHBOARD = "dashboard";
const ROUTE_ID_PROJECTS = "projects";
const ROUTE_ID_PROJECT_CREATE = "project-create";
const ROUTE_ID_PROJECT_EDIT = "project-edit";
const ROUTE_ID_PROJECT_FORMS = "project-forms";
const ROUTE_ID_FORM_EDITOR = "form-editor";
const ROUTE_ID_SUBMISSIONS = "submissions";
const ROUTE_ID_SUBMISSION_DETAIL = "submission-detail";
const ROUTE_ID_ITEMS = "items";
const ROUTE_ID_CLAIMS = "claims";
const ROUTE_ID_EMAIL = "email";
const ROUTE_ID_USERS = "users";
const ROUTE_ID_LOGIN_LOGS = "login-logs";
const ROUTE_ID_SCANNER_CLAIMS = "scanner-claims";
const ROUTE_ID_PUBLIC_FORM = "public-form";
const ROUTE_ID_PUBLIC_FORM_SUCCESS = "public-form-success";

const PATH_LOGIN = "/login";
const PATH_DASHBOARD = "/admin/dashboard";
const PATH_PROJECTS = "/admin/projects";
const PATH_PROJECT_CREATE = "/admin/projects/create";
const PATH_FORM_EDITOR = "/admin/forms/editor";
const PATH_SUBMISSIONS = "/admin/submissions";
const PATH_ITEMS = "/admin/items";
const PATH_CLAIMS = "/admin/claims";
const PATH_EMAIL = "/admin/email";
const PATH_USERS = "/admin/users";
const PATH_LOGIN_LOGS = "/admin/login-logs";
const PATH_SCANNER_CLAIMS = "/scanner/claims";

const THEME_STORAGE_KEY = "attendance-theme";
const ROLE_STORAGE_KEY = "attendance-role";

const ROUTE_PERMISSION_GROUP = {
  login: ["admin", "staff", "scanner"],
  dashboard: ["admin", "staff"],
  projects: ["admin", "staff"],
  "project-create": ["admin", "staff"],
  "project-edit": ["admin", "staff"],
  "project-forms": ["admin", "staff"],
  "form-editor": ["admin", "staff"],
  submissions: ["admin", "staff"],
  "submission-detail": ["admin", "staff"],
  items: ["admin", "staff"],
  claims: ["admin", "staff", "scanner"],
  email: ["admin", "staff"],
  users: ["admin"],
  "login-logs": ["admin"],
  "scanner-claims": ["admin", "staff", "scanner"],
  "public-form": ["admin", "staff", "scanner"],
  "public-form-success": ["admin", "staff", "scanner"]
};

const STATIC_ROUTES = {
  [PATH_LOGIN]: ROUTE_ID_LOGIN,
  [PATH_DASHBOARD]: ROUTE_ID_DASHBOARD,
  [PATH_PROJECTS]: ROUTE_ID_PROJECTS,
  [PATH_PROJECT_CREATE]: ROUTE_ID_PROJECT_CREATE,
  [PATH_FORM_EDITOR]: ROUTE_ID_FORM_EDITOR,
  [PATH_SUBMISSIONS]: ROUTE_ID_SUBMISSIONS,
  [PATH_ITEMS]: ROUTE_ID_ITEMS,
  [PATH_CLAIMS]: ROUTE_ID_CLAIMS,
  [PATH_EMAIL]: ROUTE_ID_EMAIL,
  [PATH_USERS]: ROUTE_ID_USERS,
  [PATH_LOGIN_LOGS]: ROUTE_ID_LOGIN_LOGS,
  [PATH_SCANNER_CLAIMS]: ROUTE_ID_SCANNER_CLAIMS
};

const ROUTE_ALIAS = {
  "/": PATH_LOGIN,
  "/admin/templates": PATH_PROJECTS,
  "/admin/templates/create": PATH_FORM_EDITOR
};

const toProjectEditPath = (projectId) => `/admin/projects/${projectId}/edit`;
const toProjectFormsPath = (projectId) => `/admin/projects/${projectId}/forms`;

const normalizePathname = (pathname) => {
  if (!pathname || pathname === "/") {
    return PATH_LOGIN;
  }

  const trimmed = pathname.replace(/\/+$/, "");
  const normalized = trimmed || "/";
  return ROUTE_ALIAS[normalized] || normalized;
};

const matchDynamicRoute = (pathname) => {
  const projectEditMatch = pathname.match(/^\/admin\/projects\/(\d+)\/edit$/);
  if (projectEditMatch) {
    return {
      id: ROUTE_ID_PROJECT_EDIT,
      params: {
        projectId: Number(projectEditMatch[1])
      }
    };
  }

  const projectFormsMatch = pathname.match(/^\/admin\/projects\/(\d+)\/forms$/);
  if (projectFormsMatch) {
    return {
      id: ROUTE_ID_PROJECT_FORMS,
      params: {
        projectId: Number(projectFormsMatch[1])
      }
    };
  }

  const publicFormMatch = pathname.match(/^\/forms\/([^/]+)$/);
  if (publicFormMatch) {
    return {
      id: ROUTE_ID_PUBLIC_FORM,
      params: {
        publicPath: decodeURIComponent(publicFormMatch[1])
      }
    };
  }

  const publicFormSuccessMatch = pathname.match(/^\/forms\/([^/]+)\/success$/);
  if (publicFormSuccessMatch) {
    return {
      id: ROUTE_ID_PUBLIC_FORM_SUCCESS,
      params: {
        publicPath: decodeURIComponent(publicFormSuccessMatch[1])
      }
    };
  }

  const submissionDetailMatch = pathname.match(/^\/admin\/submissions\/(\d+)$/);
  if (submissionDetailMatch) {
    return {
      id: ROUTE_ID_SUBMISSION_DETAIL,
      params: {
        submissionId: Number(submissionDetailMatch[1])
      }
    };
  }

  return null;
};

const parseRoute = (target) => {
  const url = new URL(target, window.location.origin);
  const pathname = normalizePathname(url.pathname);
  const dynamicRoute = matchDynamicRoute(pathname);

  if (dynamicRoute) {
    return {
      ...dynamicRoute,
      pathname,
      search: url.search
    };
  }

  const staticRouteId = STATIC_ROUTES[pathname];
  if (staticRouteId) {
    return {
      id: staticRouteId,
      pathname,
      search: url.search,
      params: {}
    };
  }

  return {
    id: ROUTE_ID_LOGIN,
    pathname: PATH_LOGIN,
    search: "",
    params: {}
  };
};

function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.href));
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  const [projects, setProjects] = useState([]);
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [submissionDetail, setSubmissionDetail] = useState(null);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [ssoAccounts, setSsoAccounts] = useState([]);
  const [adminLoginLogs, setAdminLoginLogs] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [bootstrapError, setBootstrapError] = useState("");
  const [currentRole, setCurrentRole] = useState(() => {
    const saved = window.localStorage.getItem(ROLE_STORAGE_KEY);
    return saved || "admin";
  });

  useEffect(() => {
    const normalized = parseRoute(window.location.href);
    const expectedUrl = `${normalized.pathname}${normalized.search}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (expectedUrl !== currentUrl) {
      window.history.replaceState({}, "", expectedUrl);
      setRoute(normalized);
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRoute(window.location.href));
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(ROLE_STORAGE_KEY, currentRole);
  }, [currentRole]);

  useEffect(() => {
    const bootstrap = async () => {
      setIsBootstrapping(true);
      setBootstrapError("");
      try {
      const [
        loadedProjects,
        loadedForms,
        loadedSubmissions,
        loadedItems,
        loadedClaims,
        loadedEmailTemplates,
        loadedEmailLogs,
        loadedUsers,
        loadedSsoAccounts,
        loadedAdminLoginLogs
      ] = await Promise.all([
        adminDataAdapter.listProjects(),
        adminDataAdapter.listForms(),
        adminDataAdapter.listSubmissions(),
        adminDataAdapter.listItems(),
        adminDataAdapter.listClaims(),
        adminDataAdapter.listEmailTemplates(),
        adminDataAdapter.listEmailLogs(),
        adminDataAdapter.listUsers(),
        adminDataAdapter.listSsoAccounts(),
        adminDataAdapter.listAdminLoginLogs()
      ]);
      setProjects(loadedProjects);
      setForms(loadedForms);
      setSubmissions(loadedSubmissions);
      setItems(loadedItems);
      setClaims(loadedClaims);
      setEmailTemplates(loadedEmailTemplates);
      setEmailLogs(loadedEmailLogs);
      setUsers(loadedUsers);
      setSsoAccounts(loadedSsoAccounts);
      setAdminLoginLogs(loadedAdminLoginLogs);
      } catch (error) {
        setBootstrapError(error instanceof Error ? error.message : "โหลดข้อมูลล้มเหลว");
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, []);

  const projectsWithLabel = useMemo(() => projects, [projects]);

  const projectNameById = useMemo(
    () =>
      projectsWithLabel.reduce((lookup, project) => {
        lookup[project.project_id] = project.project_name;
        return lookup;
      }, {}),
    [projectsWithLabel]
  );

  const formsWithProjectName = useMemo(
    () =>
      forms.map((form) => ({
        ...form,
        project_name: projectNameById[form.project_id] || form.project_name
      })),
    [forms, projectNameById]
  );

  const navigate = (target, options = {}) => {
    const nextRoute = parseRoute(target);
    const nextUrl = `${nextRoute.pathname}${nextRoute.search}`;
    const method = options.replace ? "replaceState" : "pushState";

    window.history[method]({}, "", nextUrl);
    setRoute(nextRoute);
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  const routeSearchParams = useMemo(
    () => new URLSearchParams(route.search),
    [route.search]
  );

  const firstProjectId = projectsWithLabel[0]?.project_id || null;
  const firstProjectFormsPath = firstProjectId
    ? toProjectFormsPath(firstProjectId)
    : PATH_PROJECTS;

  const activeNavKey = useMemo(() => {
    if (
      route.id === ROUTE_ID_PROJECTS ||
      route.id === ROUTE_ID_PROJECT_CREATE ||
      route.id === ROUTE_ID_PROJECT_EDIT
    ) {
      return "projects";
    }

    if (route.id === ROUTE_ID_PROJECT_FORMS || route.id === ROUTE_ID_FORM_EDITOR) {
      return "forms";
    }

    if (route.id === ROUTE_ID_SUBMISSIONS || route.id === ROUTE_ID_SUBMISSION_DETAIL) {
      return "submissions";
    }

    if (route.id === ROUTE_ID_ITEMS) {
      return "items";
    }

    if (route.id === ROUTE_ID_CLAIMS) {
      return "claims";
    }

    if (route.id === ROUTE_ID_SCANNER_CLAIMS) {
      return "scanner";
    }

    if (route.id === ROUTE_ID_EMAIL) {
      return "email";
    }

    if (route.id === ROUTE_ID_USERS) {
      return "users";
    }

    if (route.id === ROUTE_ID_LOGIN_LOGS) {
      return "login-logs";
    }

    return route.id === ROUTE_ID_DASHBOARD ? "dashboard" : "";
  }, [route.id]);

  const adminNavItems = useMemo(() => {
    const allItems = [
      {
        routeKey: ROUTE_ID_DASHBOARD,
        path: PATH_DASHBOARD,
        label: "แดชบอร์ด",
        icon: "dashboard",
        group: "ภาพรวม",
        isActive: activeNavKey === "dashboard"
      },
      {
        routeKey: ROUTE_ID_PROJECTS,
        path: PATH_PROJECTS,
        label: "โครงการ",
        icon: "projects",
        group: "การตั้งค่าแบบฟอร์ม",
        isActive: activeNavKey === "projects"
      },
      {
        routeKey: ROUTE_ID_FORM_EDITOR,
        path: firstProjectFormsPath,
        label: "ฟอร์ม",
        icon: "forms",
        group: "การตั้งค่าแบบฟอร์ม",
        isActive: activeNavKey === "forms"
      },
      {
        routeKey: ROUTE_ID_SUBMISSIONS,
        path: PATH_SUBMISSIONS,
        label: "คำตอบ",
        icon: "submissions",
        group: "การปฏิบัติการ",
        isActive: activeNavKey === "submissions"
      },
      {
        routeKey: ROUTE_ID_ITEMS,
        path: PATH_ITEMS,
        label: "รายการของ",
        icon: "items",
        group: "การปฏิบัติการ",
        isActive: activeNavKey === "items"
      },
      {
        routeKey: ROUTE_ID_CLAIMS,
        path: PATH_CLAIMS,
        label: "สิทธิ์รับของ",
        icon: "claims",
        group: "การปฏิบัติการ",
        isActive: activeNavKey === "claims"
      },
      {
        routeKey: ROUTE_ID_SCANNER_CLAIMS,
        path: PATH_SCANNER_CLAIMS,
        label: "สแกนรับของ",
        icon: "scanner",
        group: "การปฏิบัติการ",
        isActive: activeNavKey === "scanner"
      },
      {
        routeKey: ROUTE_ID_EMAIL,
        path: PATH_EMAIL,
        label: "อีเมล",
        icon: "email",
        group: "การปฏิบัติการ",
        isActive: activeNavKey === "email"
      },
      {
        routeKey: ROUTE_ID_USERS,
        path: PATH_USERS,
        label: "ผู้ใช้งาน",
        icon: "users",
        group: "ผู้ดูแลระบบ",
        isActive: activeNavKey === "users"
      },
      {
        routeKey: ROUTE_ID_LOGIN_LOGS,
        path: PATH_LOGIN_LOGS,
        label: "ประวัติเข้าใช้",
        icon: "logs",
        group: "ผู้ดูแลระบบ",
        isActive: activeNavKey === "login-logs"
      }
    ];

    return allItems.filter((item) =>
      (ROUTE_PERMISSION_GROUP[item.routeKey] || ["admin"]).includes(currentRole)
    );
  }, [activeNavKey, currentRole, firstProjectFormsPath, route.id]);

  const handleCreateProject = () => {
    navigate(PATH_PROJECT_CREATE);
  };

  const handleSaveProject = (draftProject) => {
    const save = async () => {
      if (route.id === ROUTE_ID_PROJECT_EDIT) {
        await adminDataAdapter.upsertProject(Number(route.params.projectId), draftProject);
      } else {
        await adminDataAdapter.upsertProject(null, draftProject);
      }

      const [
        nextProjects,
        nextForms,
        nextSubmissions,
        nextItems,
        nextClaims,
        nextEmailTemplates,
        nextEmailLogs,
        nextUsers,
        nextSsoAccounts,
        nextAdminLoginLogs
      ] = await Promise.all([
        adminDataAdapter.listProjects(),
        adminDataAdapter.listForms(),
        adminDataAdapter.listSubmissions(),
        adminDataAdapter.listItems(),
        adminDataAdapter.listClaims(),
        adminDataAdapter.listEmailTemplates(),
        adminDataAdapter.listEmailLogs(),
        adminDataAdapter.listUsers(),
        adminDataAdapter.listSsoAccounts(),
        adminDataAdapter.listAdminLoginLogs()
      ]);

      setProjects(nextProjects);
      setForms(nextForms);
      setSubmissions(nextSubmissions);
      setItems(nextItems);
      setClaims(nextClaims);
      setEmailTemplates(nextEmailTemplates);
      setEmailLogs(nextEmailLogs);
      setUsers(nextUsers);
      setSsoAccounts(nextSsoAccounts);
      setAdminLoginLogs(nextAdminLoginLogs);
      navigate(PATH_PROJECTS, { replace: true });
    };

    void save();
  };

  const handleLoadFormDraft = async (formId, projectId) =>
    adminDataAdapter.getFormDraft(formId, projectId);

  const handleSaveForm = async (formId, draft, targetStatus) => {
    const result = await adminDataAdapter.saveFormDraft(formId, draft, targetStatus);

    const [
      nextForms,
      nextSubmissions,
      nextItems,
      nextClaims,
      nextEmailTemplates,
      nextEmailLogs,
      nextUsers,
      nextSsoAccounts,
      nextAdminLoginLogs
    ] = await Promise.all([
      adminDataAdapter.listForms(),
      adminDataAdapter.listSubmissions(),
      adminDataAdapter.listItems(),
      adminDataAdapter.listClaims(),
      adminDataAdapter.listEmailTemplates(),
      adminDataAdapter.listEmailLogs(),
      adminDataAdapter.listUsers(),
      adminDataAdapter.listSsoAccounts(),
      adminDataAdapter.listAdminLoginLogs()
    ]);

    setForms(nextForms);
    setSubmissions(nextSubmissions);
    setItems(nextItems);
    setClaims(nextClaims);
    setEmailTemplates(nextEmailTemplates);
    setEmailLogs(nextEmailLogs);
    setUsers(nextUsers);
    setSsoAccounts(nextSsoAccounts);
    setAdminLoginLogs(nextAdminLoginLogs);

    return result;
  };

  const handleUpdateClaimStatus = async (claimId, receiveStatus) => {
    await adminDataAdapter.updateClaimStatus(claimId, receiveStatus);
    const [nextClaims] = await Promise.all([adminDataAdapter.listClaims()]);
    setClaims(nextClaims);
  };

  const handleSaveEmailTemplate = async (templateId, payload) => {
    await adminDataAdapter.updateEmailTemplate(templateId, payload);
    const [nextEmailTemplates] = await Promise.all([
      adminDataAdapter.listEmailTemplates()
    ]);
    setEmailTemplates(nextEmailTemplates);
  };

  const handleUpdateUser = async (userId, payload) => {
    await adminDataAdapter.updateUser(userId, payload);
    const [nextUsers] = await Promise.all([adminDataAdapter.listUsers()]);
    setUsers(nextUsers);
  };

  const handleScanToken = async (token) => {
    const result = await adminDataAdapter.scanClaimToken(token);
    setScanResult(result);
    const [nextClaims] = await Promise.all([adminDataAdapter.listClaims()]);
    setClaims(nextClaims);
  };

  const handleUpdateSubmission = async (submissionId, payload) => {
    await adminDataAdapter.updateSubmission(submissionId, payload);
    const [nextSubmissions, nextDetail] = await Promise.all([
      adminDataAdapter.listSubmissions(),
      adminDataAdapter.getSubmissionDetail(submissionId)
    ]);
    setSubmissions(nextSubmissions);
    setSubmissionDetail(nextDetail);
  };

  const handleToggleProjectUsage = async (projectId, isActive) => {
    await adminDataAdapter.setProjectUsage(projectId, isActive);
    const [nextProjects] = await Promise.all([adminDataAdapter.listProjects()]);
    setProjects(nextProjects);
  };

  const handleToggleFormUsage = async (formId, isEnabled) => {
    await adminDataAdapter.setFormUsage(formId, isEnabled);
    const [nextForms] = await Promise.all([adminDataAdapter.listForms()]);
    setForms(nextForms);
  };

  const handleLoadPublicForm = async (publicPath) =>
    adminDataAdapter.getPublicForm(publicPath);

  const handleSubmitPublicForm = async (publicPath, payload) => {
    const result = await adminDataAdapter.submitPublicForm(publicPath, payload);
    const [nextSubmissions, nextClaims, nextEmailLogs] = await Promise.all([
      adminDataAdapter.listSubmissions(),
      adminDataAdapter.listClaims(),
      adminDataAdapter.listEmailLogs()
    ]);
    setSubmissions(nextSubmissions);
    setClaims(nextClaims);
    setEmailLogs(nextEmailLogs);
    return result;
  };

  const handleCreateAdminSubmission = async (formId, payload) => {
    const result = await adminDataAdapter.createAdminSubmission(formId, payload);
    const [nextSubmissions, nextClaims, nextEmailLogs] = await Promise.all([
      adminDataAdapter.listSubmissions(),
      adminDataAdapter.listClaims(),
      adminDataAdapter.listEmailLogs()
    ]);
    setSubmissions(nextSubmissions);
    setClaims(nextClaims);
    setEmailLogs(nextEmailLogs);
    return result;
  };

  useEffect(() => {
    if (route.id !== ROUTE_ID_SUBMISSION_DETAIL) {
      setSubmissionDetail(null);
      return;
    }

    const loadDetail = async () => {
      const detail = await adminDataAdapter.getSubmissionDetail(route.params.submissionId);
      setSubmissionDetail(detail);
    };

    void loadDetail();
  }, [route.id, route.params.submissionId, submissions]);

  const canAccessCurrentRoute = useMemo(() => {
    const allowedRoles = ROUTE_PERMISSION_GROUP[route.id] || ["admin"];
    return allowedRoles.includes(currentRole);
  }, [currentRole, route.id]);

  let currentPage = null;

  if (route.id === ROUTE_ID_LOGIN) {
    currentPage = (
      <LoginPage
        onLogin={() => navigate(PATH_DASHBOARD)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (route.id === ROUTE_ID_DASHBOARD) {
    currentPage = (
      <AdminDashboardPage
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        projects={projectsWithLabel}
        forms={formsWithProjectName}
        onToggleProjectUsage={handleToggleProjectUsage}
        onToggleFormUsage={handleToggleFormUsage}
        onLoadFormDraft={handleLoadFormDraft}
        onOpenProjectForms={(projectId) => navigate(toProjectFormsPath(projectId))}
        onOpenFormEditor={(projectId, formId) =>
          navigate(`${PATH_FORM_EDITOR}?project=${projectId}&template=${formId}`)
        }
      />
    );
  }

  if (route.id === ROUTE_ID_PROJECTS) {
    currentPage = (
      <ProjectsPage
        projects={projectsWithLabel}
        onCreateProject={handleCreateProject}
        onEditProject={(projectId) => navigate(toProjectEditPath(projectId))}
        onOpenProjectForms={(projectId) => navigate(toProjectFormsPath(projectId))}
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
    );
  }

  if (route.id === ROUTE_ID_PROJECT_CREATE) {
    currentPage = (
      <ProjectEditorPage
        editingProject={null}
        onSave={handleSaveProject}
        onBack={() => navigate(PATH_PROJECTS)}
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
    );
  }

  if (route.id === ROUTE_ID_PROJECT_EDIT) {
    const editingProject = projectsWithLabel.find(
      (project) => project.project_id === Number(route.params.projectId)
    );

    if (!editingProject) {
      currentPage = (
        <ModulePlaceholderPage
          title="ไม่พบโครงการ"
          description="ไม่พบข้อมูลโครงการที่ต้องการแก้ไข อาจถูกลบไปแล้วหรือมีการเปลี่ยนรหัสโครงการ"
          bullets={["กลับไปหน้ารายการโครงการแล้วเลือกใหม่อีกครั้ง"]}
          breadcrumbs={["แอดมิน", "โครงการ", "ไม่พบข้อมูล"]}
          onLogout={() => navigate(PATH_LOGIN, { replace: true })}
          theme={theme}
          onToggleTheme={toggleTheme}
          navItems={adminNavItems}
          activePath={route.pathname}
          onNavigate={navigate}
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
        />
      );
    } else {
      currentPage = (
        <ProjectEditorPage
          editingProject={editingProject}
          onSave={handleSaveProject}
          onBack={() => navigate(PATH_PROJECTS)}
          onLogout={() => navigate(PATH_LOGIN, { replace: true })}
          theme={theme}
          onToggleTheme={toggleTheme}
          navItems={adminNavItems}
          activePath={route.pathname}
          onNavigate={navigate}
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
        />
      );
    }
  }

  if (route.id === ROUTE_ID_PROJECT_FORMS) {
    const activeProjectId = Number(route.params.projectId);
    const project = projectsWithLabel.find(
      (projectItem) => Number(projectItem.project_id) === activeProjectId
    );

    if (!project) {
      currentPage = (
        <ModulePlaceholderPage
          title="ไม่พบโครงการ"
          description="ไม่พบโครงการที่ต้องการเปิดหน้าฟอร์ม กรุณากลับไปเลือกโครงการใหม่อีกครั้ง"
          bullets={["ตรวจสอบว่าโครงการยังเปิดใช้งานอยู่", "กลับไปหน้ารายการโครงการ"]}
          breadcrumbs={["แอดมิน", "โครงการ", "ไม่พบข้อมูล"]}
          onLogout={() => navigate(PATH_LOGIN, { replace: true })}
          theme={theme}
          onToggleTheme={toggleTheme}
          navItems={adminNavItems}
          activePath={route.pathname}
          onNavigate={navigate}
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
        />
      );
    } else {
      const projectForms = formsWithProjectName.filter(
        (form) => Number(form.project_id) === activeProjectId
      );

      currentPage = (
        <AttendanceTemplatesPage
          project={project}
          templates={projectForms}
          onCreateTemplate={() =>
            navigate(`${PATH_FORM_EDITOR}?project=${project.project_id}`)
          }
          onEditTemplate={(templateId) =>
            navigate(
              `${PATH_FORM_EDITOR}?project=${project.project_id}&template=${templateId}`
            )
          }
          onOpenSubmissions={(templateId) =>
            navigate(`${PATH_SUBMISSIONS}?project=${project.project_id}&form=${templateId}`)
          }
          onOpenItems={(templateId) =>
            navigate(`${PATH_ITEMS}?project=${project.project_id}&form=${templateId}`)
          }
          onOpenEmail={(templateId) =>
            navigate(`${PATH_EMAIL}?project=${project.project_id}&form=${templateId}`)
          }
          onBackToProjects={() => navigate(PATH_PROJECTS)}
          onLogout={() => navigate(PATH_LOGIN, { replace: true })}
          theme={theme}
          onToggleTheme={toggleTheme}
          navItems={adminNavItems}
          activePath={route.pathname}
          onNavigate={navigate}
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
        />
      );
    }
  }

  if (route.id === ROUTE_ID_FORM_EDITOR) {
    const selectedTemplateId = routeSearchParams.get("template");
    const projectFromQuery = Number(routeSearchParams.get("project"));
    const selectedTemplate = formsWithProjectName.find(
      (template) => String(template.form_id) === String(selectedTemplateId)
    );
    const selectedProjectId =
      projectFromQuery || Number(selectedTemplate?.project_id) || firstProjectId;

    currentPage = (
      <CreateAttendanceTemplatePage
        selectedTemplateId={selectedTemplateId}
        selectedProjectId={selectedProjectId}
        projectRecords={projectsWithLabel}
        editingTemplate={selectedTemplate}
        onLoadDraft={handleLoadFormDraft}
        onSaveForm={handleSaveForm}
        onBack={() =>
          selectedProjectId
            ? navigate(toProjectFormsPath(selectedProjectId))
            : navigate(PATH_PROJECTS)
        }
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
    );
  }

  if (route.id === ROUTE_ID_USERS) {
    currentPage = (
      <UsersAdminPage
        users={users}
        ssoAccounts={ssoAccounts}
        onUpdateUser={handleUpdateUser}
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
    );
  }

  if (route.id === ROUTE_ID_LOGIN_LOGS) {
    currentPage = (
      <LoginLogsPage
        logs={adminLoginLogs}
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
    );
  }

  if (route.id === ROUTE_ID_SCANNER_CLAIMS) {
    currentPage = (
      <ScannerClaimsPage
        scanResult={scanResult}
        onScanToken={handleScanToken}
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
    );
  }

  if (route.id === ROUTE_ID_SUBMISSIONS) {
    const filterProjectId = Number(routeSearchParams.get("project"));
    const filterFormId = routeSearchParams.get("form");

    currentPage = (
      <SubmissionsPage
        submissions={submissions}
        projects={projectsWithLabel}
        forms={formsWithProjectName}
        filterProjectId={filterProjectId || null}
        filterFormId={filterFormId || null}
        onChangeFilter={(projectId, formId) => {
          const query = new URLSearchParams();
          if (projectId) {
            query.set("project", String(projectId));
          }
          if (formId) {
            query.set("form", String(formId));
          }

          const queryString = query.toString();
          navigate(queryString ? `${PATH_SUBMISSIONS}?${queryString}` : PATH_SUBMISSIONS);
        }}
        onOpenSubmission={(submissionId) => navigate(`/admin/submissions/${submissionId}`)}
        onUpdateSubmission={handleUpdateSubmission}
        onCreateAdminSubmission={handleCreateAdminSubmission}
        onLoadFormDraft={handleLoadFormDraft}
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
    );
  }

  if (route.id === ROUTE_ID_SUBMISSION_DETAIL) {
    currentPage = (
      <SubmissionDetailPage
        submission={submissionDetail}
        onBack={() => navigate(PATH_SUBMISSIONS)}
        onUpdateSubmission={handleUpdateSubmission}
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
    );
  }

  if (route.id === ROUTE_ID_ITEMS || route.id === ROUTE_ID_CLAIMS) {
    currentPage = (
      <ItemsClaimsPage
        mode={route.id === ROUTE_ID_ITEMS ? "items" : "claims"}
        rows={route.id === ROUTE_ID_ITEMS ? items : claims}
        projects={projectsWithLabel}
        forms={formsWithProjectName}
        onUpdateClaimStatus={handleUpdateClaimStatus}
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
    );
  }

  if (route.id === ROUTE_ID_EMAIL) {
    currentPage = (
      <EmailCenterPage
        templates={emailTemplates}
        logs={emailLogs}
        projects={projectsWithLabel}
        forms={formsWithProjectName}
        onSaveTemplate={handleSaveEmailTemplate}
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
    );
  }

  if (route.id === ROUTE_ID_PUBLIC_FORM) {
    currentPage = (
      <PublicFormPage
        publicPath={route.params.publicPath}
        onLoadPublicForm={handleLoadPublicForm}
        onSubmitPublicForm={handleSubmitPublicForm}
        onNavigateSuccess={(result) => {
          const query = new URLSearchParams();
          query.set("code", result.submissionCode || "");
          query.set("title", result.successTitle || "");
          query.set("message", result.successMessage || "");
          navigate(`/forms/${route.params.publicPath}/success?${query.toString()}`);
        }}
        onGoLogin={() => navigate(PATH_LOGIN)}
      />
    );
  }

  if (route.id === ROUTE_ID_PUBLIC_FORM_SUCCESS) {
    currentPage = (
      <PublicFormSuccessPage
        publicPath={route.params.publicPath}
        submissionCode={routeSearchParams.get("code")}
        title={routeSearchParams.get("title")}
        message={routeSearchParams.get("message")}
        onFillAgain={() => navigate(`/forms/${route.params.publicPath}`)}
        onGoLogin={() => navigate(PATH_LOGIN)}
      />
    );
  }

  if (!currentPage) {
    currentPage = (
      <LoginPage
        onLogin={() => navigate(PATH_DASHBOARD)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (
    isBootstrapping &&
    route.id !== ROUTE_ID_LOGIN &&
    route.id !== ROUTE_ID_PUBLIC_FORM &&
    route.id !== ROUTE_ID_PUBLIC_FORM_SUCCESS
  ) {
    currentPage = (
      <ModulePlaceholderPage
        title="กำลังโหลดข้อมูลระบบ"
        description="ระบบกำลังเตรียมข้อมูลหน้าจอ กรุณารอสักครู่"
        bullets={[]}
        breadcrumbs={["แอดมิน", "Loading"]}
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
    );
  }

  if (
    bootstrapError &&
    route.id !== ROUTE_ID_LOGIN &&
    route.id !== ROUTE_ID_PUBLIC_FORM &&
    route.id !== ROUTE_ID_PUBLIC_FORM_SUCCESS
  ) {
    currentPage = (
      <ModulePlaceholderPage
        title="โหลดข้อมูลไม่สำเร็จ"
        description={`เกิดข้อผิดพลาด: ${bootstrapError}`}
        bullets={["ลองรีเฟรชหน้าอีกครั้ง", "ตรวจสอบ mock adapter/service"]}
        breadcrumbs={["แอดมิน", "Error"]}
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
    );
  }

  if (!canAccessCurrentRoute) {
    currentPage = (
      <ModulePlaceholderPage
        title="ไม่มีสิทธิ์เข้าถึงหน้านี้"
        description={`บทบาทปัจจุบัน: ${currentRole} ไม่สามารถเข้าถึงเส้นทาง ${route.pathname}`}
        bullets={[
          "เลือกบทบาทจากมุมขวาบนเพื่อทดสอบ permission matrix",
          "สำหรับใช้งานจริง ระบบจะอ่านบทบาทจาก session/auth token"
        ]}
        breadcrumbs={["แอดมิน", "Access Control"]}
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#2f6fed",
          borderRadius: 12,
          fontFamily: "Nunito, Anuphan, sans-serif"
        }
      }}
    >
      {currentPage}
    </ConfigProvider>
  );
}

export default App;
