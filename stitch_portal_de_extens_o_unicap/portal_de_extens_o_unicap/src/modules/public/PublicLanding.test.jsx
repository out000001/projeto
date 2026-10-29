import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { SessionProvider } from "../../contexts/SessionContext";
import PublicLanding from "./PublicLanding";
import { projects } from "./data/projects";
import * as api from "../../services/api";

// Sprint 11: a vitrine lê /api/projects. Os testes rodam sobre o mock de
// contrato (mesmos dados do seed do back-end).
vi.mock("../../services/api", () => import("../../services/apiMock"));

async function renderLanding() {
  const result = render(
    <SessionProvider>
      <MemoryRouter>
        <PublicLanding authenticated />
      </MemoryRouter>
    </SessionProvider>
  );
  // Aguarda o carregamento assíncrono dos projetos da API.
  await screen.findByText(/projetos com editais ativos/);
  return result;
}

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("Sprint 2 — vitrine pública", () => {
  it("renderiza hero, filtros e a listagem de projetos vindos da API", async () => {
    await renderLanding();

    expect(screen.getByRole("heading", { name: /conectando a unicap/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/área temática/i)).toBeInTheDocument();
    expect(screen.getByText(/projetos com editais ativos/i)).toBeInTheDocument();

    // Todos os 6 projetos do seed da API aparecem na listagem inicial
    projects.forEach((project) => {
      expect(screen.getByText(project.title)).toBeInTheDocument();
    });
  });

  it("busca por texto reduz a listagem ao projeto correspondente", async () => {
    const user = userEvent.setup();
    await renderLanding();

    await user.type(screen.getByLabelText(/buscar projetos/i), "hortas");

    expect(screen.getByText(/1 projetos com editais ativos/i)).toBeInTheDocument();
    expect(screen.getByText(/Observatório de Segurança Alimentar/i)).toBeInTheDocument();
    expect(screen.queryByText(/Clínica de Direitos Humanos/i)).not.toBeInTheDocument();
  });

  it("filtra por área temática via select", async () => {
    const user = userEvent.setup();
    await renderLanding();

    await user.selectOptions(screen.getByLabelText(/área temática/i), "Saúde Comunitária");

    expect(screen.getByText(/1 projetos com editais ativos/i)).toBeInTheDocument();
    expect(screen.getByText(/Atenção Psicológica/i)).toBeInTheDocument();
  });

  it("botão limpar filtros restaura a listagem completa", async () => {
    const user = userEvent.setup();
    await renderLanding();

    await user.selectOptions(screen.getByLabelText(/área temática/i), "Sustentabilidade");
    expect(screen.getByText(/1 projetos com editais ativos/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^limpar$/i }));
    expect(screen.getByText(/6 projetos com editais ativos/i)).toBeInTheDocument();
  });

  it("abre modal de detalhes e permite fechar", async () => {
    const user = userEvent.setup();
    await renderLanding();

    const card = screen.getByText(/Clínica de Direitos Humanos/i).closest("article");
    await user.click(within(card).getByRole("button", { name: /detalhes/i }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/Atendimento jurídico gratuito, orientação processual/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Atividades previstas/i)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Fechar", exact: false }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("projeto sem vagas exibe estado esgotado e botão desabilitado", async () => {
    await renderLanding();

    const card = screen.getByText(/Cultura Popular do Recife Antigo/i).closest("article");
    expect(within(card).getByText(/vagas esgotadas/i)).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: /inscrever-se/i })).toBeDisabled();
  });
});

describe("Sprint 11 — vitrine consumindo a API", () => {
  it("exibe estado de carregamento enquanto a API responde", async () => {
    let resolveRequest;
    vi.spyOn(api, "fetchProjects").mockImplementation(
      () => new Promise((resolve) => { resolveRequest = resolve; })
    );

    render(
      <SessionProvider>
        <MemoryRouter>
          <PublicLanding authenticated />
        </MemoryRouter>
      </SessionProvider>
    );

    expect(screen.getByRole("status")).toHaveTextContent(/carregando projetos/i);
    expect(screen.queryByText(/projetos com editais ativos/i)).not.toBeInTheDocument();

    await act(async () => {
      resolveRequest({ total: projects.length, items: projects });
    });
    expect(await screen.findByText(/projetos com editais ativos/i)).toBeInTheDocument();
  });

  it("erro da API exibe mensagem, esconde a listagem e permite tentar novamente", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "fetchProjects").mockRejectedValueOnce(
      new Error("Não foi possível conectar ao servidor.")
    );

    render(
      <SessionProvider>
        <MemoryRouter>
          <PublicLanding authenticated />
        </MemoryRouter>
      </SessionProvider>
    );

    expect(
      await screen.findByText(/não foi possível carregar os projetos/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/não foi possível conectar ao servidor/i)).toBeInTheDocument();
    expect(screen.queryByText(/projetos com editais ativos/i)).not.toBeInTheDocument();

    // Segunda tentativa usa o mock real e carrega a listagem.
    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));
    expect(await screen.findByText(/6 projetos com editais ativos/i)).toBeInTheDocument();
    expect(screen.getByText(/Clínica de Direitos Humanos/i)).toBeInTheDocument();
  });
});
