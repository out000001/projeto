import ProjectPublication from "./ProjectPublication";
import PropTypes from "prop-types";
import Modal from "../../../components/ui/Modal";
import Badge from "../../../components/ui/Badge";
import { executionRate } from "../dashboardLogic";
import { formatCurrency } from "../../../utils/format";

/** Modal com a ficha completa do projeto para o gestor. */
export default function ProjectDetailModal({ project, onClose, onChanged = () => {} }) {
  if (!project) return null;
  const rate = executionRate(project);

  return (
    <Modal open onClose={onClose} title={`Detalhes do projeto ${project.title}`} titleId="manager-detail-title" className="w-full max-w-lg">
      <div className="border-b border-surface-container-high p-6 pr-12">
        <p className="text-label-sm font-bold text-primary">{project.id}</p>
        <h2 id="manager-detail-title" className="font-headline-md font-bold text-on-surface">{project.title}</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">{project.coordinator}</p>
      </div>

      <div className="overflow-y-auto p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge status={project.status} />
          <Badge label={project.center} />
          <Badge
            type={
              project.grant.startsWith("PIBEX")
                ? "pbex"
                : project.grant.startsWith("PROEXT")
                  ? "proext"
                  : "voluntary"
            }
          />
        </div>

        <dl className="space-y-3 text-body-sm">
          <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-2">
            <dt className="text-on-surface-variant">Linha temática</dt>
            <dd className="font-semibold text-on-surface">{project.thematicLine}</dd>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-2">
            <dt className="text-on-surface-variant">Edital</dt>
            <dd className="font-semibold text-on-surface">{project.grant}</dd>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-2">
            <dt className="text-on-surface-variant">Equipe</dt>
            <dd className="font-semibold text-on-surface">
              {project.scholarships} bolsistas • {project.volunteers} voluntários
            </dd>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-2">
            <dt className="text-on-surface-variant">Orçamento</dt>
            <dd className="font-semibold text-on-surface">
              {formatCurrency(project.spentBudget)} / {formatCurrency(project.budget)}
            </dd>
          </div>
          <div className="rounded-lg bg-surface-container-low px-3 py-2">
            <dt className="text-on-surface-variant">Execução orçamentária</dt>
            <dd className="mt-1 flex items-center gap-2">
              <div
                className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-highest"
                role="progressbar"
                aria-valuenow={rate}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`h-full rounded-full ${rate >= 90 ? "bg-red-500" : "bg-primary"}`}
                  style={{ width: `${rate}%` }}
                />
              </div>
              <span className="font-semibold text-on-surface">{rate}%</span>
            </dd>
          </div>
          {project.pendingReports > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
              ⚠️ {project.pendingReports} relatório{project.pendingReports > 1 ? "s" : ""} pendente
              {project.pendingReports > 1 ? "s" : ""} de entrega
            </div>
          )}
        </dl>
        <ProjectPublication project={project} onChanged={onChanged} />
      </div>
    </Modal>
  );
}

ProjectDetailModal.propTypes = {
  onChanged: PropTypes.func,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    coordinator: PropTypes.string.isRequired,
    center: PropTypes.string.isRequired,
    thematicLine: PropTypes.string.isRequired,
    grant: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    scholarships: PropTypes.number.isRequired,
    volunteers: PropTypes.number.isRequired,
    budget: PropTypes.number.isRequired,
    spentBudget: PropTypes.number.isRequired,
    pendingReports: PropTypes.number.isRequired
  }),
  onClose: PropTypes.func.isRequired
};
