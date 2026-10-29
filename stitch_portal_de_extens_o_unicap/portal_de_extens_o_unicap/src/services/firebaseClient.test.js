import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  browserLocalPersistence, inMemoryPersistence, onIdTokenChanged,
  setPersistence, signInWithEmailAndPassword, signOut
} from "firebase/auth";
import { getDoc, getDocs } from "firebase/firestore";
import { createFirebaseClient } from "./firebaseClient";

vi.mock("firebase/auth", () => ({
  browserLocalPersistence: { type: "LOCAL" },
  inMemoryPersistence: { type: "NONE" },
  onIdTokenChanged: vi.fn(), setPersistence: vi.fn(),
  signInWithEmailAndPassword: vi.fn(), signOut: vi.fn()
}));
vi.mock("firebase/firestore", () => ({
  collection: (_db, path) => path,
  doc: (_db, collection, id) => `${collection}/${id}`,
  getDoc: vi.fn(), getDocs: vi.fn()
}));

const auth = {};
const client = createFirebaseClient({ auth, firestore: {} });
const firebaseUser = { uid: "uid-student", email: "student@example.com" };

beforeEach(() => {
  vi.resetAllMocks();
  setPersistence.mockResolvedValue();
  signOut.mockResolvedValue();
  signInWithEmailAndPassword.mockResolvedValue({ user: firebaseUser });
  getDoc.mockResolvedValue({ exists: () => false });
});

describe("Firebase client", () => {
  it("signs in with email and asks the SDK to persist, never storing a custom token", async () => {
    const result = await client.loginRequest(" student@example.com ", "password");
    expect(setPersistence).toHaveBeenCalledWith(auth, browserLocalPersistence);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, "student@example.com", "password");
    expect(getDoc).toHaveBeenCalledWith("users/uid-student");
    expect(result).toEqual({ user: expect.objectContaining({ profile: "estudante", id: "uid-student" }) });
    expect(result).not.toHaveProperty("token");
  });

  it("uses in-memory persistence when keeping the session is unchecked", async () => {
    await client.loginRequest("student@example.com", "password", { persist: false });
    expect(setPersistence).toHaveBeenCalledWith(auth, inMemoryPersistence);
  });

  it("rejects empty credentials before accessing Firebase", async () => {
    await expect(client.loginRequest("", "")).rejects.toThrow(/preencha/i);
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("takes the manager role from the protected Firestore profile", async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ name: "Ana", profile: "gestor" }) });
    const result = await client.loginRequest("ana@example.com", "password");
    expect(result.user).toMatchObject({ name: "Ana", profile: "gestor" });
  });

  it("does not trust an unknown role or the selected profile card", async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ profile: "admin" }) });
    const result = await client.loginRequest("student@example.com", "password", { profile: "gestor" });
    expect(result.user.profile).toBe("estudante");
  });

  it("clears Firebase authentication when profile loading is denied", async () => {
    getDoc.mockRejectedValue({ code: "permission-denied" });
    await expect(client.loginRequest("student@example.com", "password")).rejects.toMatchObject({
      code: "permission-denied", message: expect.stringMatching(/acesso negado/i)
    });
    expect(signOut).toHaveBeenCalledWith(auth);
  });

  it("maps invalid credentials into a useful Portuguese error", async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: "auth/invalid-credential" });
    await expect(client.loginRequest("student@example.com", "wrong")).rejects.toThrow(/identificação ou senha inválidos/i);
  });

  it("logs out through Firebase", async () => {
    await client.logoutRequest();
    expect(signOut).toHaveBeenCalledWith(auth);
  });

  it("loads Firestore projects with document IDs and no SQLite fallback", async () => {
    getDocs.mockResolvedValue({ docs: [{ id: "project-1", data: () => ({ id: 99, title: "Projeto" }) }] });
    await expect(client.fetchProjects()).resolves.toEqual({ total: 1, items: [{ id: "project-1", title: "Projeto" }] });
    expect(getDocs).toHaveBeenCalledWith("projects");
  });

  it("preserves an empty catalogue instead of showing local demo projects", async () => {
    getDocs.mockResolvedValue({ docs: [] });
    await expect(client.fetchProjects()).resolves.toEqual({ total: 0, items: [] });
  });

  it("reports a Firestore permissions failure instead of falling back to mock data", async () => {
    getDocs.mockRejectedValue({ code: "permission-denied" });
    await expect(client.fetchProjects()).rejects.toMatchObject({ code: "permission-denied" });
  });

  it("observes restoration and token refresh, and unsubscribes", async () => {
    const unsubscribe = vi.fn();
    let onUser;
    onIdTokenChanged.mockImplementation((_auth, callback) => { onUser = callback; return unsubscribe; });
    const onSession = vi.fn();
    const stop = client.observeSession(onSession, vi.fn());
    await onUser(firebaseUser);
    expect(onSession).toHaveBeenLastCalledWith({ user: expect.objectContaining({ id: "uid-student" }) });
    await onUser(null);
    expect(onSession).toHaveBeenLastCalledWith(null);
    stop();
    expect(unsubscribe).toHaveBeenCalled();
    onSession.mockClear();
    await onUser(firebaseUser);
    expect(onSession).not.toHaveBeenCalled();
  });

  it("does not restore a stale profile if logout occurred during its fetch", async () => {
    let finish;
    getDoc.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    let onUser;
    onIdTokenChanged.mockImplementation((_auth, callback) => { onUser = callback; return vi.fn(); });
    const onSession = vi.fn();
    client.observeSession(onSession, vi.fn());
    const pending = onUser(firebaseUser);
    await onUser(null);
    finish({ exists: () => false });
    await pending;
    expect(onSession).toHaveBeenCalledTimes(1);
    expect(onSession).toHaveBeenCalledWith(null);
  });
});
