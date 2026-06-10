import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  ClipboardList,
  UserPlus,
  Package,
  CheckSquare,
  ScanLine,
  Mail,
  Users,
  Clock,
  ChevronLeft,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  KeyRound,
  Sun,
  Moon,
  Menu,
  X,
  Circle
} from "lucide-react";
import { Button, Modal } from "./ui";
import { useSession } from "../contexts/SessionContext";

const NAV_ICON_MAP = {
  dashboard: LayoutDashboard,
  projects: Briefcase,
  forms: FileText,
  submissions: ClipboardList,
  preregister: UserPlus,
  items: Package,
  claims: CheckSquare,
  scanner: ScanLine,
  email: Mail,
  users: Users,
  logs: Clock
};

const ROLE_LABEL = {
  super_admin: "Super admin",
  admin: "Admin",
  staff: "Staff",
  scanner: "Scanner"
};

function AdminLayout({
  breadcrumbs,
  onLogout,
  onBack,
  theme,
  onToggleTheme,
  navItems,
  activePath,
  onNavigate,
  children
}) {
  const { sessionUser, onChangeOwnPassword } = useSession();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = window.localStorage.getItem("attendance-sidebar-collapsed");
    return saved === "1";
  });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [isChangePwOpen, setIsChangePwOpen] = useState(false);
  const [changePwDraft, setChangePwDraft] = useState({ current: "", next: "", confirm: "" });
  const [changePwError, setChangePwError] = useState("");
  const [changePwBusy, setChangePwBusy] = useState(false);
  const [changePwSuccess, setChangePwSuccess] = useState(false);

  useEffect(() => {
    if (!isUserMenuOpen) {
      return undefined;
    }
    const onDocClick = (event) => {
      if (!userMenuRef.current?.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    const onEsc = (event) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isUserMenuOpen]);

  const openChangePw = () => {
    setChangePwDraft({ current: "", next: "", confirm: "" });
    setChangePwError("");
    setChangePwSuccess(false);
    setIsChangePwOpen(true);
    setIsUserMenuOpen(false);
  };

  const submitChangePw = async (event) => {
    event.preventDefault();
    if (changePwBusy) {
      return;
    }
    if (changePwDraft.next.length < 8) {
      setChangePwError("รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (changePwDraft.next !== changePwDraft.confirm) {
      setChangePwError("ยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    setChangePwError("");
    setChangePwBusy(true);
    try {
      await onChangeOwnPassword(changePwDraft.current, changePwDraft.next);
      setChangePwSuccess(true);
      setChangePwDraft({ current: "", next: "", confirm: "" });
    } catch (err) {
      setChangePwError(err?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    } finally {
      setChangePwBusy(false);
    }
  };

  useEffect(() => {
    window.localStorage.setItem(
      "attendance-sidebar-collapsed",
      isSidebarCollapsed ? "1" : "0"
    );
  }, [isSidebarCollapsed]);

  // Close the mobile drawer whenever the active page changes (so tapping a
  // nav item navigates AND collapses the drawer in one gesture).
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [activePath]);

  // While the drawer is open, lock background scroll and close on ESC.
  useEffect(() => {
    if (!isMobileNavOpen) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (event) => {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onEsc);
    };
  }, [isMobileNavOpen]);

  const groupedNavItems = (navItems || []).reduce((groups, item) => {
    const groupName = item.group || "เมนู";
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(item);
    return groups;
  }, {});

  const resolveNavState = (item) =>
    item.isActive ??
    (item.matchPaths?.includes(activePath) ||
      item.matchPrefixes?.some((prefix) => activePath?.startsWith(prefix)) ||
      item.path === activePath);

  return (
    <div className="admin-shell">
      <div className="admin-aurora admin-aurora-left" />
      <div className="admin-aurora admin-aurora-right" />

      <main className={`admin-body${isSidebarCollapsed ? " admin-body-sidebar-collapsed" : ""}`}>
        {navItems?.length ? (
          <aside className="admin-sidebar" aria-label="เมนูหลังบ้าน">
            <div className="admin-sidebar-header">
              {!isSidebarCollapsed ? (
                <div>
                  <p className="admin-sidebar-title">Attendance Admin</p>
                  <p className="admin-sidebar-caption">Workspace navigation</p>
                </div>
              ) : null}
              <button
                className="icon-only-button icon-neutral-button sidebar-collapse-button"
                type="button"
                onClick={() => setIsSidebarCollapsed((current) => !current)}
                aria-label={isSidebarCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
                title={isSidebarCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen size={16} strokeWidth={1.8} />
                ) : (
                  <PanelLeftClose size={16} strokeWidth={1.8} />
                )}
              </button>
            </div>

            <nav className="admin-sidebar-nav">
              {Object.entries(groupedNavItems).map(([groupName, items]) => (
                <section className="admin-nav-group" key={groupName}>
                  {!isSidebarCollapsed ? (
                    <p className="admin-nav-group-title">{groupName}</p>
                  ) : null}
                  {items.map((item) => {
                    const isActive = resolveNavState(item);
                    const IconComponent = NAV_ICON_MAP[item.icon] || Circle;

                    return (
                      <button
                        key={item.routeKey || `${item.path}-${item.label}`}
                        className={`admin-nav-button${isActive ? " admin-nav-button-active" : ""}`}
                        type="button"
                        onClick={() => onNavigate?.(item.path)}
                        title={item.label}
                        data-label={item.label}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span className="admin-nav-button-icon">
                          <IconComponent size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                        </span>
                        <span className="admin-nav-button-label">{item.label}</span>
                      </button>
                    );
                  })}
                </section>
              ))}
            </nav>
          </aside>
        ) : null}

        <div className="admin-stage">
          <header className="admin-topbar">
            <div className="admin-topbar-left">
              {navItems?.length ? (
                <button
                  className="icon-only-button icon-neutral-button admin-mobile-menu-button"
                  type="button"
                  onClick={() => setIsMobileNavOpen(true)}
                  title="เปิดเมนู"
                  aria-label="เปิดเมนู"
                  aria-haspopup="dialog"
                  aria-expanded={isMobileNavOpen}
                  aria-controls="admin-mobile-drawer"
                >
                  <Menu size={18} strokeWidth={2} />
                </button>
              ) : null}
              {onBack ? (
                <button
                  className="icon-only-button icon-neutral-button admin-back-button"
                  type="button"
                  onClick={onBack}
                  title="ย้อนกลับ"
                  aria-label="ย้อนกลับ"
                >
                  <ChevronLeft size={18} strokeWidth={2} />
                </button>
              ) : null}
              <nav className="admin-breadcrumb" aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, index) => (
                  <span key={index} className="admin-breadcrumb-item">
                    {index > 0 ? (
                      <span className="admin-breadcrumb-sep">/</span>
                    ) : null}
                    <span>{crumb}</span>
                  </span>
                ))}
              </nav>
            </div>
            <div className="admin-topbar-actions">
              <button
                className="icon-only-button icon-neutral-button"
                type="button"
                onClick={onToggleTheme}
                aria-pressed={theme === "dark"}
                title={theme === "dark" ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
                aria-label={theme === "dark" ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
              >
                {theme === "dark" ? (
                  <Sun size={17} strokeWidth={2} />
                ) : (
                  <Moon size={17} strokeWidth={2} />
                )}
              </button>

              {sessionUser ? (
                <div className="user-menu" ref={userMenuRef}>
                  <button
                    type="button"
                    className="user-menu-trigger"
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                    onClick={() => setIsUserMenuOpen((open) => !open)}
                  >
                    <span className="user-menu-avatar" aria-hidden="true">
                      {(sessionUser.display_name || sessionUser.email || "?")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                    <span className="user-menu-text">
                      <span className="user-menu-name">{sessionUser.display_name}</span>
                      <span className="user-menu-role">
                        {ROLE_LABEL[sessionUser.role_code] || sessionUser.role_code}
                      </span>
                    </span>
                    <ChevronDown size={14} aria-hidden="true" />
                  </button>
                  {isUserMenuOpen ? (
                    <div className="user-menu-popover" role="menu">
                      <div className="user-menu-header">
                        <p className="user-menu-name">{sessionUser.display_name}</p>
                        <p className="user-menu-email">{sessionUser.email}</p>
                      </div>
                      <button
                        type="button"
                        role="menuitem"
                        className="user-menu-item"
                        onClick={openChangePw}
                      >
                        <KeyRound size={14} aria-hidden="true" />
                        <span>เปลี่ยนรหัสผ่าน</span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="user-menu-item user-menu-item-danger"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout?.();
                        }}
                      >
                        <LogOut size={14} aria-hidden="true" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <button
                  className="icon-only-button icon-neutral-button"
                  type="button"
                  onClick={onLogout}
                  title="ออกจากระบบ"
                  aria-label="ออกจากระบบ"
                >
                  <LogOut size={17} strokeWidth={2} />
                </button>
              )}
            </div>
          </header>

          <section className="admin-content">{children}</section>
        </div>
      </main>

      {navItems?.length ? (
        <div
          className={`admin-mobile-drawer-root${isMobileNavOpen ? " admin-mobile-drawer-open" : ""}`}
          aria-hidden={!isMobileNavOpen}
        >
          <div
            className="admin-mobile-drawer-backdrop"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside
            id="admin-mobile-drawer"
            className="admin-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="เมนูหลังบ้าน"
          >
            <div className="admin-mobile-drawer-header">
              <p className="admin-sidebar-title">Attendance Admin</p>
              <button
                className="icon-only-button icon-neutral-button"
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                aria-label="ปิดเมนู"
                title="ปิดเมนู"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <nav className="admin-mobile-drawer-nav">
              {Object.entries(groupedNavItems).map(([groupName, items]) => (
                <section className="admin-nav-group" key={groupName}>
                  <p className="admin-nav-group-title">{groupName}</p>
                  {items.map((item) => {
                    const isActive = resolveNavState(item);
                    const IconComponent = NAV_ICON_MAP[item.icon] || Circle;

                    return (
                      <button
                        key={item.routeKey || `${item.path}-${item.label}`}
                        className={`admin-nav-button${isActive ? " admin-nav-button-active" : ""}`}
                        type="button"
                        onClick={() => {
                          setIsMobileNavOpen(false);
                          onNavigate?.(item.path);
                        }}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span className="admin-nav-button-icon">
                          <IconComponent size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                        </span>
                        <span className="admin-nav-button-label">{item.label}</span>
                      </button>
                    );
                  })}
                </section>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}

      <Modal
        open={isChangePwOpen}
        onClose={() => (changePwBusy ? null : setIsChangePwOpen(false))}
        title="เปลี่ยนรหัสผ่าน"
        description={sessionUser ? sessionUser.email : ""}
        size="sm"
        closeOnBackdrop={!changePwBusy}
      >
        {changePwSuccess ? (
          <div className="auth-form">
            <p className="auth-form-hint">เปลี่ยนรหัสผ่านเรียบร้อยแล้ว</p>
            <div className="auth-form-actions">
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsChangePwOpen(false)}
              >
                เสร็จสิ้น
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submitChangePw} className="auth-form">
            <label className="auth-form-field">
              <span>รหัสผ่านปัจจุบัน</span>
              <input
                className="input-control"
                type="password"
                value={changePwDraft.current}
                onChange={(event) =>
                  setChangePwDraft({ ...changePwDraft, current: event.target.value })
                }
                autoComplete="current-password"
                required
                disabled={changePwBusy}
              />
            </label>
            <label className="auth-form-field">
              <span>รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)</span>
              <input
                className="input-control"
                type="password"
                value={changePwDraft.next}
                onChange={(event) =>
                  setChangePwDraft({ ...changePwDraft, next: event.target.value })
                }
                autoComplete="new-password"
                minLength={8}
                required
                disabled={changePwBusy}
              />
            </label>
            <label className="auth-form-field">
              <span>ยืนยันรหัสผ่านใหม่</span>
              <input
                className="input-control"
                type="password"
                value={changePwDraft.confirm}
                onChange={(event) =>
                  setChangePwDraft({ ...changePwDraft, confirm: event.target.value })
                }
                autoComplete="new-password"
                minLength={8}
                required
                disabled={changePwBusy}
              />
            </label>
            {changePwError ? <p className="login-form-error">{changePwError}</p> : null}
            <div className="auth-form-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsChangePwOpen(false)}
                disabled={changePwBusy}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={changePwBusy}
                disabled={changePwBusy}
              >
                บันทึก
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default AdminLayout;
