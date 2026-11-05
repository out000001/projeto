import PropTypes from "prop-types";
import {Building,FileText,School,Calendar,Person} from "../../../components/ui/Icons";
import Input from "../../../components/ui/Input";
import { centers, editais, modalities } from "../data/submissionOptions";

const modalityIcons={programa:<Building className="h-5 w-5"/>,projeto:<FileText className="h-5 w-5"/>,curso:<School className="h-5 w-5"/>,evento:<Calendar className="h-5 w-5"/>,servico:<Person className="h-5 w-5"/>};

export default function StepIdentificacao({ form, updateForm, errors }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
        <div>
          <span className="font-label-sm font-bold uppercase tracking-wider text-secondary">Seção 1</span>
          <h2 className="font-headline-sm font-semibold text-on-surface">Dados Gerais da Ação Extensionista</h2>
          <p className="text-body-sm text-on-surface-variant">
            Definição do escopo, vinculação a edital institucional e centro acadêmico.
          </p>
        </div>
      </div>

      <Input
        label="Título do Projeto de Extensão *"
        value={form.title}
        onChange={(e) => updateForm({ title: e.target.value })}
        maxLength={160}
        error={errors.title}
        hint="Mín. 10 caracteres • Máx. 160"
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="edital" className="mb-1 block font-label-md font-semibold text-on-surface">
            Edital de Vinculação
          </label>
          <select
            id="edital"
            value={form.edital}
            onChange={(e) => updateForm({ edital: e.target.value })}
            className="input"
          >
            {editais.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="center" className="mb-1 block font-label-md font-semibold text-on-surface">
            Centro Acadêmico / Departamento *
          </label>
          <select
            id="center"
            value={form.center}
            onChange={(e) => updateForm({ center: e.target.value })}
            className="input"
          >
            {centers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.center && <p className="mt-1 text-sm text-error">{errors.center}</p>}
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 font-label-md font-semibold text-on-surface">
          Modalidade da Ação de Extensão (FORPROEX) *
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {modalities.map((m) => (
            <label
              key={m.value}
              className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 p-3 transition-colors ${
                form.modality === m.value
                  ? "border-primary bg-primary-container text-on-primary"
                  : "border-surface-container-highest bg-surface-container-low hover:bg-surface-container"
              }`}
            >
              <input
                type="radio"
                name="modality"
                value={m.value}
                checked={form.modality === m.value}
                onChange={() => updateForm({ modality: m.value })}
                className="sr-only"
              />
              <span aria-hidden="true">{modalityIcons[m.value]}</span>
              <span className="text-sm font-semibold">{m.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

StepIdentificacao.propTypes = {
  form: PropTypes.object.isRequired,
  updateForm: PropTypes.func.isRequired,
  errors: PropTypes.object
};
