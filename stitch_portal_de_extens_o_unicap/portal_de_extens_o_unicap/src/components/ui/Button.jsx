import PropTypes from "prop-types";

export default function Button({
  children,
  variant = "primary",
  size = "medium",
  className = "",
  type = "button",
  ...rest
}) {
  const base =
    "btn inline-flex items-center justify-center gap-2 rounded-lg font-semibold";

  const variants = {
    primary:
      "bg-primary-container text-on-primary hover:bg-primary shadow-sm",
    secondary:
      "bg-transparent border border-secondary text-secondary hover:bg-surface-container-lowest",
    outline:
      "bg-transparent border border-surface-container-high text-on-surface hover:bg-surface-container-high",
    ghost:
      "bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
    danger:
      "bg-error text-on-error hover:bg-error/90 shadow-sm"
  };

  const sizes = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-sm"
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant] || variants.outline} ${sizes[size] || sizes.medium} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "outline",
    "ghost",
    "danger"
  ]),
  size: PropTypes.oneOf(["small", "medium"]),
  className: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit", "reset"])
};
