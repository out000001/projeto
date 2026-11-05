import { services } from '../server/firebase-admin.mjs';
import { createProjectsHandler } from '../server/projects.mjs';
export default async function projects(req,res) {
  res.setHeader('Cache-Control','no-store');
  try { return await createProjectsHandler(services())(req,res); }
  catch { return res.status(503).json({error:'Serviço de projetos indisponível. Tente novamente.'}); }
}
