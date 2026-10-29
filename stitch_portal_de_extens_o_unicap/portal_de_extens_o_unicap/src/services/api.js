// Cliente HTTP da API do back-end (server/). Único ponto de saída para a rede.
//
// Base URL: VITE_API_URL tem prioridade; no preview do Freebuff a página vive
// na porta 5173 e o proxy roteia a API na porta 3001 do MESMO host
// (https://3001-<id>.daytonaproxy01.net), então derivamos trocando a porta.
// Em dev local (localhost), a API é http://localhost:3001.

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function resolveApiBaseUrl({ hostname, protocol } = {}) {
  const configured = import.meta.env.VITE_API_URL;
  if (configured) return String(configured).replace(/\/+$/, "");

  const host = hostname ?? (typeof window !== "undefined" ? window.location.hostname : "");
  const proto = protocol ?? (typeof window !== "undefined" ? window.location.protocol : "http:");

  const proxyMatch = host.match(/^\d+-(.+)$/);
  if (proxyMatch) return `${proto}//3001-${proxyMatch[1]}`;
  if (host) return `${proto}//${host.split(":")[0]}:3001`;

  return "http://localhost:3001";
}

async function apiFetch(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${resolveApiBaseUrl()}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique se a API está em execução (bun run api).",
      { code: "NETWORK_ERROR" }
    );
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(data?.error?.message ?? "Erro inesperado no servidor.", {
      status: response.status,
      code: data?.error?.code
    });
  }
  return data;
}

/** POST /api/auth/login → { token, user } */
export function loginRequest(identifier, password) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: { identifier, password }
  });
}

/** GET /api/auth/me → { user } (valida o token no servidor) */
export function meRequest(token) {
  return apiFetch("/api/auth/me", { token });
}

/** POST /api/auth/logout → 204 */
export function logoutRequest(token) {
  return apiFetch("/api/auth/logout", { method: "POST", token });
}

/** GET /api/projects → { total, items } */
export function fetchProjects() {
  return apiFetch("/api/projects");
}
