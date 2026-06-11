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

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message, type = "success") => {
      if (!message) {
        return;
      }
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => remove(id), AUTO_DISMISS_MS);
    },
    [remove]
  );

  // Like show(), but the toast carries an "เลิกทำ" button. Used for
  // destructive actions (e.g. submission delete) so the user has a
  // window to revert. Auto-dismisses after UNDO_DISMISS_MS instead of
  // the default 4s so they have time to read + react.
  const undoable = useCallback(
    (message, onUndo) => {
      if (!message || typeof onUndo !== "function") {
        return;
      }
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((current) => [
        ...current,
        { id, message, type: "info", action: { label: "เลิกทำ", run: onUndo } }
      ]);
      window.setTimeout(() => remove(id), UNDO_DISMISS_MS);
    },
    [remove]
  );

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
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type] || Info;
            return (
              <div
                key={toast.id}
                className={`ui-toast ui-toast-${toast.type}`}
                role={toast.type === "error" ? "alert" : "status"}
              >
                <Icon size={16} aria-hidden="true" className="ui-toast-icon" />
                <span className="ui-toast-message">{toast.message}</span>
                {toast.action ? (
                  <button
                    type="button"
                    className="ui-toast-action"
                    onClick={() => {
                      try {
                        toast.action.run();
                      } finally {
                        remove(toast.id);
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
                  onClick={() => remove(toast.id)}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            );
          })}
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
