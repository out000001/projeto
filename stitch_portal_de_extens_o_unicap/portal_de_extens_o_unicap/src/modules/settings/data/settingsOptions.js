// Dados estáticos de opções da tela de Configurações.

export const PROFILE_LABELS = {
  gestor: "Gestor / Docente",
  estudante: "Estudante / Comunidade"
};

export const NOTIFICATION_OPTIONS = [
  {
    id: "notifyDeadlines",
    title: "Alertas de prazos",
    description: "Prazos cadastrados para marcos e relatórios dos seus projetos."
  },
  {
    id: "notifyHomologacoes",
    title: "Homologações e pareceres",
    description: "Mostra folhas pendentes para gestores e homologações recentes para alunos."
  },
  {
    id: "notifyEditais",
    title: "Propostas para análise",
    description: "Para gestores: propostas que aguardam análise no painel."
  },
  {
    id: "weeklyDigest",
    title: "Resumo semanal",
    description: "Mostra no portal quantos projetos foram atualizados nos últimos 7 dias."
  }
];

export const DENSITY_OPTIONS = [
  { id: "confortavel", label: "Confortável (padrão)" },
  { id: "compacta", label: "Compacta (mais linhas por tela)" }
];
