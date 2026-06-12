import { CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui";

function PublicFormSuccessPage({
  publicPath,
  submissionCode,
  title,
  message,
  allowMultiple,
  onFillAgain
}) {
  return (
    <div className="public-form-shell page-enter">
      <section className="public-form-card public-form-card-status public-form-success">
        <span className="public-form-success-icon" aria-hidden="true">
          <CheckCircle2 size={34} strokeWidth={2} />
        </span>
        <h1>{title || "ส่งแบบฟอร์มสำเร็จ"}</h1>
        <p>{message || "ระบบบันทึกข้อมูลของคุณแล้ว"}</p>
        {submissionCode ? (
          <div className="public-form-code">
            <span className="public-form-code-label">รหัสอ้างอิง</span>
            <span className="public-form-code-value">{submissionCode}</span>
          </div>
        ) : null}
        {allowMultiple ? (
          <Button
            variant="ghost"
            onClick={onFillAgain}
            className="public-form-success-again"
          >
            กรอกฟอร์มอีกครั้ง
          </Button>
        ) : null}
      </section>
    </div>
  );
}

export default PublicFormSuccessPage;
