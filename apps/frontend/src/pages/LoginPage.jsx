import { useState } from "react";

function LoginPage({ onLogin, theme, onToggleTheme }) {
  const [email, setEmail] = useState("admin@attendance.com");
  const [password, setPassword] = useState("password");

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin();
  };

  return (
    <div className="login-shell page-enter">
      <button
        className="theme-toggle login-mode-toggle"
        type="button"
        onClick={onToggleTheme}
        aria-pressed={theme === "dark"}
      >
        <span className="theme-toggle-label">ธีม</span>
        <span className="theme-toggle-value">{theme === "dark" ? "มืด" : "สว่าง"}</span>
      </button>

      <section className="login-card-square">
        <div className="login-card-top">
          <p className="login-kicker">ระบบจัดการลงชื่อเข้าร่วม</p>
          <h1>เข้าสู่ระบบแอดมิน</h1>
          <p>
            ใช้บัญชีภายในของคุณเพื่อเข้าใช้งานแดชบอร์ดและจัดการแบบฟอร์ม
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            <span>อีเมล</span>
            <input
              className="input-control"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            <span>รหัสผ่าน</span>
            <input
              className="input-control"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <div className="login-form-actions">
            <button className="primary-button" type="submit">
              เข้าสู่ระบบ
            </button>

            <button className="ghost-button login-sso-button" type="button" disabled>
              เข้าสู่ระบบด้วย SSO (เร็วๆ นี้)
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;
