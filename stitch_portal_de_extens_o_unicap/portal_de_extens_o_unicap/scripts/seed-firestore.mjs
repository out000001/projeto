import { connectAuthEmulator, inMemoryPersistence, setPersistence, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { connectFirestoreEmulator, doc, getDoc, terminate } from "firebase/firestore";
import { auth, firestore, firebaseApp } from "../src/services/firebase.js";
import { deleteApp } from "firebase/app";
import { seedPublicProjects } from "./seedPublicProjects.js";

async function main() {
  if (!process.argv.includes("--write")) {
    console.log("Nenhum dado alterado. Use --write para importar somente os projetos ausentes.");
    return;
  }
  if (process.env.FIREBASE_EMULATOR === "true") {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
  }
  const email = process.env.FIREBASE_SEED_EMAIL;
  const password = process.env.FIREBASE_SEED_PASSWORD;
  if (!email || !password) throw new Error("Defina FIREBASE_SEED_EMAIL e FIREBASE_SEED_PASSWORD em um arquivo .env.seed.local ignorado pelo Git ou no ambiente seguro.");
  await setPersistence(auth, inMemoryPersistence);
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getDoc(doc(firestore, "users", user.uid));
  if (!profile.exists() || profile.data().profile !== "gestor") {
    throw new Error("A conta precisa de um documento users/{uid} com profile = gestor, criado por um administrador no console.");
  }
  console.log(await seedPublicProjects(firestore));
}

try {
  await main();
} catch (error) {
  // Do not log request bodies, tokens or SDK credential objects.
  console.error(error.code || error.message);
  process.exitCode = 1;
} finally {
  await signOut(auth).catch(() => {});
  await terminate(firestore);
  await deleteApp(firebaseApp);
}
