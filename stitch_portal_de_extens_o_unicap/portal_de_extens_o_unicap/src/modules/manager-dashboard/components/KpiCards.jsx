import { useMemo } from "react";
import PropTypes from "prop-types";
import Card from "../../../components/ui/Card";
import { computeKpis } from "../dashboardLogic";
import { formatNumber } from "../formatters";

/** Cartões de KPI institucional calculados a partir da lista de projetos. */
export default function KpiCards({ projects }) {
  const kpis = useMemo(() => computeKpis(projects), [projects]);

  const cards = [
    {
      label: "Projetos cadastrados",
      value: String(kpis.total),
      note: `${kpis.activeCount} ativos`,
      icon: "workspaces",
      accent: "text-primary bg-primary/10"
    },
    {
      label: "Vagas previstas para estudantes",
      value: formatNumber(kpis.students),
      note: `${kpis.scholarships} bolsas • ${kpis.volunteers} voluntários`,
      icon: "groups",
      accent: "text-secondary bg-secondary/10"
    },
    {
      label: "Público estimado nas propostas",
      value: formatNumber(kpis.impact),
      note: "Estimativa informada no cadastro",
      icon: "diversity_3",
      accent: "text-teal-700 bg-teal-700/10"
    },
    {
      label: "Relatórios pendentes",
      value: formatNumber(kpis.pendingReports),
      note: kpis.pendingReports > 0 ? "Requer atenção do comitê" : "Tudo em dia",
      icon: "pending_actions",
      accent: kpis.pendingReports > 0 ? "text-red-700 bg-red-700/10" : "text-teal-700 bg-teal-700/10"
    }
  ];

  return (
    <section aria-label="Indicadores institucionais" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-5">
          <div className="flex items-start justify-between gap-2">
            <span className="text-label-md font-semibold text-on-surface-variant">{card.label}</span>
            <span className={`material-symbols-outlined rounded-full p-1.5 text-base ${card.accent}`} aria-hidden="true">
              {card.icon}
            </span>
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-on-surface">{card.value}</p>
          <p className={`mt-1 text-xs ${card.label === "Relatórios pendentes" && kpis.pendingReports > 0 ? "font-semibold text-red-700" : "text-on-surface-variant"}`}>
            {card.note}
          </p>
        </Card>
      ))}
    </section>
  );
}

KpiCards.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string,
      scholarships: PropTypes.number,
      volunteers: PropTypes.number,
      impact: PropTypes.number,
      pendingReports: PropTypes.number,
      center: PropTypes.string
    })
  )
};
