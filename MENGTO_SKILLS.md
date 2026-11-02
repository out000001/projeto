# MengTo — superfícies e catálogo

Skills aplicadas:
- https://github.com/MengTo/Skills/blob/main/agent-skills/web-design/clean-minimal-beige-light-mode/SKILL.md
- https://github.com/MengTo/Skills/blob/main/agent-skills/web-design/beautiful-shadows/SKILL.md
- https://github.com/MengTo/Skills/blob/main/agent-skills/ui/no-ai-design-slop/SKILL.md

Direção: facilitar a busca por projetos num portal universitário, com superfícies
claras, vinho institucional nas ações e hierarquia estável. Sem bibliotecas novas.

Alterações: hero claro sem luzes decorativas, sombras neutras da skill nos
componentes Card/Button e cartões de projeto, remoção de zoom de foto no hover.
Cartões usam imageUrl HTTPS quando cadastrada; sem imagem ou em caso de falha,
mostram a área do projeto. imageAlt pode descrever a imagem cadastrada. Fotos
aleatórias de picsum foram removidas. Contagem de projetos vem do catálogo;
removidas as afirmações fixas de 130 projetos e autenticação federada CAFe/RNP.

Verificação: lint, build e 30 testes de login, cadastro, vitrine e dashboard.
Chromium com fixture de projetos SOMENTE na sessão local do navegador: desktop,
320px sem overflow horizontal, detalhes abre/fecha e login inicia em scrollY=0.
As capturas locais usam dados de exemplo; produção continua lendo o Firestore.
As permissões, credenciais de cadastro e regras do Firebase não foram alteradas.
