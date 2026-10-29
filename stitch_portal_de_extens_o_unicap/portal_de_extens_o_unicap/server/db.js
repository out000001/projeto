// Abertura do banco SQLite (node:sqlite, sem dependência externa), schema e
// seed idempotente. Arquivo em server/data/portal.db (ignorado pelo git, ver
// .gitignore) ou ":memory:" para os testes — mesma fachada em ambos os casos.

// node:sqlite é carregado via createRequire: o bundler do Vite não o lista
// como builtin e quebraria o collect dos testes ao analisar o import estático.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "./passwords.js";
import { normalizeText } from "./text.js";
import seed from "./seed.js";

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite");

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "data");

/** Caminho padrão do arquivo de banco (em memória nos testes). */
export const DEFAULT_DB_PATH = join(DATA_DIR, "portal.db");

/**
 * Abre (ou cria) o banco, garante o schema e popula as tabelas vazias com o
 * seed. Idempotente: rodar de novo não duplica usuários nem projetos.
 */
export function openDatabase(dbPath = DEFAULT_DB_PATH) {
  if (dbPath !== ":memory:") {
    mkdirSync(dirname(dbPath), { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON;");
  createSchema(db);
  seedIfEmpty(db);
  return db;
}

function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      identifier    TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name          TEXT NOT NULL,
      profile       TEXT NOT NULL CHECK (profile IN ('gestor', 'estudante')),
      unit          TEXT,
      course        TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token     TEXT PRIMARY KEY,
      user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id           INTEGER PRIMARY KEY,
      title        TEXT NOT NULL,
      short_desc   TEXT NOT NULL,
      area         TEXT NOT NULL,
      area_norm    TEXT NOT NULL,
      local        TEXT NOT NULL,
      local_norm   TEXT NOT NULL,
      modality     TEXT NOT NULL,
      hours        TEXT NOT NULL,
      ods          TEXT NOT NULL,   -- JSON array
      courses      TEXT NOT NULL,
      deadline     TEXT NOT NULL,
      spots_left   INTEGER NOT NULL,
      spots_max    INTEGER NOT NULL,
      featured     INTEGER NOT NULL, -- 0/1
      turnos       TEXT NOT NULL,   -- JSON array
      description  TEXT NOT NULL,
      activities   TEXT NOT NULL,   -- JSON array
      partner      TEXT NOT NULL,
      search_text  TEXT NOT NULL    -- título+resumo+área+local normalizados p/ busca
    );
  `);
}

function seedIfEmpty(db) {
  const hasUsers = db.prepare("SELECT COUNT(*) AS n FROM users").get().n > 0;
  if (!hasUsers) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, identifier, password_hash, name, profile, unit, course)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const user of seed.users) {
      insertUser.run(
        user.id,
        user.identifier,
        hashPassword(user.password),
        user.name,
        user.profile,
        user.unit ?? null,
        user.course ?? null
      );
    }
  }

  const hasProjects = db.prepare("SELECT COUNT(*) AS n FROM projects").get().n > 0;
  if (!hasProjects) {
    const insertProject = db.prepare(`
      INSERT INTO projects (
        id, title, short_desc, area, area_norm, local, local_norm, modality,
        hours, ods, courses, deadline, spots_left, spots_max, featured,
        turnos, description, activities, partner, search_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const project of seed.projects) {
      insertProject.run(
        project.id,
        project.title,
        project.shortDesc,
        project.area,
        normalizeText(project.area),
        project.local,
        normalizeText(project.local),
        project.modality,
        project.hours,
        JSON.stringify(project.ods),
        project.courses,
        project.deadline,
        project.spotsLeft,
        project.spotsMax,
        project.featured ? 1 : 0,
        JSON.stringify(project.turnos),
        project.description,
        JSON.stringify(project.activities),
        project.partner,
        normalizeText(`${project.title} ${project.shortDesc} ${project.area} ${project.local}`)
      );
    }
  }
}
