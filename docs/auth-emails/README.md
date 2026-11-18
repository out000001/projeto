# E-mails de autenticação — Portal de Extensão UNICAP

Remetente exibido: **Portal de Extensão UNICAP**. Idioma: **português do Brasil**.

| Modelo no Firebase | Assunto | Mensagem |
| --- | --- | --- |
| Verificação de endereço | Confirme seu e-mail \| Portal de Extensão UNICAP | Corpo administrado pelo Firebase |
| Redefinição de senha | Redefina sua senha \| Portal de Extensão UNICAP | HTML personalizado, com cabeçalho UNICAP em vinho e dourado, CTA, link alternativo e orientação para solicitações não reconhecidas |
| Alteração de endereço | Alteração de e-mail \| Portal de Extensão UNICAP | Corpo administrado pelo Firebase |
| Registro da autenticação multifator | Novo fator de autenticação \| Portal de Extensão UNICAP | Corpo administrado pelo Firebase |

A personalização do último modelo não ativa autenticação multifator na aplicação.

O cabeçalho utiliza texto HTML, sem depender de imagens externas. Ele não é um arquivo do logotipo oficial; é um cabeçalho com o nome UNICAP, legível mesmo com bloqueio de imagens. O HTML está em `config/auth-emails/reset-password.html`; assuntos e nome do remetente em `config/auth-emails/templates.json`.

O endereço técnico do remetente, reply-to, provedor de envio e link de ação existentes são preservados. Não foi inventado um endereço @unicap.br nem redirecionado o link de confirmação para uma página incapaz de tratar códigos Firebase. `%LINK%` e `%EMAIL%` são substituídos pelo Firebase no envio.

## Limite do Firebase

A documentação oficial permite personalizar nome do remetente e assunto de todos os modelos, mas permite editar a mensagem para redefinição de senha. Os corpos dos demais modelos permanecem sob controle do Firebase:
https://support.google.com/firebase/answer/7000714?hl=pt-BR

## Aplicação

Os arquivos são modelos para edição no console do Firebase, separados do código e da publicação do portal. O cabeçalho foi conferido localmente em 720 e 320 CSS px, com endereço e link de exemplo; não houve envio real de mensagem. A tentativa de atualização administrativa usou apenas os campos de modelos e idioma, sem alterar métodos de login, MFA, domínio, SMTP ou callback URI. A rotina experimental foi removida após a recusa da API.

## Resultado da tentativa de aplicação

A API administrativa respondeu `EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED` para os quatro modelos, inclusive para redefinição de senha. Portanto, o cabeçalho e os assuntos preparados **não foram aplicados automaticamente aos e-mails reais**. A edição deve ser concluída no console do Firebase, conforme as permissões disponibilizadas por ele.

O código das telas e o `vercel.json` do portal foram mantidos exatamente como estavam antes desta tarefa. As operações administrativas isoladas foram encerradas sem publicação de conteúdo no site. Não foram enviados e-mails reais de teste.

## Como salvar no console

1. Firebase → Authentication → Modelos.
2. Abra o modelo desejado e clique no lápis de edição.
3. Nome do remetente: `Portal de Extensão UNICAP`. Use o assunto correspondente da tabela acima. Mantenha o endereço técnico do remetente e o endereço de resposta existentes.
4. Em **Redefinição de senha**, cole o HTML de `config/auth-emails/reset-password.html` no campo de mensagem/HTML, caso ele esteja disponível para edição.
5. Preserve `%LINK%` e `%EMAIL%`. Não substitua o link de ação por uma página do portal.
6. Salve cada modelo. Nos modelos com corpo bloqueado, personalize apenas os campos que o console liberar.

`COLAR-NO-FIREBASE.txt` reúne os campos e o HTML para copiar. A prévia usa endereço e link de exemplo, sem códigos reais de autenticação.
