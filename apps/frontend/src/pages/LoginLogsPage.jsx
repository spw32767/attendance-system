import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AdminLayout from "../components/AdminLayout";

function LoginLogsPage({
  logs,
  onLogout,
  theme,
  onToggleTheme,
  navItems,
  activePath,
  onNavigate,
  currentRole,
  onRoleChange
}) {
  const [searchText, setSearchText] = useState("");

  const filteredLogs = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) {
      return logs;
    }

    return logs.filter((log) =>
      [
        log.email,
        log.login_method,
        log.login_status,
        log.reject_reason,
        log.ip_address,
        log.user_agent
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [logs, searchText]);

  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", "ประวัติการเข้าสู่ระบบ"]}
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
        <h1>ประวัติการเข้าสู่ระบบ</h1>
      </section>

      <section className="templates-card">
        <div className="templates-search-row">
          <div className="search-input-wrapper">
            <Search size={16} strokeWidth={2} className="search-input-icon" />
            <input
              className="input-control templates-search search-with-icon"
              value={searchText}
              placeholder="ค้นหาอีเมล, สถานะ, IP"
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>
        </div>

        <div className="templates-table-wrap">
          <table className="templates-table table-first-col-left">
            <thead>
              <tr>
                <th>เวลา</th>
                <th>Email</th>
                <th>Method</th>
                <th>Status</th>
                <th>Reject Reason</th>
                <th>IP / UA</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.login_log_id}>
                  <td>{new Date(log.logged_at).toLocaleString("th-TH")}</td>
                  <td>{log.email}</td>
                  <td>{log.login_method}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        log.login_status === "success"
                          ? "status-pill-active"
                          : "status-pill-inactive"
                      }`}
                    >
                      {log.login_status}
                    </span>
                  </td>
                  <td>{log.reject_reason || "-"}</td>
                  <td>
                    <div className="project-title-cell">
                      <p>{log.ip_address}</p>
                      <small>{log.user_agent}</small>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}

export default LoginLogsPage;
