import { useState } from "react";
import { LogIn, Moon, Sun } from "lucide-react";
import { Button } from "../components/ui";

function LoginPage({ onLogin, theme, onToggleTheme }) {
  const [email, setEmail] = useState("admin@attendance.com");
  const [password, setPassword] = useState("password");

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin();
  };

  return (
    <div className="login-shell">
      <button
        className="icon-only-button icon-neutral-button login-theme-toggle"
        type="button"
        onClick={onToggleTheme}
        aria-pressed={theme === "dark"}
        title={theme === "dark" ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
        aria-label={theme === "dark" ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
      >
        {theme === "dark" ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
      </button>

      <section className="login-card">
        <header className="login-card-head">
          <h1>เข้าสู่ระบบแอดมิน</h1>
          <p>ใช้บัญชีภายในของคุณเพื่อเข้าใช้งานแดชบอร์ดและจัดการแบบฟอร์ม</p>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-form-field">
            <span>อีเมล</span>
            <input
              className="input-control"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="login-form-field">
            <span>รหัสผ่าน</span>
            <input
              className="input-control"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <Button type="submit" variant="primary" className="login-form-submit">
            <LogIn size={14} aria-hidden="true" />
            <span>เข้าสู่ระบบ</span>
          </Button>

          <Button type="button" variant="ghost" disabled className="login-form-submit">
            <span>เข้าสู่ระบบด้วย SSO (เร็วๆ นี้)</span>
          </Button>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;
