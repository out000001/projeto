// Dados iniciais da API (em memória).
// Os projetos reaproveitam os dados puros da vitrine (sem React): quando o
// front passar a consumir esta API, o mock deixa de ser a fonte do navegador.

import { projects as vitrineProjects } from "../src/modules/public/data/projects.js";

// Credenciais de demonstração — trocar por hash + banco real nas próximas entregas.
export const users = [
  {
    id: "usr-gestor",
    identifier: "ana.souza@unicap.br",
    password: "gestor123",
    name: "Profa. Ana Souza",
    profile: "gestor",
    unit: "DEG — Divisão de Extensão Geral"
  },
  {
    id: "usr-estudante",
    identifier: "20241001@unicap.br",
    password: "estudante123",
    name: "João Pedro Lima",
    profile: "estudante",
    course: "Ciência da Computação"
  }
];

export const projects = vitrineProjects;

// Reunião dos dois em um único objeto, para o repositório em memória.
const seed = { users, projects };
export default seed;
