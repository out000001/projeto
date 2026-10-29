import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { loginRequest, meRequest, logoutRequest } from "../services/api";

const SessionContext = createContext(null);

const STORAGE_KEY = "unicap:session:v1";
const VALID_PROFILES = ["gestor", "estudante"];

/** Recupera a sessão persistida ("Manter sessão conectada"), se válida. */
function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.token !== "string" || !VALID_PROFILES.includes(parsed?.profile)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persistSession(session) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...session, savedAt: Date.now() }));
  } catch {
    // localStorage indisponível (modo privado): a sessão segue apenas em memória.
  }
}

function clearStoredSession() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignora
  }
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => {
    const stored = readStoredSession();
    return stored ? { token: stored.token, profile: stored.profile, user: null } : null;
  });
  // restoring: validação do token persistido no mount (gating de rota).
  // loading: login em andamento (spinner do formulário) — conceitos separados
  // para o formulário não ser desmontado durante o submit.
  const [restoring, setRestoring] = useState(() => readStoredSession() != null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Restauração: valida o token persistido contra /api/auth/me. O servidor é a
  // autoridade — token inválido/expirado limpa a sessão local.
  useEffect(() => {
    if (!session?.token) return;

    meRequest(session.token)
      .then(({ user }) => {
        setSession((current) =>
          current?.token === session.token ? { ...current, user, profile: user.profile } : current
        );
      })
      .catch(() => {
        setSession(null);
        clearStoredSession();
      })
      .finally(() => {
        // Incondicional: setState após unmount é no-op silencioso no React 18.
        setRestoring(false);
      });
  }, [session?.token]);

  const login = useCallback(async (identifier, password, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { token, user } = await loginRequest(identifier, password);
      const next = { token, profile: user.profile, user };
      setSession(next);
      if (options.persist) {
        persistSession({ token, profile: user.profile });
      } else {
        clearStoredSession();
      }
      return { ok: true, user };
    } catch (err) {
      setError(err?.message || "Não foi possível fazer login.");
      return { ok: false, error: err?.message || "Não foi possível fazer login." };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    const current = session?.token;
    setSession(null);
    clearStoredSession();
    if (current) {
      // Invalidação no servidor é best-effort: a sessão local já saiu.
      logoutRequest(current).catch(() => {});
    }
  }, [session?.token]);

  const value = useMemo(
    () => ({
      profile: session?.profile ?? null,
      user: session?.user ?? null,
      loading,
      restoring,
      error,
      login,
      logout,
      isAuthenticated: session != null
    }),
    [session, loading, restoring, error, login, logout]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

SessionProvider.propTypes = {
  children: PropTypes.node
};

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
