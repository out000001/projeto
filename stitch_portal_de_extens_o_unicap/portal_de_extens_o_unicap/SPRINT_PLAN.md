---
title: Portal de Extensão UNICAP - Sprint Plan
status: concluido (Sprints 0-11 concluídas)
stack: Vite + React 18 (JSX) + Tailwind / back-end Node + Express + SQLite
goal: transformar as telas conceituais em um site modular, testável e mantível
---

# 🗓️ Sprint Plan - Portal de Extensão UNICAP

Este é o documento de roteiro de entregas do site do **Portal de Extensão Universitária da UNICAP**.

Ele foi feito para:
- transformar o design conceitual em um site real,
- separar o código em módulos,
- garantir qualidade com testes,
- deixar clara a ordem de construção e os critérios de aceitação.

---

## 1. Visão geral do projeto

### 1.1 O que é o sistema

O Portal de Extensão UNICAP é um ambiente web institucional que organiza:
- acesso por perfil,
- divulgação pública de projetos de extensão,
- submissão e acompanhamento de projetos,
- gestão institucional com métricas, filtros e prazos.

O tom visual e as Rules vêm do `portal_de_extens_o_unicap/DESIGN.md`.

### 1.2 Principais usuários

- **Gestor / docente** - painel restrito, criação e acompanhamento de projetos, homologação, relatórios.
- **Estudante / comunidade** - busca de oportunidades, inscrição, visualização de vagas e certificações.
- **Comitê / coordenação** - validação, pareceres, prazos, status.

### 1.3 Módulos principais identificados

- `acesso-e-autenticacao`
- `vitrine-publica`
- `submissao-de-projeto`
- `acompanhamento-de-projeto`
- `painel-gestor`

Essa separação vai guiar os sprints.

---

## 2. Princípios de organização do código

### 2.1Por módulos

Cada módulo deve ter responsabilidade clara e limitada.

Exemplo de estrutura base sugerida:

```text
src/
  modules/
    auth/
    public/
    project-submission/
    project-tracking/
    manager-dashboard/
  ui/
  lib/
  hooks/
  store/
  tests/
```

Cada módulo pode conter:
- componentes ou páginas específicas,
- estado local,
- lógica de regra do domínio,
- testes específicos.

### 2.2 Boas práticas esperadas

- componentes pequenos e com props explícitas,
- evitar lógica de negócio dentro de apresentação pura,
- reutilizar layout e design system definidos no DESIGN.md,
- manter formulários, validações e estados separados quando possível,
- usar nomes consistentes em português ou inglês conforme a convenção escolhida no time,
- manter Tailwind configurado a partir do arquivo de design do projeto,
- evitar estilos soltos fora do sistema definido,
- tratar acessibilidade e responsividade desde cedo.

### 2.3 Qualidade de código

- lint ativo,
- formatação automática,
- revisão por pares,
- commits pequenos e com mensagem clara,
- evita “parei aqui” sem rtl/documentação,
- evita duplicação de componentes de UI ou de comportamento de formulário.

---

## 3. Escopo inicial do site

Antes de sprints complexos, recomenda-se uma base executável e consistente.

### 3.1 O que precisaria existir antes dos módulos avançados

- estrutura base da aplicação,
- navegação entre principais áreas,
- shell com header/sidebar/footer coerentes,
- sistema de cores e tipografia aplicados do DESIGN.md,
- componentes primitivos de botão, badge, input, card, seletor, tabela, stepper, modal.

### 3.2 Módulos-chave do negócio

- autenticação e roteamento por perfil,
- vitrine pública com busca, filtros e cards de projeto,
- submissão do projeto em etapas,
- acompanhamento com equipe, frequência, cronograma e relatórios,
- painel gestor com KPIs, filtros, tabelas e prazos.

---

## 4. Sprint backlog

### Sprint 0 - Preparação e base

Objetivo:
colocar a base do projeto para desenvolvimento organizado e testável.

Tarefas sugeridas:
- definir convenção de estrutura de pastas,
- definir convenção de commits e revisão,
- converter o design do DESIGN.md em tokens/CSS reutilizável,
- criar componentes de UI básicos,
- definir roteamento das principais áreas,
- deixar claro onde vão dados, formulários e regras.

Critérios de aceitação:
- um desenvolvedor consegue criar uma nova página seguindo o padrão,
- o design base está aplicado de forma consistente,
- a estrutura de módulos está visível e documentada.

---

### Sprint 1 - Módulo de acesso e perfil inicial

Objetivo:
entregar a entrada do portal com seleção de perfil e lógica inicial de fluxo restrito.

Tarefas sugeridas:
- tela/estrutura de escolha de perfil,
- diferença de permissões por perfil,
- roteamento simples conforme perfil selecionado,
- mock de credenciais e fluxos de login,
- feedback de erro e estados de loading,
- acessibilidade e estados de formulário.

Critérios de aceitação:
- é possível escolher perfil e seguir para a tela correta,
- cada perfil vê apenas o que lhe compete,
- estados inválidos não quebram o fluxo.

---

### Sprint 2 - Vitrine pública ✅ (concluída)

Implementação:
- dados mock centralizados em `src/modules/public/data/projects.js`,
- filtro/ordenação puros e testáveis em `src/modules/public/hooks/useProjectFilters.js`,
- componentes `ProjectCard`, `ProjectFilters` e `ProjectDetailModal` em `src/modules/public/components/`,
- `PublicLanding.jsx` recomposto de forma modular (hero + filtros + listagem + detalhe + FAQ + parcerias),
- 12 testes de unidade (filtro/ordenação) e 6 testes de componente (busca, filtros, modal, estado esgotado).

Objetivo:
entregar a área pública de descoberta de projetos de extensão.

Tarefas sugeridas:
- listagem de projetos em cards,
- busca por texto e filtros por categoria/área,
- destaques e abas de oportunidade,
- modal ou página de detalhes do projeto,
- separação entre estudante e comunidade quando necessário,
- performance e comportamento responsivo.

Critérios de aceitação:
- usuário consegue encontrar oportunidades com busca e filtros,
- informações principais do projeto estão claras,
- o fluxo de detalhe e inscrição tem sentido completo.

---

### Sprint 3 - Submissão de projeto ✅ (concluída)

Implementação:
- fluxo em 6 etapas com `Stepper` navegável (voltar para etapas concluídas, bloqueio futuro),
- validação pura por etapa em `src/modules/project-submission/validation.js` (testável sem React),
- rascunho persistido automaticamente em localStorage (`hooks/useSubmissionDraft`), com "Limpar rascunho",
- equipe com contadores (bolsistas/voluntários/público) e lista dinâmica de integrantes,
- plano de trabalho com objetivos, atividades, cronograma e entregáveis, 
- orçamento por categoria com total formatado, parceria e anexos validados (extensão, 10 MB, máx. 5 arquivos),
- revisão com resumo completo + checklist de conformidade institucional (CNE 7/2018, FORPROEX, LGPD, autorização),
- tela de sucesso pós-envio (mock) e limpeza do rascunho.

Critérios de aceitação atendidos:
- o proponente avança, volta e o estado não se perde (rascunho automático),
- obrigatoriedades claras com mensagens por campo,
- resumo final engloba os pontos institucionais esperados.

### Sprint 4 - Acompanhamento de projeto ✅ (concluída)

Implementação:
- dados centralizados em `src/modules/project-tracking/data/trackingData.js`,
- regras de negócio puras em `trackingLogic.js` (progresso mensal, horas acumuladas, validação de homologação, conclusão por competência),
- folha de frequência mensal editável (`FrequencyTable`) com seleção, homologação individual e em lote,
- cronograma de marcos com status visual (`MilestonesTimeline`),
- painel de relatórios e pareceres com prazos e ações (`ReportsPanel`),
- 4 abas funcionais em `ProjectTracking.jsx` com KPIs calculados (índice de execução, pendências por competência).

Critérios de aceitação atendidos:
- gestor consegue acompanhar o projeto em um lugar (abas funcionais),
- dados de equipe e frequência são coerentes (validação de teto mensal e 0h),
- homologação e pendências ficam explícitas (badges, contadores e avisos).

Tarefas originais:
- visão geral do projeto,
- lista de bolsistas/voluntários,
- frequência mensal e homologação,
- marcos / cronograma,
- relatórios e pareceres,
- exportação quando aplicável.

Critérios de aceitação:
- gestor consegue acompanhar o projeto em um lugar,
- dados de equipe e frequência são coerentes,
- homologação e pendências ficam explícitos.

---

### Sprint 5 - Painel gestor ✅ (concluída)

Implementação:
- dados centralizados em `src/modules/manager-dashboard/data/dashboardData.js` (registro de 12 projetos com centro, linha temática, edital, orçamento e pendências; prazos do comitê gerados relativos à data atual),
- regras puras em `dashboardLogic.js`: `computeKpis` (total, ativos, estudantes, bolsas/voluntários, impacto, relatórios pendentes, centro único dos ativos), `executionRate`, `filterProjects` (busca sem acento/caixa, centro, linha, status, edital), `sortProjects` (título/impacto/execução), `paginate` (5 itens) e `buildDeadlines` (vencido/urgente ≤7 dias/próximo),
- componentes `KpiCards`, `DashboardFilters`, `ProjectsTable` (ordenação por coluna + barra de execução), `CommitteeDeadlines`, `PendingActions` e `ProjectDetailModal`,
- `ManagerDashboard.jsx` recomposto: KPIs calculados, filtros funcionais, paginação real com `aria-current`, cartão de pendências com atalho "Revisar" (aplica filtro status=analysis) e modal de detalhes,
- `Button` ganhou prop `size` (small/medium); refino na Sprint 4: `useFrequencySheet` calcula homologação fora do updater do `setState`.

Critérios de aceitação atendidos:
- o gestor entende rapidamente o que está ativo e o que está pendente (KPIs + cartão de ações),
- filtros funcionam de forma consistente (busca + 4 dimensões combinadas, contagem em `role=status`),
- o resumo institucional condiz com o escopo real (KPIs derivados dos mesmos dados da tabela).

Objetivo:
entregar visão institucional de projetos, métricas e prazos.

Tarefas sugeridas:
- KPIs e indicadores,
- filtros avançados por centro, linha, status e edital,
- tabela de projetos com paginação/ordem,
- calendário/prazos do comitê,
- destaques de ações pendentes.

Critérios de aceitação:
- o gestor entende rapidamente o que está ativo e o que está pendente,
- filtros funcionam de forma consistente,
- o resumo institucional condiz com o escopo real.

---

### Sprint 6 - Refinamento, qualidade e usabilidade ✅ (concluída)

Implementação:
- `Modal` compartilhado acessível em `components/ui/Modal.jsx` (Escape, clique no backdrop, bloqueio de scroll do body, foco no painel ao abrir) — adotado pelos modais de detalhe da vitrine e do painel gestor, eliminando duplicação de estrutura;
- `ErrorBoundary` envolvendo as rotas no `App.jsx` com fallback amigável, "Tentar novamente" e detalhe do erro só em desenvolvimento (sem tela branca);
- `Icons.jsx` reescrito com fábrica única de ícones: ~43 wrappers SVG duplicados viraram 1 função + mapa de conteúdo, com `aria-hidden="true"` (decorativo) e PropTypes — mesma API de named exports, zero mudança nos 23 consumidores;
- código morto removido: `modules/auth/AuthPage.jsx` e `components/layout/Layout.jsx` (duplicatas abandonadas dos fluxos que vivem em `App.jsx`/`AppLayout.jsx`);
- padronização completa de `PropTypes` (de 53 warnings para 0) e limpeza de unused vars;
- backdrop de modal com `role="presentation"` e clique; botão X com `aria-label`;
- documentação: `src/README.md` (stack, anatomia de módulo, convenções, critério de pronto) e `USABILITY_TEST_PLAN.md` (5–8 participantes, 8 tarefas roteirizadas com métricas e checklist de moderação).

Critérios de aceitação atendidos:
- o sistema se comporta de forma previsível (ErrorBoundary + validações já existentes),
- o código está mais fácil de manter (duplication removida, README de arquitetura, lint 0/0),
- pontos de frustração mapeados com plano de teste de usabilidade acionável.

Objetivo:
deixar o site robusto, coerente e confortável de usar.

Tarefas sugeridas:
- padronização de componentes,
- correção de pontos de acessibilidade,
- ajustes de responsividade,
- redução de duplicação,
-UX em pontos críticos como formulários longos,
- tratamento de erro mais claro,
- documentação interna do módulo.

Critérios de aceitação:
- o sistema se comporta de forma previsível,
- o código está mais fácil de manter,
- não há pontos óbvios de frustração no fluxo principal.

---

### Sprint 9 - Início do Back-end (API REST) ✅ (concluída)

Implementação:
- stack escolhida: **Node + Express** com persistência **em memória + seed** (sem serviço externo nesta etapa),
- `server/app.js` — fábrica `createApp(store)` (JSON body parser, CORS, rotas, 404 e handler de erro em JSON) — testável sem subir processo,
- `server/index.js` — entrypoint (`bun run api`; porta `API_PORT`, default 3001), binding em `0.0.0.0`,
- `server/store.js` — repositório em memória (única porta de acesso a dados): sessões por token opaco, busca de usuário, listagem/detalhe de projetos; regras puras exportadas (`filterProjects`, `normalizeText`, busca sem acento/caixa),
- `server/seed.js` — 2 usuários-demo (gestor/estudante) + reuso dos dados puros da vitrine (`src/modules/public/data/projects.js`),
- `server/errors.js` — `ApiError` + formato único de resposta de erro `{ error: { code, message } }` (404 de rota, JSON malformado → 400 INVALID_JSON, 500 sem vazar detalhe interno),
- rotas: `GET /api/health`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `GET /api/projects` (filtros `q`, `area`, `local`) e `GET /api/projects/:id`,
- `server/app.test.js` — 21 testes de integração com **supertest** (HTTP real em memória): saúde, login válido/inválido, exposição de senha, sessão (me/logout), filtros de projeto, 404 e JSON inválido.

Critérios de aceitação atendidos:
- existe uma API executável (`bun run api`) com contratos JSON documentados pelos testes,
- autenticação e projeção de dados funcionam de ponta a ponta (login → token → /me → logout invalida),
- a persistência está isolada em um repositório (troca por banco real não afeta rotas),
- suíte completa, lint e build verdes (160 testes).

Pendências para as próximas entregas: hash de senha e JWT, CORS restrito ao domínio do front, persistência real (banco), consumo da API pelo front e CRUD completo de projetos.

---

### Sprint 10 - Persistência com SQLite ✅ (concluída)

Implementação:
- `server/store.js` reescrito como repositório **SQLite** (`node:sqlite`, sem nova dependência) mantendo a MESMA interface — as rotas e os testes de integração da Sprint 9 passaram a rodar sobre o schema real sem nenhuma mudança de contrato,
- `server/db.js` — abre/cria o schema (`users`, `sessions`, `projects`) e aplica **seed idempotente** em `server/data/portal.db` (ignorado pelo git; `:memory:` nos testes); colunas normalizadas `area_norm`, `local_norm` e `search_text` indexam a busca sem acento/caixa feita em SQL,
- `server/passwords.js` — senhas com hash **scrypt + salt aleatório** (`node:crypto`), verificação em tempo seguro com `timingSafeEqual`; o hash nunca contém a senha em texto puro,
- `server/text.js` — utilidades puras isoladas (`normalizeText`, `isDefaultFilter`),
- `server/persistence.test.js` — 10 testes: reabertura do MESMO arquivo com store novo (sessão e projetos sobrevivem), seed idempotente (sem duplicação), hash scrypt e texto puro.

Correções encontradas ao validar:
- `isDefaultFilter` usava `startsWith("toda")` e não cobria "Todos os locais" — regex `^(toda|todo)`;
- `node:sqlite` não é listado como builtin pelo analyzer do Vite (quebrava o collect dos testes) — carregado via `createRequire`.

Critérios de aceitação atendidos:
- dados sobrevivem a reinício do processo (validado com dois processos reais: token do 1º usado no 2º via `/me` → 200),
- senha nunca é persistida em texto puro,
- rotas inalteradas (a troca de repositório foi transparente),
- suíte completa, lint e build verdes (170 testes).

Pendências seguintes: JWT com expiração, CORS restrito ao domínio do front, CRUD completo de projetos e consumo da API pelo front.

---

### Sprint 11 - Ligação Front ↔ Back ✅ (concluída)

Objetivo:
 fazer o site deixar de rodar com dados mockados: vitrine e sessão passam a ler da API real (SQLite + seed), sem quebrar nada do que já estava operante.

Implementação:
- `src/services/api.js` — cliente HTTP único (único ponto de saída do front para a rede): `ApiError` (mensagem do `{ error: { code, message } }` do back, com `status`/`code`), `resolveApiBaseUrl()` (prioriza `VITE_API_URL`; no preview do Freebuff deriva a URL da API trocando a porta `5173-<id>` → `3001-<id>` do mesmo host; em dev local, `host:3001`) e as chamadas `loginRequest`, `meRequest`, `logoutRequest`, `fetchProjects`;
- `SessionContext` servidor-backed: login via `POST /api/auth/login` (token e perfil vêm do back), restauração da sessão persistida valida o token contra `GET /api/auth/me` (o servidor é a autoridade: token inválido/expirado limpa o `localStorage`), `logout` chama `POST /api/auth/logout` em best-effort;
- `App.jsx`: rota `/`, `ProtectedRoute` e `PageLoader` aguardam `restoring` (validação do token) antes de decidir redirecionamento — sem “piscar” a tela de login;
- `PublicLanding.jsx` lê `GET /api/projects` com estados de carregando, erro (com “Tentar novamente”) e lista vazia — os filtros/ordenação continuam puros sobre a resposta;
- testes adaptados ao contrato real (`App.test`, `PublicLanding.test` mockam `services/api`);
- `scripts/dev-with-api.sh` — preview único com API + front: Vite sobe primeiro (o preview identifica a 5173) e a API só depois que o 5173 escuta; comando salvo com `freebuff-preview set`.

Bugs reais encontrados e corrigidos ao ligar:
- um único flag de `loading` fazia o `PageLoader` substituir a tela durante o submit, desmontando o `LoginForm` e perdendo o `setFormError` — separados `restoring` (validação do token) × `loading` (submissão do formulário);
- no `/me` que falhava, a troca de token disparava o cleanup antes do `finally`, que ficava engolido e a tela travava em “Verificando acesso...” — `setRestoring(false)` passou a ser incondicional no `.finally`.

Critérios de aceitação atendidos:
- a vitrine mostra os projetos que estão no SQLite (reabrir a página lê do banco, não do mock);
- login/logout/restauração de sessão usam a API (usuário errado → 401 com mensagem, token inválido → volta para o login sem travar);
- preview único serve API + front e o fluxo foi verificado de ponta a ponta pelo proxy público (front 200, `/api/projects` 200, login 200 → `/me` 200 → logout 204, 401 sem token, preflight CORS 204);
- suíte completa, lint e build verdes (174 testes).

Pendências seguintes: JWT com expiração, CORS restrito ao domínio do front, CRUD completo de projetos (a vitrine continua somente leitura) e demais módulos (submissão, acompanhamento, painel) migrados dos mocks locais para a API.

---

## 5. Testes de qualidade

### 5.1 Tipos de teste sugeridos

- **Testes de unidade**:
  - validações,
  - transformações de dados,
  - regras de status,
  - lógica de formulário isolada.

- **Testes de componente**:
  - comportamento de botões, inputs, stepper, modal, cards,
  - estados de erro, foco, loading,
  - renderização condicional.

- **Testes de integração**:
  - navegação entre etapas,
  - filtros + listagem,
  - formulários que impactam resumo,
  - estado compartilhado entre módulos.

- **Testes de e2e**:
  - fluxo básico de acesso,
  - busca e filtro na vitrine,
  - submissão de projeto até envio,
  - acompanhamento e homologação.

### 5.2 O que testar primeiro

Recomendo priorizar:
- regras de obrigatoriedade e validação,
- navegação entre módulos,
- estado do formulário de submissão,
- filtros da vitrine,
- comportamento crítico de acesso por perfil.

### 5.3 Critérios de qualidade do código

- não deixar regras críticas sem teste,
- cada módulo com testes focados no que ele faz,
- testes devem descrever comportamento, não apenas implementação,
- manter cobertura em pontos importantes antes de expandir.

---

## 6. Testes de usabilidade

### 6.1 O que observar

- clareza do fluxo de escolha de perfil,
- facilidade para encontrar projetos na vitrine,
- compreensão das etapas de submissão,
- confiança nas ações de salvar e enviar,
- legibilidade das tabelas de gestão,
- clareza de status e pendências.

### 6.2 Como conduzir

- sessões curtas com personas reais se possível,
- tarefas definidas como:
  - “encontrar um projeto de extensão",
  - “submeter uma proposta",
  - “consultar frequência de bolsista",
  - “identificar pendências no painel gestor",
- anotações de onde o usuário hesita,
- ajustes baseados em obstrução real, não em achismos.

### 6.3 Métricas úteis

- tempo para completar tarefa,
- taxa de erro em formulários,
- número de clareamentos necessários,
- satisfação subjetiva e feedback qualitativo.

---

## 7. Gestão do projeto

### 7.1 Artefatos recomendados

- este `SPRINT_PLAN.md`,
- o `PROJECT_BRAIN.md` como núcleo de referências,
- tarefas/issues por sprint,
- definição de pronto para cada módulo,
- pequena documentação por módulo quando necessário.

### 7.2 Ritmo sugerido

- sprints de tamanho predefined e curto o suficiente para feedback rápido,
- reunião de planejamento no início,
- revisão de entrega no fim,
- ajuste de backlog com base em usabilidade e qualidade.

### 7.3 Critério de “pronto”

Uma entrega pode ser considerada pronta quando:
- implementa o escopo acordado,
- segue a organização por módulos,
- tem teste necessário para o risco envolvido,
- não quebra usabilidade do fluxo principal,
- está consistente com o design do projeto.

---

## 8. Riscos e observações

- Se o projeto for construído como site estático agora e evoluir depois para framework, manter a separação por módulos desde o início evita refatoração pesada.
- Formulários longos como o de submissão exigem atenção extra de estado, validação e salvamento.
- Acessibilidade e responsividade devem ser parte da entrega, não um ajuste final.
- O sistema de design já está bem definido; o risco maior é implementar regras soltas e incoherentes entre módulos.
