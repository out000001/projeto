// Persistência: a promessa desta entrega é que dados sobrevivem a um
// reinício do processo. Estes testes reabrem o MESMO arquivo de banco com um
// store novo — algo impossível na versão em memória — e cobrem hash de senha
// e a utilidade pura de texto usada pela busca.

import { describe, it, expect, afterAll } from "vitest";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStore } from "./store.js";
import { openDatabase } from "./db.js";
import { hashPassword, verifyPassword } from "./passwords.js";
import { normalizeText, isDefaultFilter } from "./text.js";

const tempDir = mkdtempSync(join(tmpdir(), "portal-db-"));
const dbPath = join(tempDir, "portal.db");

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe("Persistência em arquivo (SQLite)", () => {
  it("sessão criada antes de um reinício continua válida depois dele", () => {
    // 1) primeiro 'processo': cria sessão e encerra (fecha o banco).
    const first = openDatabase(dbPath);
    const storeA = createStore(first);
    const user = storeA.findUser("ana.souza@unicap.br", "gestor123");
    expect(user).toBeTruthy();
    const token = storeA.createSession(user);
    first.close();

    // 2) segundo 'processo': novo banco/store sobre o MESMO arquivo.
    const second = openDatabase(dbPath);
    const storeB = createStore(second);
    expect(storeB.getSessionUser(token)?.identifier).toBe("ana.souza@unicap.br");
    second.close();
  });

  it("projetos do seed persistem entre reinícios", () => {
    const db = openDatabase(dbPath);
    const store = createStore(db);
    expect(store.listProjects({}).length).toBeGreaterThan(0);
    expect(store.getProject(1)?.title).toBeTruthy();
    db.close();
  });

  it("reabrir o banco não duplica usuários nem projetos (seed idempotente)", () => {
    openDatabase(dbPath);
    const db = openDatabase(dbPath);
    const users = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
    const projects = db.prepare("SELECT COUNT(*) AS n FROM projects").get().n;
    expect(users).toBe(2);
    expect(projects).toBe(6);
    db.close();
  });

  it("senhas ficam armazenadas como hash, nunca em texto puro", () => {
    const db = openDatabase(dbPath);
    const row = db
      .prepare("SELECT password_hash FROM users WHERE identifier = ?")
      .get("ana.souza@unicap.br");
    expect(row.password_hash.startsWith("scrypt:")).toBe(true);
    expect(row.password_hash).not.toContain("gestor123");
    db.close();
  });

  it("o arquivo de banco é criado no disco", () => {
    expect(existsSync(dbPath)).toBe(true);
  });
});

describe("Hash de senhas (scrypt)", () => {
  it("verifica a senha correta e recusa a incorreta", () => {
    const stored = hashPassword("senha-segura-123");
    expect(verifyPassword("senha-segura-123", stored)).toBe(true);
    expect(verifyPassword("outra-senha", stored)).toBe(false);
  });

  it("usa salt distinto por hash (mesmos dados geram hashes diferentes)", () => {
    expect(hashPassword("mesma")).not.toBe(hashPassword("mesma"));
  });

  it("recusa formato de hash desconhecido", () => {
    expect(verifyPassword("x", "md5:abc:def")).toBe(false);
    expect(verifyPassword("x", "")).toBe(false);
  });
});

describe("Utilidades de texto", () => {
  it("normalizeText remove acentos e caixa", () => {
    expect(normalizeText("Saúde Comunitária")).toBe("saude comunitaria");
    expect(normalizeText(undefined)).toBe("");
  });

  it("isDefaultFilter reconhece os valores padrão do front", () => {
    expect(isDefaultFilter("Todas as áreas")).toBe(true);
    expect(isDefaultFilter("Todos os locais")).toBe(true);
    expect(isDefaultFilter("")).toBe(true);
    expect(isDefaultFilter("Cultura Popular")).toBe(false);
  });
});
