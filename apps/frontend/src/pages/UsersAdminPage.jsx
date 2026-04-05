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
        <h1>จัดการผู้ใช้งานและ SSO</h1>
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

      <section className="templates-card" style={{ marginTop: 12 }}>
        <div className="templates-table-wrap">
          {activeTab === "users" ? (
            <table className="templates-table table-first-col-left">
              <thead>
                <tr>
                  <th>ชื่อ</th>
                  <th>อีเมล</th>
                  <th>บทบาท</th>
                  <th>Login</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td>{user.display_name}</td>
                    <td>{user.email}</td>
                    <td>
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
                    <td>{user.login_method}</td>
                    <td>
                      <label className="toggle-switch-label">
                        <input
                          type="checkbox"
                          checked={user.is_active}
                          onChange={(event) =>
                            onUpdateUser(user.user_id, { is_active: event.target.checked })
                          }
                        />
                        <span className="toggle-switch-track">
                          <span className="toggle-switch-thumb" />
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="templates-table table-first-col-left">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Provider</th>
                  <th>Provider User ID</th>
                  <th>ผู้ใช้งาน</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {ssoAccounts.map((account) => (
                  <tr key={account.sso_account_id}>
                    <td>{account.email}</td>
                    <td>{account.provider_name}</td>
                    <td>{account.provider_user_id}</td>
                    <td>{usersById[account.user_id]?.display_name || account.display_name}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          account.is_active ? "status-pill-active" : "status-pill-inactive"
                        }`}
                      >
                        {account.is_active ? "active" : "inactive"}
                      </span>
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
