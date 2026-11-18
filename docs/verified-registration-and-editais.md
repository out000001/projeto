# Confirmação de e-mail, escolas e editais

## Comportamento

- O cadastro cria contas explicitamente não verificadas. Após criar a conta, o cliente solicita o e-mail de confirmação ao Firebase Auth e encerra a sessão temporária. A interface distingue conta criada de falha no envio da confirmação. O botão de reenvio no login foi removido por solicitação do usuário; a exigência de confirmação foi mantida.
- Login, restauração de sessão e APIs de projetos, acompanhamento, conta e editais exigem e-mail confirmado. O perfil gestor continua vindo do documento protegido, nunca da seleção de perfil ou de um parâmetro enviado pelo cliente.
- A chegada da mensagem a uma caixa real não foi medida. O teste local usa os links efetivamente emitidos pelo Firebase Auth Emulator e aplica seus códigos de confirmação antes de verificar o acesso.
- O card “Acesso Seguro e Transparente” foi removido da vitrine. A preferência “Propostas para análise” aparece apenas para gestores. Os campos das configurações ficam desabilitados durante carregamento/salvamento para impedir sobrescrita de uma edição pela resposta inicial.
- Gestores cadastram editais em `/editais`, com título e um PDF de até 10 MB. Os PDFs são persistidos em partes no armazenamento privado já usado pelo portal, validados por assinatura e selados contra alteração. Alunos e docentes/gestores autenticados e verificados podem listar, visualizar e baixar. Alunos não podem publicar documentos.
- Editais salvos são oferecidos na submissão; “Ação Não Vinculada a Bolsas” permanece disponível. Identificadores antigos de editais foram mantidos para não quebrar propostas já salvas. O nome exibido do programa passa a PIBIC, inclusive em rótulos vindos de registros antigos, sem alterar IDs ou o conteúdo binário de anexos.

## Escolas oficiais

Fonte consultada: https://lp.portal.unicap.br/vest_unicap (seção Escolas).

1. Ciências Jurídicas, Empresariais e Comunicação
2. Educação e Humanidades
3. Saúde e Ciências da Vida
4. Tecnologia e Inovação (ICAM-Tech)

A submissão valida a escola escolhida na interface e no servidor. Rascunhos com opções obsoletas precisam selecionar uma escola da lista atual.

## Publicação

A integração Git → Vercel publica a aplicação. O build de produção aplica também as regras revisadas do Firestore usando o Admin SDK e a credencial de serviço já configurada no projeto, sem imprimir seu conteúdo. A publicação é limitada ao projeto `portaldeextensaocomunitaria`; builds locais e previews não alteram regras. Se faltarem permissões do Firebase Rules, a etapa falha e informa o código do erro. A regra exige e-mail verificado também na escrita direta de projetos por gestores; coleções privadas continuam sem acesso direto pelo cliente.

## Validação

- `npm test`: APIs, autorização de e-mails não confirmados, PDF íntegro após upload/download e rejeição de arquivo com extensão falsa.
- Aplicativo: lint, testes Vitest e build.
- Playwright local com Firebase Auth/Firestore Emulator: links reais do emulador, bloqueio anterior à confirmação, acesso posterior, escolas oficiais, ausência da opção de gestor nas configurações do aluno, cadastro/listagem de edital e download com bytes idênticos. A suíte padrão exclui testes de produção.
- As evidências desta rodada ficam em `reports/registration-editais/`, sem substituir os relatórios históricos.
