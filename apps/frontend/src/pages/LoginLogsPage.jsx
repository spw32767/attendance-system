import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { PageHead, TableEmpty } from "../components/ui";

const PAGE_SIZE = 15;

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
  const [page, setPage] = useState(1);

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

  const totalRows = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const normalizedPage = Math.min(page, totalPages);
  const startIndex = (normalizedPage - 1) * PAGE_SIZE;
  const pagedLogs = filteredLogs.slice(startIndex, startIndex + PAGE_SIZE);
  const showingStart = totalRows === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(startIndex + PAGE_SIZE, totalRows);

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
      <PageHead
        title="ประวัติการเข้าสู่ระบบ"
        meta={`${logs.length} เหตุการณ์ · ${successLogs} สำเร็จ · ${logs.length - successLogs} ถูกปฏิเสธ`}
      />

      <section className="templates-card">
        <div className="templates-search-row">
          <div className="search-input-wrapper">
            <Search size={16} strokeWidth={2} className="search-input-icon" />
            <input
              className="input-control templates-search search-with-icon"
              value={searchText}
              placeholder="ค้นหาอีเมล, สถานะ, IP"
              onChange={(event) => {
                setSearchText(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <p className="templates-search-meta">แสดง {filteredLogs.length} รายการจากทั้งหมด {logs.length}</p>
        </div>

        <div className="templates-table-wrap">
          <table className="templates-table table-first-col-left table-cards">
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
              {totalRows === 0 ? (
                <TableEmpty
                  colSpan={6}
                  icon={<ShieldCheck size={20} aria-hidden="true" />}
                  title={searchText.trim() ? "ไม่พบรายการที่ตรงกับคำค้นหา" : "ยังไม่มีประวัติการเข้าใช้งาน"}
                  description={
                    searchText.trim()
                      ? "ลองปรับคำค้นหา"
                      : "เมื่อมีการเข้าสู่ระบบ ประวัติจะแสดงที่นี่"
                  }
                />
              ) : (
                pagedLogs.map((log) => (
                <tr key={log.login_log_id}>
                  <td className="table-col-date" data-label="เวลา">{new Date(log.logged_at).toLocaleString("th-TH")}</td>
                  <td className="table-col-meta" data-label="Email">{log.email}</td>
                  <td className="table-col-secondary" data-label="Method">{log.login_method}</td>
                  <td className="table-col-status" data-label="Status">
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
                  <td className="table-col-meta" data-label="Reject Reason">{log.reject_reason || "-"}</td>
                  <td className="table-col-primary table-col-left" data-label="IP / UA">
                    <div className="table-primary-cell">
                      <p>{log.ip_address}</p>
                      <small>{log.user_agent}</small>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="templates-footer">
          <p>
            แสดง {showingStart} ถึง {showingEnd} จากทั้งหมด {totalRows} รายการ
          </p>

          <div className="pagination-actions">
            <button
              className="ghost-button icon-text-button"
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={normalizedPage <= 1}
            >
              <ChevronLeft size={15} strokeWidth={2} />
              <span>ก่อนหน้า</span>
            </button>
            <span className="pagination-current">{normalizedPage}</span>
            <button
              className="ghost-button icon-text-button"
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={normalizedPage >= totalPages}
            >
              <span>ถัดไป</span>
              <ChevronRight size={15} strokeWidth={2} />
            </button>
          </div>
        </footer>
      </section>
    </AdminLayout>
  );
}

export default LoginLogsPage;
