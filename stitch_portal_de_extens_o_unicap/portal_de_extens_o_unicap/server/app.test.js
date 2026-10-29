// Testes de integração da API (supertest): o app é montado em memória e as
// requisições passam por HTTP de verdade, sem subir processo separado.

import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import { createStore } from "./store.js";
import { openDatabase } from "./db.js";
import seed from "./seed.js";

// Banco em memória: os mesmos testes de HTTP de antes, agora sobre o schema
// real do SQLite (a reescrita do store.js é transparente para as rotas).
const app = createApp(createStore(openDatabase(":memory:")));

const login = (identifier, password) =>
  request(app).post("/api/auth/login").send({ identifier, password });

describe("GET /api/health", () => {
  it("responde 200 com status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("portal-extensao-unicap-api");
  });
});

describe("POST /api/auth/login", () => {
  it("abre sessão de gestor com credenciais válidas", async () => {
    const res = await login("ana.souza@unicap.br", "gestor123");
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.length).toBeGreaterThan(0);
    expect(res.body.user).toMatchObject({
      name: "Profa. Ana Souza",
      profile: "gestor"
    });
  });

  it("devolve o perfil estudante", async () => {
    const res = await login("20241001@unicap.br", "estudante123");
    expect(res.status).toBe(200);
    expect(res.body.user.profile).toBe("estudante");
  });

  it("não expõe a senha na resposta", async () => {
    const res = await login("ana.souza@unicap.br", "gestor123");
    expect(res.body.user).not.toHaveProperty("password");
    expect(JSON.stringify(res.body)).not.toContain("gestor123");
  });

  it("rejeita login sem senha com 400 VALIDATION_ERROR", async () => {
    const res = await login("ana.souza@unicap.br", "");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejeita senha incorreta com 401 INVALID_CREDENTIALS", async () => {
    const res = await login("ana.souza@unicap.br", "errada");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejeita identificação desconhecida com 401", async () => {
    const res = await login("ninguem@unicap.br", "gestor123");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });
});

describe("Sessão: /api/auth/me e /api/auth/logout", () => {
  it("exige token (401 UNAUTHORIZED sem Bearer)", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejeita token inválido", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer token-qualquer");
    expect(res.status).toBe(401);
  });

  it("devolve o usuário do token válido", async () => {
    const { body } = await login("20241001@unicap.br", "estudante123");
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.identifier).toBe("20241001@unicap.br");
  });

  it("logout encerra a sessão (204 e novo /me dá 401)", async () => {
    const { body } = await login("ana.souza@unicap.br", "gestor123");
    const out = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${body.token}`);
    expect(out.status).toBe(204);

    const after = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${body.token}`);
    expect(after.status).toBe(401);
  });
});

describe("GET /api/projects", () => {
  it("lista todos os projetos do seed", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(seed.projects.length);
    expect(res.body.items).toHaveLength(seed.projects.length);
  });

  it("busca textual ignora acento e caixa (q=saude)", async () => {
    const res = await request(app).get("/api/projects").query({ q: "SAUDE" });
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
    for (const item of res.body.items) {
      expect(`${item.title} ${item.shortDesc} ${item.area} ${item.local}`.toLowerCase())
        .toContain("saúde");
    }
  });

  it("filtra por área exata", async () => {
    const res = await request(app)
      .get("/api/projects")
      .query({ area: "Cultura Popular" });
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].area).toBe("Cultura Popular");
  });

  it("filtra por local", async () => {
    const res = await request(app).get("/api/projects").query({ local: "Soledade" });
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
    for (const item of res.body.items) {
      expect(item.local).toBe("Soledade");
    }
  });

  it("valores padrão do front ('Todas as áreas') não filtram", async () => {
    const res = await request(app)
      .get("/api/projects")
      .query({ area: "Todas as áreas", local: "Todos os locais" });
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(seed.projects.length);
  });
});

describe("GET /api/projects/:id", () => {
  it("devolve o projeto pelo id", async () => {
    const res = await request(app).get("/api/projects/1");
    expect(res.status).toBe(200);
    expect(res.body.project.id).toBe(1);
    expect(res.body.project.title).toBeTruthy();
  });

  it("id inexistente responde 404 PROJECT_NOT_FOUND", async () => {
    const res = await request(app).get("/api/projects/9999");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("PROJECT_NOT_FOUND");
  });

  it("id não numérico também responde 404", async () => {
    const res = await request(app).get("/api/projects/abc");
    expect(res.status).toBe(404);
  });
});

describe("Erros de rota e de corpo", () => {
  it("rota desconhecida responde 404 em JSON", async () => {
    const res = await request(app).get("/api/rota-inexistente");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
  });

  it("JSON malformado responde 400 INVALID_JSON", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{isso nao é json");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_JSON");
  });
});
