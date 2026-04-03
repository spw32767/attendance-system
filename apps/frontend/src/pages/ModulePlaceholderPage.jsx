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
  onNavigate
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
    >
      <section className="templates-head">
        <h1>{title}</h1>
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
