import { describe, it, expect } from "vitest";
import {
  PAGE_SIZE,
  computeKpis,
  executionRate,
  matchesSearch,
  filterProjects,
  sortProjects,
  paginate,
  daysUntil,
  deadlineStatus,
  buildDeadlines,
  buildProjectsCsv
} from "./dashboardLogic";
import { dashboardProjects, committeeDeadlines } from "../../test/fixtures/dashboardProjects";

const today = new Date("2025-03-20T12:00:00");

describe("computeKpis", () => {
  it("totaliza projetos, estudantes e impacto a partir do registro", () => {
    const projects = [
      {status:'active',scholarships:2,volunteers:1,impact:100,pendingReports:2,center:'Direito'},
      {status:'completed',scholarships:0,volunteers:3,impact:20,pendingReports:0,center:'Saúde'}
    ];
    expect(computeKpis(projects)).toEqual({
      total:2,activeCount:1,students:6,scholarships:2,volunteers:4,
      impact:120,pendingReports:2,activeCenter:'Direito'
    });
  });

  it("conta apenas projetos ativos como ativos", () => {
    const kpis = computeKpis([
      { status: "active", scholarships: 2, volunteers: 1, impact: 100, pendingReports: 0 },
      { status: "pending", scholarships: 1, volunteers: 0, impact: 50, pendingReports: 1 },
      { status: "active", scholarships: 0, volunteers: 3, impact: 10, pendingReports: 2 }
    ]);

    expect(kpis.activeCount).toBe(2);
    expect(kpis.students).toBe(7); // (2+1) + (1+0) + (0+3)
  });

  it("deriva centro único quando todos os ativos pertencem ao mesmo centro", () => {
    const kpis = computeKpis([
      { status: "active", center: "Saúde", scholarships: 1, volunteers: 1, impact: 0, pendingReports: 0 },
      { status: "active", center: "Saúde", scholarships: 0, volunteers: 0, impact: 0, pendingReports: 0 }
    ]);
    expect(kpis.activeCenter).toBe("Saúde");
  });

  it("retorna centro nulo quando ativos vêm de centros distintos", () => {
    const kpis = computeKpis([
      { status: "active", center: "Saúde", scholarships: 1, volunteers: 0, impact: 0, pendingReports: 0 },
      { status: "active", center: "Direito", scholarships: 0, volunteers: 0, impact: 0, pendingReports: 0 }
    ]);
    expect(kpis.activeCenter).toBeNull();
  });
});

describe("executionRate", () => {
  it("calcula percentual gasto/orçamento limitado a 100", () => {
    expect(executionRate({ budget: 1000, spentBudget: 250 })).toBe(25);
    expect(executionRate({ budget: 1000, spentBudget: 1500 })).toBe(100);
  });

  it("retorna 0 quando não há orçamento", () => {
    expect(executionRate(null)).toBe(0);
    expect(executionRate({ spentBudget: 500 })).toBe(0);
  });
});

describe("matchesSearch", () => {
  const project = dashboardProjects[0]; // Clínica Psicológica Itinerante...

  it("casa título, coordenação e id sem acento/caixa", () => {
    expect(matchesSearch(project, "clínica")).toBe(true);
    expect(matchesSearch(project, "MARIANA")).toBe(true);
    expect(matchesSearch(project, "ext-2025-001")).toBe(true);
  });

  it("exige todos os termos da busca", () => {
    expect(matchesSearch(project, "psicológica itinerante")).toBe(true);
    expect(matchesSearch(project, "psicológica robson")).toBe(false);
  });

  it("qualquer termo casa com busca vazia", () => {
    expect(matchesSearch(project, "")).toBe(true);
    expect(matchesSearch(project, "   ")).toBe(true);
  });
});

describe("filterProjects", () => {
  it("combina múltiplos filtros", () => {
    const result = filterProjects(dashboardProjects, {
      center: "Ciências Jurídicas",
      status: "active"
    });
    expect(result).toHaveLength(0); // Jurídicas não tem ativo no registro

    const juridicas = filterProjects(dashboardProjects, { center: "Ciências Jurídicas" });
    expect(juridicas.every((p) => p.center === "Ciências Jurídicas")).toBe(true);
  });

  it("filtra por linha temática e edital", () => {
    const saude = filterProjects(dashboardProjects, { thematicLine: "Saúde" });
    expect(saude.length).toBeGreaterThan(0);
    expect(saude.every((p) => p.thematicLine === "Saúde")).toBe(true);

    const pibex = filterProjects(dashboardProjects, { grant: "PIBEX 2024.2" });
    expect(pibex.every((p) => p.grant === "PIBEX 2024.2")).toBe(true);
  });

  it("retorna tudo com filtros padrão", () => {
    expect(filterProjects(dashboardProjects)).toHaveLength(dashboardProjects.length);
  });

  it("retorna vazio quando nada casa", () => {
    expect(
      filterProjects(dashboardProjects, { search: "zzz inexistente" })
    ).toHaveLength(0);
  });
});

describe("sortProjects", () => {
  it("ordena por título alfabeticamente", () => {
    const sorted = sortProjects(dashboardProjects.slice(0, 4), "title");
    expect(sorted[0].title < sorted[1].title).toBe(true);
  });

  it("ordena por impacto descendente", () => {
    const sorted = sortProjects(dashboardProjects, "impact");
    expect(sorted[0].impact).toBeGreaterThanOrEqual(sorted[1].impact);
  });

  it("ordena por execução orçamentária descendente", () => {
    const sorted = sortProjects(dashboardProjects, "execution");
    expect(
      executionRate(sorted[0])
    ).toBeGreaterThanOrEqual(executionRate(sorted[1]));
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 13 }, (_, i) => i);

  it("fatia a primeira página com PAGE_SIZE itens", () => {
    const result = paginate(items, 1);
    expect(result.items).toHaveLength(PAGE_SIZE);
    expect(result.pageCount).toBe(3);
    expect(result.total).toBe(13);
  });

  it("última página parcial", () => {
    const result = paginate(items, 3);
    expect(result.items).toHaveLength(3);
  });

  it("limita página fora do intervalo", () => {
    expect(paginate(items, 99).page).toBe(3);
    expect(paginate(items, 0).page).toBe(1);
  });
});

describe("daysUntil / deadlineStatus", () => {
  it("conta dias até o prazo", () => {
    expect(daysUntil("2025-03-24", today)).toBe(4);
    expect(daysUntil("2025-03-20", today)).toBe(0);
    expect(daysUntil("2025-03-18", today)).toBe(-2);
  });

  it("classifica overdue, urgent e upcoming", () => {
    const overdue = deadlineStatus({ date: "2025-03-18" }, today);
    const urgent = deadlineStatus({ date: "2025-03-25" }, today);
    const upcoming = deadlineStatus({ date: "2025-04-15" }, today);

    expect(overdue.urgency).toBe("overdue");
    expect(urgent.urgency).toBe("urgent");
    expect(upcoming.urgency).toBe("upcoming");
  });

  it("buildDeadlines ordena por proximidade e sinaliza vencidos", () => {
    // Prazos relativos à mesma data de referência do teste.
    const rel = (offset) => {
      const date = new Date(today);
      date.setDate(date.getDate() + offset);
      return date.toISOString();
    };
    const deadlines = [
      { id: "a", label: "Futuro", date: rel(20) },
      { id: "b", label: "Urgente", date: rel(3) },
      { id: "c", label: "Vencido", date: rel(-5) }
    ];

    const sorted = buildDeadlines(deadlines, today);
    expect(sorted.map((d) => d.id)).toEqual(["c", "b", "a"]);
    expect(sorted[0].urgency).toBe("overdue");
    expect(sorted[1].urgency).toBe("urgent");
    expect(sorted[2].urgency).toBe("upcoming");
  });

  it("classifica os prazos reais do comitê sem lançar erro", () => {
    const sorted = buildDeadlines(committeeDeadlines);
    expect(sorted).toHaveLength(committeeDeadlines.length);
    sorted.forEach((d) => {
      expect(["overdue", "urgent", "upcoming"]).toContain(d.urgency);
    });
  });
});

describe("buildProjectsCsv — exportação do Relatório MEC", () => {
  it("gera CSV com BOM, cabeçalho e uma linha por projeto recebido", () => {
    const csv = buildProjectsCsv(dashboardProjects.slice(0, 2));
    const [header, ...rows] = csv.replace(/^\uFEFF/, "").trim().split("\r\n");

    expect(header).toContain("Código");
    expect(header).toContain("Execução (%)");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toContain(dashboardProjects[0].id);
    expect(rows[0]).toContain("Clínica Psicológica Itinerante no Morro da Conceição");
    expect(rows[0]).toContain("Ativo");
  });

  it("respeita a lista filtrada que está sendo exibida no painel", () => {
    const filtered = filterProjects(dashboardProjects, { center: "Ciências Jurídicas" });
    const rows = buildProjectsCsv(filtered).replace(/^\uFEFF/, "").trim().split("\r\n");

    expect(filtered.length).toBeGreaterThan(0);
    expect(rows).toHaveLength(filtered.length + 1);
    expect(rows[1]).toContain("Ciências Jurídicas");
  });
});

it('does not substitute demonstration data when projects are absent',()=>{
 expect(computeKpis().total).toBe(0);
 expect(filterProjects()).toEqual([]);
 expect(buildDeadlines()).toEqual([]);
});
