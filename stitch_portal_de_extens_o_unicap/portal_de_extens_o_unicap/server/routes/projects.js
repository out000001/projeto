import { Router } from "express";
import { ApiError } from "../errors.js";

export default function projectsRoutes(store) {
  const router = Router();

  // GET /api/projects?q=&area=&local= — listagem da vitrine com filtros opcionais.
  router.get("/", (req, res) => {
    const items = store.listProjects({
      q: req.query.q,
      area: req.query.area,
      local: req.query.local
    });
    res.status(200).json({ total: items.length, items });
  });

  // GET /api/projects/:id — detalhe de um projeto.
  router.get("/:id", (req, res, next) => {
    const project = store.getProject(req.params.id);
    if (!project) {
      return next(new ApiError(404, "PROJECT_NOT_FOUND", "Projeto não encontrado."));
    }
    return res.status(200).json({ project });
  });

  return router;
}
