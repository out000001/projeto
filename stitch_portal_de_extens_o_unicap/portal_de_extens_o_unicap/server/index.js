// Ponto de entrada da API: `bun run api` (ou `node server/index.js`).
// API_PORT evita colidir com a PORT que a plataforma injeta no front (5173).

import { createApp } from "./app.js";

const port = Number(process.env.API_PORT) || 3001;
const app = createApp();

app.listen(port, "0.0.0.0", () => {
  console.log(`[api] Portal de Extensão UNICAP ouvindo em http://0.0.0.0:${port}`);
});
