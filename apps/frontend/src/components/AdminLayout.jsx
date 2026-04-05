import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  ClipboardList,
  Package,
  CheckSquare,
  ScanLine,
  Mail,
  Users,
  Clock,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Sun,
  Moon,
  Circle
} from "lucide-react";

const NAV_ICON_MAP = {
  dashboard: LayoutDashboard,
  projects: Briefcase,
  forms: FileText,
  submissions: ClipboardList,
  items: Package,
  claims: CheckSquare,
  scanner: ScanLine,
  email: Mail,
  users: Users,
  logs: Clock
};

function AdminLayout({
  breadcrumbs,
  onLogout,
  onBack,
  theme,
  onToggleTheme,
  navItems,
  activePath,
  onNavigate,
  currentRole,
  onRoleChange,
  children
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = window.localStorage.getItem("attendance-sidebar-collapsed");
    return saved === "1";
  });

  useEffect(() => {
    window.localStorage.setItem(
      "attendance-sidebar-collapsed",
      isSidebarCollapsed ? "1" : "0"
    );
  }, [isSidebarCollapsed]);

  const groupedNavItems = (navItems || []).reduce((groups, item) => {
    const groupName = item.group || "เมนู";
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(item);
    return groups;
  }, {});

  return (
    <div className="admin-shell">
      <div className="admin-aurora admin-aurora-left" />
      <div className="admin-aurora admin-aurora-right" />

      <main className="admin-frame">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            {onBack ? (
              <button
                className="icon-only-button icon-neutral-button admin-back-button"
                type="button"
                onClick={onBack}
                title="ย้อนกลับ"
                aria-label="ย้อนกลับ"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
            ) : null}
            <nav className="admin-breadcrumb" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="admin-breadcrumb-item">
                  {index > 0 ? (
                    <span className="admin-breadcrumb-sep">/</span>
                  ) : null}
                  <span>{crumb}</span>
                </span>
              ))}
            </nav>
          </div>
          <div className="admin-topbar-actions">
            {/* Theme toggle switch */}
            <button
              className="theme-toggle-switch"
              type="button"
              onClick={onToggleTheme}
              aria-pressed={theme === "dark"}
              title={theme === "dark" ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
            >
              <Sun
                size={15}
                className={`theme-toggle-icon theme-icon-sun${
                  theme === "light" ? " theme-icon-active" : ""
                }`}
              />
              <span className="theme-toggle-track">
                <span className="theme-toggle-thumb" />
              </span>
              <Moon
                size={15}
                className={`theme-toggle-icon theme-icon-moon${
                  theme === "dark" ? " theme-icon-active" : ""
                }`}
              />
            </button>

            {/* Logout icon button */}
            <button
              className="icon-only-button icon-neutral-button topbar-logout-button"
              type="button"
              onClick={onLogout}
              title="ออกจากระบบ"
              aria-label="ออกจากระบบ"
            >
              <LogOut size={17} strokeWidth={2} />
            </button>

            {onRoleChange ? (
              <select
                className="select-control role-select"
                value={currentRole || "admin"}
                onChange={(event) => onRoleChange(event.target.value)}
              >
                <option value="admin">admin</option>
                <option value="staff">staff</option>
                <option value="scanner">scanner</option>
              </select>
            ) : null}
          </div>
        </header>

        <div
          className={`admin-body${
            isSidebarCollapsed ? " admin-body-sidebar-collapsed" : ""
          }`}
        >
          {navItems?.length ? (
            <aside className="admin-sidebar" aria-label="เมนูหลังบ้าน">
              <div className="admin-sidebar-header">
                <p className="admin-sidebar-title">Navigation</p>
                <button
                  className="icon-only-button icon-neutral-button sidebar-collapse-button"
                  type="button"
                  onClick={() => setIsSidebarCollapsed((current) => !current)}
                  aria-label={isSidebarCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
                  title={isSidebarCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
                >
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen size={16} strokeWidth={1.8} />
                  ) : (
                    <PanelLeftClose size={16} strokeWidth={1.8} />
                  )}
                </button>
              </div>

              <nav className="admin-sidebar-nav">
                {Object.entries(groupedNavItems).map(([groupName, items]) => (
                  <section className="admin-nav-group" key={groupName}>
                    {!isSidebarCollapsed ? (
                      <p className="admin-nav-group-title">{groupName}</p>
                    ) : null}
                    {items.map((item) => {
                      const isActive =
                        item.isActive ??
                        (item.matchPaths?.includes(activePath) ||
                          item.matchPrefixes?.some((prefix) => activePath?.startsWith(prefix)) ||
                          item.path === activePath);

                      const IconComponent = NAV_ICON_MAP[item.icon] || Circle;

                      return (
                        <button
                          key={item.path}
                          className={`admin-nav-button${isActive ? " admin-nav-button-active" : ""}`}
                          type="button"
                          onClick={() => onNavigate?.(item.path)}
                          title={item.label}
                          data-label={item.label}
                        >
                          <span className="admin-nav-button-icon">
                            <IconComponent
                              size={15}
                              strokeWidth={isActive ? 2.2 : 1.8}
                            />
                          </span>
                          <span className="admin-nav-button-label">{item.label}</span>
                        </button>
                      );
                    })}
                  </section>
                ))}
              </nav>
            </aside>
          ) : null}

          <section className="admin-content">{children}</section>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
