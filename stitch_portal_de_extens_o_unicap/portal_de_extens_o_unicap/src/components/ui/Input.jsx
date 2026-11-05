import { useId } from "react";
import PropTypes from "prop-types";

export default function Input({
  label,
  error,
  hint,
  trailingAction,
  className = "",
  id,
  "aria-describedby": describedBy,
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || `field-${generatedId}`;
  const messageId = `${inputId}-description`;
  const description = [describedBy, (error || hint) ? messageId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="font-label-md text-on-surface font-semibold"
        >
          {label}
        </label>
      )}
      <div className="relative min-w-0">
      <input
        id={inputId}
        name={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={description}
        className={`input ${trailingAction ? "pe-14" : ""} ${error ? "border-error focus:ring-error" : ""}`}
        {...rest}
      />
      {trailingAction && <div className="absolute inset-y-0 end-0 flex items-center">{trailingAction}</div>}
      </div>
      {error && (
        <span id={messageId} className="font-body-sm text-error text-sm">{error}</span>
      )}
      {hint && !error && (
        <span id={messageId} className="font-body-sm text-on-surface-variant">{hint}</span>
      )}
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.node,
  error: PropTypes.node,
  hint: PropTypes.node,
  trailingAction: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
  "aria-describedby": PropTypes.string
};
