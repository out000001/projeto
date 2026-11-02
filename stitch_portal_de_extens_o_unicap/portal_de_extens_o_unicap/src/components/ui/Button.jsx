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
      "bg-primary-container text-on-primary hover:bg-primary shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]",
    secondary:
      "bg-transparent border border-secondary text-secondary hover:bg-surface-container-lowest",
    outline:
      "bg-transparent border border-surface-container-high text-on-surface hover:bg-surface-container-high",
    ghost:
      "bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
    danger:
      "bg-error text-on-error hover:bg-error/90 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
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
