// Utilidades de texto puras (sem I/O): normalização para busca sem acento/caixa
// e reconhecimento dos valores padrão de filtro usados pelo front.

/** Remove acentos e caixa para busca textual simples (mesmo critério do front). */
export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Valores padrão do front ("Todas as áreas", "Todos os locais") não filtram. */
export function isDefaultFilter(value) {
  const text = String(value ?? "").trim();
  // "Todas as áreas" e "Todos os locais" começam com toda/todo.
  return text === "" || /^(toda|todo)/.test(normalizeText(text));
}
