import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, it, expect, vi } from "vitest";
import RegistrationForm from "./RegistrationForm";

afterEach(() => vi.unstubAllGlobals());
async function fill(user, confirmation = "password123") {
  await user.type(screen.getByLabelText("Nome completo"), "Ana Silva");
  await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
  await user.type(screen.getByLabelText("Senha"), "password123");
  await user.type(screen.getByLabelText("Confirmar senha"), confirmation);
}
it("registers a student without a manager code and offers login", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  vi.stubGlobal("fetch", fetchMock);
  const onBack = vi.fn();
  const user = userEvent.setup();
  render(<RegistrationForm onBack={onBack} />);
  expect(screen.queryByLabelText("Chave de cadastro de gestor")).not.toBeInTheDocument();
  await fill(user);
  await user.click(screen.getByRole("button", { name: "Criar conta" }));
  expect(await screen.findByRole("status")).toHaveTextContent("Cadastro concluído");
  const body = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(body.profile).toBe("estudante");
  expect(body).not.toHaveProperty("managerCode");
  await user.click(screen.getByRole("button", { name: "Ir para o login" }));
  expect(onBack).toHaveBeenCalledOnce();
});
it("sends the manager key to the server and displays rejection without granting access", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Chave de gestor inválida." }) });
  vi.stubGlobal("fetch", fetchMock);
  const user = userEvent.setup();
  render(<RegistrationForm onBack={() => {}} />);
  await user.click(screen.getByLabelText("Gestor / Docente"));
  await fill(user);
  await user.type(screen.getByLabelText("Chave de cadastro de gestor"), "incorrect-key");
  await user.click(screen.getByRole("button", { name: "Criar conta" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Chave de gestor inválida.");
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ profile: "gestor", managerCode: "incorrect-key" });
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
it("blocks mismatched passwords before sending a request", async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  const user = userEvent.setup();
  render(<RegistrationForm onBack={() => {}} />);
  await fill(user, "different-password");
  await user.click(screen.getByRole("button", { name: "Criar conta" }));
  expect(screen.getByRole("alert")).toHaveTextContent("As senhas não coincidem");
  expect(fetchMock).not.toHaveBeenCalled();
});
