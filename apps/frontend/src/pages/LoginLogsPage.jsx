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

  const successLogs = useMemo(
    () => logs.filter((log) => log.login_status === "success").length,
    [logs]
  );

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
        <div className="page-head-body">
          <p className="page-kicker">Audit Trail</p>
          <h1>ประวัติการเข้าสู่ระบบ</h1>
          <p className="page-summary">
            ใช้ตรวจสอบการเข้าใช้งานย้อนหลังทั้งฝั่งผู้ใช้และแอดมิน พร้อมค้นหาสถานะและอุปกรณ์ที่ใช้ล็อกอิน
          </p>
          <div className="page-stats">
            <div className="page-stat">
              <strong>{logs.length}</strong>
              <span>เหตุการณ์ทั้งหมด</span>
            </div>
            <div className="page-stat">
              <strong>{successLogs}</strong>
              <span>เข้าสำเร็จ</span>
            </div>
            <div className="page-stat">
              <strong>{logs.length - successLogs}</strong>
              <span>ถูกปฏิเสธ</span>
            </div>
          </div>
        </div>
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
          <p className="templates-search-meta">แสดง {filteredLogs.length} รายการจากทั้งหมด {logs.length}</p>
        </div>

        <div className="templates-table-wrap">
          <table className="templates-table table-first-col-left">
            <thead>
              <tr>
                <th className="table-col-date">เวลา</th>
                <th className="table-col-meta">Email</th>
                <th className="table-col-secondary">Method</th>
                <th className="table-col-status">Status</th>
                <th className="table-col-meta">Reject Reason</th>
                <th className="table-col-primary table-col-left">IP / UA</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.login_log_id}>
                  <td className="table-col-date">{new Date(log.logged_at).toLocaleString("th-TH")}</td>
                  <td className="table-col-meta">{log.email}</td>
                  <td className="table-col-secondary">{log.login_method}</td>
                  <td className="table-col-status">
                    <div className="table-status-readout">
                      <span
                        className={`status-pill ${
                          log.login_status === "success"
                            ? "status-pill-active"
                            : "status-pill-inactive"
                        }`}
                      >
                        {log.login_status}
                      </span>
                    </div>
                  </td>
                  <td className="table-col-meta">{log.reject_reason || "-"}</td>
                  <td className="table-col-primary table-col-left">
                    <div className="table-primary-cell">
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
