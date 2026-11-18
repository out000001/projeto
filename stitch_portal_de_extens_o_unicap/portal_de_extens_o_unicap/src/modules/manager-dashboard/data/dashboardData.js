import {centers} from "../../project-submission/data/submissionOptions";
// Dashboard filter defaults. Available values are populated from saved projects.
export const filterOptions = {
  centers,
  thematicLines: [
    "Comunicação e expressão",
    "Cultura e diversidade",
    "Direitos humanos e justiça",
    "Educação",
    "Meio ambiente",
    "Saúde",
    "Tecnologia e produção"
  ],
  statuses: [
    { value: "active", label: "Ativo" },
    { value: "pending", label: "Pendente" },
    { value: "analysis", label: "Em análise" },
    { value: "suspended", label: "Suspenso" },
    { value: "completed", label: "Concluído" }
  ],
  grants: [
    "PIBIC 2024.2",
    "PIBIC 2025.1",
    "PROEXT 2025.1",
    "Prouni Extensão",
    "Programa Voluntário"
  ]
};
