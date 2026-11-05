import PropTypes from "prop-types";
import Input from "../../../components/ui/Input";
import { teamRoles } from "../data/submissionOptions";

function Counter({ label, description, icon, value, onChange, error }) {
  return (
    <div className="rounded-xl border border-surface-container-highest bg-surface-container-low p-4">
      <div className="flex items-center justify-between">
        <span className="font-label-md font-semibold text-on-surface">{label}</span>
        <span className={`material-symbols-outlined ${error ? "text-error" : "text-primary"}`}>{icon}</span>
      </div>
      <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          aria-label={`Reduzir ${label}`}
          onClick={() => onChange(Math.max(0, (Number(value) || 0) - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
        >
          −
        </button>
        <input
          type="number"
          aria-label={label}
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          min={0}
          max={1000000}
          step={1}
          aria-invalid={error ? true : undefined}
          className="h-8 w-16 border-none bg-transparent text-center text-lg font-bold text-primary outline-none"
        />
        <button
          type="button"
          aria-label={`Aumentar ${label}`}
          onClick={() => onChange((Number(value) || 0) + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
        >
          +
        </button>
      </div>
    </div>
  );
}

Counter.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.bool
};

export default function StepEquipe({ form, updateForm, errors }) {
  const members = form.teamMembers || [];

  const addMember = () => {
    updateForm({
      teamMembers: [...members, { name: "", role: "voluntario", email: "" }]
    });
  };

  const updateMember = (index, patch) => {
    updateForm({
      teamMembers: members.map((m, i) => (i === index ? { ...m, ...patch } : m))
    });
  };

  const removeMember = (index) => {
    updateForm({ teamMembers: members.filter((_, i) => i !== index) });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
        <div>
          <span className="font-label-sm font-bold uppercase tracking-wider text-secondary">Seção 3</span>
          <h2 className="font-headline-sm font-semibold text-on-surface">Vagas, Equipe e Abrangência Social</h2>
          <p className="text-body-sm text-on-surface-variant">
            Dimensionamento de estudantes envolvidos e estimativa de impacto direto na comunidade.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Counter
          label="Bolsistas PIBEX"
          description="Cotas de bolsa com auxílio financeiro mensal."
          icon="payments"
          value={Number(form.bolsistas) || 0}
          onChange={(v) => updateForm({ bolsistas: v })}
          error={Boolean(errors.team || errors.bolsistas)}
        />
        <Counter
          label="Voluntários"
          description="Alunos certificados para creditação curricular (ACCs)."
          icon="group_add"
          value={Number(form.voluntarios) || 0}
          onChange={(v) => updateForm({ voluntarios: v })}
          error={Boolean(errors.team || errors.voluntarios)}
        />
        <Counter
          label="Público Estimado"
          description="Moradores externos impactados diretamente."
          icon="diversity_1"
          value={Number(form.expectedAudience) || 0}
          onChange={(v) => updateForm({ expectedAudience: v })}
          error={Boolean(errors.expectedAudience)}
        />
      </div>
      <p className="text-sm text-on-surface-variant">Use números inteiros: por exemplo, 2 bolsistas, 5 voluntários e público de 100 pessoas.</p>
      {(errors.team || errors.bolsistas || errors.voluntarios || errors.expectedAudience) && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {[errors.team, errors.bolsistas, errors.voluntarios, errors.expectedAudience].filter(Boolean).join(" ")}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <span className="font-label-md font-semibold text-on-surface">Equipe prevista (opcional nesta etapa)</span>
          <button
            type="button"
            onClick={addMember}
            className="rounded-lg border border-secondary px-3 py-1.5 text-label-sm font-semibold text-secondary transition-colors hover:bg-surface-container-lowest"
          >
            + Adicionar integrante
          </button>
        </div>

        {members.length === 0 ? (
          <p className="mt-3 text-body-sm text-on-surface-variant">
            Nenhum integrante adicionado. Os nomes podem ser confirmados após a aprovação do edital.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {members.map((member, index) => (
              <div key={index} className="flex flex-col gap-3 rounded-xl border border-surface-container-highest bg-surface-container-lowest p-4 sm:flex-row sm:items-end">
                <Input
                  label="Nome"
                  className="flex-1"
                  value={member.name}
                  onChange={(e) => updateMember(index, { name: e.target.value })}
                  placeholder="Nome completo"
                />
                <div>
                  <label htmlFor={`role-${index}`} className="mb-1 block font-label-md font-semibold text-on-surface">
                    Função
                  </label>
                  <select
                    id={`role-${index}`}
                    value={member.role}
                    onChange={(e) => updateMember(index, { role: e.target.value })}
                    className="input"
                  >
                    {teamRoles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="E-mail"
                  className="flex-1"
                  value={member.email}
                  onChange={(e) => updateMember(index, { email: e.target.value })}
                  placeholder="nome@unicap.br"
                />
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="text-label-sm font-semibold text-error hover:underline"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

StepEquipe.propTypes = {
  form: PropTypes.object.isRequired,
  updateForm: PropTypes.func.isRequired,
  errors: PropTypes.object
};
