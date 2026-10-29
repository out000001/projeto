// Fábrica do app Express: JSON body parser, CORS, rotas e handlers de erro.
// createApp(store) aceita um repositório próprio para os testes; o servidor
// real usa o repositório padrão: SQLite em server/data/portal.db.

import express from "express";
import cors from "cors";
import { createStore } from "./store.js";
import { openDatabase } from "./db.js";
import { notFoundHandler, errorHandler } from "./errors.js";
import authRoutes from "./routes/auth.js";
import projectsRoutes from "./routes/projects.js";

export function createApp(store = null) {
  const repo = store ?? createStore(openDatabase());
  const app = express();

  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json());

  // GET /api/health — verificação simples de vida da API.
  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "portal-extensao-unicap-api",
      time: new Date().toISOString()
    });
  });

  app.use("/api/auth", authRoutes(repo));
  app.use("/api/projects", projectsRoutes(repo));

  // Fora de /api ou rota desconhecida: 404 em JSON (nunca HTML do Express).
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
