import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signOut, deleteUser } from "firebase/auth";
import { collection, connectFirestoreEmulator, doc, getDoc, getDocs, getFirestore, setDoc, terminate, updateDoc } from "firebase/firestore";
import { createFirebaseClient } from "../src/services/firebaseClient.js";
import { seedPublicProjects } from "./seedPublicProjects.js";

// Fixed demo project: this test must never operate on production.
const projectId = "demo-portal-unicap";

await test("Firebase Auth + Firestore integration and security rules", async (t) => {
  const environment = await initializeTestEnvironment({
    projectId,
    firestore: { host: "127.0.0.1", port: 8080, rules: await readFile(new URL("../firestore.rules", import.meta.url), "utf8") }
  });
  const app = initializeApp({ projectId, apiKey: "emulator-key" }, "firebase-integration");
  const auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  const firestore = getFirestore(app);
  connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
  const client = createFirebaseClient({ auth, firestore });
  let account;
  try {
    await environment.clearFirestore();
    const guest = environment.unauthenticatedContext().firestore();
    const student = environment.authenticatedContext("student").firestore();
    const manager = environment.authenticatedContext("manager").firestore();
    await environment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "users", "student"), { profile: "estudante" });
      await setDoc(doc(context.firestore(), "users", "manager"), { profile: "gestor" });
    });

    await t.test("guests can read the public catalogue but cannot write", async () => {
      await assertSucceeds(getDocs(collection(guest, "projects")));
      await assertFails(setDoc(doc(guest, "projects", "x"), { title: "Denied" }));
    });
    await t.test("students cannot write projects or promote themselves", async () => {
      await assertFails(setDoc(doc(student, "projects", "x"), { title: "Denied" }));
      await assertFails(updateDoc(doc(student, "users", "student"), { profile: "gestor" }));
      const newUser = environment.authenticatedContext("new-user").firestore();
      await assertFails(setDoc(doc(newUser, "users", "new-user"), { profile: "gestor" }));
    });
    await t.test("profiles are private and clients cannot enumerate users", async () => {
      await assertSucceeds(getDoc(doc(student, "users", "student")));
      await assertFails(getDoc(doc(student, "users", "manager")));
      await assertFails(getDocs(collection(manager, "users")));
      await assertFails(getDoc(doc(guest, "users", "student")));
      await assertFails(setDoc(doc(manager, "users", "student"), { profile: "gestor" }));
    });
    await t.test("unlisted collections remain private", async () => {
      await assertFails(setDoc(doc(manager, "private", "secret"), { content: "Denied" }));
      await assertFails(getDoc(doc(guest, "private", "secret")));
    });
    await t.test("real Auth SDK login, profile and logout use the configured adapter", async () => {
      const credential = await createUserWithEmailAndPassword(auth, `integration-${Date.now()}@example.com`, "emulator-password-123");
      account = credential.user;
      await environment.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "users", account.uid), { profile: "gestor", name: "Gestor de teste" });
      });
      await signOut(auth);
      const result = await client.loginRequest(account.email, "emulator-password-123", { persist: false });
      assert.equal(result.user.profile, "gestor");
      assert.equal(result.user.name, "Gestor de teste");
      await client.logoutRequest();
      assert.equal(auth.currentUser, null);
      await assert.rejects(client.loginRequest(account.email, "incorrect-password", { persist: false }));
    });
    await t.test("manager seed is idempotent and the adapter reads six actual documents", async () => {
      const first = await seedPublicProjects(manager);
      assert.equal(first.created, 6);
      const second = await seedPublicProjects(manager);
      assert.equal(second.created, 0);
      assert.equal(second.preserved, 6);
      const result = await client.fetchProjects();
      assert.equal(result.total, 6);
      assert.ok(result.items.some((item) => item.id === "1" && item.title.includes("Direitos Humanos")));
    });
  } finally {
    if (account) {
      await client.loginRequest(account.email, "emulator-password-123", { persist: false }).catch(() => {});
      if (auth.currentUser) await deleteUser(auth.currentUser).catch(() => {});
    }
    await signOut(auth);
    await terminate(firestore);
    await deleteApp(app);
    await environment.cleanup();
  }
});
