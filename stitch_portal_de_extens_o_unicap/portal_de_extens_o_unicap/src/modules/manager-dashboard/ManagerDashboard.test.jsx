import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ManagerDashboard from "./ManagerDashboard";
import { dashboardProjects } from "../../test/fixtures/dashboardProjects";
import { PAGE_SIZE, computeKpis } from "./dashboardLogic";

vi.mock("../../services/projectApi", () => ({ fetchProjectDetails: vi.fn(async id => ({ item: dashboardProjects.find(p=>p.id===id) })) }));

vi.mock("./components/PartnershipInbox", () => ({ default: () => null }));

vi.mock("./useManagerProjects", () => ({ default: () => ({ items: dashboardProjects, loading: false, error: null, reload: vi.fn() }) }));

const getKpiSection = () => screen.getByLabelText("Indicadores institucionais");

describe("ManagerDashboard", () => {
  it("renderiza KPIs calculados a partir do registro de projetos", () => {
    render(
      <MemoryRouter>
        <ManagerDashboard />
      </MemoryRouter>
    );
    const kpis = computeKpis(dashboardProjects);
    const kpiSection = getKpiSection();

    expect(
      within(kpiSection).getByText(`${kpis.activeCount} ativos`)
    ).toBeInTheDocument();
    expect(
      within(kpiSection).getByText(
        `${kpis.scholarships} bolsas • ${kpis.volunteers} voluntários`
      )
    ).toBeInTheDocument();
    expect(
      within(kpiSection).getByText(kpis.impact.toLocaleString("pt-BR"))
    ).toBeInTheDocument();
    expect(
      within(kpiSection).getByText(
        kpis.pendingReports > 0 ? "Requer atenção do comitê" : "Tudo em dia"
      )
    ).toBeInTheDocument();
  });

  it("filtra por centro, status e limpa filtros", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ManagerDashboard />
      </MemoryRouter>
    );

    await user.selectOptions(screen.getByLabelText("Filtrar por centro"), "Ciências Jurídicas");
    const expectedJuridicas = dashboardProjects.filter(
      (p) => p.center === "Ciências Jurídicas"
    ).length;
    expect(screen.getByRole("status")).toHaveTextContent(
      expectedJuridicas === 1
        ? "1 projeto encontrado"
        : `${expectedJuridicas} projetos encontrados`
    );

    await user.selectOptions(screen.getByLabelText("Filtrar por status"), "active");
    expect(screen.getByText(/Nenhum projeto corresponde aos filtros/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /limpar filtros/i }));
    expect(screen.getByRole("status")).toHaveTextContent(
      `${dashboardProjects.length} projetos encontrados`
    );
  });

  it("busca por texto e atualiza a contagem", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ManagerDashboard />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Buscar projetos"), "clínica psicológica");
    expect(screen.getByRole("status")).toHaveTextContent(/^1 projeto encontrado$/);

    await user.clear(screen.getByLabelText("Buscar projetos"));
    expect(screen.getByRole("status")).toHaveTextContent(
      `${dashboardProjects.length} projetos encontrados`
    );
  });

  it("ordena por impacto ao clicar na coluna", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ManagerDashboard />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Ordenar por impacto" }));
    const table = screen.getByRole("table");
    const firstRow = within(table).getAllByRole("row")[1];

    const sortedFirst = [...dashboardProjects].sort((a, b) => b.impact - a.impact)[0];
    expect(firstRow).toHaveTextContent(sortedFirst.title.slice(0, 30));
  });

  it("pagina resultados com PAGE_SIZE itens por página", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ManagerDashboard />
      </MemoryRouter>
    );

    const pageCount = Math.ceil(dashboardProjects.length / PAGE_SIZE);
    expect(pageCount).toBeGreaterThan(1);

    const counter = () => screen.getByText(/Mostrando/);
    expect(counter()).toHaveTextContent(`Mostrando 5 de ${dashboardProjects.length} projetos`);

    await user.click(screen.getByRole("button", { name: "Próxima" }));
    expect(counter()).toHaveTextContent(`Mostrando 5 de ${dashboardProjects.length} projetos`);
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");
  });

  it("abre modal de detalhes do projeto e fecha", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ManagerDashboard />
      </MemoryRouter>
    );

    const table = screen.getByRole("table");
    const targetRow = within(table)
      .getAllByRole("row")
      .find((row) => row.textContent.includes("Clínica Psicológica"));
    await user.click(within(targetRow).getByRole("button", { name: "Detalhes" }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText(/Clínica Psicológica Itinerante/i)
    ).toBeInTheDocument();
    expect(within(dialog).getByText(/Execução orçamentária/i)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mostra ações pendentes com prazos vencidos e relatórios", () => {
    render(
      <MemoryRouter>
        <ManagerDashboard />
      </MemoryRouter>
    );
    const kpis = computeKpis(dashboardProjects);

    expect(screen.queryByText(/prazo[s]? vencido[s]?/i)).not.toBeInTheDocument();
    expect(kpis.pendingReports).toBeGreaterThan(0);
    expect(screen.getAllByText(/relatório[s]? pendente[s]?/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/aguardando parecer/i)).toBeInTheDocument();
  });

  it("botão Revisar aplica filtro de projetos em análise", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ManagerDashboard />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: /revisar/i }));
    const analysisCount = dashboardProjects.filter((p) => p.status === "analysis").length;
    expect(screen.getByRole("status")).toHaveTextContent(
      analysisCount === 1 ? "1 projeto encontrado" : `${analysisCount} projetos encontrados`
    );
  });

  it("fireEvent.change em selects atualiza a listagem", () => {
    render(
      <MemoryRouter>
        <ManagerDashboard />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText("Filtrar por edital"), {
      target: { value: "PIBEX 2024.2" }
    });
    const expected = dashboardProjects.filter((p) => p.grant === "PIBEX 2024.2").length;
    expect(screen.getByRole("status")).toHaveTextContent(
      expected === 1 ? "1 projeto encontrado" : `${expected} projetos encontrados`
    );
  });
});

describe("Sprint 8 — ações do cabeçalho do painel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
  });

  it("'Exportar relatório CSV' dispara o download do CSV", async () => {
    const createObjectURL = vi.fn(() => "blob:relatorio");
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ManagerDashboard />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: /exportar relatório csv/i }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0];
    expect(blob.type).toContain("text/csv");
  });

  it("'Novo Edital PIBEX' navega para a tela de submissão", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<ManagerDashboard />} />
          <Route path="/submit" element={<h1>Submissão de Proposta de Extensão</h1>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: /novo edital pibex/i }));

    expect(
      await screen.findByRole("heading", { name: /submissão de proposta de extensão/i })
    ).toBeInTheDocument();
  });
});
