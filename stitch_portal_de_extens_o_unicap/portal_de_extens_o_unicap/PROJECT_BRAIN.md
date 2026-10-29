# 🧠 Project Brain - Portal de Extensão UNICAP

 Este arquivo é o centro de referências do projeto.
Use os links internos para navegar entre módulos, decisões, testes e riscos.

---

## 🎯 Objetivo do projeto

- [x] Construir um portal web para gestão e divulgação de extensão universitária da UNICAP.
- [ ] Organizar código por módulos com responsabilidade clara.
- [ ] Garantir qualidade com testes e validação de usabilidade.

Ver:
- [[Objetivo do Projeto]]
- [[Visão do Sistema]]
- [[Usuários Principais]]

---

## 1. Visão e escopo

### Visão do Sistema

O portal deve integrar:
- acesso restrito por perfil,
- divulgação pública de projetos,
- submissão de projetos por docentes,
- acompanhamento de execução,
- gestão e métricas institucionais.

Link: [[Visão do Sistema]]

### Usuários Principais

- Gestor docente / coordenador
- Estudante
- Comunidade externa
- Comitê de avaliação

Link: [[Usuários Principais]]

### Regras institucionais relevantes

- Foco na extensão universitária.
- Vinculação com ODS da ONU.
- Curricularização conforme Resolução CNE/CES nº 7/2018.
- Atenção a LGPD / autenticação segura.
- Editais e prazos institucionais.

Link: [[Regras Institucionais]]

---

## 2. Módulos do sistema

### Módulo de acesso e autenticação

Responsável por:
- escolha/perfil inicial,
- roteamento por perfil,
- mock ou integração de login,
- privilégios de acesso.

Referências:
- [[Módulo de Acesso e Autenticação]]
- [[Perfil e Permissões]]
- [[Fluxo de Login]]

### Módulo de vitrine pública

Responsável por:
- card de projetos,
- busca e filtros,
- destaques,
- inscrição ou detalhe.

Referências:
- [[Módulo de Vitrine Pública]]
- [[Cards de Projeto]]
- [[Filtros de Oportunidade]]

### Módulo de submissão de projeto

Responsável por:
- formulário em etapas,
- validações,
- anexos,
- rascunho,
- checklist institucional.

Referências:
- [[Módulo de Submissão de Projeto]]
- [[Formulário de Submissão]]
- [[Estado do Formulário]]

### Módulo de acompanhamento

Responsável por:
- equipe,
- frequência,
- cronograma,
- relatórios,
- homologação.

Referências:
- [[Módulo de Acompanhamento]]
- [[Equipe de Projeto]]
- [[Frequência e Bolsistas]]

### Módulo do painel gestor

Responsável por:
- KPIs,
- filtros avançados,
- tabelas,
- prazos e pendências.

Referências:
- [[Módulo do Painel Gestor]]
- [[KPIs Institucionais]]
- [[Filtros de Gestão]]

---

## 3. Organização do código

### Estrutura recomendada

Ver:
- [[Estrutura de Módulos]]
- [[Diretórios Sugeridos]]

### Princípios

- separar UI, estado, regra e testes,
- componentes com responsabilidade limitada,
- evitar duplicação de lógica de formulário,
- seguir o design system do projeto.

Referências:
- [[Boas Práticas de Programação]]
- [[Design System]]

---

## 4. Qualidade e testes

### Tipos de teste

- testes de unidade,
- testes de componente,
- testes de integração,
- testes de fluxo principal / e2e.

Ver:
- [[Tipos de Teste]]
- [[O que Testar Primeiro]]

### Critérios de qualidade

- regras críticas testadas,
- comportamento de formulário validado,
- navegação entre módulos estabilizada,
- código legível e coeso.

Ver:
- [[Critérios de Qualidade]]

### Testes de usabilidade

- sessões com tarefas definidas,
- foco em clareza e confiança,
- ajustes a partir de uso real.

Ver:
- [[Testes de Usabilidade]]
- [[Tarefas de Avaliação]]

---

## 5. Design e UX

### Base visual

O design segue o arquivo central de estilo do projeto.

Ver:
- [[Design System]]
- [[Cores]]
- [[Tipografia]]
- [[Layout e Responsividade]]

### Padrões recorrentes

- cards de projeto,
- badges de status,
- formulários em seções,
- tabelas de gestão,
- stepper de etapas,
- modais de detalhe.

Ver:
- [[Componentes Recorrentes]]

---

## 6. Decisões e risco

### Decisões importantes

- escolha da stack,
- estratégia de estado,
- estratégia de roteamento,
- momento de introdução de backend ou dados reais.
- **Back-end (Sprint 9)**: Node + Express, persistência em memória + seed; repositório único (`server/store.js`) para trocar por banco real sem tocar nas rotas.
- **Persistência (Sprint 10)**: SQLite via `node:sqlite` (sem dependência externa) — repositório `store.js` mantém a interface, seed idempotente em `server/data/portal.db` (git-ignored), senhas com hash scrypt + salt. JWT/expiração ficam para a próxima etapa.

Ver:
- [[Decisões do Projeto]]

### Riscos

- formulários longos com estado complexo,
- inconsistência entre módulos,
- acessibilidade adiada,
- acoplamento de UI e regra de negócio.

Ver:
- [[Riscos do Projeto]]
- [[Mitigações]]

---

## 7. Roadmap consistente

O roteiro oficial de entregas está em:
- [[Sprint Plan]]

Sprints sugeridas:
- Sprint 0 - base e organização,
- Sprint 1 - acesso e perfil,
- Sprint 2 - vitrine pública,
- Sprint 3 - submissão,
- Sprint 4 - acompanhamento,
- Sprint 5 - painel gestor,
- Sprint 6 - qualidade e usabilidade.

### Status de execução

- [x] Sprint 0 - base, design system, componentes UI primitivos, roteamento inicial.
- [x] Sprint 1 - login por perfil, [[Sessão e Perfil]], rotas protegidas, testes de fluxo de acesso.
- [x] Sprint 2 - [[Módulo de Vitrine Pública]] concluído (dados mock em `src/modules/public/data/`, lógica isolada em `hooks/useProjectFilters`, componentes `ProjectCard`, `ProjectFilters`, `ProjectDetailModal` e FAQ). Testes: 12 de unidade + 6 de componente. Lint (ESLint flat config) sem erros.
- [x] Sprint 3 - [[Módulo de Submissão de Projeto]] concluído: formulário em 6 etapas (identificação, impacto/ODS, equipe, plano de trabalho, orçamento + anexos, revisão), validação pura por etapa em `validation.js`, rascunho persistido em localStorage (`useSubmissionDraft`), anexos validados (tipo/tamanho/quantidade), checklist de conformidade (CNE 7/2018, FORPROEX, LGPD, autorização) e tela de sucesso. Testes: 18 de unidade + 9 de componente.
- [x] Sprint 4 - [[Módulo de Acompanhamento]] concluído: folha de frequência mensal editável por competência, homologação individual e em lote com regras de negócio puras (`trackingLogic.js`: teto mensal, 0h bloqueado, tolerância 2h), KPIs calculados (execução, pendências), cronograma de marcos e painel de relatórios/pareceres com ações. Testes: 12 de unidade + 9 de componente. Refino pós-validação: `useFrequencySheet` passou a calcular o resultado de homologação fora do updater do `setFrequency` (evita retorno `null` quando o React adia o updater).
- `[[Button]]` ganhou prop `size` (small/medium) para reuso em tabelas.
- [x] Sprint 5 - [[Módulo do Painel Gestor]] concluído: KPIs institucionais calculados a partir do registro de projetos (`computeKpis`), filtros avançados combinados (busca sem acento, centro, linha temática, status, edital) com lógica pura em `dashboardLogic.js`, tabela com ordenação por título/impacto/execução orçamentária e paginação de 5 itens, calendário de prazos do comitê classificado em vencido/urgente/próximo (`daysUntil` + `deadlineStatus`), cartão de ações pendentes e modal de detalhes com execução orçamentária. Testes: 23 de unidade + 9 de componente.
- [x] Sprint 6 - [[Refinamento e Qualidade]] concluída (roteiro completo): `Modal` compartilhado acessível (Escape, backdrop, scroll lock, foco no painel) adotado pelos 2 modais de detalhe; `ErrorBoundary` envolvendo as rotas com fallback amigável e retry; `Icons.jsx` reescrito com fábrica única (43 wrappers SVG → 1, com `aria-hidden` e PropTypes); código morto removido (`modules/auth/AuthPage.jsx`, `components/layout/Layout.jsx` — duplicatas não rastreadas); PropTypes completos em todos os componentes (lint 0/0); `Button` com prop `size`; documentação em `src/README.md` (anatomia de módulo, convenções) e `USABILITY_TEST_PLAN.md` (roteiro de 8 tarefas, métricas, checklist). Testes: 9 novos (Modal + ErrorBoundary).
- [x] Sprint 7 - [[Módulo de Configurações da Conta]] concluído: nova tela `/settings` com módulo `modules/settings/` autocontido (`settingsLogic.js` puro com validação/sanitização, hook `useSettings` com persistência em localStorage, dados em `data/settingsOptions.js`), seções de Perfil, Vínculo Institucional (leitura), Notificações (toggles acessíveis com `role="switch"`) e Privacidade & Segurança (densidade, alerta de prazos, expiração de sessão); botão Configurações do header (`AppLayout`) virou link funcional; suporte a salvar/descartar/restaurar padrões com estados de dirty e erro. Testes: 6 de unidade + 5 de componente (123 no total).
- [x] Sprint 9 - [[Início do Back-end]] concluído: API REST em Node + Express em `server/` (fora do bundle do front), com `createApp(store)` testável e `index.js` como entrypoint (`bun run api`, porta `API_PORT`/3001). Persistência em memória atrás do repositório `store.js` (`createStore(seed)` — única porta de acesso a dados; trocar por banco real = reimplementar só esse arquivo), seed em `seed.js` (2 usuários-demo + reuso dos dados puros da vitrine). Endpoints: `GET /api/health`, `POST /api/auth/login` (token opaco em sessão em memória), `GET /api/auth/me`, `POST /api/auth/logout`, `GET /api/projects` (busca sem acento/caixa + filtros área/local, com "Todas as áreas/Todos os locais" tratados como sem filtro) e `GET /api/projects/:id`. Erros em formato único `{ error: { code, message } }` (`errors.js`: `ApiError`, 404 e handler final em JSON; JSON malformado → 400 INVALID_JSON). Testes: 21 novos de integração com supertest (160 no total). Lint 0/0.
- [x] Sprint 10 - [[Persistência com SQLite]] concluída: `store.js` reescrito como repositório SQLite (`node:sqlite`, sem dependência nova) com a MESMA interface — rotas e testes de integração não mudaram, só a implementação. `db.js` abre/cria o schema (`users`, `sessions`, `projects` com colunas normalizadas `area_norm`/`local_norm`/`search_text` para a busca sem acento) e aplica seed idempotente em `server/data/portal.db` (ignorado pelo git; `:memory:` nos testes). Senhas agora com hash **scrypt + salt** (`passwords.js`, `node:crypto`; verificado que o hash nunca contém a senha e sobrevive a comparação em tempo seguro); utilidades de texto puras isoladas em `text.js` (`normalizeText`, `isDefaultFilter`). Bug encontrado e corrigido no caminho: `startsWith("toda")` não cobria "Todos os locais" (regex `^(toda|todo)`); `node:sqlite` carregado via `createRequire` (o analyzer do Vite não o lista como builtin e quebrava o collect dos testes). Testes: 170 no total (+10 de persistência/hash/texto — inclui reabertura do MESMO arquivo com store novo, seed idempotente e sessão válida após reinício). Verificação extra: smoke com DOIS processos (login no 1º, `/me` com o mesmo token no 2º → 200). Lint 0/0, build limpo. Pendências seguintes: JWT com expiração, CORS de produção, CRUD de projetos e consumo da API pelo front.
- [x] Sprint 11 - [[Ligação Front ↔ Back]] concluída: o front passou a consumir a API real. Novo cliente HTTP `src/services/api.js` (único ponto de saída para a rede): `ApiError` com `status`/`code`, `resolveApiBaseUrl` (prioriza `VITE_API_URL`; no preview do Freebuff deriva a porta da API trocando `5173-<id>` → `3001-<id>` do proxy; em local, `host:3001`) e chamadas `loginRequest`, `meRequest`, `logoutRequest`, `fetchProjects`. `SessionContext` agora é servidor-backed: login via `POST /api/auth/login` (token + perfil vindos do back), restauração valida o token persistido contra `GET /api/auth/me` (servidor é a autoridade — token inválido limpa a sessão local) e `logout` invalida no servidor best-effort; `App.jsx` (rota `/`, `ProtectedRoute` e `PageLoader`) aguarda `restoring` antes de redirecionar. Vitrine lê `GET /api/projects` com estados de carregando/erro + "Tentar novamente". **Dois bugs reais encontrados e corrigidos ao ligar**: (1) um único flag de loading desmontava o `LoginForm` durante o submit (o `finally` perdia o estado) — separados `restoring` (validação do token) × `loading` (submissão do form); (2) corrida no `finally` da restauração quando `/me` falhava deixava "Verificando acesso..." preso para sempre. Testes `App.test` e `PublicLanding.test` adaptados ao contrato real (mock de `services/api`): **174 no total**, lint 0/0, build limpo. Preview único API+front via `scripts/dev-with-api.sh` (Vite primeiro, API só depois do 5173 escutar), verificado de ponta a ponta pelo proxy: front 200, `/api/projects` 200, login 200 → `/me` 200 → logout 204, 401 sem token e preflight CORS 204.
- [x] Sprint 8 - Revisão de funcionalidade do front-end ("tudo operante"): (1) **visual** — link da fonte *Material Symbols Outlined* adicionado ao `index.html` (os ícones eram renderizados como texto) e `tailwind.config.js` agora lê a paleta `--color-*` do `index.html` em hex, habilitando utilitários com opacidade (`bg-error-container/40`, `bg-surface-container-lowest/90`, …) que o Tailwind descartava com `var()`; chave `surfaceContainer` corrigida para `surface-container`. (2) **rotas/auth** — `/submit`, `/tracking` e `/settings` passaram a exigir sessão (`ProtectedRoute`), a vitrine `/public` ganha o cabeçalho do portal quando autenticada (`PublicPage`) e o login de estudante cai na vitrine (antes oscilava pelo `/dashboard` de gestor). (3) **persistência de sessão** — checkbox "Manter sessão conectada" agora grava/remove `unicap:session:v1` (validado ao restaurar; `logout` limpa). (4) **botões mortos ligados** — Ajuda → `Modal` de central de ajuda; Exportar Relatório MEC → CSV real (`buildProjectsCsv` + `utils/download.js`); Novo Edital PIBEX → navega para `/submit`; Emitir Declaração (aviso), Submeter Relatório Parcial e Gerenciar Bolsistas (troca de aba); Exportar Folha → CSV (`buildFrequencyCsv`); Baixar relatório → TXT; "Esqueceu a senha?" → `mailto:` da DEG; CTA da vitrine → `/submit` quando autenticado. Testes: 140 no total (+17: rotas/perfis/sessão, ações do painel e do acompanhamento, `utils/download`, builders CSV).

Notas técnicas:
- `[[Sessão e Perfil]]`: contexto em `src/contexts/SessionContext.jsx` já consumindo `/api/auth` (Sprint 11) — token opaco do back, validação por `/me` e persistência local só como cache do token.
- Correções de regressão encontradas ao validar: imports ausentes (`Settings`, `Button`, `AlertTriangle`) e export inexistente em `Icons.jsx` usados por módulos de gestão.
- `prop-types` declarado explicitamente no `package.json`.
- Front ↔ back (Sprint 11): `src/services/api.js` é a única porta de saída do front para a rede; rotas e páginas não conhecem URL. Pendências seguintes: JWT com expiração, CORS restrito ao domínio do front e CRUD de projetos (a vitrine é somente leitura).
- Back-end (Sprints 9-10): stack Node + Express com persistência **SQLite** (`node:sqlite`) atrás do repositório `server/store.js` (decisão registrada em [[Decisões do Projeto]]). Regras puras em `server/text.js` (`normalizeText`, `isDefaultFilter`), hash de senha em `server/passwords.js` (scrypt), schema/seed em `server/db.js`; roteadores em `server/routes/`. O seed reaproveita `src/modules/public/data/projects.js` (dado puro, sem React).

---

## 8. Referências globais

- [[Objetivo do Projeto]]
- [[Visão do Sistema]]
- [[Usuários Principais]]
- [[Regras Institucionais]]
- [[Módulos do Sistema]]
- [[Boas Práticas de Programação]]
- [[Testes de Qualidade]]
- [[Testes de Usabilidade]]
- [[Design System]]
- [[Riscos do Projeto]]
- [[Decisões do Projeto]]
- [[Sprint Plan]]

---

## 9. Glossário rápido

- **ODS** - Objetivo de Desenvolvimento Sustentável.
- **PIBEX** - Programa Institucional de Bolsas de Extensão.
- **PROEXT** - Edital/programa institucional relacionado à extensão.
- **ACC** - Atividade Curricular Complementar ou similar, usada como referência de horas creditáveis.
- **DEG** - Divisão/Departamento de Extensão Geral ou similar no contexto institucional.
- **Painel Gestor** - visão administrativa de supervisão.
- **Vitrine Pública** - área externa de divulgação.
- **Submissão** - fluxo docente de criação de projeto.
- **Acompanhamento** - execução, equipe e relatórios.

---

## 10. Como usar este arquivo

- Comece por [[Visão do Sistema]] e [[Módulos do Sistema]].
- Se for implementar, consulte [[Sprint Plan]] e o módulo específico.
- Se for discutir qualidade, vá direto para [[Testes de Qualidade]] e [[Testes de Usabilidade]].
- Se algo mudar de escopo, atualize [[Decisões do Projeto]] e a [[Sprint Plan]].

Este é o arquivo de “cérebro” do projeto.
Ele deve ser mantido vivo: quando uma decisão for repetida, registre aqui.
