import { forwardRef, useId } from "react";

const Select = forwardRef(function Select(
  { label, hint, error, className = "", id, options, placeholder, children, ...rest },
  ref
) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const describedById = error || hint ? `${selectId}-msg` : undefined;

  return (
    <div className={`ui-field${className ? ` ${className}` : ""}`}>
      {label ? (
        <label htmlFor={selectId} className="ui-field-label">
          {label}
        </label>
      ) : null}
      <select
        ref={ref}
        id={selectId}
        className={`select-control${error ? " select-control-error" : ""}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedById}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error || hint ? (
        <p id={describedById} className={`ui-field-msg${error ? " ui-field-msg-error" : ""}`}>
          {error || hint}
        </p>
      ) : null}
    </div>
  );
});

export default Select;
