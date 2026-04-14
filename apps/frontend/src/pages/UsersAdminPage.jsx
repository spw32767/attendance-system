import { useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";

const ROLE_OPTIONS = [
  { value: "admin", label: "admin" },
  { value: "staff", label: "staff" },
  { value: "scanner", label: "scanner" }
];

function UsersAdminPage({
  users,
  ssoAccounts,
  onUpdateUser,
  onLogout,
  theme,
  onToggleTheme,
  navItems,
  activePath,
  onNavigate,
  currentRole,
  onRoleChange
}) {
  const [activeTab, setActiveTab] = useState("users");

  const usersById = useMemo(
    () =>
      users.reduce((lookup, user) => {
        lookup[user.user_id] = user;
        return lookup;
      }, {}),
    [users]
  );

  const activeUsersCount = useMemo(
    () => users.filter((user) => user.is_active).length,
    [users]
  );

  const activeSsoCount = useMemo(
    () => ssoAccounts.filter((account) => account.is_active).length,
    [ssoAccounts]
  );

  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", "ผู้ใช้งาน"]}
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
          <p className="page-kicker">Access</p>
          <h1>จัดการผู้ใช้งานและ SSO</h1>
          <p className="page-summary">
            ปรับสิทธิ์ผู้ใช้ภายในระบบ พร้อมตรวจสอบบัญชีเชื่อมต่อ SSO ใน workflow เดียวกัน
          </p>
          <div className="page-stats">
            <div className="page-stat">
              <strong>{users.length}</strong>
              <span>ผู้ใช้งานทั้งหมด</span>
            </div>
            <div className="page-stat">
              <strong>{activeUsersCount}</strong>
              <span>บัญชีที่ใช้งานได้</span>
            </div>
            <div className="page-stat">
              <strong>{activeSsoCount}</strong>
              <span>SSO ที่ active</span>
            </div>
          </div>
        </div>
      </section>

      <nav className="builder-tabs" aria-label="แท็บผู้ใช้งาน">
        <button
          className={`builder-tab-button${activeTab === "users" ? " builder-tab-button-active" : ""}`}
          type="button"
          onClick={() => setActiveTab("users")}
        >
          ผู้ใช้งาน
        </button>
        <button
          className={`builder-tab-button${activeTab === "sso" ? " builder-tab-button-active" : ""}`}
          type="button"
          onClick={() => setActiveTab("sso")}
        >
          SSO Accounts
        </button>
      </nav>

      <section className="templates-card section-stack-gap-sm">
        <div className="templates-table-wrap">
          {activeTab === "users" ? (
            <table className="templates-table table-first-col-left">
              <thead>
                <tr>
                  <th className="table-col-primary table-col-left">ชื่อ</th>
                  <th className="table-col-meta">อีเมล</th>
                  <th className="table-col-secondary">บทบาท</th>
                  <th className="table-col-secondary">Login</th>
                  <th className="table-col-status">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td className="table-col-primary table-col-left">
                      <div className="table-primary-cell">
                        <p>{user.display_name}</p>
                        <small>{user.user_id}</small>
                      </div>
                    </td>
                    <td className="table-col-meta">{user.email}</td>
                    <td className="table-col-secondary">
                      <select
                        className="select-control"
                        value={user.role_code}
                        onChange={(event) =>
                          onUpdateUser(user.user_id, { role_code: event.target.value })
                        }
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="table-col-secondary">{user.login_method}</td>
                    <td className="table-col-status">
                      <div className="table-status-control">
                        <label className="toggle-switch-label table-status-switch">
                          <input
                            type="checkbox"
                            checked={user.is_active}
                            onChange={(event) =>
                              onUpdateUser(user.user_id, { is_active: event.target.checked })
                            }
                          />
                          <span
                            className="toggle-switch-track"
                            data-off-label="ปิด"
                            data-on-label="เปิด"
                          >
                            <span className="toggle-switch-thumb" />
                          </span>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="templates-table table-first-col-left">
              <thead>
                <tr>
                  <th className="table-col-meta">Email</th>
                  <th className="table-col-secondary">Provider</th>
                  <th className="table-col-meta">Provider User ID</th>
                  <th className="table-col-primary table-col-left">ผู้ใช้งาน</th>
                  <th className="table-col-status">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {ssoAccounts.map((account) => (
                  <tr key={account.sso_account_id}>
                    <td className="table-col-meta">{account.email}</td>
                    <td className="table-col-secondary">{account.provider_name}</td>
                    <td className="table-col-meta">{account.provider_user_id}</td>
                    <td className="table-col-primary table-col-left">
                      <div className="table-primary-cell">
                        <p>{usersById[account.user_id]?.display_name || account.display_name}</p>
                        <small>{account.provider_name}</small>
                      </div>
                    </td>
                    <td className="table-col-status">
                      <div className="table-status-readout">
                        <span
                          className={`status-pill ${
                            account.is_active ? "status-pill-active" : "status-pill-inactive"
                          }`}
                        >
                          {account.is_active ? "active" : "inactive"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}

export default UsersAdminPage;
