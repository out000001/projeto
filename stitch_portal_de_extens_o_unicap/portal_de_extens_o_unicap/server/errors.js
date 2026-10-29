// Erros da API com formato único: { error: { code, message } }.
// Handlers de rota lançam ApiError; os middlewares abaixo respondem em JSON.

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** 404 para rotas desconhecidas (evita o HTML padrão do Express). */
export function notFoundHandler(req, _res, next) {
  next(new ApiError(404, "ROUTE_NOT_FOUND", `Rota não encontrada: ${req.method} ${req.path}`));
}

/** Handler final: converte ApiError/erros do body-parser em JSON; o resto vira 500. */
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ error: { code: err.code, message: err.message } });
  }

  // JSON malformado ou corpo grande demais vêm do express.json().
  if (err?.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ error: { code: "INVALID_JSON", message: "Corpo da requisição não é um JSON válido." } });
  }
  if (err?.type === "entity.too.large") {
    return res
      .status(413)
      .json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Corpo da requisição excede o limite." } });
  }

  // Erro inesperado: registra no servidor e responde sem vazar detalhe interno.
  console.error("[api] erro não tratado:", err);
  return res
    .status(500)
    .json({ error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor." } });
}
