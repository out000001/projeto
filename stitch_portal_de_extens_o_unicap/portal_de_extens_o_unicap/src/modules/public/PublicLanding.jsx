import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { enrollProject } from "../../services/portalApi";
import PartnershipForm from "./components/PartnershipForm";
import MyEnrollments from "./components/MyEnrollments";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  Search,
  Sort,
  ArrowForward,
  Verified,
  Mail,
  CheckCircle,
  Shield,
  Logout,
  AlertTriangle
} from "../../components/ui/Icons";
import { useSession } from "../../contexts/SessionContext";
import ProjectCard from "./components/ProjectCard";
import ProjectFilters from "./components/ProjectFilters";
import ProjectDetailModal from "./components/ProjectDetailModal";
import useProjectFilters from "./hooks/useProjectFilters";
import useProjects from "./hooks/useProjects";
import { sortOptions, faq } from "./data/projects";

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-surface-container-high py-3 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-body-md font-semibold text-on-surface">{item.question}</span>
        <span
          className={`flex h-6 w-6 flex-none items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-transform ${
            open ? "rotate-45" : ""
          }`}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      {open && <p className="mt-2 text-body-md text-on-surface-variant">{item.answer}</p>}
    </div>
  );
}

FaqItem.propTypes = {
  item: PropTypes.shape({
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired
  }).isRequired
};

export default function PublicLanding({ authenticated = false }) {
  const navigate = useNavigate();
  const { logout, profile, isAuthenticated } = useSession();
  const [enrollmentNotice,setEnrollmentNotice] = useState("");
  const [enrollmentError,setEnrollmentError] = useState("");
  const [enrolling,setEnrolling] = useState(false);
  const [enrollmentVersion,setEnrollmentVersion] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  // A vitrine lê somente o catálogo público do Firestore.
  const {
    items: projects,
    loading: projectsLoading,
    error: projectsError,
    reload: reloadProjects
  } = useProjects();
  const {
    search,
    area,
    local,
    turnos,
    onlyOpen,
    sortBy,
    filteredProjects,
    hasActiveFilters,
    setSearch,
    setArea,
    setLocal,
    toggleTurno,
    setOnlyOpen,
    setSortBy,
    clearFilters
  } = useProjectFilters(projects);

  const handleLogout = async () => {
    if (await logout()) navigate("/", { replace: true });
  };

  useEffect(() => {
    const changed = () => { reloadProjects(); setEnrollmentVersion(value => value + 1); };
    window.addEventListener('portal-enrollment-changed',changed);
    return () => window.removeEventListener('portal-enrollment-changed',changed);
  }, [reloadProjects]);

  const handleEnroll = async (project) => {
    if (!isAuthenticated) { navigate('/'); return; }
    if (enrolling) return;
    setEnrolling(true); setEnrollmentNotice(''); setEnrollmentError('');
    try {
      const result = await enrollProject(String(project.id));
      setEnrollmentNotice(result.enrollment.status === 'confirmed' ? `Inscrição confirmada em “${project.title}”. Consulte seu acompanhamento em Minhas inscrições.` : `Sua inscrição em “${project.title}” foi salva na lista de espera.`);
      setSelectedProject(null); reloadProjects(); setEnrollmentVersion(value => value + 1);
    } catch (error) { setEnrollmentError(error.message); setSelectedProject(null); }
    finally { setEnrolling(false); window.scrollTo({ top: 0, behavior: "instant" }); }
  };

  return (
    <div className={`public-portal flex flex-col gap-8 ${authenticated ? "" : "mx-auto max-w-7xl px-5 py-6 md:px-8"}`}>
      {!authenticated && <header className="public-header"><a href="/" className="public-wordmark">UNICAP<span>Extensão Comunitária</span></a><Button variant="outline" onClick={() => navigate("/")}>Entrar no portal <ArrowForward className="h-4 w-4" /></Button></header>}
      {enrollmentNotice && <p role="status" className="rounded-lg bg-surface-container-low p-4 text-primary">{enrollmentNotice}</p>}
      {enrollmentError && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{enrollmentError}</p>}
      {enrolling && <p role="status">Salvando inscrição…</p>}
      {authenticated && <MyEnrollments key={enrollmentVersion} />}
      <section className="public-hero relative overflow-hidden rounded-2xl bg-surface-container-low p-8 text-on-surface md:p-12 lg:p-16">
        <div className="relative z-10 max-w-4xl">
          <div className="mb-4 flex items-center gap-2 rounded-full text-sm font-semibold uppercase tracking-wider text-primary">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Transformação Social • Recife e RMR
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
            Conectando a UNICAP à Comunidade: Participe de Nossos Projetos de Extensão
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-on-surface-variant">
            A extensão universitária é a ponte viva que une conhecimento científico, vocação humanista e
            cidadania participativa. Descubra bolsas ativas, cursos gratuitos e ações de impacto real nos
            territórios de Pernambuco.
          </p>

          <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:flex-wrap">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-surface-container-lowest p-1 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]">
              <Search className="h-5 w-5 flex-shrink-0 text-primary" />
              <input
                type="search"
                aria-label="Buscar projetos por palavra-chave"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/70"
                placeholder="Busque por área, curso, bairro ou palavra-chave..."
              />
            </div>
            <Button className="w-full sm:w-auto" onClick={() => navigate(authenticated ? profile === "gestor" ? "/submit" : "/tracking" : "/")}>
              {authenticated ? profile === "gestor" ? "Submeter Proposta" : "Meu acompanhamento" : "Área de Inscrição"}
              <ArrowForward className="h-4 w-4" />
            </Button>
            {authenticated && (
              <Button
                variant="outline"
                className="flex-none"
                onClick={handleLogout}
              >
                <Logout className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-tertiary-fixed" />{projectsLoading ? "Carregando catálogo…" : projectsError ? "Catálogo temporariamente indisponível" : `${projects.length} projetos no catálogo`}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-secondary-fixed" />Consulte a carga horária de cada projeto
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-tertiary-fixed" />Atividades para estudantes e comunidade
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <ProjectFilters
            areas={["Todas as áreas", ...new Set(projects.map(project => project.area).filter(Boolean))]}
            locations={["Todos os locais", ...new Set(projects.map(project => project.local).filter(Boolean))]}
            area={area}
            local={local}
            turnos={turnos}
            onlyOpen={onlyOpen}
            onAreaChange={setArea}
            onLocalChange={setLocal}
            onToggleTurno={toggleTurno}
            onOnlyOpenChange={setOnlyOpen}
            onClear={clearFilters}
          />
        </aside>

        <main className="lg:col-span-9">
          {projectsLoading && (
            <div
              role="status"
              className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface-container-lowest py-12 text-center shadow-sm"
            >
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-body-md text-on-surface-variant">Carregando projetos...</p>
            </div>
          )}

          {!projectsLoading && projectsError && (
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-error-container bg-error-container/20 py-12 text-center shadow-sm">
              <AlertTriangle className="h-8 w-8 text-error" />
              <p className="mt-3 text-lg font-semibold text-on-surface">Não foi possível carregar os projetos</p>
              <p className="text-body-md text-on-surface-variant">{projectsError}</p>
              <Button variant="secondary" onClick={reloadProjects} className="mt-4">
                Tentar novamente
              </Button>
            </div>
          )}

          {!projectsLoading && !projectsError && (
          <>
          <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-center xl:justify-between">
            <div>
              <h2 className="font-headline-md font-semibold text-on-surface">Oportunidades Disponíveis</h2>
              <p className="mt-1 text-body-md text-on-surface-variant">
                {filteredProjects.length} projetos com editais ativos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sort className="h-4 w-4 text-on-surface-variant" />
              <label htmlFor="sort-projects" className="text-label-sm text-on-surface-variant">
                Ordenar por:
              </label>
              <select
                id="sort-projects"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-surface-container-highest bg-surface-container-lowest px-3 py-1.5 text-sm text-on-surface shadow-sm outline-none focus:ring-2 focus:ring-primary-container"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={setSelectedProject}
                onEnroll={handleEnroll}
              />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="mt-10 flex flex-col items-center justify-center rounded-2xl bg-surface-container-lowest py-12 text-center shadow-sm">
              <Search className="h-8 w-8 text-secondary" />
              <p className="mt-3 text-lg font-semibold text-on-surface">Nenhum projeto encontrado</p>
              <p className="text-body-md text-on-surface-variant">
                Tente ajustar os filtros ou buscar por outro termo.
              </p>
              {hasActiveFilters && (
                <Button variant="secondary" onClick={clearFilters} className="mt-4">
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
          </>
          )}
        </main>
      </div>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-6 p-8">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5" />
            <span className="text-label-sm font-semibold uppercase tracking-wider">Perguntas Frequentes</span>
          </div>
          <h3 className="mb-2 font-headline-md font-semibold text-on-surface">
            Dúvidas Comuns da Comunidade e dos Estudantes
          </h3>
          <div>{faq.map((item) => <FaqItem key={item.question} item={item} />)}</div>

          <div className="mt-6 flex items-center gap-3 text-on-surface-variant">
            <Mail className="h-5 w-5 text-primary" />
            <span className="text-body-md">
              Ainda com dúvidas? Entre em contato pelo e-mail{" "}
              <a className="font-semibold text-primary underline" href="mailto:extensao@unicap.br">
                extensao@unicap.br
              </a>
              .
            </span>
          </div>
        </Card>

        <Card className="lg:col-span-6 p-8">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <Verified className="h-5 w-5" />
            <span className="text-label-sm font-semibold uppercase tracking-wider">Parcerias Estratégicas</span>
          </div>
          <h3 className="mb-2 font-headline-md font-semibold text-on-surface">Seja uma Instituição Parceira</h3>
          <p className="mb-6 text-body-md text-on-surface-variant">
            ONGs, associações de bairro, órgãos públicos e empresas podem submeter propostas conjuntas para
            receber estudantes, docentes e infraestrutura universitária.
          </p>
          <PartnershipForm />
        </Card>
      </section>

      <section className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-8 shadow-sm">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
          <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary-container font-bold text-on-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              Acesso Seguro e Transparente
            </span>
            <span className="text-body-md text-on-surface">
              Acesso por e-mail e senha. As permissões de gestão são definidas pelo perfil cadastrado.
            </span>
          </div>
        </div>
      </section>

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onEnroll={handleEnroll}
        />
      )}
    </div>
  );
}

PublicLanding.propTypes = {
  authenticated: PropTypes.bool
};
