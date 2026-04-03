import AdminLayout from "../components/AdminLayout";

function AdminDashboardPage({
  onLogout,
  theme,
  onToggleTheme,
  navItems,
  activePath,
  onNavigate,
  currentRole,
  onRoleChange,
  quickLinks
}) {
  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", "แดชบอร์ด"]}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
      navItems={navItems}
      activePath={activePath}
      onNavigate={onNavigate}
      currentRole={currentRole}
      onRoleChange={onRoleChange}
    >
      <section className="templates-head">
        <h1>แดชบอร์ดการจัดการระบบ</h1>
      </section>

      <section className="dashboard-grid">
        {quickLinks.map((link) => (
          <article key={link.path} className="dashboard-card">
            <h2>{link.title}</h2>
            <p>{link.description}</p>
            <button
              className="ghost-button"
              type="button"
              onClick={() => onNavigate(link.path)}
            >
              {link.actionLabel}
            </button>
          </article>
        ))}
      </section>
    </AdminLayout>
  );
}

export default AdminDashboardPage;
