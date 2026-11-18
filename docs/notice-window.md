# Avisos em janela central

A escolha do usuário mantém os avisos em janela central. O modal agora é renderizado por portal no body: o efeito backdrop-filter do cabeçalho fixo deixava o posicionamento relativo ao cabeçalho e cortava o conteúdo no topo.

- Janela dentro do viewport, inclusive a 320 CSS px, com lista rolável e cabeçalho/rodapé disponíveis.
- Cards separados em ações/prazos e atualizações/resumos, com títulos, ícones e ações específicas. Contagens são as recebidas da API; não representam avisos não lidos. Não foram inventados horários de recebimento.
- Carregamento, erro, retry e estado vazio explícitos. O resultado de uma atualização antiga não substitui o de uma mais recente.
- Escape e clique no fundo fecham; Tab/Shift+Tab permanecem no diálogo e o foco retorna ao acionador ao fechar.
- O botão de reenvio foi retirado do login a pedido do usuário. O cadastro continua solicitando o e-mail de confirmação e o acesso continua exigindo endereço confirmado. Mensagens não indicam mais um botão inexistente.
- A logo UNICAP retorna à página inicial do perfil e o ícone do aluno usa o SVG de educação.

## Reprodução

No aplicativo: `npm run lint`, `npm run test:run -- --maxWorkers=1 --testTimeout=10000` e `npm run build`.

Na raiz: `npm test`. Para a regressão local de posição/teclado, mantenha o Vite em 127.0.0.1:5173 e execute `PLAYWRIGHT_BROWSERS_PATH=/workspace/.browser-cache node server/notices.browser.cjs`. As identidades e avisos dessa inspeção visual são fixtures; chamadas externas são bloqueadas. São verificadas quatro larguras, lista de 30 avisos com scroll próprio, foco, Escape, ícone do aluno e ausência do botão de reenvio. Os arquivos são gerados em `reports/notices-ui/`.

A regressão completa de navegador usa o procedimento Playwright/Firebase Emulator documentado em `docs/playwright-platform-tests.md`; não executa testes funcionais em produção. Os PDFs de testes anteriores são históricos e não são reescritos nesta alteração.
