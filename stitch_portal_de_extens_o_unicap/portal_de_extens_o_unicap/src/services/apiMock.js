// Mock de contrato da API para testes de componente/fluxo: espelha os
// endpoints reais de server/ (login, me, logout, projects) com o mesmo formato
// de sucesso e de erro ({ error: { code, message } } → Error com message).
// Importa o seed real do back-end para os testes usarem as MESMAS credenciais
// de demonstração. Arquivo só de teste — nunca entra no bundle do app.
//
// Uso nos testes:
//   vi.mock("../services/api", () => import("../services/apiMock"));

import seed from "../../server/seed.js";

const sessions = new Map(); // token -> user (espelha as sessões do servidor)
let tokenSeq = 0;

/** Erro com o mesmo formato do ApiError real (message/status/code). */
function apiError(message, status, code) {
  const err = new Error(message);
  err.name = "ApiError";
  err.status = status;
  err.code = code;
  return err;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    identifier: user.identifier,
    profile: user.profile
  };
}

/** Zera as sessões entre testes (chamar em beforeEach). */
export function resetApiMock() {
  sessions.clear();
  tokenSeq = 0;
}

export async function loginRequest(identifier, password) {
  const clean = String(identifier ?? "").trim();
  if (!clean || !password) {
    throw apiError("Preencha identificação e senha.", 400, "VALIDATION_ERROR");
  }

  const user = seed.users.find(
    (candidate) =>
      candidate.identifier.toLowerCase() === clean.toLowerCase() &&
      candidate.password === password
  );
  if (!user) {
    throw apiError("Identificação ou senha inválidos.", 401, "INVALID_CREDENTIALS");
  }

  const token = `mock-token-${++tokenSeq}`;
  sessions.set(token, user);
  return { token, user: publicUser(user) };
}

export async function meRequest(token) {
  const user = sessions.get(token);
  if (!user) {
    throw apiError("Sessão ausente ou inválida.", 401, "UNAUTHORIZED");
  }
  return { user: publicUser(user) };
}

export async function logoutRequest(token) {
  sessions.delete(token);
  return null;
}

export async function fetchProjects() {
  return { total: seed.projects.length, items: seed.projects };
}
