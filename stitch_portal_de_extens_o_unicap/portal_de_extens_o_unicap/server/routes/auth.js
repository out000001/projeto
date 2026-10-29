import { Router } from "express";
import { ApiError } from "../errors.js";

/** Remove campos sensíveis antes de responder. */
function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    identifier: user.identifier,
    profile: user.profile
  };
}

/** Middleware de autenticação por token Bearer (sessão em memória). */
export function requireAuth(store) {
  return (req, _res, next) => {
    const header = req.get("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
    const user = store.getSessionUser(token);

    if (!user) {
      return next(new ApiError(401, "UNAUTHORIZED", "Sessão ausente ou inválida."));
    }

    req.user = user;
    return next();
  };
}

export default function authRoutes(store) {
  const router = Router();
  const auth = requireAuth(store);

  // POST /api/auth/login — abre sessão em memória e devolve um token opaco.
  router.post("/login", (req, res, next) => {
    const { identifier, password } = req.body ?? {};

    if (!String(identifier ?? "").trim() || !password) {
      return next(
        new ApiError(400, "VALIDATION_ERROR", "Informe identificação e senha.")
      );
    }

    const user = store.findUser(identifier, password);
    if (!user) {
      return next(
        new ApiError(401, "INVALID_CREDENTIALS", "Identificação ou senha inválidos.")
      );
    }

    const token = store.createSession(user);
    return res.status(200).json({ token, user: publicUser(user) });
  });

  // GET /api/auth/me — perfil de quem detém o token.
  router.get("/me", auth, (req, res) => {
    res.status(200).json({ user: publicUser(req.user) });
  });

  // POST /api/auth/logout — encerra a sessão do token informado.
  router.post("/logout", auth, (req, res) => {
    const header = req.get("authorization") ?? "";
    store.destroySession(header.slice(7).trim());
    res.status(204).end();
  });

  return router;
}
