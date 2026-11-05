import PropTypes from "prop-types";
import Card from "../../../components/ui/Card";
import { Calendar } from "../../../components/ui/Icons";
import { monthLabel, formatNumber } from "../formatters";
import { formatDate } from "../../../utils/format";

const urgencyStyles = {
  overdue: {
    badge: "bg-red-700 text-white",
    text: "text-red-700",
    label: "Vencido"
  },
  urgent: {
    badge: "bg-amber-600 text-white",
    text: "text-amber-700",
    label: "Urgente"
  },
  upcoming: {
    badge: "bg-secondary-container text-on-secondary-fixed",
    text: "text-secondary",
    label: "Próximo"
  }
};

function daysText(days) {
  if (days === 0) return "Hoje";
  if (days === 1) return "Amanhã";
  if (days === -1) return "Ontem";
  return days > 0 ? `Faltam ${days} dias` : `${Math.abs(days)} dias em atraso`;
}

/** Prazos do comitê DEG classificados por urgência. */
export default function CommitteeDeadlines({ deadlines }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <Calendar className="h-4 w-4" />
          <span className="font-headline-sm font-bold text-on-surface">Prazos & Calendário</span>
        </div>
        <span className="text-label-sm font-bold text-primary">Comitê DEG</span>
      </div>

      {deadlines.length === 0 && <p className="text-sm text-on-surface-variant">Nenhum prazo cadastrado.</p>}
      <ul className="space-y-3">
        {deadlines.map((deadline) => {
          const style = urgencyStyles[deadline.urgency];
          const date = new Date(deadline.date);
          return (
            <li
              key={deadline.id}
              className={`flex items-start gap-3 rounded-lg p-3 ${
                deadline.urgency === "overdue"
                  ? "border border-red-200 bg-red-50"
                  : "bg-surface-container-low"
              }`}
            >
              <div className="flex min-w-[52px] flex-col items-center justify-center rounded-lg bg-surface-container-highest p-2 text-center">
                <span className="font-display text-xl font-bold text-primary">
                  {formatNumber(date.getDate())}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {monthLabel(date)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md font-bold text-on-surface">{deadline.label}</span>
                <span className="text-sm text-on-surface-variant">{deadline.detail}</span>
                <span className="mt-1 flex items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${style.badge}`}>
                    {style.label}
                  </span>
                  <span className={`text-sm font-bold ${style.text}`}>{daysText(deadline.days)}</span>
                  <span className="text-xs text-on-surface-variant">{formatDate(date)}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

CommitteeDeadlines.propTypes = {
  deadlines: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      detail: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      days: PropTypes.number.isRequired,
      urgency: PropTypes.oneOf(["overdue", "urgent", "upcoming"]).isRequired
    })
  ).isRequired
};
