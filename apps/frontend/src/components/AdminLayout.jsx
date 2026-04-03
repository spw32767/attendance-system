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
  return (
    <div className="admin-shell">
      <div className="admin-aurora admin-aurora-left" />
      <div className="admin-aurora admin-aurora-right" />

      <main className="admin-frame page-enter">
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

        {navItems?.length ? (
          <nav className="admin-nav-strip" aria-label="เมนูหลังบ้าน">
            {navItems.map((item) => {
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
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        ) : null}

        <section className="admin-content">{children}</section>
      </main>
    </div>
  );
}

export default AdminLayout;
