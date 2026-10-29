import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useSession } from "../../contexts/SessionContext";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { Logout, Settings } from "../ui/Icons";

function HelpIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

HelpIcon.propTypes = {
  className: PropTypes.string
};

const managerNav = [
  { to: "/dashboard", label: "Painel Gestor", icon: "dashboard" },
  { to: "/tracking", label: "Acompanhamento", icon: "monitoring" },
  { to: "/submit", label: "Submeter Projeto", icon: "post_add" }
];

const communityNav = [
  { to: "/public", label: "Vitrine Pública", icon: "public" },
  { to: "/submit", label: "Submeter Projeto", icon: "post_add" },
  { to: "/tracking", label: "Acompanhamento", icon: "monitoring" }
];

export default function AppLayout({ children }) {
  const { profile, logout, error } = useSession();
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);
  const links = profile === "gestor" ? managerNav : communityNav;

  // Sair sempre encerra a sessão e devolve o usuário à tela de login.
  const handleLogout = async () => {
    if (await logout()) navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface antialiased">
      <header className="sticky top-0 z-40 border-b border-surface-container-high bg-surface-container-lowest/90 backdrop-blur-xl px-6 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-bold text-primary tracking-tight">UNICAP</span>
            <span className="hidden sm:inline text-label-sm text-on-surface-variant">
              {profile === "gestor" ? "Área de Gestão" : "Área Pública"}
            </span>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/dashboard"}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-primary-container text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`
                }
              >
                <span className="material-symbols-outlined text-sm">
                  {link.icon === "dashboard" ? "dashboard" : link.icon === "monitoring" ? "monitoring" : link.icon === "post_add" ? "post_add" : "public"}
                </span>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-surface-container-high bg-surface-container px-3 py-2 text-label-sm text-on-surface-variant shadow-sm transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              <HelpIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Ajuda</span>
            </button>
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 rounded-lg border border-surface-container-high bg-surface-container px-3 py-2 text-label-sm text-on-surface-variant shadow-sm transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="gap-1">
              <Logout className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>
      {error && <p role="alert" className="mx-auto mt-4 max-w-4xl px-6 text-red-800">{error}</p>}

      <div className="flex flex-1 flex-col">
        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      <footer className="border-t border-surface-container-highest bg-surface-container-lowest py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-on-surface-variant text-label-sm">
          <span>UNICAP • Universidade Católica de Pernambuco • Propesp / Deg</span>
          <span className="sm:inline">Rua do Príncipe, 526, Boa Vista, Recife - PE</span>
        </div>
      </footer>

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Central de Ajuda" titleId="help-title">
        <div className="flex flex-col gap-5 p-6">
          <div>
            <h2 id="help-title" className="font-headline-md font-semibold text-on-surface">
              Como podemos ajudar?
            </h2>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Atendimento da Divisão de Extensão (DEG) — segunda a sexta, 8h às 18h.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-surface-container-high bg-surface-container-low p-4 text-body-md text-on-surface-variant">
            <span>
              <strong className="text-on-surface">Suporte técnico:</strong>{" "}
              <a className="font-semibold text-primary underline" href="mailto:extensao@unicap.br">
                extensao@unicap.br
              </a>
            </span>
            <span>
              <strong className="text-on-surface">Recuperação de senha:</strong> solicite pelo mesmo e-mail
              informando seu login institucional ou matrícula.
            </span>
            <span>
              <strong className="text-on-surface">Prazos e pareceres:</strong> consulte o calendário no módulo
              de Acompanhamento.
            </span>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setHelpOpen(false)}>Entendi</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

AppLayout.propTypes = {
  children: PropTypes.node
};
