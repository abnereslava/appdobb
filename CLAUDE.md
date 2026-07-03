# Instruções do projeto — Dos tais (appdobb)

## Orientação geral

Toda ação neste projeto — planejamento, decisão técnica ou implementação — deve partir da consideração das orientações em `docs/AGENTS.md` (fluxo spec-driven, regras de spec.md/plan.md/tasks.md/review.md, tratamento de inferências/sugestões/pendências). Consulte esse arquivo antes de agir, mesmo quando não for citado explicitamente no pedido do usuário.

## Branch de desenvolvimento

Sempre desenvolva na branch `claude/repo-copy-rename-appdocarro-PQGhA`.
Nunca faça push direto para `master` sem permissão explícita.

## Fluxo padrão após modificações

**Após qualquer conjunto de mudanças, faça automaticamente:**
1. `git add` nos arquivos alterados
2. `git commit` com mensagem descritiva em português
3. `git push -u origin claude/repo-copy-rename-appdocarro-PQGhA`
4. Fazer merge para `master` via `mcp__github__merge_pull_request` (PR #1 já existe; se estiver fechado, criar novo PR e mergear em seguida) — método `squash`.

Não espere o usuário pedir — push + merge para master fazem parte de cada tarefa concluída.
Se o push falhar por rede, tente até 4 vezes com espera exponencial (2s, 4s, 8s, 16s).

## Stack

- PWA estática hospedada em **GitHub Pages** (subpath `/appdobb/`) — todos os caminhos devem ser **relativos** (`./`), nunca absolutos (`/`).
- Firebase Auth (Google) + Firestore (`persistentLocalCache`) + `onSnapshot` para dados em tempo real.
- JS vanilla, CSS custom properties, sem bundler.

## Convenções

- Commits em português, mensagens descritivas (tipo: `feat:`, `fix:`, `docs:`, `style:`).
- Imagens PNG com fundo transparente; exibidas como silhueta branca via `filter: brightness(0) invert(1)`. Exceção: `logo.png`.
- Imagens comprimidas para o tamanho de uso (ver `dev/imagens.md`).
- Não criar arquivos `.md` de documentação extra sem o usuário pedir.
- Specs em `specs/<feature>/` (spec.md → plan.md → tasks.md → review.md) conforme `docs/AGENTS.md`.
