import { useState } from "react";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("admin@attendance.com");
  const [password, setPassword] = useState("password");

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin();
  };

  return (
    <div className="login-shell page-enter">
      <div className="login-aurora login-aurora-cyan" />
      <div className="login-aurora login-aurora-blue" />

      <div className="login-grid">
        <section className="login-brand">
          <p className="pill-label">Attendance Platform</p>
          <h1>Build and manage attendance forms with confidence.</h1>
          <p>
            Internal users can create form templates, collect responses, and
            prepare item claim workflow from one admin panel.
          </p>

          <ul>
            <li>Google-Form style template builder</li>
            <li>Flexible field types and validation</li>
            <li>Ready for attendance and item claim flow</li>
          </ul>
        </section>

        <section className="login-card">
          <h2>Admin Login</h2>
          <p>Use your internal account to access the attendance dashboard.</p>

          <form onSubmit={handleSubmit} className="login-form">
            <label>
              <span>Email</span>
              <input
                className="input-control"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label>
              <span>Password</span>
              <input
                className="input-control"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <button className="primary-button" type="submit">
              Sign in
            </button>

            <button className="ghost-button" type="button" disabled>
              SSO Login (coming soon)
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
