import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionProvider } from "../../contexts/SessionContext";
import SettingsScreen from "./Settings";

vi.mock("../../services/api", () => import("../../services/apiMock"));

const STORAGE_KEY = "portal-unicap.settings.v1";

async function renderSettings() {
  let result;
  await act(async () => { result = render(
    <SessionProvider>
      <SettingsScreen />
    </SessionProvider>
  ); });
  return result;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("Sprint 7 — tela de configurações da conta", () => {
  it("renderiza as quatro seções com valores padrão e botão salvar desabilitado", async () => {
    await renderSettings();

    expect(screen.getByRole("heading", { name: /configurações da conta/i })).toBeInTheDocument();
    for (const section of ["Perfil", "Vínculo Institucional", "Notificações", "Privacidade & Segurança"]) {
      expect(screen.getByRole("heading", { name: section })).toBeInTheDocument();
    }

    expect(screen.getByRole("switch", { name: "Alertas de prazos" })).toBeChecked();
    expect(screen.getByRole("switch", { name: "Novos editais" })).not.toBeChecked();
    expect(screen.getByLabelText("Nome de exibição")).toHaveValue("");
    expect(screen.getByRole("button", { name: /salvar configurações/i })).toBeDisabled();
  });

  it("carrega preferências previamente salvas do localStorage", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        displayName: "Maria Silva",
        alternateEmail: "maria@pessoal.com",
        notifyDeadlines: true,
        notifyHomologacoes: true,
        notifyEditais: true,
        weeklyDigest: false,
        density: "confortavel",
        deadlineAlertDays: 3,
        sessionTimeoutMinutes: 60
      })
    );
    await renderSettings();

    expect(screen.getByLabelText("Nome de exibição")).toHaveValue("Maria Silva");
    expect(screen.getByRole("switch", { name: "Novos editais" })).toBeChecked();
    expect(screen.getByRole("switch", { name: "Resumo semanal" })).not.toBeChecked();
    expect(screen.getByLabelText("Antecedência do alerta de prazos (dias)")).toHaveValue(3);
  });

  it("valida campos inválidos e impede salvar", async () => {
    const user = userEvent.setup();
    await renderSettings();

    await user.type(screen.getByLabelText("E-mail alternativo"), "email-invalido");
    const daysInput = screen.getByLabelText("Antecedência do alerta de prazos (dias)");
    await user.clear(daysInput);
    await user.type(daysInput, "99");

    expect(screen.getByText(/informe um e-mail válido/i)).toBeInTheDocument();
    expect(screen.getByText(/antecedência do alerta deve ser entre 1 e 30 dias/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /salvar configurações/i })).toBeDisabled();
  });

  it("salva alterações no localStorage e sincroniza o estado salvo", async () => {
    const user = userEvent.setup();
    await renderSettings();

    await user.type(screen.getByLabelText("Nome de exibição"), "Maria Silva");
    await user.click(screen.getByRole("switch", { name: "Novos editais" }));
    await user.click(screen.getByRole("button", { name: /salvar configurações/i }));

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    expect(stored.displayName).toBe("Maria Silva");
    expect(stored.notifyEditais).toBe(true);
    expect(screen.getByText("Tudo sincronizado.")).toBeInTheDocument();

    // Nova alteração habilita Descartar, que reverte para o snapshot salvo
    await user.type(screen.getByLabelText("Nome de exibição"), " Souza");
    await user.click(screen.getByRole("button", { name: /descartar/i }));
    expect(screen.getByLabelText("Nome de exibição")).toHaveValue("Maria Silva");
  });

  it("restaurar padrões apaga o localStorage e volta aos valores iniciais", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ displayName: "Maria Silva" }));
    await renderSettings();

    expect(screen.getByLabelText("Nome de exibição")).toHaveValue("Maria Silva");

    await user.click(screen.getByRole("button", { name: /restaurar padrões/i }));

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(screen.getByLabelText("Nome de exibição")).toHaveValue("");
    expect(screen.getByRole("switch", { name: "Alertas de prazos" })).toBeChecked();
  });
});
