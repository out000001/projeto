import { useCallback, useEffect, useState } from "react";

const DRAFT_KEY = "unicap:submission-draft";

function readDraft() {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    return { ...draft, attachments: [], attachmentsNeedReselection: Boolean(draft.attachments?.length || draft.attachmentsNeedReselection) };
  } catch {
    return null;
  }
}

/**
 * Persiste o rascunho de submissão no localStorage.
 * - salva automaticamente a cada alteração (com pequeno debounce),
 * - expõe metadados (salvo em / exists) para a UI,
 * - limpa o rascunho após o envio.
 */
export default function useSubmissionDraft(initialForm) {
  const [form, setForm] = useState(() => ({ ...initialForm, ...(readDraft() || {}) }));
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
        setSavedAt(new Date().toISOString());
      } catch {
        // storage indisponível (ex: modo privado) — rascunho vive só em memória
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form]);

  const updateForm = useCallback((updater) => {
    setForm((prev) =>
      typeof updater === "function" ? { ...prev, ...updater(prev) } : { ...prev, ...updater }
    );
  }, []);

  const clearDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // noop
    }
    setForm(initialForm);
    setSavedAt(null);
  }, [initialForm]);

  return { form, updateForm, clearDraft, savedAt, hasDraft: savedAt != null };
}
