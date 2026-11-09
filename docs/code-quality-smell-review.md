# Análise de boas práticas e Test Smells — 09/11/2026

## Resultado e método

Análise equivalente para JavaScript, autorizada pelo usuário, com ESLint, grafo de imports/exports por AST (`@babel/parser`), revisão manual dos testes, comparação de builds e regressão automatizada. Não é uma execução nem certificação do tsDetect.

O [Test Smell Detector indicado](https://testsmells.org/pages/testsmelldetector.html) executa um JAR e recebe pares de arquivos de teste/produção Java em CSV, conforme seus exemplos e o [repositório oficial](https://github.com/TestSmells/TestSmellDetector). O portal utiliza JavaScript, Vitest, node:test e Playwright. Nenhum código ou dado do portal foi enviado ao site.

Base da comparação: commit `ae399ea`. O build anterior foi reconstruído em uma cópia temporária dessa versão, usando as mesmas dependências e configuração do build atual.

| Verificação | Antes | Depois |
| --- | ---: | ---: |
| Candidatos a exports sem consumidores, mesma análise estática | 24 | 0 |
| Alertas automáticos de test smells (exigem revisão manual) | 8 | 5 |
| JavaScript gerado, UTF-8 | 1.050.585 bytes | 1.044.672 bytes |
| JavaScript gzip, nível 9 | 278.350 bytes | 276.694 bytes |
| Testes da aplicação | 212 aprovados | 210 aprovados |
| ESLint do servidor/APIs | Não havia comando dedicado | 24 arquivos; 0 erros e avisos |

Economia medida: 5.913 bytes de JS (0,56%) e 1.656 bytes gzip (0,59%). Isso não é uma medição de latência, memória ou tempo de carregamento em dispositivo real. O bundle ainda é grande; o aviso acima de 500 kB continua e merece um trabalho separado de carregamento por rota e análise de dependências.

A quantidade de testes diminuiu porque 15 testes da lógica antiga/dados de exemplo foram substituídos por 12 testes dos cálculos realmente usados no tracking e um teste que impede retorno silencioso aos mocks. Não se removeu teste que falhava para fazer a suíte passar.

## Problemas confirmados e correções

| Classe | Evidência | Correção |
| --- | --- | --- |
| Dead code / dados de demonstração em módulo de produção | `dashboardLogic.js` importava projetos e prazos fictícios como fallback | Entradas ausentes passam a produzir listas vazias; fixtures foram isoladas em `src/test/fixtures` |
| Código sem consumidor | Nove exports de ícones, três formatadores, mapa de densidade, metadados antigos e seis funções antigas de tracking | Remoção após conferir imports estáticos, imports dinâmicos e referências no repositório |
| Export desnecessário | Constantes de limites/densidade e urgência usadas apenas no próprio módulo | Mantidas como constantes privadas; seus valores e validações foram preservados |
| Variável sem uso | `fs` no roteiro Playwright | Import removido; lint do servidor passa a impedir novas ocorrências |
| Conditional Test Logic | `ManagerDashboard.test.jsx` só verificava relatórios se o próprio resultado calculado fosse positivo | Premissa e resultado são verificados incondicionalmente |
| Conditional Test Logic / teste potencialmente vazio | `server/projects.test.mjs` só verificava tamanho dos shards dentro de `if`, podendo passar sem nenhum shard | Verifica primeiro que existem shards e testa todos os selecionados |
| Sleepy Test | `layout-audit.mjs` aguardava 60 ms fixos após redimensionar | Aguarda dois frames de renderização do navegador, sem duração arbitrária em milissegundos |
| Oráculo duplicado / General Fixture | Teste de KPIs calculava o esperado repetindo reduções da implementação sobre fixture grande | Caso pequeno com resultado esperado explícito e independente |
| Teste sem comportamento de produção | Teste que apenas verificava que um valor estático de exemplo era positivo | Substituído por casos de meses, fuso horário, horas homologadas, membros inativos e ausência de carga |
| Fixture dependente do relógio | Prazos de demonstração gerados em relação ao dia real | Data de referência fixa na fixture |

As fixtures públicas usadas pelos testes e pelos comandos explícitos de seed foram preservadas, com imports atualizados. O mock de autenticação usado via `import()` foi preservado: não é código morto. O backend SQLite legado e suas dependências também foram mantidos porque ainda possuem comando e testes próprios.

## Cinco alertas remanescentes: revisão manual

| Local | Detecção | Classificação |
| --- | --- | --- |
| `server/playwright/production.spec.cjs` | `if` no callback que conta requisições POST | Instrumentação: necessário para contar apenas envios de cadastro. Não decide se uma asserção será executada |
| `scripts/test-auth.mjs` | Guarda de limpeza de usuário + try/finally | Gerenciamento de recursos: evita vazamento de contas/conexões no emulador |
| `scripts/test-firebase.mjs` | Guardas de limpeza + try/finally | Mesmo caso: teardown precisa funcionar após falhas parciais |

Os dois últimos arquivos geram dois alertas cada (condicional e try), totalizando cinco. Foram retidos deliberadamente. Não representam uma prova de ausência de todos os test smells.

## Dívida técnica identificada, sem reescrita nesta limpeza

- Os 24 testes funcionais Playwright compartilham um cenário serial. Existe dependência entre etapas: se uma falhar, as seguintes são ignoradas. Isso é documentado e útil para uma jornada completa, mas não substitui testes independentes. Próximo passo: fixtures isoladas para os casos que não precisam compartilhar a jornada.
- Handlers como `server/tracking.mjs` e `server/portal.mjs` concentram muitas ações. Separar validação, autorização e cada operação pode melhorar manutenção, mas exige uma refatoração própria com a cobertura atual.
- Busca e paginação carregam resumos no cliente. A escala de milhares de projetos e o custo de leituras não foram medidos.

## Reprodução e limites

- `npm run audit:quality`: relatório AST em `reports/quality/code-quality.json`.
- `npm run lint:server`: servidor e APIs; relatório em `reports/quality/server-eslint.json`.
- No diretório da aplicação: `npm run lint`, `npm run test:run`, `npm run build`.
- `npm test` na raiz: testes das APIs.
- Playwright: procedimento em `docs/playwright-platform-tests.md`; escrita apenas nos emuladores. Produção recebe consultas de leitura e navegação anônima.

O AST considera imports relativos estáticos, `require()` e `import()` com caminho literal. Não detecta todos os acessos construídos em runtime, regras de domínio, desperdício de memória ou comportamento de serviços externos. Contagem de asserções/condicionais é triagem, não diagnóstico automático. Os arquivos JSON antes/depois registram o escopo e os candidatos; as decisões acima são revisão manual.

## Validação final desta revisão

- ESLint da aplicação: sem erros ou avisos; variáveis não usadas agora bloqueiam o lint.
- ESLint de 24 arquivos de servidor/APIs: sem erros ou avisos.
- 210 testes da aplicação em 21 arquivos: aprovados.
- 11 testes unitários das APIs: aprovados.
- 29 cenários Playwright: aprovados; um deles cobre 125 combinações de layout e a regressão de sessão.
- Build de produção: aprovado. Mantido o aviso conhecido de bundle acima de 500 kB.
- A escrita dos testes end-to-end usou apenas Firebase emulado. Os checks do site publicado foram de leitura; a validação funcional das alterações foi realizada no emulador.
