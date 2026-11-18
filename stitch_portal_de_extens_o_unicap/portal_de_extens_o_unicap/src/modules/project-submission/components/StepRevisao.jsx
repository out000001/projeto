import PropTypes from "prop-types";
import Badge from "../../../components/ui/Badge";
import { Shield } from "../../../components/ui/Icons";
import { editais, odsOptions, deliverables } from "../data/submissionOptions";
import { totalBudget } from "../validation";
import { formatCurrency } from "../../../utils/format";

const complianceItems = [
  { key: "cne", label: "A proposta está de acordo com a Resolução CNE/CES nº 7/2018 (curricularização da extensão)." },
  { key: "forproex", label: "A ação é classificável nas modalidades do FORPROEX (programa, projeto, curso, evento ou serviço)." },
  { key: "lgpd", label: "O tratamento de dados pessoais dos participantes seguirá a LGPD (Lei nº 13.709/2018)." },
  { key: "autorizacao", label: "Tenho autorização da coordenação do curso/centro para esta proposta." }
];

function SummaryRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 border-b border-surface-container-high py-2 last:border-b-0">
      <span className="text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">{label}</span>
      <span className="text-body-md text-on-surface">{value}</span>
    </div>
  );
}

SummaryRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node
};

export default function StepRevisao({ form, updateForm, errors, availableEditais=editais }) {
  const compliance = form.compliance || {};
  const odsLabels = (form.ods || [])
    .map((v) => odsOptions.find((o) => o.value === v)?.label)
    .filter(Boolean);
  const deliverableLabels = (form.selectedDeliverables || [])
    .map((v) => deliverables.find((d) => d.value === v)?.label)
    .filter(Boolean);
  const editalLabel = availableEditais.find((e) => e.value === form.edital)?.label;

  const allChecked = complianceItems.every((item) => compliance[item.key]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
        <div>
          <span className="font-label-sm font-bold uppercase tracking-wider text-secondary">Seção 6</span>
          <h2 className="font-headline-sm font-semibold text-on-surface">Revisão e Conformidade Institucional</h2>
          <p className="text-body-sm text-on-surface-variant">
            Confira o resumo da proposta e confirme os compromissos antes do envio ao comitê.
          </p>
        </div>
        <Badge status={allChecked ? "active" : "pending"} label={allChecked ? "Pronto para envio" : "Checklist pendente"} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-surface-container-highest bg-surface-container-lowest p-5">
          <h3 className="mb-2 font-label-lg font-semibold text-on-surface">Resumo da proposta</h3>
          <SummaryRow label="Título" value={form.title} />
          <SummaryRow label="Edital" value={editalLabel} />
          <SummaryRow label="Centro" value={form.center} />
          <SummaryRow label="Linha temática" value={form.thematicLine} />
          <SummaryRow label="ODS" value={odsLabels.join(" • ")} />
          <SummaryRow
            label="Equipe"
            value={`${form.bolsistas || 0} bolsistas • ${form.voluntarios || 0} voluntários • público estimado: ${form.expectedAudience || 0}`}
          />
          <SummaryRow label="Orçamento total" value={formatCurrency(totalBudget(form.budget))} />
          <SummaryRow label="Entregáveis" value={deliverableLabels.join(" • ")} />
          <SummaryRow label="Parceiro" value={form.partnerName} />
          <SummaryRow
            label="Anexos"
            value={form.attachments?.length ? `${form.attachments.length} documento(s) anexado(s)` : "Nenhum anexo"}
          />
        </div>

        <div className="rounded-xl border-2 border-primary/30 bg-surface-container-lowest p-5">
          <div className="mb-3 flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            <h3 className="font-label-lg font-semibold text-on-surface">Conformidade institucional</h3>
          </div>
          <div className="flex flex-col gap-3">
            {complianceItems.map((item) => (
              <label
                key={item.key}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${
                  compliance[item.key]
                    ? "border-primary/40 bg-primary-container/10 text-on-surface"
                    : "border-surface-container-highest bg-surface-container-low text-on-surface-variant"
                }`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(compliance[item.key])}
                  onChange={(e) =>
                    updateForm({ compliance: { ...compliance, [item.key]: e.target.checked } })
                  }
                  className="mt-0.5 h-4 w-4 flex-none rounded accent-primary"
                />
                {item.label}
              </label>
            ))}
          </div>
          {errors.compliance && <p className="mt-2 text-sm text-error">{errors.compliance}</p>}
        </div>
      </div>
    </div>
  );
}

StepRevisao.propTypes = {
  availableEditais: PropTypes.array,
  form: PropTypes.object.isRequired,
  updateForm: PropTypes.func.isRequired,
  errors: PropTypes.object
};
