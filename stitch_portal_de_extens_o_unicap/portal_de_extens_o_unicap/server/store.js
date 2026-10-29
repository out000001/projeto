// Repositório de dados da API, agora sobre SQLite (node:sqlite, sem deps).
// Interface IDÊNTICA à versão em memória (findUser, createSession, ...), então
// as rotas e os testes de integração não mudaram — só a implementação trocou,
// exatamente o que a arquitetura por repositório prometia.

import { randomUUID } from "node:crypto";
import { verifyPassword } from "./passwords.js";
import { normalizeText, isDefaultFilter } from "./text.js";

/** Linha de projects -> formato da API (camelCase, arrays parseados). */
function mapProject(row) {
  return {
    id: row.id,
    title: row.title,
    shortDesc: row.short_desc,
    area: row.area,
    local: row.local,
    modality: row.modality,
    hours: row.hours,
    ods: JSON.parse(row.ods),
    courses: row.courses,
    deadline: row.deadline,
    spotsLeft: row.spots_left,
    spotsMax: row.spots_max,
    featured: row.featured === 1,
    turnos: JSON.parse(row.turnos),
    description: row.description,
    activities: JSON.parse(row.activities),
    partner: row.partner
  };
}

/** Linha de users -> usuário público (sem senha nem hash). */
function mapUser(row) {
  return {
    id: row.id,
    identifier: row.identifier,
    name: row.name,
    profile: row.profile,
    unit: row.unit ?? undefined,
    course: row.course ?? undefined
  };
}

export function createStore(db) {
  return {
    /** Busca por identificador e confere a senha contra o hash scrypt. */
    findUser(identifier, password) {
      const wanted = String(identifier ?? "").trim().toLowerCase();
      const row = db
        .prepare("SELECT * FROM users WHERE identifier = ?")
        .get(wanted);

      if (!row || !verifyPassword(password, row.password_hash)) {
        return undefined;
      }
      return mapUser(row);
    },

    createSession(user) {
      const token = randomUUID();
      db.prepare(
        "INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)"
      ).run(token, user.id, Date.now());
      return token;
    },

    getSessionUser(token) {
      if (!token) return undefined;
      const row = db
        .prepare(
          `SELECT u.* FROM sessions s
             JOIN users u ON u.id = s.user_id
            WHERE s.token = ?`
        )
        .get(token);
      return row ? mapUser(row) : undefined;
    },

    destroySession(token) {
      const info = db
        .prepare("DELETE FROM sessions WHERE token = ?")
        .run(token);
      return info.changes > 0;
    },

    /** Listagem com busca sem acento/caixa e filtros exatos de área/local. */
    listProjects({ q, area, local } = {}) {
      const clauses = [];
      const params = [];

      if (!isDefaultFilter(q)) {
        // search_text já é normalizado; LIKE no SQLite ignora caixa ASCII.
        clauses.push("search_text LIKE ? ESCAPE '\\'");
        params.push(`%${normalizeText(q).replace(/[\\%_]/g, "\\$&")}%`);
      }
      if (!isDefaultFilter(area)) {
        clauses.push("area_norm = ?");
        params.push(normalizeText(area));
      }
      if (!isDefaultFilter(local)) {
        clauses.push("local_norm = ?");
        params.push(normalizeText(local));
      }

      const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
      const rows = db
        .prepare(`SELECT * FROM projects ${where} ORDER BY id`)
        .all(...params);
      return rows.map(mapProject);
    },

    getProject(id) {
      const numericId = Number(id);
      if (!Number.isInteger(numericId)) return undefined;
      const row = db
        .prepare("SELECT * FROM projects WHERE id = ?")
        .get(numericId);
      return row ? mapProject(row) : undefined;
    }
  };
}
