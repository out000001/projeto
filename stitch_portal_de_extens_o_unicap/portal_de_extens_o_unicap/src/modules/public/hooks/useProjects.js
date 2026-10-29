// Carrega o catálogo público do Firestore. Erros não são substituídos por mocks.

import { useState, useEffect, useCallback } from "react";
import { fetchProjects } from "../../../services/api";

export default function useProjects() {
  const [state, setState] = useState({ items: [], loading: true, error: null });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const { items } = await fetchProjects();
      setState({ items, loading: false, error: null });
    } catch (err) {
      setState({
        items: [],
        loading: false,
        error: err?.message || "Não foi possível carregar os projetos."
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
