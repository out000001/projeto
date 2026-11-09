// Fixture for tests and the explicit seed command. Never imported by the UI.
export const projects = [
  {
    id: 1,
    title: "Clínica de Direitos Humanos e Cidadania Dom Helder Câmara",
    shortDesc:
      "Atendimento jurídico gratuito e orientação processual a famílias em situação de vulnerabilidade habitacional e violação de garantias civis básicas.",
    area: "Direitos Humanos",
    local: "Soledade",
    modality: "Bolsa PIBEX Remunerada",
    hours: "60h ACCs",
    ods: ["ODS 10 • Redução Desigualdades", "ODS 16 • Paz e Justiça"],
    courses: "Direito • Serviço Social",
    deadline: "2026-11-24",
    spotsLeft: 4,
    spotsMax: 12,
    featured: true,
    turnos: ["Tarde", "Noite"],
    description:
      "A Clínica de Direitos Humanos promove atendimento jurídico gratuito, orientação processual e apoio comunitário a famílias em situação de vulnerabilidade habitacional. As atividades incluem triagem, acompanhamento de casos, oficinas de direitos e articulação com defensorias e organizações parceiras.",
    activities: [
      "Triagem e atendimento jurídico inicial",
      "Acompanhamento processual de casos acompanhados",
      "Oficinas de educação em direitos"
    ],
    partner: "Defensoria Pública de Pernambuco"
  },
  {
    id: 2,
    title: "Inclusão Digital para Terceira Idade em Santo Amaro",
    shortDesc:
      "Oficinas práticas de alfabetização tecnológica, segurança contra golpes online e uso de aplicativos bancários para o público 60+.",
    area: "Inclusão Digital",
    local: "Santo Amaro",
    modality: "Inscrição Gratuita Comunidade",
    hours: "40h ACCs",
    ods: ["ODS 4 • Educação de Qualidade", "ODS 9 • Inovação"],
    courses: "Ciência da Computação • Pedagogia",
    deadline: "2026-11-24",
    spotsLeft: 15,
    spotsMax: 25,
    featured: false,
    turnos: ["Manhã", "Tarde"],
    description:
      "Projeto de alfabetização digital para pessoas idosas do bairro de Santo Amaro, com oficinas práticas sobre uso de smartphones, segurança digital e serviços públicos online.",
    activities: [
      "Oficinas semanais de informática básica",
      "Roda de conversa sobre segurança digital",
      "Atendimento individual de dúvidas"
    ],
    partner: "Associação de Moradores de Santo Amaro"
  },
  {
    id: 3,
    title: "Atenção Psicológica e Saúde Integrada nas Comunidades",
    shortDesc:
      "Plantão psicológico, grupos de apoio em saúde mental pós-crises e sessões de reabilitação física postural preventiva no centro da cidade.",
    area: "Saúde Comunitária",
    local: "Boa Vista",
    modality: "Bolsa PIBEX • Saúde",
    hours: "80h ACCs",
    ods: ["ODS 3 • Saúde e Bem-Estar"],
    courses: "Psicologia • Fisioterapia",
    deadline: "2026-11-24",
    spotsLeft: 22,
    spotsMax: 40,
    featured: true,
    turnos: ["Manhã", "Noite"],
    description:
      "Plantões psicológicos e grupos de apoio em saúde mental, integrados a sessões preventivas de fisioterapia, articulados com a rede básica de saúde da região central do Recife.",
    activities: [
      "Plantão psicológico semanal",
      "Grupos de apoio em saúde mental",
      "Sessões de reabilitação física preventiva"
    ],
    partner: "Unidade de Saúde da Família - Boa Vista"
  },
  {
    id: 4,
    title: "Mapeamento e Valorização da Cultura Popular do Recife Antigo",
    shortDesc:
      "Documentação oral, produção de podcasts etnográficos e rotas turísticas colaborativas com agremiações carnavalescas tradicionais.",
    area: "Cultura Popular",
    local: "Recife Antigo",
    modality: "Parceria Fundação de Cultura",
    hours: "50h ACCs",
    ods: ["ODS 11 • Cidades Sustentáveis"],
    courses: "História • Jornalismo • Artes Visuais",
    deadline: "2026-11-24",
    spotsLeft: 0,
    spotsMax: 18,
    featured: true,
    turnos: ["Tarde", "Sábados"],
    description:
      "Levantamento e documentação oral do patrimônio imaterial do Recife Antigo, com produção de podcasts etnográficos e desenho colaborativo de rotas culturais junto às agremiações carnavalescas.",
    activities: [
      "Entrevistas e documentação oral",
      "Produção de podcasts etnográficos",
      "Construção colaborativa de rotas culturais"
    ],
    partner: "Fundação de Cultura Cidade do Recife"
  },
  {
    id: 5,
    title: "Educação Financeira e Empreendedorismo Feminino Periférico",
    shortDesc:
      "Capacitação em fluxo de caixa, formalização MEI e precificação justa para lideranças femininas de comunidades do Grande Recife.",
    area: "Empreendedorismo",
    local: "Híbrido",
    modality: "Inscrição Gratuita Comunidade",
    hours: "45h ACCs",
    ods: ["ODS 5 • Igualdade de Gênero", "ODS 8 • Trabalho Decente"],
    courses: "Administração • Ciências Econômicas",
    deadline: "2026-11-24",
    spotsLeft: 30,
    spotsMax: 40,
    featured: false,
    turnos: ["Noite", "Sábados"],
    description:
      "Formação em gestão financeira básica, formalização MEI e precificação para mulheres empreendedoras de territórios periféricos do Grande Recife, com mentoria contínua.",
    activities: [
      "Oficinas de gestão financeira",
      "Mentoria de formalização MEI",
      "Feira de troca de experiências"
    ],
    partner: "Rede de Mulheres Empreendedoras do Grande Recife"
  },
  {
    id: 6,
    title: "Observatório de Segurança Alimentar e Hortas Urbanas Escolares",
    shortDesc:
      "Instalação de canteiros agroecológicos em escolas municipais e oficinas nutricionais de aproveitamento integral de alimentos regionais.",
    area: "Sustentabilidade",
    local: "Soledade",
    modality: "Bolsa PIBEX Remunerada",
    hours: "70h ACCs",
    ods: ["ODS 2 • Fome Zero & Agroecologia"],
    courses: "Nutrição • Ciências Biológicas",
    deadline: "2026-11-24",
    spotsLeft: 2,
    spotsMax: 8,
    featured: false,
    turnos: ["Manhã", "Tarde"],
    description:
      "Implantação de hortas agroecológicas em escolas municipais e observatório de segurança alimentar, com oficinas de aproveitamento integral de alimentos regionais.",
    activities: [
      "Implantação de hortas escolares",
      "Oficinas de nutrição e aproveitamento integral",
      "Monitoramento do observatório de segurança alimentar"
    ],
    partner: "Secretaria de Educação do Recife"
  }
];
