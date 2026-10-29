import {
  browserLocalPersistence,
  inMemoryPersistence,
  onIdTokenChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

const messages = {
  "auth/invalid-credential": "Identificação ou senha inválidos.",
  "auth/invalid-email": "Informe um e-mail válido para entrar.",
  "auth/user-not-found": "Identificação ou senha inválidos.",
  "auth/wrong-password": "Identificação ou senha inválidos.",
  "auth/user-disabled": "Esta conta foi desativada. Entre em contato com o suporte.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde antes de tentar novamente.",
  "auth/network-request-failed": "Não foi possível conectar ao Firebase. Verifique sua conexão.",
  "auth/operation-not-allowed": "O acesso por e-mail e senha ainda não está habilitado.",
  "permission-denied": "Acesso negado pelo banco de dados. Entre em contato com o suporte.",
  unavailable: "O banco de dados está indisponível. Tente novamente."
};

function firebaseError(error) {
  const result = new Error(messages[error?.code] || "Não foi possível concluir a operação no Firebase.");
  result.code = error?.code || "FIREBASE_ERROR";
  return result;
}

/** Firebase owns sessions; protected users/{uid} documents own roles. */
export function createFirebaseClient({ auth, firestore }) {
  async function loadUser(firebaseUser) {
    const snapshot = await getDoc(doc(firestore, "users", firebaseUser.uid));
    const profile = snapshot.exists() ? snapshot.data() : {};
    return {
      id: firebaseUser.uid,
      identifier: firebaseUser.email,
      name: profile.name || firebaseUser.displayName || firebaseUser.email,
      profile: profile.profile === "gestor" ? "gestor" : "estudante",
      unit: profile.unit,
      course: profile.course
    };
  }

  return {
    async loginRequest(identifier, password, { persist = true } = {}) {
      const email = String(identifier ?? "").trim();
      if (!email || !password) throw new Error("Preencha identificação e senha.");
      try {
        await setPersistence(auth, persist ? browserLocalPersistence : inMemoryPersistence);
        const credential = await signInWithEmailAndPassword(auth, email, password);
        try {
          return { user: await loadUser(credential.user) };
        } catch (error) {
          await signOut(auth);
          throw error;
        }
      } catch (error) {
        throw firebaseError(error);
      }
    },

    async logoutRequest() {
      try {
        await signOut(auth);
      } catch (error) {
        throw firebaseError(error);
      }
    },

    observeSession(onSession, onError) {
      let active = true;
      let revision = 0;
      const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
        const current = ++revision;
        if (!firebaseUser) {
          if (active) onSession(null);
          return;
        }
        try {
          const user = await loadUser(firebaseUser);
          if (active && current === revision) onSession({ user });
        } catch (error) {
          if (active && current === revision) onError(firebaseError(error));
        }
      }, (error) => {
        if (active) onError(firebaseError(error));
      });
      return () => {
        active = false;
        unsubscribe();
      };
    },

    async fetchProjects() {
      try {
        const snapshot = await getDocs(collection(firestore, "projects"));
        const items = snapshot.docs.map((project) => ({ ...project.data(), id: project.id }));
        return { total: items.length, items };
      } catch (error) {
        throw firebaseError(error);
      }
    }
  };
}
