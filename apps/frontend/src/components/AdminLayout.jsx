import { useEffect, useState } from "react";

const NavIcon = ({ icon, active }) => {
  if (active) {
    if (icon === "dashboard") {
      return (
        <svg viewBox="0 0 24 24" className="admin-nav-svg" aria-hidden="true">
          <rect x="3" y="3" width="8" height="8" rx="1.6" fill="currentColor" />
          <rect x="13" y="3" width="8" height="5" rx="1.4" fill="currentColor" />
          <rect x="13" y="10" width="8" height="11" rx="1.6" fill="currentColor" />
          <rect x="3" y="13" width="8" height="8" rx="1.6" fill="currentColor" />
        </svg>
      );
    }

    if (icon === "projects") {
      return (
        <svg viewBox="0 0 24 24" className="admin-nav-svg" aria-hidden="true">
          <path
            d="M3 8.2A2.2 2.2 0 0 1 5.2 6h13.6A2.2 2.2 0 0 1 21 8.2v9.6a2.2 2.2 0 0 1-2.2 2.2H5.2A2.2 2.2 0 0 1 3 17.8V8.2z"
            fill="currentColor"
          />
          <rect x="8" y="3.2" width="8" height="2.4" rx="1" fill="currentColor" opacity="0.8" />
        </svg>
      );
    }

    if (icon === "forms") {
      return (
        <svg viewBox="0 0 24 24" className="admin-nav-svg" aria-hidden="true">
          <rect x="4" y="3" width="16" height="18" rx="2" fill="currentColor" />
          <rect x="7" y="6" width="10" height="1.6" rx="0.8" fill="white" opacity="0.95" />
          <rect x="7" y="10.5" width="10" height="1.6" rx="0.8" fill="white" opacity="0.95" />
          <rect x="7" y="15" width="6.6" height="1.6" rx="0.8" fill="white" opacity="0.95" />
        </svg>
      );
    }

    if (icon === "submissions") {
      return (
        <svg viewBox="0 0 24 24" className="admin-nav-svg" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" />
          <circle cx="7.2" cy="8" r="1" fill="white" />
          <circle cx="7.2" cy="12" r="1" fill="white" />
          <circle cx="7.2" cy="16" r="1" fill="white" />
          <rect x="9" y="7.2" width="7.8" height="1.4" rx="0.7" fill="white" />
          <rect x="9" y="11.2" width="7.8" height="1.4" rx="0.7" fill="white" />
          <rect x="9" y="15.2" width="5" height="1.4" rx="0.7" fill="white" />
        </svg>
      );
    }

    if (icon === "items") {
      return (
        <svg viewBox="0 0 24 24" className="admin-nav-svg" aria-hidden="true">
          <rect x="3" y="7" width="18" height="13" rx="2" fill="currentColor" />
          <rect x="11.3" y="7" width="1.4" height="13" fill="white" opacity="0.96" />
          <rect x="8" y="3" width="8" height="3" rx="1.2" fill="currentColor" opacity="0.85" />
        </svg>
      );
    }

    if (icon === "claims") {
      return (
        <svg viewBox="0 0 24 24" className="admin-nav-svg" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" />
          <path d="M7.1 12.2l3.1 3.2 6.8-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    if (icon === "scanner") {
      return (
        <svg viewBox="0 0 24 24" className="admin-nav-svg" aria-hidden="true">
          <path d="M4 7V4h3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 7V4h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 17v3h3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 17v3h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <rect x="7" y="10.5" width="10" height="3" rx="1.2" fill="currentColor" />
        </svg>
      );
    }

    if (icon === "email") {
      return (
        <svg viewBox="0 0 24 24" className="admin-nav-svg" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor" />
          <path d="M3 7l9 7 9-7" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    if (icon === "users") {
      return (
        <svg viewBox="0 0 24 24" className="admin-nav-svg" aria-hidden="true">
          <circle cx="9" cy="8" r="3" fill="currentColor" />
          <path d="M3.8 18c1.2-2.3 3.3-3.4 5.2-3.4s4 .9 5.2 3.4" fill="currentColor" />
          <circle cx="17" cy="9" r="2" fill="currentColor" opacity="0.85" />
        </svg>
      );
    }

    if (icon === "logs") {
      return (
        <svg viewBox="0 0 24 24" className="admin-nav-svg" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="currentColor" />
          <path d="M12 7v5l3 2" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
  }

  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "admin-nav-svg"
  };

  if (icon === "dashboard") {
    return (
      <svg {...commonProps}>
        <rect x="3" y="3" width="8" height="8" />
        <rect x="13" y="3" width="8" height="5" />
        <rect x="13" y="10" width="8" height="11" />
        <rect x="3" y="13" width="8" height="8" />
      </svg>
    );
  }

  if (icon === "projects") {
    return (
      <svg {...commonProps}>
        <path d="M3 8h18" />
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M8 5V3h8v2" />
      </svg>
    );
  }

  if (icon === "forms") {
    return (
      <svg {...commonProps}>
        <path d="M7 5h10" />
        <path d="M7 10h10" />
        <path d="M7 15h6" />
        <rect x="4" y="3" width="16" height="18" rx="2" />
      </svg>
    );
  }

  if (icon === "submissions") {
    return (
      <svg {...commonProps}>
        <path d="M8 7h10" />
        <path d="M8 12h10" />
        <path d="M8 17h6" />
        <path d="M5 7h.01" />
        <path d="M5 12h.01" />
        <path d="M5 17h.01" />
      </svg>
    );
  }

  if (icon === "items") {
    return (
      <svg {...commonProps}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M12 7v13" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    );
  }

  if (icon === "claims") {
    return (
      <svg {...commonProps}>
        <path d="M4 12l5 5 11-11" />
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    );
  }

  if (icon === "scanner") {
    return (
      <svg {...commonProps}>
        <path d="M4 7V4h3" />
        <path d="M20 7V4h-3" />
        <path d="M4 17v3h3" />
        <path d="M20 17v3h-3" />
        <path d="M7 12h10" />
      </svg>
    );
  }

  if (icon === "email") {
    return (
      <svg {...commonProps}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 7 9-7" />
      </svg>
    );
  }

  if (icon === "users") {
    return (
      <svg {...commonProps}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 18c1.8-3 8.2-3 10 0" />
        <circle cx="17" cy="9" r="2" />
        <path d="M14.5 17c1-.9 2.8-1.3 4.5-1" />
      </svg>
    );
  }

  if (icon === "logs") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
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
                <svg viewBox="0 0 24 24" aria-hidden="true" className="question-action-icon">
                  <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.9" />
                </svg>
              </button>
            ) : null}
            <p className="admin-breadcrumb">{breadcrumbs.join(" / ")}</p>
          </div>
          <div className="admin-topbar-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={onToggleTheme}
              aria-pressed={theme === "dark"}
            >
              <span className="theme-toggle-label">ธีม</span>
              <span className="theme-toggle-value">
                {theme === "dark" ? "มืด" : "สว่าง"}
              </span>
            </button>
            <button className="text-button" type="button" onClick={onLogout}>
              ออกจากระบบ
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
                  <svg viewBox="0 0 24 24" className="admin-nav-svg" aria-hidden="true">
                    <path
                      d={isSidebarCollapsed ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
                            <NavIcon icon={item.icon} active={isActive} />
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
