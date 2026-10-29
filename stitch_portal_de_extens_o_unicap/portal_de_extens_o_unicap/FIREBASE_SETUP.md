# Firebase — Portal de Extensão

O frontend usa Firebase Authentication (e-mail/senha) e a coleção pública
`projects` do Cloud Firestore no projeto `portaldeextensaocomunitaria`.
`src/services/firebase.js` contém a configuração web pública. Ela não concede
acesso administrativo. O navegador não usa mais as sessões da API SQLite.
O backend SQLite e seus testes continuam disponíveis separadamente.

## Concluir no console

1. Em **Authentication → Método de login**, habilite **E-mail/senha**.
2. Em **Firestore Database**, crie o banco **(default)** em modo de produção.
3. Em **Firestore → Regras**, copie todo o conteúdo de `firestore.rules` e clique
   em **Publicar**. As regras de produção iniciais bloqueiam as consultas até
   essa publicação. Se já houver outras coleções usadas por outro aplicativo,
   integre as regras antes de publicar; este arquivo nega acesso às coleções
   que não estão listadas.
4. Em **Authentication → Usuários → Adicionar usuário**, cadastre sua conta.
   As antigas contas e senhas de demonstração do SQLite não são importadas.
5. Copie o **UID** dessa conta. Em **Firestore → Dados**, crie a coleção `users`
   e um documento cujo ID seja exatamente esse UID. Campos do gestor:

   | Campo | Tipo | Valor |
   | --- | --- | --- |
   | `profile` | string | `gestor` |
   | `name` | string | Seu nome |
   | `unit` | string | Sua unidade (opcional) |

   Para estudantes, use `profile: estudante` e, se desejar, `course` (string).
   Uma conta autenticada sem documento recebe acesso de estudante. O cartão
   selecionado na tela de login não concede permissões. Somente um administrador
   no console ou código Admin SDK confiável pode alterar os perfis.
6. Entre no portal usando o e-mail e a senha da conta Firebase.

Nenhum usuário pode criar/alterar seu próprio perfil pelo SDK. A vitrine é
pública; gestores podem alterar projetos; os perfis são privados. Nunca guarde
senhas, inscrições ou informações privadas na coleção pública `projects`.
A interface de edição de projetos não foi adicionada nesta integração.

Também é possível publicar as regras em uma máquina com Firebase CLI autenticada:

```sh
firebase deploy --only firestore:rules --project portaldeextensaocomunitaria
```

Este ambiente não possui uma identidade administrativa Google vinculada.
Criar o banco no console não autentica automaticamente a sessão de desenvolvimento.

## Importar os seis projetos de demonstração (opcional)

A vitrine ficará vazia até que existam documentos no Firestore. Não há fallback
para os dados locais. O importador grava somente projetos ausentes, nunca
sobrescreve documentos existentes e não importa usuários nem senhas de exemplo.

Na pasta deste arquivo, crie **localmente** `.env.seed.local` (ignorado pelo Git)
com `FIREBASE_SEED_EMAIL` e `FIREBASE_SEED_PASSWORD` da sua conta de gestor.
Não envie esses valores no chat e não use variáveis `VITE_` para senhas.
Execute:

```sh
# Apenas mostra a orientação; não faz gravações:
npm run seed:firestore
# Importa documentos ausentes usando as permissões do gestor:
node --env-file=.env.seed.local scripts/seed-firestore.mjs --write
```

Apague o arquivo de credenciais após o uso. O script exige `users/{uid}` com
`profile: gestor`; não tente liberar escrita pública para fazê-lo funcionar.
Os documentos `projects/1` a `projects/6` contêm os campos definidos em
`src/modules/public/data/projects.js`, exceto o campo `id`: a interface utiliza
o ID do próprio documento. Não há índice composto necessário para listar o catálogo.

## Desenvolvimento e testes

Requisitos: Node 24, Bun 1.3.11; Java 21 para o emulador Firestore.

```sh
bun install --frozen-lockfile
npm run dev
npm run test:run
npm run lint
npm run build
npm run test:firebase:auth
npm run test:firebase
```

Os testes `test:firebase*` usam exclusivamente o projeto fictício
`demo-portal-unicap`, nunca o banco real. `test:firebase` cobre acesso público,
restrições de escrita, privacidade dos perfis, bloqueio de promoção de usuários,
login, logout, leitura dos projetos e repetição da importação sem sobrescrita.
O primeiro uso baixa o emulador Firestore de `storage.googleapis.com`.

Para usar o navegador com os emuladores, inicie-os em outro terminal com:

```sh
firebase emulators:start --only auth,firestore --project portaldeextensaocomunitaria
```

Depois execute `VITE_FIREBASE_USE_EMULATORS=true npm run dev`. Esse modo é
explícito e local. Contas e dados do emulador não são contas ou dados de produção.
O login sem “Manter sessão” usa memória; com a opção marcada, o SDK restaura
sua própria sessão e renova os tokens automaticamente.

O ambiente em nuvem precisa permitir os destinos `identitytoolkit.googleapis.com`,
`securetoken.googleapis.com`, `firestore.googleapis.com` e
`portaldeextensaocomunitaria.firebaseapp.com`. Os emuladores precisam também de
`storage.googleapis.com` para o download oficial. As adições foram salvas no
rascunho de rede; precisam ser aplicadas nas configurações do ambiente.

Submissões, acompanhamento e preferências mantêm o comportamento anterior
(dados locais/demonstração); esta alteração migra login/sessão e o catálogo público.
Analytics não foi ativado: não é necessário para autenticação nem para o banco.
