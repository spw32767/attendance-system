import { useEffect, useMemo, useState } from "react";
import { ConfigProvider } from "antd";
import AttendanceTemplatesPage from "./pages/AttendanceTemplatesPage";
import CreateAttendanceTemplatePage from "./pages/CreateAttendanceTemplatePage";
import LoginPage from "./pages/LoginPage";

const ROUTE_LOGIN = "/login";
const ROUTE_TEMPLATES = "/admin/templates";
const ROUTE_CREATE_TEMPLATE = "/admin/templates/create";
const THEME_STORAGE_KEY = "attendance-theme";

const normalizePathname = (pathname) => {
  if (!pathname || pathname === "/") {
    return ROUTE_LOGIN;
  }

  if (pathname.startsWith(ROUTE_CREATE_TEMPLATE)) {
    return ROUTE_CREATE_TEMPLATE;
  }

  if (pathname.startsWith(ROUTE_TEMPLATES)) {
    return ROUTE_TEMPLATES;
  }

  if (pathname.startsWith(ROUTE_LOGIN)) {
    return ROUTE_LOGIN;
  }

  return ROUTE_LOGIN;
};

const parseRoute = (target) => {
  const url = new URL(target, window.location.origin);
  return {
    pathname: normalizePathname(url.pathname),
    search: url.search
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

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  const navigate = (target, options = {}) => {
    const nextRoute = parseRoute(target);
    const nextUrl = `${nextRoute.pathname}${nextRoute.search}`;
    const method = options.replace ? "replaceState" : "pushState";

    window.history[method]({}, "", nextUrl);
    setRoute(nextRoute);
  };

  const routeSearchParams = useMemo(
    () => new URLSearchParams(route.search),
    [route.search]
  );

  let currentPage = null;

  if (route.pathname === ROUTE_LOGIN) {
    currentPage = (
      <LoginPage
        onLogin={() => navigate(ROUTE_TEMPLATES)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (route.pathname === ROUTE_TEMPLATES) {
    currentPage = (
      <AttendanceTemplatesPage
        onCreateTemplate={() => navigate(ROUTE_CREATE_TEMPLATE)}
        onEditTemplate={(templateId) =>
          navigate(`${ROUTE_CREATE_TEMPLATE}?template=${templateId}`)
        }
        onLogout={() => navigate(ROUTE_LOGIN, { replace: true })}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (route.pathname === ROUTE_CREATE_TEMPLATE) {
    currentPage = (
      <CreateAttendanceTemplatePage
        selectedTemplateId={routeSearchParams.get("template")}
        onBack={() => navigate(ROUTE_TEMPLATES)}
        onLogout={() => navigate(ROUTE_LOGIN, { replace: true })}
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
