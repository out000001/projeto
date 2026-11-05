import PropTypes from "prop-types";
import Card from "../../../components/ui/Card";
import { Filter, CalendarMonth } from "../../../components/ui/Icons";
import { areaOptions, localOptions, turnoOptions } from "../data/projects";

const odsChips = [
  "ODS 2 • Fome Zero",
  "ODS 3 • Saúde",
  "ODS 4 • Educação",
  "ODS 5 • Igualdade",
  "ODS 10 • Desigualdades",
  "ODS 16 • Paz & Justiça"
];

export default function ProjectFilters({
  area,
  local,
  turnos,
  onlyOpen,
  onAreaChange,
  onLocalChange,
  onToggleTurno,
  onOnlyOpenChange,
  onClear,
  areas = areaOptions,
  locations = localOptions
}) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <Filter className="h-4 w-4" />
          <span className="font-headline-sm font-semibold text-on-surface">Filtros Avançados</span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-label-sm font-semibold text-secondary hover:text-primary"
        >
          Limpar
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="filter-area" className="mb-1 block font-label-md font-semibold text-on-surface">
            Área Temática
          </label>
          <select
            id="filter-area"
            value={area}
            onChange={(e) => onAreaChange(e.target.value)}
            className="input"
          >
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-local" className="mb-1 block font-label-md font-semibold text-on-surface">
            Território / Modalidade
          </label>
          <select
            id="filter-local"
            value={local}
            onChange={(e) => onLocalChange(e.target.value)}
            className="input"
          >
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="mb-2 font-label-md font-semibold text-on-surface">Turno / Horário</legend>
          <div className="flex flex-col gap-2">
            {turnoOptions.map((turno) => (
              <label key={turno} className="flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-primary"
                  checked={turnos.includes(turno)}
                  onChange={() => onToggleTurno(turno)}
                />
                {turno}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-center justify-between rounded-lg bg-surface-container-low p-3">
          <span>
            <span className="font-label-md text-on-surface">Somente vagas abertas</span>
            <span className="block text-label-sm text-on-surface-variant">Oculta projetos esgotados</span>
          </span>
          <input
            type="checkbox"
            className="h-4 w-4 rounded accent-primary"
            checked={onlyOpen}
            onChange={(e) => onOnlyOpenChange(e.target.checked)}
          />
        </label>

        <div>
          <span className="font-label-md font-semibold text-on-surface">Alinhamento aos ODS da ONU</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {odsChips.map((ods) => (
              <span
                key={ods}
                className="rounded-lg bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:bg-secondary-container hover:text-on-secondary-container"
              >
                {ods}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-surface-container-high pt-4">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <CalendarMonth className="h-5 w-5" />
          <span className="font-label-lg font-semibold text-on-surface">Prazos de inscrição</span>
        </div>
        <p className="text-sm text-on-surface-variant">Consulte o prazo de cada projeto na vitrine. As datas são definidas pela gestão ao publicar.</p>
      </div>
    </Card>
  );
}

ProjectFilters.propTypes = {
  areas: PropTypes.arrayOf(PropTypes.string),
  locations: PropTypes.arrayOf(PropTypes.string),
  area: PropTypes.string.isRequired,
  local: PropTypes.string.isRequired,
  turnos: PropTypes.arrayOf(PropTypes.string).isRequired,
  onlyOpen: PropTypes.bool.isRequired,
  onAreaChange: PropTypes.func.isRequired,
  onLocalChange: PropTypes.func.isRequired,
  onToggleTurno: PropTypes.func.isRequired,
  onOnlyOpenChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired
};
