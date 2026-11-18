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

A aplicação dos modelos é separada do portal, pelo script administrativo `server/deploy-auth-email-templates.mjs`; ele não faz parte do build normal do site. O script usa a credencial de serviço já configurada no projeto `portaldeextensaocomunitaria`, sem imprimir tokens ou a chave. A leitura é limitada aos campos dos modelos e idioma; não solicita configuração SMTP. O PATCH usa máscara de campos específica, sem alterar regras de login, MFA, domínios, SMTP ou callback URI. A configuração é lida novamente após a atualização para confirmar os campos.

Builds locais e previews não alteram a configuração remota. Os testes locais verificam placeholders, branding e limite da máscara de atualização. Nenhuma mensagem real é enviada por essa etapa de publicação.
