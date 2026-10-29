// Shared UI contract: Firebase Auth owns sessions; Firestore owns the catalogue.
// The SQLite API remains available for legacy development, independently.
import { auth, firestore } from "./firebase";
import { createFirebaseClient } from "./firebaseClient";

export const { loginRequest, logoutRequest, observeSession, fetchProjects } =
  createFirebaseClient({ auth, firestore });
