import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Routes, Route, Navigate } from "react-router-dom";
import { SessionProvider, useSession } from "./contexts/SessionContext";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import AppLayout from "./components/layout/AppLayout";
import LoginForm from "./modules/auth/LoginForm";
import PublicLanding from "./modules/public/PublicLanding";
import ManagerDashboard from "./modules/manager-dashboard/ManagerDashboard";
import ProjectSubmission from "./modules/project-submission/ProjectSubmission";
import ProjectTracking from "./modules/project-tracking/ProjectTracking";
import SettingsScreen from "./modules/settings/Settings";

function ProtectedRoute({ children, allowedProfile }) {
  const { profile, isAuthenticated, restoring } = useSession();

  // Sprint 11: com sessão persistida, o token é validado no servidor antes de
  // decidir o redirecionamento — aguardar (sem "piscar" a tela de login).
  if (restoring) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedProfile && profile !== allowedProfile) {
    return <Navigate to={profile === "gestor" ? "/dashboard" : "/public"} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  allowedProfile: PropTypes.oneOf(["gestor", "estudante"])
};

function AuthPage() {
  const { isAuthenticated, profile } = useSession();

  if (isAuthenticated) {
    const target = profile === "gestor" ? "/dashboard" : "/public";
    return <Navigate to={target} replace />;
  }

  return (
    <main className="auth-shell">
      <aside className="auth-story">
        <a className="auth-brand" href="/public" aria-label="UNICAP — conhecer os projetos">UNICAP<span>Universidade Católica de Pernambuco</span></a>
        <div className="auth-story-copy">
          <span className="auth-eyebrow">CONHECIMENTO QUE TRANSFORMA</span>
          <h2>A universidade<br />encontra a<br /><em>comunidade.</em></h2>
          <p>Ideias que saem da sala de aula e fazem a diferença na vida das pessoas. Faça parte da extensão universitária.</p>
          <a className="auth-explore" href="/public">Conheça os projetos <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 19 19 5M5 5h14v14" /></svg></a>
        </div>
        <div className="auth-story-footer"><span className="auth-seal" aria-hidden="true">U</span><span>Extensão Comunitária<br /><strong>Recife · Pernambuco</strong></span></div>
      </aside>
      <section className="auth-content" aria-label="Acesso ao portal">
        <div className="auth-content-inner"><LoginForm /></div>
        <p className="auth-footer">UNICAP · Divisão de Extensão · Conhecimento a serviço da vida</p>
      </section>
    </main>
  );
}

/**
 * A vitrine pública fica aberta a visitantes, mas quando o usuário já está
 * autenticado ela ganha o cabeçalho do portal (navegação, configurações e sair),
 * para que estudante/gestor nunca fiquem sem rota de volta.
 */
function PublicPage() {
  const { isAuthenticated } = useSession();

  if (!isAuthenticated) {
    return <PublicLanding />;
  }

  return (
    <AppLayout>
      <PublicLanding authenticated />
    </AppLayout>
  );
}

function PageLoader() {
  const { restoring } = useSession();
  if (restoring) {
    return (
      <div className="mx-auto flex max-w-sm items-center justify-center gap-3 rounded-xl border border-surface-container-high bg-surface-container-lowest py-12 shadow-sm">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-body-md text-on-surface-variant">Verificando acesso...</span>
      </div>
    );
  }

  return <AuthPage />;
}

export default function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SessionProvider>
      <ErrorBoundary>
        <Routes>
        <Route path="/" element={<PageLoader />} />
        <Route path="/public" element={<PublicPage />} />

        {/* Rotas protegidas por perfil */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedProfile="gestor">
            <AppLayout>
              <ManagerDashboard />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/submit" element={
          <ProtectedRoute>
            <AppLayout>
              <ProjectSubmission />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/tracking" element={
          <ProtectedRoute>
            <AppLayout>
              <ProjectTracking />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <AppLayout>
              <SettingsScreen />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </SessionProvider>
  );
}
