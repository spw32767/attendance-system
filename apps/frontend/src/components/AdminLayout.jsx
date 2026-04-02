function AdminLayout({ breadcrumbs, onLogout, onBack, children }) {
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
                title="Back"
                aria-label="Back"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="question-action-icon">
                  <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.9" />
                </svg>
              </button>
            ) : null}
            <p className="admin-breadcrumb">{breadcrumbs.join(" / ")}</p>
          </div>
          <button className="text-button" type="button" onClick={onLogout}>
            Logout
          </button>
        </header>

        <section className="admin-content">{children}</section>
      </main>
    </div>
  );
}

export default AdminLayout;
