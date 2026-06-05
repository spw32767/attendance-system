import { forwardRef } from "react";

const VARIANT_CLASS = {
  primary: "primary-button",
  ghost: "ghost-button",
  danger: "danger-button",
  text: "text-button"
};

const Button = forwardRef(function Button(
  { variant = "primary", size = "md", className = "", type = "button", loading = false, disabled, children, ...rest },
  ref
) {
  const variantClass = VARIANT_CLASS[variant] || VARIANT_CLASS.primary;
  const sizeClass = size === "sm" ? "ui-button-sm" : "";
  const classes = [variantClass, sizeClass, className].filter(Boolean).join(" ");
  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;
