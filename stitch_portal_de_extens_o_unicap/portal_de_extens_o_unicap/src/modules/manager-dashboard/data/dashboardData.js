// Dashboard filter defaults. Available values are populated from saved projects.
export const filterOptions = {
  centers: [
    "Ciências Humanas",
    "Ciências Jurídicas",
    "Ciências Sociais",
    "Ciências Biológicas e Saúde",
    "UNICAP Icam Tech"
  ],
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
    "PIBEX 2024.2",
    "PIBEX 2025.1",
    "PROEXT 2025.1",
    "Prouni Extensão",
    "Programa Voluntário"
  ]
};
