import AdminLayout from "../components/AdminLayout";

function ModulePlaceholderPage({
  title,
  description,
  bullets,
  breadcrumbs,
  onLogout,
  theme,
  onToggleTheme,
  navItems,
  activePath,
  onNavigate,
  currentRole,
  onRoleChange
}) {
  return (
    <AdminLayout
      breadcrumbs={breadcrumbs}
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
        <div className="page-head-body">
          <p className="page-kicker">System State</p>
          <h1>{title}</h1>
          <p className="page-summary">สถานะระบบหรือหน้าจอนี้ยังต้องการการดำเนินการเพิ่มเติมก่อนจะพร้อมใช้งานเต็มรูปแบบ</p>
        </div>
      </section>

      <section className="module-placeholder-card">
        <p>{description}</p>
        {bullets.length ? (
          <ul>
            {bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        ) : null}
      </section>
    </AdminLayout>
  );
}

export default ModulePlaceholderPage;
