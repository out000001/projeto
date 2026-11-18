# Portal de Extensão Comunitária — UNICAP

Projeto acadêmico para organizar ações de extensão da Universidade Católica de Pernambuco. O portal conecta alunos, comunidade e docentes, reunindo a divulgação de projetos, inscrições, acompanhamento de atividades, homologação de horas e entrega de relatórios.

**[Acessar o portal](https://projeto-silk-iota.vercel.app)** · **[Documentação técnica](docs/real-portal-workflows.md)** · **[Reportar um problema](https://github.com/out000001/projeto/issues)**

## Funcionalidades

### Alunos e comunidade

- Consultar projetos, pesquisar oportunidades e filtrar resultados.
- Criar uma conta e confirmar o endereço de e-mail antes de acessar as áreas privadas.
- Inscrever-se em projetos, acompanhar a situação da inscrição e participar da lista de espera.
- Consultar frequência, horas homologadas, cronograma e entregas dos projetos aos quais estão vinculados.
- Enviar relatórios e anexos, acompanhar pareceres e apresentar novas versões quando houver solicitação de ajustes.
- Visualizar e baixar os editais em PDF disponibilizados pela gestão.

### Gestores e docentes

- Cadastrar propostas em um formulário de seis etapas e publicar projetos na vitrine.
- Organizar projetos por escola, edital, situação e linha temática.
- Gerenciar participantes, inscrições, vagas e lista de espera.
- Registrar frequência, homologar horas e acompanhar metas e atividades.
- Solicitar entregas, analisar relatórios e emitir pareceres.
- Cadastrar editais com PDF de até 10 MB e exportar dados em CSV.

### Conta e navegação

- Acesso por e-mail e senha com permissões determinadas pelo perfil salvo no servidor.
- Cadastro de gestores protegido por uma chave institucional validada no backend.
- Configurações persistidas por conta, avisos de pendências e encerramento de sessão por inatividade.
- Interface adaptável a telas estreitas, controles de visibilidade de senha e navegação da marca UNICAP conforme o perfil.

## Tecnologias e arquitetura

| Camada | Tecnologias | Responsabilidade |
| --- | --- | --- |
| Interface | React 18, React Router 7, Vite 7 e Tailwind CSS 3 | Páginas, formulários, navegação e apresentação dos dados |
| Autenticação | Firebase Authentication | Contas, confirmação de e-mail, recuperação de senha e sessões |
| API | Node.js, Firebase Admin SDK e Vercel Functions | Validação, autorização e operações privadas |
| Dados | Cloud Firestore | Projetos, perfis, inscrições, acompanhamento e documentos |
| Verificação | Vitest, Testing Library, `node:test`, Playwright e Firebase Emulator Suite | Testes unitários, integração, fluxos de navegador e layout |
| Publicação | GitHub e Vercel | Versionamento e entrega da aplicação |

A vitrine consulta o catálogo público no Firestore. Operações de gestão, inscrição e acompanhamento passam pelas APIs, que verificam a sessão, a confirmação do e-mail e as permissões necessárias. PDFs e outros anexos são armazenados em partes em coleções privadas e disponibilizados pelas APIs; o projeto não depende de um bucket público para esses arquivos.

O backend Express/SQLite em `server/` **dentro da pasta da aplicação** é legado e possui execução e testes próprios. Ele não é o backend utilizado pelo portal publicado.

## Estrutura do repositório

```text
projeto/
├── api/                              # Entradas das funções HTTP da Vercel
├── server/                           # Regras de negócio, testes e ferramentas de validação
├── config/auth-emails/               # Modelos preparados para os e-mails do Firebase
├── docs/                             # Decisões, procedimentos e revisões técnicas
├── stitch_portal_de_extens_o_unicap/
│   └── portal_de_extens_o_unicap/
│       ├── src/                      # Aplicação React
│       ├── scripts/                  # Testes Firebase e ferramentas auxiliares
│       ├── server/                   # Backend Express/SQLite legado
│       ├── firebase.json             # Configuração dos emuladores
│       ├── firestore.rules           # Regras de acesso ao banco
│       └── bun.lock                  # Lockfile usado na instalação do frontend
├── package.json                      # Dependências e comandos do backend atual
└── vercel.json                       # Build, rotas e cabeçalhos de produção
```

## Requisitos

- Node.js **24.x**, versão utilizada na validação do projeto.
- npm, fornecido com o Node.js, para as dependências da raiz.
- Bun **1.3.11**, utilizado na instalação reproduzível da aplicação e na Vercel.
- Java **21 ou superior** para os testes com Firestore Emulator.
- Chromium do Playwright para os testes de navegador.

Para publicação, também são necessários um projeto Firebase com Authentication/Firestore configurados e acesso ao projeto correspondente na Vercel.

## Instalação

```bash
git clone https://github.com/out000001/projeto.git
cd projeto
npm ci

cd stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap
bun install --frozen-lockfile
```

A raiz utiliza `package-lock.json`. A instalação do frontend segue `bun.lock`, o mesmo lockfile utilizado pela configuração de produção.

### Executar a interface local

Na pasta da aplicação:

```bash
bun run dev
```

A interface fica disponível em **http://localhost:5173**.

O Vite inicia apenas o frontend: ele não executa as funções de `api/`. Para validar os fluxos completos localmente, utilize a suíte de integração com emuladores descrita abaixo. A execução manual conjunta do frontend e das APIs ainda não possui um comando dedicado no repositório.

As configurações Firebase atuais identificam o projeto deste portal. Antes de utilizar outro projeto, revise a configuração do cliente e as validações de identificação do projeto no backend. Não utilize credenciais de produção em testes locais.

### Gerar o build

Na pasta da aplicação:

```bash
bun run build
```

Os arquivos são gerados em `dist/`. Para inspecionar esse build localmente:

```bash
bun run preview
```

A prévia também não inicia as APIs da Vercel.

## Testes e qualidade

### Backend e análise estática

Na raiz do repositório:

```bash
npm test
npm run lint:server
npm run audit:quality
```

### Aplicação React

Na pasta da aplicação:

```bash
bun run lint
npm run test:run -- --maxWorkers=1 --testTimeout=10000
```

O timeout acima acomoda os testes de formulários com várias etapas; não é uma meta de tempo de resposta do produto.

### Integração e navegador com Firebase emulado

Os comandos abaixo usam Bash e devem ser executados na raiz. Instale primeiro o navegador:

```bash
export PORTAL_APP=stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap
node "$PORTAL_APP/node_modules/@playwright/test/cli.js" install chromium
```

Em seguida, execute a suíte:

```bash
"$PORTAL_APP/node_modules/.bin/firebase" emulators:exec \
  --config "$PORTAL_APP/firebase.json" \
  --only auth,firestore \
  --project demo-portal-unicap \
  'node "$PORTAL_APP/node_modules/@playwright/test/cli.js" test --config server/playwright.config.cjs'
```

A configuração inicia ou reutiliza o Vite local. Os fluxos autenticados utilizam Firebase Auth/Firestore Emulator e os handlers reais da API. A suíte padrão exclui os cenários de produção.

**Use emuladores dedicados:** os testes removem contas e dados de demonstração durante a preparação e a limpeza. Não os execute em uma instância compartilhada com dados que deseja preservar.

Carga, estresse, Smoke Test e usabilidade devem ser realizados localmente. Apenas verificações de segurança podem usar o ambiente online. Procedimentos e limites estão em [testes Playwright](docs/playwright-platform-tests.md) e [testes finais](docs/final-validation.md).

Os resultados são gerados em `reports/`, incluindo JSON, capturas e relatórios conforme o comando executado. Esses artefatos podem não estar versionados. Consulte a data e o escopo de cada execução; não some contagens de rodadas diferentes como se fossem casos únicos.

## Configuração de produção

Cadastre as variáveis abaixo como **Secret** no ambiente **Production** da Vercel:

| Variável | Finalidade |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Credencial de serviço utilizada exclusivamente pelo backend para acessar o Firebase |
| `MANAGER_REGISTRATION_KEY` | Chave exigida no cadastro de gestores/docentes |

Não coloque os valores dessas variáveis no README, em arquivos versionados ou no código do frontend. A configuração web do Firebase identifica a aplicação; a proteção dos dados depende das regras do Firestore e da autorização nas APIs.

**Se uma credencial já tiver sido publicada em um commit, substitua-a no serviço correspondente. Remover o texto da versão atual não elimina o histórico do Git.**

### Publicação na Vercel

O projeto está conectado ao GitHub; alterações enviadas para `main` acionam o fluxo de publicação. O [vercel.json](vercel.json) define:

1. Instalação das dependências da raiz com npm e da aplicação com Bun.
2. Build do frontend.
3. Aplicação das regras revisadas do Firestore em produção, usando a credencial de serviço configurada.
4. Publicação de `dist/` e disponibilização das funções em `api/`.

A aplicação das regras é limitada ao projeto Firebase esperado pelo backend. A credencial precisa das permissões necessárias; uma falha nessa etapa interrompe o build. Confirme o estado **READY** do deployment antes de considerar a publicação concluída.

## Documentação complementar

| Documento | Conteúdo |
| --- | --- |
| [Fluxos reais do portal](docs/real-portal-workflows.md) | Persistência, permissões e jornadas implementadas |
| [Cadastro, escolas e editais](docs/verified-registration-and-editais.md) | Confirmação de e-mail, escolas oficiais e PDFs |
| [Descoberta de projetos](docs/tracking-project-discovery.md) | Busca, filtros e paginação do acompanhamento |
| [Revisão do tracking](docs/tracking-refinement.md) | Indicadores, entregas e regras do acompanhamento |
| [Avisos da conta](docs/notice-window.md) | Janela central, estados e navegação por teclado |
| [Responsividade](docs/responsive-layout-review.md) | Cobertura e limites da revisão de layout |
| [Qualidade e Test Smells](docs/code-quality-smell-review.md) | Análise equivalente para JavaScript e melhorias realizadas |
| [Testes finais](docs/final-validation.md) | Carga, estresse, segurança e Smoke Test |
| [Modelos de e-mail](docs/auth-emails/README.md) | Conteúdo preparado e instruções para salvar no console Firebase |

## Limitações conhecidas

- A busca e a paginação de projetos usam os resumos carregados no cliente; a capacidade com milhares de projetos ainda precisa ser medida.
- Há um aviso de tamanho do bundle no build. Carregamento por rota e análise das dependências são oportunidades de otimização.
- A revisão de usabilidade documentada é técnica, sem estudo com participantes humanos ou pontuação SUS. Há verificações de acessibilidade que ainda exigem leitores de tela e dispositivos reais.
- A suíte de navegador usa Chromium; seus resultados não certificam comportamento em Safari, Firefox ou aparelhos físicos.
- Os modelos de e-mail personalizados estão preparados, mas a aplicação automática foi recusada pelo Firebase. Eles precisam ser salvos no console; não devem ser apresentados como já ativos nos envios reais.
- A análise de Test Smells foi equivalente para JavaScript; o tsDetect não foi executado.

## Equipe

- Guilherme Marques
- João Gabriel Coutinho
- João Marcos Pessoa
