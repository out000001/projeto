import PropTypes from "prop-types";
import { Check } from "../../../components/ui/Icons";

export default function Stepper({ steps, currentStep, onStepClick }) {
  return (
    <nav aria-label="Etapas da submissão" className="grid grid-cols-1 gap-3 rounded-lg bg-surface-container-lowest p-4 sm:grid-cols-3 xl:grid-cols-6">
      {steps.map((s, i) => {
        const isDone = i < currentStep;
        const isCurrent = i === currentStep;
        const reachable = i <= currentStep || isDone;

        return (
          <button
            key={s.id}
            type="button"
            onClick={() => reachable && onStepClick(i)}
            aria-current={isCurrent ? "step" : undefined}
            className={`relative flex min-w-0 flex-col items-center px-3 py-2 text-sm transition-colors sm:items-start sm:text-left ${
              isCurrent
                ? "font-semibold text-primary"
                : reachable
                  ? "text-on-surface-variant hover:text-on-surface"
                  : "cursor-not-allowed text-on-surface-variant/50"
            }`}
          >
            <span
              className={`z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                isDone
                  ? "bg-primary text-on-primary"
                  : isCurrent
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {isDone ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className="mt-1 sm:mt-0">{s.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

Stepper.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  currentStep: PropTypes.number.isRequired,
  onStepClick: PropTypes.func.isRequired
};
