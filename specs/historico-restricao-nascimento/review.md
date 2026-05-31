# Revisão: Restrição de Histórico por Data de Nascimento

## 1. Status geral

Aprovado

## 2. Resumo da implementação

- `app.js`: texto "Bem-vinda!" corrigido para "Bem-vindo(a)!" na welcome screen.
- `app.js`: `renderizarTimeline()` carrega perfil e eventos em paralelo; exibe abaixo do cabeçalho a data de nascimento do bebê (com texto gendered: "Nascido em" / "Nascida em"), clicável para navegar ao Perfil.
- `app.js`: `abrirFormEvento()` carrega o perfil, calcula a data mínima (`dataNascimento - 315 dias`) e define o atributo `min` no campo de data + armazena no campo hidden `#evento-data-min`.
- `app.js`: `salvarEvento()` valida a data contra `#evento-data-min` antes de salvar; exibe toast contextual com a data mínima se inválida.
- `index.html`: campo `<input type="hidden" id="evento-data-min" />` adicionado ao formulário de evento.
- `style.css`: classe `.historico-nascimento` adicionada com estilo sutil e hover.

## 3. Critérios de aceite

- [x] Data de nascimento exibida no cabeçalho do Histórico quando disponível no perfil.
- [x] Formulário de evento bloqueia salvamento se a data for anterior a `dataNascimento - 45 semanas`.
- [x] Mensagem de erro clara e contextual exibida (toast com data mínima formatada).
- [x] Agenda não é afetada pela restrição.
- [x] Se perfil não tem `dataNascimento`, nenhuma restrição é aplicada.

## 4. Tarefas concluídas

- [x] Tarefa 1 — Texto "Bem-vindo(a)!" 
- [x] Tarefa 2 — Campo hidden `#evento-data-min`
- [x] Tarefa 3 — Data de nascimento no cabeçalho do Histórico
- [x] Tarefa 4 — Validação de data mínima no formulário

## 5. Testes realizados

Testes manuais pendentes (ambiente sem servidor local disponível). Verificar:
- [ ] Perfil menino → "Nascido em DD/MM/AAAA" no cabeçalho do Histórico.
- [ ] Perfil menina → "Nascida em DD/MM/AAAA".
- [ ] Perfil sem data → nada exibido, sem restrição.
- [ ] Formulário: data anterior ao mínimo → toast de erro.
- [ ] Formulário: data válida → salva normalmente.
- [ ] Edição de evento com data inválida → bloqueada.
- [ ] Clique na data de nascimento → navega para Perfil.

## 6. Problemas encontrados

Nenhum.

## 7. Alterações fora do escopo

Nenhuma.

## 8. Pendências

- A dúvida sobre "bloquear edição de eventos já existentes com data inválida" foi respondida como "sim" — a validação em `salvarEvento` cobre ambos os casos (novo e edição), pois o mesmo submit handler é usado.

## 9. Recomendações

Testar manualmente com perfis de diferentes gêneros e com/sem data de nascimento.

## 10. Conclusão

Feature implementada e pronta para teste manual.
