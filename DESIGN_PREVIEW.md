# Prévia visual — Emil Kowalski

A versão anterior foi preservada no GitHub em `backup/antes-skills-2026-11-02`,
commit `09490afcd078a41440a83f53d99c9f4ffd0affee`. Essa referência inclui o cadastro
funcional e a correção do Firebase. As variáveis secretas continuam no Vercel;
não fazem parte do backup de código.

A proposta está em `design/emil-skills`. A produção permanece na versão anterior
até a publicação da proposta.

## Skills aplicadas

- https://github.com/emilkowalski/skills/blob/main/skills/emil-design-eng/SKILL.md
- https://github.com/emilkowalski/skills/blob/main/skills/animate/SKILL.md
- Receita de botão: https://github.com/emilkowalski/skills/blob/main/skills/animate/RECIPES.md

| Antes | Depois | Motivo |
| --- | --- | --- |
| Formulário central sem contexto institucional | Layout dividido com apresentação e formulário | Hierarquia e identidade |
| Campos com opacidade reduzida | Campos brancos e texto com opacidade total | Legibilidade |
| `transition-all` nos botões compartilhados | Propriedades explícitas e pressão com escala 0.97, 160ms | Retorno imediato sem animar layout |
| Sem nome acessível no botão de senha | Mostrar/ocultar senha com nome e estado | Navegação acessível |
| Fundo azulado e cantos rígidos | Superfícies neutras, vinho institucional e cantos consistentes | Coerência visual |

Animação aplicada apenas ao pressionar botões com ponteiro, para feedback;
ações de teclado não recebem movimento. Preferência de movimento reduzido
remove a escala. Sem biblioteca adicional de animação ou animação de dados.

## Restaurar

Se a proposta ainda estiver apenas nesta branch, o site de produção já é a versão
anterior. Basta abandonar a prévia.

Se a proposta for publicada, reverta os commits de design com `git revert` e
publique a reversão. A branch de backup também pode servir como fonte para
restaurar apenas os arquivos visuais. Não use reset forçado nem remova mudanças
posteriores de autenticação ou dados. A reversão visual não altera as contas,
Firestore ou as variáveis secretas.

## Verificação

Lint e build, testes de login/roteamento, cadastro e vitrine. Capturas reais do
Chromium em 1440px e 390px; sem rolagem horizontal no cadastro e na vitrine.
Desempenho de animação verificado por propriedades no código; não foi medido em
um celular físico.
