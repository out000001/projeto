import { toCsv } from "../../utils/download";

// Regras puras do painel gestor — sem React, para testes de unidade diretos.

export const PAGE_SIZE = 5;
const URGENT_DAYS = 7;

/** Agrupa lista de projetos em um único centro, se houver; senão retorna null. */
function uniqueCenter(projects) {
  if (projects.length === 0) return null;
  const first = projects[0].center;
  return projects.every((p) => p.center === first) ? first : null;
}

/** Indicadores institucionais calculados a partir do registro real. */
export function computeKpis(projects) {
  const list = projects ?? [];
  const active = list.filter((p) => p.status === "active");
  const pendingReports = list.reduce((sum, p) => sum + (p.pendingReports || 0), 0);

  return {
    total: list.length,
    activeCount: active.length,
    students: list.reduce((sum, p) => sum + (p.scholarships || 0) + (p.volunteers || 0), 0),
    scholarships: list.reduce((sum, p) => sum + (p.scholarships || 0), 0),
    volunteers: list.reduce((sum, p) => sum + (p.volunteers || 0), 0),
    impact: list.reduce((sum, p) => sum + (p.impact || 0), 0),
    pendingReports,
    activeCenter: uniqueCenter(active)
  };
}

/** Execução orçamentária (0–100) de um projeto. */
export function executionRate(project) {
  if (!project?.budget) return 0;
  return Math.min(100, Math.round(((project.spentBudget || 0) / project.budget) * 100));
}

const normalize = (text) =>
  String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Busca textual por título, coordenação ou ID. */
export function matchesSearch(project, term) {
  const query = normalize(term).trim();
  if (!query) return true;
  const haystack = normalize(
    `${project.title} ${project.coordinator} ${project.id}`
  );
  return query.split(/\s+/).every((part) => haystack.includes(part));
}

/** Filtros combinados: busca + centro + linha + status + edital. */
export function filterProjects(projects, filters = {}) {
  const { search = "", center = "all", thematicLine = "all", status = "all", grant = "all" } = filters;
  return (projects ?? []).filter((project) => {
    if (!matchesSearch(project, search)) return false;
    if (center !== "all" && project.center !== center) return false;
    if (thematicLine !== "all" && project.thematicLine !== thematicLine) return false;
    if (status !== "all" && project.status !== status) return false;
    if (grant !== "all" && project.grant !== grant) return false;
    return true;
  });
}

const comparators = {
  title: (a, b) => a.title.localeCompare(b.title, "pt-BR"),
  impact: (a, b) => b.impact - a.impact,
  execution: (a, b) => executionRate(b) - executionRate(a)
};

export function sortProjects(projects, sortBy = "title") {
  const compare = comparators[sortBy] || comparators.title;
  return [...projects].sort(compare);
}

export function paginate(items, page = 1, pageSize = PAGE_SIZE) {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    total
  };
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Dias restantes até um prazo (negativo = vencido). */
export function daysUntil(date, today = new Date()) {
  const target = new Date(date);
  const base = new Date(today);
  target.setHours(0, 0, 0, 0);
  base.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - base.getTime()) / MS_PER_DAY);
}

/** Classifica o prazo em overdue / urgent / upcoming com dias restantes. */
export function deadlineStatus(deadline, today = new Date()) {
  const days = daysUntil(deadline.date, today);
  if (days < 0) return { ...deadline, days, urgency: "overdue" };
  if (days <= URGENT_DAYS) return { ...deadline, days, urgency: "urgent" };
  return { ...deadline, days, urgency: "upcoming" };
}

export function buildDeadlines(deadlines = [], today = new Date()) {
  return deadlines
    .map((deadline) => deadlineStatus(deadline, today))
    .sort((a, b) => a.days - b.days);
}

const STATUS_LABELS = {
  active: "Ativo",
  pending: "Pendente",
  analysis: "Em análise",
  suspended: "Suspenso",
  completed: "Concluído"
};

/**
 * Conteúdo CSV do "Relatório MEC" — exporta a lista já filtrada/ordenada
 * que está sendo exibida no painel.
 */
export function buildProjectsCsv(projects) {
  const headers = [
    "Código",
    "Título",
    "Coordenação",
    "Centro",
    "Linha temática",
    "Edital",
    "Status",
    "Bolsistas",
    "Voluntários",
    "Impacto",
    "Orçamento (R$)",
    "Executado (R$)",
    "Execução (%)",
    "Relatórios pendentes",
    "Semestre"
  ];

  const rows = projects.map((project) => [
    project.id,
    project.title,
    project.coordinator,
    project.center,
    project.thematicLine,
    project.grant,
    STATUS_LABELS[project.status] || project.status,
    project.scholarships,
    project.volunteers,
    project.impact,
    project.budget,
    project.spentBudget,
    executionRate(project),
    project.pendingReports,
    project.semester
  ]);

  return toCsv(headers, rows);
}
