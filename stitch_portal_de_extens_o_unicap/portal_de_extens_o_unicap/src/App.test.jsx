import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { SessionProvider } from "./contexts/SessionContext";
import { resetApiMock } from "./services/apiMock";

// Sprint 11: o front autentica contra a API real. Os testes rodam contra o
// mock de contrato (server/seed.js), então usam as credenciais de demonstração.
vi.mock("./services/api", () => import("./services/apiMock"));

const GESTOR = { identifier: "ana.souza@unicap.br", password: "gestor123" };
const ESTUDANTE = { identifier: "20241001@unicap.br", password: "estudante123" };

beforeEach(() => {
  window.localStorage.clear();
  resetApiMock();
});

function renderWithRouter(element, initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <SessionProvider>{element}</SessionProvider>
    </MemoryRouter>
  );
}

async function loginThroughForm(user, { profileCard, credentials }) {
  await user.click(screen.getByText(profileCard));
  await user.type(screen.getByLabelText(/login institucional/i), credentials.identifier);
  await user.type(screen.getByLabelText(/senha de acesso/i), credentials.password);
  await user.click(screen.getByRole("button", { name: /entrar no painel de gestão/i }));
}

describe("Sprint 1 — acesso e roteamento", () => {
  it("renderiza o formulário de login na página inicial", () => {
    renderWithRouter(<App />, "/");
    expect(screen.getByRole("heading", { name: /portal de extensão comunitária/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/login institucional/i)).toBeInTheDocument();
  });

  it("login redireciona para dashboard após credenciais válidas", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, "/");

    await loginThroughForm(user, { profileCard: /gestor \/ docente/i, credentials: GESTOR });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /painel de gestão da extensão comunitária/i })).toBeInTheDocument();
    });
  });

  it("credenciais inválidas exibem o erro da API", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, "/");

    await user.click(screen.getByText(/gestor \/ docente/i));
    await user.type(screen.getByLabelText(/login institucional/i), "ana.souza@unicap.br");
    await user.type(screen.getByLabelText(/senha de acesso/i), "senha-errada");
    await user.click(screen.getByRole("button", { name: /entrar no painel de gestão/i }));

    expect(await screen.findByText(/identificação ou senha inválidos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/login institucional/i)).toBeInTheDocument();
  });
});

describe("Sprint 8 — rotas protegidas, perfis e sessão", () => {
  it("visitante em rota protegida é redirecionado para o login", async () => {
    renderWithRouter(<App />, "/settings");

    expect(
      await screen.findByRole("heading", { name: /portal de extensão comunitária/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/login institucional/i)).toBeInTheDocument();
  });

  it("login de estudante abre a vitrine pública com cabeçalho autenticado", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, "/");

    await loginThroughForm(user, { profileCard: /estudante \/ comunidade/i, credentials: ESTUDANTE });

    expect(
      await screen.findByRole("heading", { name: /conectando a unicap/i })
    ).toBeInTheDocument();
    // Cabeçalho do portal disponível para o estudante
    const sairButtons = screen.getAllByRole("button", { name: /sair/i });
    expect(sairButtons.length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /configurações/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /acompanhamento/i })).toBeInTheDocument();
    // Área exclusiva do gestor não aparece para o estudante
    expect(screen.queryByRole("link", { name: /painel gestor/i })).not.toBeInTheDocument();

    // Botão Ajuda abre a central de ajuda (não é um botão morto)
    await user.click(screen.getByRole("button", { name: "Ajuda" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: /como podemos ajudar\?/i })).toBeInTheDocument();
    expect(within(dialog).getByText("extensao@unicap.br")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Fechar" }));

    // Sair encerra a sessão e volta para a tela de login (não para a vitrine pública)
    await user.click(sairButtons[0]);

    expect(
      await screen.findByRole("heading", { name: /portal de extensão comunitária/i })
    ).toBeInTheDocument();
    expect(window.localStorage.getItem("unicap:session:v1")).toBeNull();
  });

  it("sessão persiste entre recargas quando 'manter conectada' está marcada", async () => {
    const user = userEvent.setup();
    const first = renderWithRouter(<App />, "/");

    await loginThroughForm(user, { profileCard: /gestor \/ docente/i, credentials: GESTOR });
    await screen.findByRole("heading", { name: /painel de gestão da extensão comunitária/i });

    expect(window.localStorage.getItem("unicap:session:v1")).toBeTruthy();
    first.unmount();

    renderWithRouter(<App />, "/dashboard");

    expect(
      await screen.findByRole("heading", { name: /painel de gestão da extensão comunitária/i })
    ).toBeInTheDocument();
  });

  it("token inválido no armazenamento limpa a sessão e volta ao login", async () => {
    // Simula um token legado/expirado gravado manualmente.
    window.localStorage.setItem(
      "unicap:session:v1",
      JSON.stringify({ token: "token-expirado", profile: "gestor" })
    );

    renderWithRouter(<App />, "/dashboard");

    expect(
      await screen.findByRole("heading", { name: /portal de extensão comunitária/i })
    ).toBeInTheDocument();
    expect(window.localStorage.getItem("unicap:session:v1")).toBeNull();
  });

  it("desmarcar 'manter conectada' não persiste a sessão", async () => {
    const user = userEvent.setup();
    const first = renderWithRouter(<App />, "/");

    await user.click(screen.getByText(/gestor \/ docente/i));
    await user.click(screen.getByRole("checkbox", { name: /manter sessão/i }));
    await user.type(screen.getByLabelText(/login institucional/i), GESTOR.identifier);
    await user.type(screen.getByLabelText(/senha de acesso/i), GESTOR.password);
    await user.click(screen.getByRole("button", { name: /entrar no painel de gestão/i }));
    await screen.findByRole("heading", { name: /painel de gestão da extensão comunitária/i });

    expect(window.localStorage.getItem("unicap:session:v1")).toBeNull();
    first.unmount();

    renderWithRouter(<App />, "/dashboard");

    expect(
      await screen.findByRole("heading", { name: /portal de extensão comunitária/i })
    ).toBeInTheDocument();
  });
});
