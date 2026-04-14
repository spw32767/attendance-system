import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

function TableActionMenu({ items = [], label = "การจัดการเพิ่มเติม" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const visibleItems = items.filter(Boolean);

  if (!visibleItems.length) {
    return null;
  }

  return (
    <div className="table-action-menu" ref={containerRef}>
      <button
        className={`table-action-menu-trigger${isOpen ? " table-action-menu-trigger-open" : ""}`}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={label}
        title={label}
        onClick={() => setIsOpen((current) => !current)}
      >
        <MoreHorizontal size={16} strokeWidth={2} />
      </button>

      {isOpen ? (
        <div className="table-action-menu-popover" role="menu">
          {visibleItems.map((item) => {
            const IconComponent = item.icon;

            return (
              <button
                key={item.label}
                className="table-action-menu-item"
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  item.onClick?.();
                }}
              >
                {IconComponent ? <IconComponent size={14} strokeWidth={1.9} /> : null}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default TableActionMenu;
