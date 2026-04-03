import { useEffect, useMemo, useState } from "react";
import { ConfigProvider } from "antd";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AttendanceTemplatesPage from "./pages/AttendanceTemplatesPage";
import CreateAttendanceTemplatePage from "./pages/CreateAttendanceTemplatePage";
import EmailCenterPage from "./pages/EmailCenterPage";
import ItemsClaimsPage from "./pages/ItemsClaimsPage";
import LoginPage from "./pages/LoginPage";
import ModulePlaceholderPage from "./pages/ModulePlaceholderPage";
import ProjectEditorPage from "./pages/ProjectEditorPage";
import ProjectsPage from "./pages/ProjectsPage";
import PublicFormPlaceholderPage from "./pages/PublicFormPlaceholderPage";
import SubmissionDetailPage from "./pages/SubmissionDetailPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import { mockAdminService } from "./services/mockAdminService";

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

const MODULE_META = {
  [ROUTE_ID_SUBMISSIONS]: {
    title: "จัดการคำตอบแบบฟอร์ม",
    description:
      "หน้า UI นี้เตรียมไว้สำหรับดูคำตอบรายฟอร์ม, สถานะ attendance, เวลา check-in/check-out และไฟล์แนบ",
    breadcrumbs: ["แอดมิน", "คำตอบแบบฟอร์ม"],
    bullets: [
      "ลิสต์คำตอบตามโครงการและฟอร์ม",
      "ดูรายละเอียดคำตอบรายช่องแบบอ่านง่าย",
      "ปรับสถานะ attendance และบันทึกหมายเหตุ"
    ]
  },
  [ROUTE_ID_ITEMS]: {
    title: "จัดการรายการของ",
    description:
      "หน้า UI นี้เตรียมไว้สำหรับกำหนดรายการของ/สิทธิ์ที่ผูกกับแต่ละฟอร์มก่อนเปิดให้ผู้ใช้ส่งข้อมูล",
    breadcrumbs: ["แอดมิน", "รายการของ"],
    bullets: [
      "เพิ่ม/แก้ไขรายการของที่ผู้เข้าร่วมมีสิทธิ์รับ",
      "กำหนดประเภทและจำนวนที่ให้ต่อหนึ่งคำตอบ",
      "ตั้งค่าให้แสดงในอีเมลยืนยันหรือไม่"
    ]
  },
  [ROUTE_ID_CLAIMS]: {
    title: "ติดตามสิทธิ์รับของ",
    description:
      "หน้า UI นี้เตรียมไว้สำหรับติดตามสถานะสิทธิ์รับของจาก item claim token และผลการสแกนรับของ",
    breadcrumbs: ["แอดมิน", "สิทธิ์รับของ"],
    bullets: [
      "ดูสถานะ pending/received แยกรายการของ",
      "ค้นหาด้วย submission code หรือ claim token",
      "ตรวจย้อนหลังว่าใครเป็นผู้สแกนรับของ"
    ]
  },
  [ROUTE_ID_EMAIL]: {
    title: "ตั้งค่าอีเมลและบันทึกการส่ง",
    description:
      "หน้า UI นี้เตรียมไว้สำหรับตั้งค่าเทมเพลตอีเมลรายฟอร์มและตรวจสอบประวัติการส่ง",
    breadcrumbs: ["แอดมิน", "อีเมล"],
    bullets: [
      "แก้หัวข้อและเนื้อหาอีเมลยืนยันแบบฟอร์ม",
      "เปิด/ปิดการแนบสรุปรายการของและ QR",
      "ตรวจสถานะส่งอีเมล sent/failed"
    ]
  },
  [ROUTE_ID_USERS]: {
    title: "จัดการผู้ใช้งานภายใน",
    description:
      "หน้า UI นี้เตรียมไว้สำหรับจัดการบัญชีแอดมิน, staff, scanner และสิทธิ์การเข้าใช้งาน",
    breadcrumbs: ["แอดมิน", "ผู้ใช้งาน"],
    bullets: [
      "สร้าง/แก้ไขผู้ใช้งานภายในระบบ",
      "กำหนดบทบาทและสิทธิ์การเข้าถึง",
      "ตั้งค่าว่าอนุญาต local login หรือ SSO"
    ]
  },
  [ROUTE_ID_LOGIN_LOGS]: {
    title: "บันทึกประวัติการเข้าสู่ระบบ",
    description:
      "หน้า UI นี้เตรียมไว้สำหรับตรวจสอบ login logs ทั้งแบบสำเร็จและล้มเหลว เพื่อช่วย audit และ debug",
    breadcrumbs: ["แอดมิน", "ประวัติการเข้าสู่ระบบ"],
    bullets: [
      "ค้นหาด้วยอีเมล, วิธี login, สถานะ",
      "ดูเหตุผล reject กรณี SSO ไม่ผ่าน",
      "ตรวจสอบ IP และ User-Agent ย้อนหลัง"
    ]
  },
  [ROUTE_ID_SCANNER_CLAIMS]: {
    title: "หน้าสแกนรับของ",
    description:
      "หน้า UI นี้เตรียมไว้สำหรับสแกน QR token เพื่อยืนยันรับของตามสิทธิ์ และป้องกันสแกนซ้ำ",
    breadcrumbs: ["สแกนเนอร์", "สแกนรับของ"],
    bullets: [
      "รับ token จากกล้องหรือกรอกเอง",
      "แสดงผล pending/received/not found ทันที",
      "รองรับการใช้งานซ้ำแบบ idempotent"
    ]
  }
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
    const bootstrap = async () => {
      const [
        loadedProjects,
        loadedForms,
        loadedSubmissions,
        loadedItems,
        loadedClaims,
        loadedEmailTemplates,
        loadedEmailLogs
      ] = await Promise.all([
        mockAdminService.listProjects(),
        mockAdminService.listForms(),
        mockAdminService.listSubmissions(),
        mockAdminService.listItems(),
        mockAdminService.listClaims(),
        mockAdminService.listEmailTemplates(),
        mockAdminService.listEmailLogs()
      ]);
      setProjects(loadedProjects);
      setForms(loadedForms);
      setSubmissions(loadedSubmissions);
      setItems(loadedItems);
      setClaims(loadedClaims);
      setEmailTemplates(loadedEmailTemplates);
      setEmailLogs(loadedEmailLogs);
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

    if (route.id === ROUTE_ID_CLAIMS || route.id === ROUTE_ID_SCANNER_CLAIMS) {
      return "claims";
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

  const adminNavItems = useMemo(
    () => [
      {
        path: PATH_DASHBOARD,
        label: "แดชบอร์ด",
        isActive: activeNavKey === "dashboard"
      },
      {
        path: PATH_PROJECTS,
        label: "โครงการ",
        isActive: activeNavKey === "projects"
      },
      {
        path: firstProjectFormsPath,
        label: "ฟอร์ม",
        isActive: activeNavKey === "forms"
      },
      {
        path: PATH_SUBMISSIONS,
        label: "คำตอบ",
        isActive: activeNavKey === "submissions"
      },
      {
        path: PATH_ITEMS,
        label: "รายการของ",
        isActive: activeNavKey === "items"
      },
      {
        path: PATH_CLAIMS,
        label: "สิทธิ์รับของ",
        isActive: activeNavKey === "claims"
      },
      {
        path: PATH_EMAIL,
        label: "อีเมล",
        isActive: activeNavKey === "email"
      },
      {
        path: PATH_USERS,
        label: "ผู้ใช้งาน",
        isActive: activeNavKey === "users"
      },
      {
        path: PATH_LOGIN_LOGS,
        label: "ประวัติเข้าใช้",
        isActive: activeNavKey === "login-logs"
      }
    ],
    [activeNavKey, firstProjectFormsPath]
  );

  const dashboardLinks = useMemo(
    () => [
      {
        title: "จัดการโครงการ",
        description: "สร้างโครงการหลัก และเป็นจุดเริ่มต้นก่อนสร้างฟอร์ม",
        actionLabel: "ไปหน้าโครงการ",
        path: PATH_PROJECTS
      },
      {
        title: "จัดการฟอร์ม",
        description: "ดูฟอร์มตามโครงการ แก้ไขคำถาม และตั้งค่าการใช้งาน",
        actionLabel: "ไปหน้าฟอร์ม",
        path: firstProjectFormsPath
      },
      {
        title: "คำตอบและการเข้าร่วม",
        description: "ดูคำตอบที่ส่งเข้ามาและตรวจสอบสถานะ attendance",
        actionLabel: "ไปหน้าคำตอบ",
        path: PATH_SUBMISSIONS
      },
      {
        title: "ของและสิทธิ์รับของ",
        description: "กำหนดรายการของ พร้อมติดตามสิทธิ์และสถานะการรับ",
        actionLabel: "ไปหน้าสิทธิ์รับของ",
        path: PATH_CLAIMS
      },
      {
        title: "อีเมลแจ้งเตือน",
        description: "ตั้งค่าเทมเพลตอีเมลและเช็กประวัติการส่ง",
        actionLabel: "ไปหน้าอีเมล",
        path: PATH_EMAIL
      },
      {
        title: "สแกนเนอร์รับของ",
        description: "หน้าสแกน QR token สำหรับยืนยันการรับของ",
        actionLabel: "ไปหน้าสแกน",
        path: PATH_SCANNER_CLAIMS
      }
    ],
    [firstProjectFormsPath]
  );

  const handleCreateProject = () => {
    navigate(PATH_PROJECT_CREATE);
  };

  const handleSaveProject = (draftProject) => {
    const save = async () => {
      if (route.id === ROUTE_ID_PROJECT_EDIT) {
        await mockAdminService.upsertProject(Number(route.params.projectId), draftProject);
      } else {
        await mockAdminService.upsertProject(null, draftProject);
      }

      const [
        nextProjects,
        nextForms,
        nextSubmissions,
        nextItems,
        nextClaims,
        nextEmailTemplates,
        nextEmailLogs
      ] = await Promise.all([
        mockAdminService.listProjects(),
        mockAdminService.listForms(),
        mockAdminService.listSubmissions(),
        mockAdminService.listItems(),
        mockAdminService.listClaims(),
        mockAdminService.listEmailTemplates(),
        mockAdminService.listEmailLogs()
      ]);

      setProjects(nextProjects);
      setForms(nextForms);
      setSubmissions(nextSubmissions);
      setItems(nextItems);
      setClaims(nextClaims);
      setEmailTemplates(nextEmailTemplates);
      setEmailLogs(nextEmailLogs);
      navigate(PATH_PROJECTS, { replace: true });
    };

    void save();
  };

  const handleLoadFormDraft = async (formId, projectId) =>
    mockAdminService.getFormDraft(formId, projectId);

  const handleSaveForm = async (formId, draft, targetStatus) => {
    const result = await mockAdminService.saveFormDraft(formId, draft, targetStatus);

    const [
      nextForms,
      nextSubmissions,
      nextItems,
      nextClaims,
      nextEmailTemplates,
      nextEmailLogs
    ] = await Promise.all([
      mockAdminService.listForms(),
      mockAdminService.listSubmissions(),
      mockAdminService.listItems(),
      mockAdminService.listClaims(),
      mockAdminService.listEmailTemplates(),
      mockAdminService.listEmailLogs()
    ]);

    setForms(nextForms);
    setSubmissions(nextSubmissions);
    setItems(nextItems);
    setClaims(nextClaims);
    setEmailTemplates(nextEmailTemplates);
    setEmailLogs(nextEmailLogs);

    return result;
  };

  const handleUpdateClaimStatus = async (claimId, receiveStatus) => {
    await mockAdminService.updateClaimStatus(claimId, receiveStatus);
    const [nextClaims] = await Promise.all([mockAdminService.listClaims()]);
    setClaims(nextClaims);
  };

  const handleSaveEmailTemplate = async (templateId, payload) => {
    await mockAdminService.updateEmailTemplate(templateId, payload);
    const [nextEmailTemplates] = await Promise.all([
      mockAdminService.listEmailTemplates()
    ]);
    setEmailTemplates(nextEmailTemplates);
  };

  useEffect(() => {
    if (route.id !== ROUTE_ID_SUBMISSION_DETAIL) {
      setSubmissionDetail(null);
      return;
    }

    const loadDetail = async () => {
      const detail = await mockAdminService.getSubmissionDetail(route.params.submissionId);
      setSubmissionDetail(detail);
    };

    void loadDetail();
  }, [route.id, route.params.submissionId, submissions]);

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
        quickLinks={dashboardLinks}
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
      />
    );
  }

  if (
    route.id === ROUTE_ID_USERS ||
    route.id === ROUTE_ID_LOGIN_LOGS ||
    route.id === ROUTE_ID_SCANNER_CLAIMS
  ) {
    const moduleMeta = MODULE_META[route.id];

    currentPage = (
      <ModulePlaceholderPage
        title={moduleMeta.title}
        description={moduleMeta.description}
        bullets={moduleMeta.bullets}
        breadcrumbs={moduleMeta.breadcrumbs}
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
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
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
      />
    );
  }

  if (route.id === ROUTE_ID_SUBMISSION_DETAIL) {
    currentPage = (
      <SubmissionDetailPage
        submission={submissionDetail}
        onBack={() => navigate(PATH_SUBMISSIONS)}
        onLogout={() => navigate(PATH_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
        navItems={adminNavItems}
        activePath={route.pathname}
        onNavigate={navigate}
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
      />
    );
  }

  if (route.id === ROUTE_ID_PUBLIC_FORM) {
    currentPage = (
      <PublicFormPlaceholderPage
        publicPath={route.params.publicPath}
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
