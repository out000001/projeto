import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { Close } from "./Icons";

/**
 * Modal acessível compartilhado.
 * - Fecha com Escape e clique no backdrop;
 * - Bloqueia o scroll do body enquanto aberto;
 * - Move o foco para o painel ao abrir (adequado para leitores de tela);
 * - `aria-labelledby` quando `titleId` é informado, senão `aria-label`.
 */
export default function Modal({
  open,
  onClose,
  title,
  titleId,
  children,
  className = "w-full max-w-2xl",
  showCloseButton = true
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        role="presentation"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-inverse-surface/40 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId || undefined}
        aria-label={titleId ? undefined : title}
        tabIndex={-1}
        className={`modal-panel relative z-10 flex min-w-0 max-h-[calc(100dvh-2rem)] flex-col overflow-y-auto rounded-2xl bg-surface-container-lowest shadow-2xl outline-none ${className}`}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <Close className="h-5 w-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  titleId: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  showCloseButton: PropTypes.bool
};
