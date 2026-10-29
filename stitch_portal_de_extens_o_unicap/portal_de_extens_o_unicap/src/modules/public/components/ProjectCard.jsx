import PropTypes from "prop-types";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import {
  School,
  MapPin,
  Verified,
  ArrowForward,
  CalendarMonth
} from "../../../components/ui/Icons";
import { formatDate } from "../../../utils/format";

function modalityBadgeType(modality) {
  if (modality.includes("Gratuita")) return "course"; // tags secundárias
  if (modality.includes("PIBEX")) return "pbex";
  return "proext";
}

export default function ProjectCard({ project, onViewDetails, onEnroll }) {
  const isClosed = project.spotsLeft === 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-xl">
      <div className="relative h-44 overflow-hidden bg-surface-container-high">
        <img
          src={`https://picsum.photos/seed/${project.id}/640/360`}
          alt={`Imagem do projeto ${project.title}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge type={modalityBadgeType(project.modality)} label={project.modality} withDot={false} />
          {project.featured && (
            <Badge status="analysis" label="Destaque" withDot={false} />
          )}
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg bg-surface-container-lowest/90 px-2.5 py-1 text-xs text-on-surface shadow backdrop-blur-sm">
          <span className="inline-flex items-center gap-1">
            <Verified className="h-4 w-4 text-tertiary" />
            {project.hours}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
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

        <h2 className="font-headline-sm font-semibold text-on-surface transition-colors group-hover:text-primary">
          {project.title}
        </h2>
        <p className="line-clamp-2 text-body-md text-on-surface-variant">{project.shortDesc}</p>

        <div className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
          <span className="inline-flex items-center gap-2">
            <School className="h-4 w-4 text-primary" />
            {project.courses}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {project.local}
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarMonth className="h-4 w-4 text-primary" />
            Inscrições até {formatDate(project.deadline)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span
            className={`text-sm font-semibold ${
              isClosed ? "text-on-surface-variant" : project.spotsLeft < 5 ? "text-error" : "text-secondary"
            }`}
          >
            {isClosed ? "Vagas esgotadas" : `${project.spotsLeft} vagas restantes`}
          </span>
          <div className="flex flex-none items-center gap-2">
            <Button variant="outline" onClick={() => onViewDetails(project)}>
              Detalhes
            </Button>
            <Button
              variant={isClosed ? "ghost" : "primary"}
              disabled={isClosed}
              onClick={() => onEnroll(project)}
            >
              Inscrever-se
              <ArrowForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    shortDesc: PropTypes.string.isRequired,
    modality: PropTypes.string.isRequired,
    hours: PropTypes.string.isRequired,
    ods: PropTypes.arrayOf(PropTypes.string).isRequired,
    courses: PropTypes.string.isRequired,
    local: PropTypes.string.isRequired,
    deadline: PropTypes.string.isRequired,
    spotsLeft: PropTypes.number.isRequired,
    featured: PropTypes.bool,
    turnos: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onEnroll: PropTypes.func.isRequired
};
