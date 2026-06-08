import Modal from "./Modal";
import Button from "./Button";

/**
 * Reusable confirmation dialog for destructive / irreversible actions.
 * Wraps Modal with a cancel + confirm button pair.
 */
function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "ยืนยันการทำรายการ",
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  confirmVariant = "danger",
  busy = false,
  children
}) {
  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      title={title}
      description={description}
      size="sm"
      closeOnBackdrop={!busy}
    >
      <div className="auth-form">
        {children ? <p className="auth-form-hint">{children}</p> : null}
        <div className="auth-form-actions">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            loading={busy}
            disabled={busy}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
