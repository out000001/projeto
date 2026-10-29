// Hash de senhas com scrypt (node:crypto, sem dependência externa).
// Formato armazenado: "scrypt:<saltHex>:<hashHex>". A demo usa scryptSync
// (baixa concorrência); em produção, preferir a versão assíncrona.

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

/** Gera o hash completo de uma senha com salt aleatório. */
export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(String(password), salt, KEY_LENGTH).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

/** Confere uma senha contra o hash armazenado (comparações em tempo seguro). */
export function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored ?? "").split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const candidate = scryptSync(String(password), salt, KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
