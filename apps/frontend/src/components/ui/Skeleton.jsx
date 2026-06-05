function Skeleton({ width, height = 14, radius = 6, className = "", style, ...rest }) {
  const mergedStyle = {
    width: width ?? "100%",
    height,
    borderRadius: radius,
    ...style
  };
  return (
    <span
      className={`ui-skeleton${className ? ` ${className}` : ""}`}
      style={mergedStyle}
      aria-hidden="true"
      {...rest}
    />
  );
}

export default Skeleton;
