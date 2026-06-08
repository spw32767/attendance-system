import { useMemo, useState } from "react";
import { KeyRound, Plus } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button, Modal, PageHead } from "../components/ui";

const ROLE_OPTIONS = [
  { value: "super_admin", label: "super_admin" },
  { value: "admin", label: "admin" },
  { value: "staff", label: "staff" },
  { value: "scanner", label: "scanner" }
];

const BLANK_NEW_USER = {
  email: "",
  display_name: "",
  role_code: "admin",
  password: ""
};

function UsersAdminPage({
  users,
  ssoAccounts,
  onUpdateUser,
  onCreateUser,
  onResetUserPassword,
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState(BLANK_NEW_USER);
  const [createError, setCreateError] = useState("");
  const [createBusy, setCreateBusy] = useState(false);

  const [resetTarget, setResetTarget] = useState(null); // { user_id, email, display_name }
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetBusy, setResetBusy] = useState(false);

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

  const openCreate = () => {
    setCreateDraft(BLANK_NEW_USER);
    setCreateError("");
    setIsCreateOpen(true);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (createBusy) {
      return;
    }
    setCreateError("");
    setCreateBusy(true);
    try {
      await onCreateUser({
        email: createDraft.email.trim(),
        display_name: createDraft.display_name.trim(),
        role_code: createDraft.role_code,
        password: createDraft.password
      });
      setIsCreateOpen(false);
    } catch (err) {
      setCreateError(err?.message || "สร้างผู้ใช้งานไม่สำเร็จ");
    } finally {
      setCreateBusy(false);
    }
  };

  const openReset = (user) => {
    setResetTarget(user);
    setResetPassword("");
    setResetError("");
  };

  const handleReset = async (event) => {
    event.preventDefault();
    if (resetBusy || !resetTarget) {
      return;
    }
    setResetError("");
    setResetBusy(true);
    try {
      await onResetUserPassword(resetTarget.user_id, resetPassword);
      setResetTarget(null);
    } catch (err) {
      setResetError(err?.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ");
    } finally {
      setResetBusy(false);
    }
  };

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
      <PageHead
        title="จัดการผู้ใช้งานและ SSO"
        meta={`${users.length} ผู้ใช้งาน · ${activeUsersCount} ใช้งานได้ · ${activeSsoCount} SSO active`}
        actions={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={14} aria-hidden="true" />
            <span>เพิ่มผู้ใช้งาน</span>
          </Button>
        }
      />

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
                  <th className="table-col-actions">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td className="empty-row" colSpan={6}>
                      ยังไม่มีผู้ใช้งาน
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
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
                    <td className="table-col-actions">
                      <Button variant="ghost" size="sm" onClick={() => openReset(user)}>
                        <KeyRound size={13} strokeWidth={2} aria-hidden="true" />
                        <span>รีเซ็ตรหัสผ่าน</span>
                      </Button>
                    </td>
                  </tr>
                  ))
                )}
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
                {ssoAccounts.length === 0 ? (
                  <tr>
                    <td className="empty-row" colSpan={5}>
                      ยังไม่มีบัญชี SSO ที่เชื่อมต่อ
                    </td>
                  </tr>
                ) : (
                  ssoAccounts.map((account) => (
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
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <Modal
        open={isCreateOpen}
        onClose={() => (createBusy ? null : setIsCreateOpen(false))}
        title="เพิ่มผู้ใช้งาน"
        description="กรอกข้อมูลเพื่อสร้างบัญชีใหม่ ระบบจะตั้งรหัสผ่านเริ่มต้นให้ตามที่คุณกำหนด"
        size="md"
        closeOnBackdrop={!createBusy}
      >
        <form onSubmit={handleCreate} className="auth-form">
          <label className="auth-form-field">
            <span>อีเมล</span>
            <input
              className="input-control"
              type="email"
              value={createDraft.email}
              onChange={(event) => setCreateDraft({ ...createDraft, email: event.target.value })}
              autoComplete="off"
              required
              disabled={createBusy}
            />
          </label>
          <label className="auth-form-field">
            <span>ชื่อแสดง</span>
            <input
              className="input-control"
              value={createDraft.display_name}
              onChange={(event) =>
                setCreateDraft({ ...createDraft, display_name: event.target.value })
              }
              required
              disabled={createBusy}
            />
          </label>
          <label className="auth-form-field">
            <span>บทบาท</span>
            <select
              className="select-control"
              value={createDraft.role_code}
              onChange={(event) =>
                setCreateDraft({ ...createDraft, role_code: event.target.value })
              }
              disabled={createBusy}
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          <label className="auth-form-field">
            <span>รหัสผ่านเริ่มต้น (อย่างน้อย 8 ตัวอักษร)</span>
            <input
              className="input-control"
              type="password"
              value={createDraft.password}
              onChange={(event) => setCreateDraft({ ...createDraft, password: event.target.value })}
              minLength={8}
              required
              disabled={createBusy}
            />
          </label>
          {createError ? <p className="login-form-error">{createError}</p> : null}
          <div className="auth-form-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateOpen(false)}
              disabled={createBusy}
            >
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary" loading={createBusy} disabled={createBusy}>
              สร้างผู้ใช้งาน
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(resetTarget)}
        onClose={() => (resetBusy ? null : setResetTarget(null))}
        title="รีเซ็ตรหัสผ่าน"
        description={resetTarget ? `${resetTarget.display_name} (${resetTarget.email})` : ""}
        size="sm"
        closeOnBackdrop={!resetBusy}
      >
        <form onSubmit={handleReset} className="auth-form">
          <p className="auth-form-hint">
            ผู้ใช้งานจะถูกบังคับให้ออกจากระบบทุกอุปกรณ์ และต้องเข้าสู่ระบบใหม่ด้วยรหัสผ่านที่คุณตั้ง
          </p>
          <label className="auth-form-field">
            <span>รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)</span>
            <input
              className="input-control"
              type="password"
              value={resetPassword}
              onChange={(event) => setResetPassword(event.target.value)}
              minLength={8}
              required
              disabled={resetBusy}
              autoFocus
            />
          </label>
          {resetError ? <p className="login-form-error">{resetError}</p> : null}
          <div className="auth-form-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setResetTarget(null)}
              disabled={resetBusy}
            >
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary" loading={resetBusy} disabled={resetBusy}>
              รีเซ็ตรหัสผ่าน
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

export default UsersAdminPage;
