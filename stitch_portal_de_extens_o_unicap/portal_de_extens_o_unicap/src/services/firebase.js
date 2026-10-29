import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";

// Firebase web configuration identifies the app; access is controlled by
// Firebase Authentication and the database security rules.
const firebaseConfig = {
  apiKey: "AIzaSyAlJ9Dx8dzE48DloIHUT-zS2Wyp7cJZuvk",
  authDomain: "portaldeextensaocomunitaria.firebaseapp.com",
  projectId: "portaldeextensaocomunitaria",
  storageBucket: "portaldeextensaocomunitaria.firebasestorage.app",
  messagingSenderId: "329542227839",
  appId: "1:329542227839:web:9eff94d0b0d3258a096c4a",
  measurementId: "G-6R0QPR8KHQ"
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

if (import.meta.env?.VITE_FIREBASE_USE_EMULATORS === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
}
