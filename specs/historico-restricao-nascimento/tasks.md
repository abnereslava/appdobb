# Tarefas: Restrição de Histórico por Data de Nascimento

## Visão geral

4 tarefas sequenciais, todas em `app.js` e `index.html`. Cada tarefa é pequena e testável isoladamente.

---

## Tarefa 1 — Corrigir texto "Bem-vinda!" para neutro

Status: Concluída

### Objetivo
Substituir o texto estático "Bem-vinda!" na welcome screen por "Bem-vindo(a)!", pois nessa tela o perfil ainda não existe e o gênero é desconhecido.

### Arquivos afetados
- `app.js` (linha ~300)

### Dependências
Nenhuma.

### Critério de conclusão
Texto "Bem-vinda!" não aparece mais. Aparece "Bem-vindo(a)!" na tela inicial sem perfil.

### Teste manual
Fazer logout ou acessar conta sem perfil criado → verificar o título da tela de boas-vindas.

### Observações
Mudança de 1 linha. Sem risco.

---

## Tarefa 2 — Campo hidden `evento-data-min` no formulário de evento

Status: Concluída

### Objetivo
Adicionar um campo `<input type="hidden" id="evento-data-min" />` no modal do formulário de evento em `index.html`, para armazenar a data mínima permitida enquanto o modal está aberto.

### Arquivos afetados
- `index.html` (dentro do `#modal-evento-form`)

### Dependências
Nenhuma.

### Critério de conclusão
`document.getElementById('evento-data-min')` retorna um elemento no DOM.

### Teste manual
Abrir o DevTools, abrir o modal de novo evento, inspecionar o DOM e confirmar que o campo existe.

### Observações
Campo hidden, sem impacto visual.

---

## Tarefa 3 — Data de nascimento no cabeçalho do Histórico

Status: Concluída

### Objetivo
Exibir abaixo do título "Histórico de Saúde" uma linha clicável com a data de nascimento do bebê. Ao clicar, navega para a aba de perfil (home). Usar o gênero para "Nascido em" / "Nascida em".

### Arquivos afetados
- `app.js` — função `renderizarTimeline()`
- `style.css` — classe `.historico-nascimento`

### Dependências
Nenhuma (independente da Tarefa 2).

### Critério de conclusão
- A data de nascimento aparece no cabeçalho do Histórico quando o perfil tem `dataNascimento`.
- Não aparece quando `dataNascimento` é null.
- Ao clicar, vai para a aba Perfil.

### Teste manual
- Abrir Histórico com perfil que tem data de nascimento → verificar exibição.
- Clicar na data → confirmar navegação para Perfil.
- Testar com perfil sem data de nascimento → linha não deve aparecer.

### Observações
`renderizarTimeline()` precisa carregar o perfil em paralelo com os eventos.

---

## Tarefa 4 — Validação de data mínima no formulário de evento

Status: Concluída

### Objetivo
Ao abrir o formulário de evento (`abrirFormEvento`), carregar o perfil, calcular a data mínima (`dataNascimento - 315 dias`) e:
- Definir o atributo `min` no `input[type=date]` de `#evento-data`.
- Gravar a data mínima em `#evento-data-min`.

Em `salvarEvento()`, verificar se a data selecionada é anterior à data mínima; se for, exibir toast de erro e abortar.

### Arquivos afetados
- `app.js` — funções `abrirFormEvento()` e `salvarEvento()`

### Dependências
Tarefa 2 (campo `#evento-data-min` deve existir no DOM).

### Critério de conclusão
- Tentativa de salvar evento com data anterior a `dataNascimento - 45 semanas` exibe toast de erro.
- O campo de data tem atributo `min` definido visualmente no picker.
- Evento com data válida salva normalmente.
- Perfil sem `dataNascimento`: nenhuma restrição aplicada.

### Teste manual
- Abrir formulário de novo evento → inspecionar atributo `min` no campo de data.
- Selecionar data anterior à mínima e tentar salvar → toast de erro.
- Selecionar data válida e salvar → funciona.
- Editar evento existente, trocar a data para inválida → deve bloquear.

### Observações
`abrirFormEvento` já é async. A leitura extra do perfil é pequena e cacheada pelo browser via Firestore SDK.
