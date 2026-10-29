import assert from "node:assert/strict";
import { test } from "node:test";
import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth, connectAuthEmulator, createUserWithEmailAndPassword, deleteUser,
  inMemoryPersistence, setPersistence, signInWithEmailAndPassword, signOut
} from "firebase/auth";

await test("Firebase Authentication SDK against the local emulator", async (t) => {
  const app = initializeApp({ projectId: "demo-portal-unicap", apiKey: "emulator-key" }, "auth-smoke-test");
  const auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  const email = `smoke-${Date.now()}@example.com`;
  const password = "emulator-password-123";
  try {
    await setPersistence(auth, inMemoryPersistence);
    await t.test("creates an isolated test user", async () => {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      assert.equal(credential.user.email, email);
      await signOut(auth);
    });
    await t.test("rejects an incorrect password", async () => {
      await assert.rejects(signInWithEmailAndPassword(auth, email, "incorrect-password"));
      assert.equal(auth.currentUser, null);
    });
    await t.test("signs in and refreshes the Firebase token", async () => {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdTokenResult(true);
      assert.equal(token.claims.email, email);
      assert.equal(auth.currentUser.uid, credential.user.uid);
    });
    await t.test("signs out and clears the SDK session", async () => {
      await signOut(auth);
      assert.equal(auth.currentUser, null);
    });
  } finally {
    await signInWithEmailAndPassword(auth, email, password).catch(() => {});
    if (auth.currentUser) await deleteUser(auth.currentUser);
    await signOut(auth);
    await deleteApp(app);
  }
});
