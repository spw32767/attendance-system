function Spinner({ size = 18, label = "Loading", className = "" }) {
  return (
    <span
      className={`ui-spinner${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    />
  );
}

export default Spinner;
