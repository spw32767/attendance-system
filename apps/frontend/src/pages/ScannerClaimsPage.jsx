import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, AlertTriangle, XCircle, ScanLine, Camera, CameraOff } from "lucide-react";
import AdminLayout from "../components/AdminLayout";

const RESULT_CONFIG = {
  received: { tone: "success", label: "รับของสำเร็จ", Icon: CheckCircle2 },
  already_used: { tone: "warning", label: "โทเคนนี้ถูกใช้แล้ว", Icon: AlertTriangle },
  not_found: { tone: "danger", label: "ไม่พบโทเคน", Icon: XCircle }
};

const QR_REGION_ID = "qr-reader";
const RESCAN_COOLDOWN_MS = 2500;

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
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const scannerRef = useRef(null);
  const lastScanRef = useRef({ token: "", at: 0 });
  // Keep latest onScanToken without restarting the camera each render.
  const onScanTokenRef = useRef(onScanToken);
  onScanTokenRef.current = onScanToken;

  const handleScan = () => {
    const trimmed = token.trim();
    if (!trimmed) {
      return;
    }
    onScanToken(trimmed);
    setToken("");
  };

  useEffect(() => {
    if (!cameraOn) {
      return undefined;
    }
    setCameraError("");

    const fail = (message) => {
      setCameraError(message);
      setCameraOn(false);
    };

    // No camera API (e.g. served over http, or a device without a camera).
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      fail("อุปกรณ์/เบราว์เซอร์นี้เข้าถึงกล้องไม่ได้ — ต้องเปิดผ่าน HTTPS และมีกล้อง");
      return undefined;
    }

    let scanner;
    try {
      scanner = new Html5Qrcode(QR_REGION_ID);
    } catch (err) {
      fail("เริ่มกล้องไม่ได้");
      return undefined;
    }
    scannerRef.current = scanner;

    const onDecode = (decodedText) => {
      const value = String(decodedText || "").trim();
      if (!value) {
        return;
      }
      const now = Date.now();
      // Debounce: ignore the same QR re-read within the cooldown window.
      if (value === lastScanRef.current.token && now - lastScanRef.current.at < RESCAN_COOLDOWN_MS) {
        return;
      }
      lastScanRef.current = { token: value, at: now };
      setToken(value);
      onScanTokenRef.current?.(value);
    };

    // .start can throw synchronously (no mediaDevices) AND reject async
    // (permission denied) — handle both so a missing/denied camera shows an
    // error instead of crashing the page.
    try {
      const startResult = scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        onDecode,
        () => {}
      );
      if (startResult && typeof startResult.catch === "function") {
        startResult.catch(() =>
          fail("เปิดกล้องไม่ได้ — โปรดอนุญาตสิทธิ์การเข้าถึงกล้อง")
        );
      }
    } catch (err) {
      fail("เปิดกล้องไม่ได้ — โปรดอนุญาตสิทธิ์การเข้าถึงกล้อง");
    }

    return () => {
      const active = scannerRef.current;
      scannerRef.current = null;
      if (!active) {
        return;
      }
      // stop() throws synchronously if the scanner never reached the running
      // state (e.g. camera failed to start) — guard so cleanup never crashes.
      try {
        const stopResult = active.stop();
        if (stopResult && typeof stopResult.then === "function") {
          stopResult.then(() => active.clear()).catch(() => {});
        } else {
          active.clear();
        }
      } catch (err) {
        try {
          active.clear();
        } catch (clearErr) {
          /* ignore */
        }
      }
    };
  }, [cameraOn]);

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
        <div className="scanner-camera-row">
          {cameraOn ? (
            <button
              className="ghost-button scanner-camera-toggle"
              type="button"
              onClick={() => setCameraOn(false)}
            >
              <CameraOff size={16} aria-hidden="true" />
              <span>ปิดกล้อง</span>
            </button>
          ) : (
            <button
              className="primary-button scanner-camera-toggle"
              type="button"
              onClick={() => setCameraOn(true)}
            >
              <Camera size={16} aria-hidden="true" />
              <span>เปิดกล้องสแกน QR</span>
            </button>
          )}
        </div>

        {/* Camera viewport — kept mounted; html5-qrcode renders the video here. */}
        <div
          id={QR_REGION_ID}
          className="qr-reader"
          style={{ display: cameraOn ? "block" : "none" }}
        />

        {cameraError ? <p className="scanner-camera-error">{cameraError}</p> : null}

        <p className="scanner-or">หรือพิมพ์/วางโทเคนเอง</p>

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
