import PropTypes from "prop-types";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { School, MapPin, Schedule, CalendarMonth } from "../../../components/ui/Icons";
import { formatDate } from "../../../utils/format";

export default function ProjectDetailModal({ project, onClose, onEnroll }) {
  if (!project) return null;

  const isClosed = project.spotsLeft === 0;

  return (
    <Modal open onClose={onClose} title={`Detalhes do projeto ${project.title}`} titleId="project-detail-title">
      <div className="flex items-start justify-between gap-4 border-b border-surface-container-high p-6 pr-12">
        <div className="flex flex-col gap-2">
          <Badge type={project.modality.includes("PIBEX") ? "pbex" : "proext"} label={project.modality} />
          <h2 id="project-detail-title" className="font-headline-md font-semibold text-on-surface">
            {project.title}
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto p-6">
        <p className="text-body-md text-on-surface">{project.description}</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-3 text-sm">
            <School className="h-4 w-4 flex-none text-primary" />
            <span className="text-on-surface-variant">{project.courses}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-3 text-sm">
            <MapPin className="h-4 w-4 flex-none text-primary" />
            <span className="text-on-surface-variant">{project.local}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-3 text-sm">
            <Schedule className="h-4 w-4 flex-none text-primary" />
            <span className="text-on-surface-variant">{project.turnos.join(" • ")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-3 text-sm">
            <CalendarMonth className="h-4 w-4 flex-none text-primary" />
            <span className="text-on-surface-variant">Até {formatDate(project.deadline)}</span>
          </div>
        </div>

        <div>
          <h3 className="font-label-lg font-semibold text-on-surface">Atividades previstas</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-body-md text-on-surface-variant">
            {project.activities.map((activity) => (
              <li key={activity}>{activity}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-surface-container-high bg-surface-container-low p-4">
          <span className="font-label-md font-semibold text-on-surface">Parceria institucional</span>
          <p className="mt-1 text-body-sm text-on-surface-variant">{project.partner}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {project.ods.map((ods) => (
            <span
              key={ods}
              className="rounded-lg bg-surface-container px-2 py-0.5 text-xs font-medium text-on-surface-variant"
            >
              {ods}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-surface-container-high p-6">
        <span
          className={`text-sm font-semibold ${
            isClosed ? "text-on-surface-variant" : project.spotsLeft < 5 ? "text-error" : "text-secondary"
          }`}
        >
          {isClosed
            ? "Vagas esgotadas — cadastre-se na lista de espera"
            : `${project.spotsLeft} de ${project.spotsMax} vagas disponíveis`}
        </span>
        <div className="flex flex-none items-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Voltar
          </Button>
          <Button
            variant={isClosed ? "ghost" : "primary"}
            disabled={isClosed}
            onClick={() => onEnroll(project)}
          >
            {isClosed ? "Lista de espera" : "Inscrever-se"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

ProjectDetailModal.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    modality: PropTypes.string.isRequired,
    courses: PropTypes.string.isRequired,
    local: PropTypes.string.isRequired,
    turnos: PropTypes.arrayOf(PropTypes.string).isRequired,
    deadline: PropTypes.string.isRequired,
    spotsLeft: PropTypes.number.isRequired,
    spotsMax: PropTypes.number.isRequired,
    activities: PropTypes.arrayOf(PropTypes.string).isRequired,
    partner: PropTypes.string.isRequired,
    ods: PropTypes.arrayOf(PropTypes.string).isRequired
  }),
  onClose: PropTypes.func.isRequired,
  onEnroll: PropTypes.func.isRequired
};
