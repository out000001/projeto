> **Firebase (atual):** login e sessão usam Firebase Authentication; a vitrine lê
> `projects` no Firestore. Consulte [FIREBASE_SETUP.md](../FIREBASE_SETUP.md) para
> publicar regras, criar o perfil gestor, importar projetos e executar os emuladores.
> As seções abaixo sobre login e vitrine pela API SQLite descrevem o fluxo legado.

# Portal de Extensão UNICAP — Arquitetura do Front-end

Guia rápido para desenvolver neste projeto. Consulte também `../PROJECT_BRAIN.md`
(índice geral em wikilinks), `../SPRINT_PLAN.md` (roteiro) e `../DESIGN.md` (design system).

## Stack

- **Vite + React 18 (JSX, sem TS)** — build e dev server.
- **React Router v6** — roteamento; sessão em `SessionContext` consumindo a API real (`services/api.js`).
- **Tailwind CSS** com tokens Material 3 (`index.html` define as CSS vars; `tailwind.config.js` mapeia cores/fontes).
- **Vitest + Testing Library** — testes de unidade e componente.
- **ESLint (flat config) + Prettier** — qualidade e formatação.
- **Back-end:** Node + Express em `server/` — API REST com SQLite + seed (ver seção "Back-end").

## Estrutura por módulos

```text
src/
  components/
    ui/            # Design system compartilhado (Button, Badge, Card, Input,
                   #   Modal, Icons, ErrorBoundary). Nada de regra de negócio aqui.
    layout/        # AppLayout (shell autenticado: header, nav, footer)
  contexts/        # SessionContext — perfil, login/logout, rotas (contra /api/auth)
  services/        # api.js — cliente HTTP único: único ponto de saída para a rede
  modules/         # Um diretório por domínio, autocontido:
    auth/                  # LoginForm (fluxo de acesso por perfil)
    public/                # Vitrine pública
    project-submission/    # Fluxo docente de submissão em etapas
    project-tracking/      # Acompanhamento (frequência, marcos, relatórios)
    manager-dashboard/     # Painel gestor (KPIs, filtros, prazos)
    settings/              # Configurações da conta (perfil, notificações, privacidade)
  utils/           # format.js — formatação pt-BR; download.js — exportação CSV/TXT
  App.jsx          # Rotas, proteção por perfil e wrapper da vitrine autenticada
```

### Anatomia de um módulo

Cada módulo segue o mesmo padrão (facilita manutenção e onboarding):

```text
modules/<nome>/
  data/            # Dados mock centralizados (troca futura por API)
  hooks/           # Estado local reutilizável (ex.: useSubmissionDraft)
  components/      # Componentes de apresentação do domínio
  <NomeModulo>.jsx # Orquestrador (composição + estado de página)
  logic|validation # Regras de negócio PURAS (sem React) — testáveis direto
  *.test.jsx|js    # Testes do módulo
```

**Regra de ouro:** regra de negócio vive em funções puras; componentes apenas
renderizam e delegam. Isso mantém os testes rápidos e o código previsível.

## Convenções

- **Componentes:** `PascalCase.jsx`, default export, `PropTypes` explícitos.
- **Funções/variáveis:** `camelCase`; dados em `kebab` não são usados no código.
- **Ícones:** sempre de `components/ui/Icons.jsx` (named exports) — nunca SVG inline novo.
- **Modal:** use `components/ui/Modal.jsx` (Escape, backdrop, scroll lock, foco) — não crie overlay manual.
- **Formatação:** `Intl.NumberFormat`/`DateTimeFormat` pt-BR via `utils/format.js`.
- **Exportações:** CSV/TXT via `utils/download.js` (`toCsv` + `downloadTextFile`), com o
  conteúdo montado por funções puras no `logic` do módulo (ex.: `buildProjectsCsv`,
  `buildFrequencyCsv`) — testáveis sem tocar na UI.
- **Estilos:** só classes Tailwind com tokens do design system; sem cores fixas fora do tema.
- **Acessibilidade:** `aria-label` em controles icônicos, `aria-current` em paginação/stepper,
  `role="status"` para contadores dinâmicos, foco visível preservado.

## Comandos

```bash
bun install            # instalar dependências
bun run dev            # servidor de desenvolvimento (front)
sh scripts/dev-with-api.sh  # API (3001) + front (5173) juntos — o que o preview usa
bun run api            # servidor da API (http://0.0.0.0:3001)
bun run test           # vitest em modo watch
bun run test -- --run  # rodar toda a suíte uma vez
bun run lint           # eslint (deve terminar sem erros)
bun run build          # build de produção (dist/)
```

## Back-end (`server/` — início)

API REST em Node + Express, persistência **em memória + seed** (sem banco nesta etapa):

```text
server/
  app.js          # createApp(store) — app Express testável (health, rotas, erros)
  index.js        # entrypoint: sobe a API em API_PORT (default 3001)
  db.js           # schema SQLite + seed idempotente (server/data/portal.db ou :memory:)
  store.js        # repositório SQLite (sessões, usuários, projetos) — interface única dos dados
  passwords.js    # hash/verificação de senha (scrypt + salt, node:crypto)
  text.js         # utilidades puras: normalizeText, isDefaultFilter
  seed.js         # usuários-demo + projetos (reusa src/modules/public/data/projects.js)
  errors.js       # ApiError + formato único { error: { code, message } }
  routes/         # auth.js (login/me/logout) e projects.js (lista/detalhe)
  app.test.js     # integração com supertest (HTTP real sobre SQLite em memória)
  persistence.test.js # persistência em arquivo, seed idempotente, hash e texto
```

**Regra de ouro (igual ao front):** nada de dados fora do `store.js` — para trocar a
persistência, reimplemente só esse arquivo; as rotas e os testes não mudam.
Banco: SQLite (`node:sqlite`, sem dependência extra) em `server/data/portal.db`
(gerado no primeiro run e ignorado pelo git); senhas sempre com hash scrypt + salt.

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/health` | verificação de vida da API |
| POST | `/api/auth/login` | `{ identifier, password }` → `{ token, user }` |
| GET | `/api/auth/me` | perfil do token (`Authorization: Bearer <token>`) |
| POST | `/api/auth/logout` | encerra a sessão do token |
| GET | `/api/projects?q=&area=&local=` | listagem com filtros (busca sem acento/caixa) |
| GET | `/api/projects/:id` | detalhe do projeto |

Credenciais de demonstração (seed): `ana.souza@unicap.br` / `gestor123` (gestor) e
`20241001@unicap.br` / `estudante123` (estudante). Erros seguem sempre
`{ error: { code, message } }`. Pendências das próximas entregas: JWT com
expiração, CORS de produção e CRUD de projetos (a vitrine é somente leitura).

## Front ligado ao back (`src/services/api.js`)

O front não conhece URL nem formato de erro: tudo passa por `services/api.js`.
`resolveApiBaseUrl()` escolhe a base — `VITE_API_URL` se definida; senão, no
preview do Freebuff, deriva a porta da API a partir do host (`5173-<id>` →
`3001-<id>`); em local, `http://<host>:3001`. Falhas de rede viram `ApiError`
com `code: "NETWORK_ERROR"`.

Consumo atual:

| Front | Chamada |
| --- | --- |
| `SessionContext.login` | `POST /api/auth/login` → `{ token, user }` |
| `SessionContext` (mount, se houver token) | `GET /api/auth/me` — servidor é a autoridade; falha limpa a sessão |
| `SessionContext.logout` | `POST /api/auth/logout` (best-effort) |
| `PublicLanding` | `GET /api/projects` com estados de carregando/erro |

Dois conceitos que não podem voltar a se misturar: `restoring` (validação do
token persistido — gating de rota) e `loading` (submissão do login — spinner do
formulário). Juntá-los desmontava o `LoginForm` durante o submit e travava a
tela em "Verificando acesso...".

## Qualidade (critério de "pronto")

1. Escopo implementado seguindo a anatomia de módulo.
2. Regras críticas cobertas por testes (unidade para lógica, componente para UI).
3. `bun run test -- --run`, `bun run lint` e `bun run build` todos verdes.
4. Sem regressão de acessibilidade básica (labels, contraste, foco).
5. Documentação do módulo atualizada no `PROJECT_BRAIN.md` quando o escopo muda.
