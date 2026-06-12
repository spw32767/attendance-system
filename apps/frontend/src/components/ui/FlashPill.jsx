import { useFlashOnChange } from "../../hooks/useFlashOnChange";

/**
 * A status pill that briefly highlights when its `value` changes, giving an
 * at-a-glance confirmation that an action took effect (e.g. publishing a form).
 * The caller owns the label + base className (status mapping differs per page);
 * this only layers the change-flash on top.
 */
export default function FlashPill({ value, className = "", children, ...rest }) {
  const flashing = useFlashOnChange(value);
  return (
    <span
      className={`${className}${flashing ? " status-pill-flash" : ""}`}
      {...rest}
    >
      {children}
    </span>
  );
}
