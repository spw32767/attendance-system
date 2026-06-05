import { forwardRef, useId } from "react";

const Input = forwardRef(function Input(
  { label, hint, error, className = "", id, ...rest },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const describedById = error || hint ? `${inputId}-msg` : undefined;

  return (
    <div className={`ui-field${className ? ` ${className}` : ""}`}>
      {label ? (
        <label htmlFor={inputId} className="ui-field-label">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={`input-control${error ? " input-control-error" : ""}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedById}
        {...rest}
      />
      {error || hint ? (
        <p id={describedById} className={`ui-field-msg${error ? " ui-field-msg-error" : ""}`}>
          {error || hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
