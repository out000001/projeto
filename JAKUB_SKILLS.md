# Refinamento de login e cadastro

Skills usadas:
- https://github.com/jakubkrehel/skills/blob/main/skills/better-accessibility/SKILL.md
- https://github.com/jakubkrehel/skills/blob/main/skills/better-typography/SKILL.md

Escopo: entrada no cadastro a partir do login, escolha de perfil, preenchimento,
validação, estado de envio e sucesso. Componente Input compartilhado revisado
com os testes dos formulários de cadastro, configurações e submissão.

| Severidade | Local | Antes | Depois | Motivo |
| --- | --- | --- | --- | --- |
| Média | `src/components/ui/Input.jsx` | Ajuda/erro sem associação | IDs únicos, aria-describedby e aria-invalid | WCAG 1.3.1 e 3.3.1: campo anuncia orientação e erro |
| Média | `src/modules/auth/RegistrationForm.jsx` | Mensagem geral para senha e chave | Erro específico com foco no campo | WCAG 3.3.1/3.3.3: localizar e corrigir o erro |
| Média | `src/modules/auth/RegistrationForm.jsx` | Mudança de formulário sem contexto de foco | Foco no título, título do documento e status persistente | Orientação por teclado e anúncios de estado |
| Baixa | `src/index.css` | Legendas de 10–11px | Legendas de pelo menos 12px e descrições de 13px | Leitura no formulário |
| Baixa | `src/index.css` | Inputs abaixo de 16px no celular | 16px até 640px | Evita zoom automático de foco no iOS |

Verificado: lint, build e 25 testes de login/cadastro/configurações/submissão.
Chromium: abertura do cadastro com Enter, foco no título, erro de confirmação com
foco e descrição programática, 320px sem rolagem horizontal e texto a 200% em
viewport de 720px sem overflow. Os inputs computam 16px no mobile.

Não verificado: leitor de tela físico, Safari/iPhone real, conformidade WCAG do
portal inteiro. A verificação de texto a 200% usa tamanho de fonte raiz, não
simula todas as combinações de zoom de navegador e sistema operacional.

Backup existente: `backup/antes-jakub-skills-2026-11-02` aponta para `66e6003`.
Publicação direta autorizada pelo usuário após validação.
