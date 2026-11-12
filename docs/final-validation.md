# Testes finais: carga, estresse, segurança e smoke

Os testes de carga e estresse usam exclusivamente HTTP local com os handlers reais e Firebase Auth/Firestore Emulator, projeto `demo-portal-unicap`. Não executá-los em produção. O script remove os dados do projeto de emulação no início e no fim; use uma instância dedicada, sem dados de trabalho.

## Execução e ordem

Na raiz, instale as dependências com `npm ci`. No aplicativo, use Bun 1.3.11 com `bun install --frozen-lockfile`. Instale o Chromium do Playwright. Java é necessário para o Firestore Emulator.

```sh
XDG_CONFIG_HOME=/tmp/portal-firebase-config CI=true JAVA_TOOL_OPTIONS=-Xmx768m \
stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/node_modules/.bin/firebase emulators:exec \
--config stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/firebase.json \
--only auth,firestore --project demo-portal-unicap \
'node --max-old-space-size=512 server/final-validation.mjs'
```

A execução registra `reports/final-tests/ordered-results.json`, na ordem:

1. Aquecimento e carga: 1, 5, 10 e 20 requisições simultâneas.
2. Estresse limitado: 40, 80 e 120 simultâneas; interrupção acima de 700 MB de RSS ou mais de 50% de respostas inesperadas. Depois, indisponibilidade injetada na interface do banco (503) e restauração (200).
3. Segurança: 24 verificações de autenticação, autorização, regras do Firestore, validação, concorrência e limites de tentativas.
4. Corrigir os achados e repetir a validação. Executar testes unitários, lint e build.
5. Smoke Test: executar a suíte Playwright descrita em `docs/playwright-platform-tests.md`, com um único conjunto de emuladores, após as correções. Use `--grep-invert Produção` para excluir os quatro casos de produção. Carga, estresse e Smoke Test devem ocorrer somente localmente; apenas verificações de segurança podem usar o ambiente online, conforme orientação do solicitante.

Os arquivos `before-fixes.json` e `after-fixes.json` preservam as duas rodadas. A auditoria de dependências usa `npm audit --omit=dev --json` na raiz e `bun audit --json` no aplicativo, cujo lock oficial é `bun.lock`.

## Critérios e limites

O critério local escolhido para carga normal é p95 <= 1.500 ms e nenhuma resposta inesperada. Não é um SLA contratual. São 100 projetos e três contas, com consultas autenticadas de catálogo, conta e detalhe. Os clientes e o servidor HTTP compartilham o processo; CPU/RSS incluem o gerador. O ambiente possui quota de duas CPUs e 8 GiB. Timeout de 5 s por requisição; heap Node limitado a 512 MB, heap Java a 768 MB.

O teto de 120 requisições simultâneas não equivale a 120 pessoas. Se não ocorrer ruptura até esse teto, o ponto exato de quebra permanece desconhecido. A falha do banco é injetada no adaptador; não representa interrupção real do serviço Firebase. Os testes curtos não demonstram estabilidade prolongada, capacidade da Vercel ou ausência de vulnerabilidades. A política CSP adicionada cobre enquadramento, base e objetos, sem política completa de scripts.

## Correções comprovadas

- Entradas de anexo inválidas são rejeitadas com 400 antes de acessar armazenamento.
- E-mails de participante e de configuração com tipo inválido retornam 400 em vez de 503.
- Alunos com participação inativa não enviam novos anexos (403).
- Cabeçalhos anti-enquadramento, anti-MIME sniffing, política de referência e CSP parcial são configurados no Vercel.
- Dependências são atualizadas com validação de compatibilidade; alertas restantes devem constar no relatório, sem afirmar auditoria zerada quando não estiver.

## Triagem de dependências após as atualizações

A auditoria da API de produção (raiz, Firebase Admin 14.5.1) ficou sem alertas. No aplicativo restaram quatro pacotes com alertas moderados, ligados ao CLI `firebase-tools`: `@opentelemetry/core` 1.x via Pub/Sub, `glob` 10.x, `minimatch` 9.x via glob e `uuid` 9.x via gaxios. As versões corrigidas exigem mudanças de versões principais nesses caminhos. Não foram aplicados overrides incompatíveis para mascarar os avisos: permanecem pendentes de atualização compatível dos pacotes responsáveis. Nenhum alerta alto/crítico permaneceu na auditoria final registrada. Isso não certifica ausência de vulnerabilidades desconhecidas.

## Compatibilidade do runtime Vercel

A atualização do Firebase Admin revelou erro `ERR_REQUIRE_ESM` em `jwks-rsa` ao carregar `jose` 6 no runtime da Vercel, que desativa require de ESM. Foi reproduzido localmente com `--no-experimental-require-module`. O override específico `jwks-rsa → jose ^5.10.0` mantém os métodos de JWK usados pelo SDK com suporte CommonJS. Há testes de importação com essa restrição e verificação RSA com chave JWK sem rede. A auditoria do servidor permanece sem alertas conhecidos.
