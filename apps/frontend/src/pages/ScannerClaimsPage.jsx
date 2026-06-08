import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, ScanLine } from "lucide-react";
import AdminLayout from "../components/AdminLayout";

const RESULT_CONFIG = {
  received: { tone: "success", label: "รับของสำเร็จ", Icon: CheckCircle2 },
  already_used: { tone: "warning", label: "โทเคนนี้ถูกใช้แล้ว", Icon: AlertTriangle },
  not_found: { tone: "danger", label: "ไม่พบโทเคน", Icon: XCircle }
};

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

  const handleScan = () => {
    const trimmed = token.trim();
    if (!trimmed) {
      return;
    }
    onScanToken(trimmed);
    // Clear so the next QR can be scanned right away.
    setToken("");
  };

  const result = scanResult
    ? RESULT_CONFIG[scanResult.status] || {
        tone: "neutral",
        label: scanResult.status,
        Icon: ScanLine
      }
    : null;

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
        <div className="page-head-body">
          <h1>สแกนโทเคนรับของ</h1>
          <p className="page-summary">
            ใช้สำหรับทีมหน้างานในการตรวจสอบโทเคนรับของอย่างรวดเร็ว พร้อมดูผลลัพธ์และสถานะ claim ทันที
          </p>
        </div>
      </section>

      <section className="module-placeholder-card scanner-card">
        <form
          className="scanner-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleScan();
          }}
        >
          <input
            className="input-control scanner-input"
            value={token}
            placeholder="วางโทเคนหรือสแกน QR"
            autoComplete="off"
            autoFocus
            onChange={(event) => setToken(event.target.value)}
          />
          <button className="primary-button scanner-submit" type="submit" disabled={!token.trim()}>
            <ScanLine size={16} aria-hidden="true" />
            <span>ตรวจสอบโทเคน</span>
          </button>
        </form>

        {result ? (
          <div className={`scanner-result scanner-result-${result.tone}`} role="status" aria-live="polite">
            <result.Icon size={40} aria-hidden="true" className="scanner-result-icon" />
            <p className="scanner-result-status">{result.label}</p>
            <p className="scanner-result-message">{scanResult.message}</p>
            {scanResult.claim ? (
              <p className="scanner-result-meta">โทเคน: {scanResult.claim.claim_token}</p>
            ) : null}
          </div>
        ) : null}
      </section>
    </AdminLayout>
  );
}

export default ScannerClaimsPage;
