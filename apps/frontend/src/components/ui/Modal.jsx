import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  labelledBy,
  className = ""
}) {
  const dialogRef = useRef(null);
  const lastFocusedRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    lastFocusedRef.current = document.activeElement;
    const dialog = dialogRef.current;
    const focusables = dialog ? dialog.querySelectorAll(FOCUSABLE_SELECTOR) : [];
    if (focusables.length > 0) {
      focusables[0].focus();
    } else if (dialog) {
      dialog.focus();
    }

    const onKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== "Tab" || !dialog) {
        return;
      }
      const nodes = dialog.querySelectorAll(FOCUSABLE_SELECTOR);
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (lastFocusedRef.current && typeof lastFocusedRef.current.focus === "function") {
        lastFocusedRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const titleId = title ? "ui-modal-title" : undefined;
  return createPortal(
    <div
      className="ui-modal-backdrop"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || titleId}
        tabIndex={-1}
        className={`ui-modal ui-modal-${size}${className ? ` ${className}` : ""}`}
      >
        <header className="ui-modal-head">
          <div className="ui-modal-head-text">
            {title ? (
              <h2 id={titleId} className="ui-modal-title">
                {title}
              </h2>
            ) : null}
            {description ? <p className="ui-modal-description">{description}</p> : null}
          </div>
          <button
            type="button"
            className="ui-modal-close"
            aria-label="Close"
            onClick={() => onClose?.()}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="ui-modal-body">{children}</div>
        {footer ? <footer className="ui-modal-footer">{footer}</footer> : null}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
