import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
};

const AUTO_DISMISS_MS = 4000;
const UNDO_DISMISS_MS = 8000;

// One toast. The countdown bar's CSS animation both shows time-remaining and,
// via onAnimationEnd, triggers removal — so pause-on-hover (a pure-CSS
// animation-play-state pause) also pauses dismissal for free.
function ToastItem({ toast, onRemove }) {
  const Icon = ICONS[toast.type] || Info;
  const duration = toast.duration || AUTO_DISMISS_MS;

  return (
    <div
      className={`ui-toast ui-toast-${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
    >
      <span className="ui-toast-icon-chip" aria-hidden="true">
        <Icon size={16} className="ui-toast-icon" />
      </span>
      <span className="ui-toast-message">{toast.message}</span>
      {toast.action ? (
        <button
          type="button"
          className="ui-toast-action"
          onClick={() => {
            try {
              toast.action.run();
            } finally {
              onRemove(toast.id);
            }
          }}
        >
          {toast.action.label}
        </button>
      ) : null}
      <button
        type="button"
        className="ui-toast-close"
        aria-label="ปิดการแจ้งเตือน"
        onClick={() => onRemove(toast.id)}
      >
        <X size={14} aria-hidden="true" />
      </button>
      <span
        className="ui-toast-progress"
        style={{ animationDuration: `${duration}ms` }}
        onAnimationEnd={() => onRemove(toast.id)}
      />
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((message, type = "success") => {
    if (!message) {
      return;
    }
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [
      ...current,
      { id, message, type, duration: AUTO_DISMISS_MS }
    ]);
  }, []);

  // Like show(), but the toast carries an "เลิกทำ" button. Used for
  // destructive actions (e.g. submission delete) so the user has a
  // window to revert. Dismisses after UNDO_DISMISS_MS instead of the
  // default 4s so they have time to read + react.
  const undoable = useCallback((message, onUndo) => {
    if (!message || typeof onUndo !== "function") {
      return;
    }
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [
      ...current,
      {
        id,
        message,
        type: "info",
        duration: UNDO_DISMISS_MS,
        action: { label: "เลิกทำ", run: onUndo }
      }
    ]);
  }, []);

  const value = useMemo(
    () => ({
      show,
      success: (message) => show(message, "success"),
      error: (message) => show(message, "error"),
      info: (message) => show(message, "info"),
      undoable
    }),
    [show, undoable]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="ui-toast-stack"
          role="region"
          aria-live="polite"
          aria-label="การแจ้งเตือน"
        >
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={remove} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

const NOOP_TOAST = {
  show: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  undoable: () => {}
};

export function useToast() {
  return useContext(ToastContext) || NOOP_TOAST;
}
