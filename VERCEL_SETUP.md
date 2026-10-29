# Publicação no Vercel

Importe o repositório `out000001/projeto` no Vercel e mantenha **Root Directory**
na raiz do repositório (`./`). O `vercel.json` dessa raiz já define instalação
congelada pelo Bun 1.3.11, build do Vite, diretório de saída e fallback das rotas
React para `index.html`. Não selecione a subpasta como Root Directory ao usar
essa configuração. O frontend não precisa executar a API Express/SQLite.

A configuração Firebase web está em `src/services/firebase.js` e não precisa
ser copiada para variáveis do Vercel. Não configure
`VITE_FIREBASE_USE_EMULATORS=true` em produção. Nunca coloque senhas, tokens
administrativos ou chaves de serviço em variáveis com prefixo `VITE_`.

## Firebase

O Vercel publica o frontend. Authentication, dados e regras continuam no Firebase,
no projeto `portaldeextensaocomunitaria`.

Antes de declarar a publicação pronta:

1. Publique as regras de
   `stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/firestore.rules`
   em **Firestore Database → Regras**, preservando as necessidades de qualquer
   outro aplicativo que já use esse banco.
2. Confirme que o banco **(default)** existe e que **Authentication → E-mail/senha**
   está habilitado.
3. Cadastre os usuários em Authentication. Para gestores, crie o documento
   `users/{UID}` com `profile` (string) igual a `gestor` e `name` (string).
4. Quando o Vercel informar o domínio real de produção, adicione apenas esse
   hostname em **Authentication → Configurações → Domínios autorizados**.
   Isso prepara fluxos futuros de redirecionamento e recuperação de senha;
   o login atual usa e-mail/senha diretamente.
5. Popule o catálogo `projects` com dados públicos. O importador opcional,
   descrito em `FIREBASE_SETUP.md`, preserva documentos existentes. Uma coleção
   vazia deve exibir catálogo vazio; ela não é substituída por dados fictícios.

## Validação após o deploy

Verifique a URL real fornecida pelo Vercel: página inicial, acesso direto a
`/public`, atualização em `/dashboard` sem 404 de hospedagem, login com uma
conta Firebase, logout, restauração de sessão e listagem real dos projetos.
Confirme que visitante/estudante não consegue escrever no catálogo e que os
perfis não podem ser alterados pelo cliente.

Criar arquivos e enviar ao GitHub não cria um projeto Vercel nem publica regras.
O deploy precisa de uma conexão Vercel autorizada; alterações administrativas
Firebase precisam de acesso ao console ou identidade administrativa autorizada.
Não envie tokens ou arquivos de chave privada pelo chat.
