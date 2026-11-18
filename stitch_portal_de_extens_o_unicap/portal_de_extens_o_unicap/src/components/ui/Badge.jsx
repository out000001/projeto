import PropTypes from "prop-types";

const statusTheme = {
  active: { bg: "bg-teal-50 text-teal-800", dot: "bg-teal-600", label: "Ativo" },
  completed: { bg: "bg-blue-50 text-blue-800", dot: "bg-blue-600", label: "Concluído" },
  analysis: { bg: "bg-amber-50 text-amber-800", dot: "bg-amber-600", label: "Em análise" },
  suspended: { bg: "bg-red-50 text-red-800", dot: "bg-red-600", label: "Suspenso" },
  pending: { bg: "bg-surface-container-high text-secondary", dot: "bg-secondary", label: "Pendente" }
};

const typeTheme = {
  pbex: { bg: "bg-primary text-on-primary", label: "PIBIC" },
  proext: { bg: "bg-secondary text-on-secondary", label: "PROEXT" },
  voluntary: { bg: "bg-surface-container-high text-secondary", label: "Voluntário" },
  course: { bg: "bg-tertiary text-on-tertiary", label: "Curso/Oficina" }
};

export default function Badge({
  status,
  type,
  label,
  withDot = true,
  className = ""
}) {
  const theme = status ? statusTheme[status] : type ? typeTheme[type] : null;
  const resolvedLabel = label || (theme ? theme.label : "Sem status");
  const resolvedBg = theme ? theme.bg : "bg-surface-container-high text-on-surface-variant";
  const resolvedDot = theme ? theme.dot : "bg-outline";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-label-sm font-medium uppercase tracking-wide ${resolvedBg} ${className}`}>
      {withDot && <span className={`h-2 w-2 rounded-full ${resolvedDot}`} />}
      {resolvedLabel}
    </span>
  );
}

Badge.propTypes = {
  status: PropTypes.oneOf(["active", "completed", "analysis", "suspended", "pending"]),
  type: PropTypes.oneOf(["pbex", "proext", "voluntary", "course"]),
  label: PropTypes.string,
  withDot: PropTypes.bool,
  className: PropTypes.string
};
