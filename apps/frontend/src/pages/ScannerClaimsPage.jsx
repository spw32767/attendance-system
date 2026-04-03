import { useState } from "react";
import AdminLayout from "../components/AdminLayout";

function ScannerClaimsPage({
  scanResult,
  onScanToken,
  onLogout,
  theme,
  onToggleTheme,
  navItems,
  activePath,
  onNavigate,
  currentRole,
  onRoleChange
}) {
  const [token, setToken] = useState("");

  return (
    <AdminLayout
      breadcrumbs={["สแกนเนอร์", "สแกนรับของ"]}
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
        <h1>สแกนโทเคนรับของ</h1>
      </section>

      <section className="module-placeholder-card">
        <div className="inline-action-row" style={{ width: "100%" }}>
          <input
            className="input-control"
            style={{ minWidth: 320 }}
            value={token}
            placeholder="วางโทเคนหรือกรอกจาก QR"
            onChange={(event) => setToken(event.target.value)}
          />
          <button
            className="primary-button"
            type="button"
            onClick={() => onScanToken(token)}
            disabled={!token.trim()}
          >
            ตรวจสอบโทเคน
          </button>
        </div>

        {scanResult ? (
          <div style={{ marginTop: 12 }}>
            <p>
              ผลลัพธ์: <strong>{scanResult.status}</strong>
            </p>
            <p>{scanResult.message}</p>
            {scanResult.claim ? (
              <p>
                Claim: {scanResult.claim.claim_token} ({scanResult.claim.receive_status})
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </AdminLayout>
  );
}

export default ScannerClaimsPage;
