// Test-only contract double. Firebase SDK behavior is tested separately.
import seed from "../../server/seed.js";

const listeners = new Set();
const STORAGE_KEY = "unicap:test-auth";
let current = null;

function publicUser(user) {
  return { id: user.id, name: user.name, identifier: user.identifier, profile: user.profile };
}

export function resetApiMock() {
  current = null;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function observeSession(callback) {
  listeners.add(callback);
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const user = stored ? seed.users.find((entry) => entry.id === stored) : null;
  Promise.resolve().then(() => {
    if (listeners.has(callback)) callback(user ? { user: publicUser(user) } : null);
  });
  return () => listeners.delete(callback);
}

export async function loginRequest(identifier, password, { persist = true } = {}) {
  const user = seed.users.find((entry) =>
    entry.identifier.toLowerCase() === String(identifier).trim().toLowerCase() && entry.password === password
  );
  if (!user) throw new Error("Identificação ou senha inválidos.");
  current = { user: publicUser(user) };
  if (persist) window.localStorage.setItem(STORAGE_KEY, user.id);
  else window.localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((listener) => listener(current));
  return current;
}

export async function logoutRequest() {
  current = null;
  window.localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((listener) => listener(null));
}

export async function fetchProjects() {
  return { total: seed.projects.length, items: seed.projects };
}
