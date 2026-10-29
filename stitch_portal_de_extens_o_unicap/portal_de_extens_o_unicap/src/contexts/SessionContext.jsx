import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { loginRequest, logoutRequest, observeSession } from "../services/api";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Retire the old SQLite session. Firebase owns token storage and refresh.
    try { window.localStorage.removeItem("unicap:session:v1"); } catch { /* unavailable storage */ }
    return observeSession((next) => {
      setSession(next);
      setRestoring(false);
    }, (err) => {
      setSession(null);
      setError(err.message);
      setRestoring(false);
    });
  }, []);

  const login = useCallback(async (identifier, password, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await loginRequest(identifier, password, options);
      setSession({ user });
      return { ok: true, user };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await logoutRequest();
      setSession(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  const value = useMemo(() => ({
    profile: session?.user?.profile ?? null,
    user: session?.user ?? null,
    loading,
    restoring,
    error,
    login,
    logout,
    isAuthenticated: session != null
  }), [session, loading, restoring, error, login, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

SessionProvider.propTypes = { children: PropTypes.node };

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
