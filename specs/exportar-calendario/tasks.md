# Tarefas: Visualização em Calendário e Exportação para Apps de Calendário

## Visão geral

7 tarefas. Blocos A (toggle), B (calendário) e C (exportação) são implementados em sequência. CSS por último.

---

## Tarefa 1 — Toggle Lista/Calendário

Status: Concluída

### Objetivo
Adicionar estado `modoAgenda` (persistido em localStorage) e os botões de toggle "Lista" / "Calendário" no cabeçalho da Agenda. `renderizarAgenda()` passa a ser um dispatcher.

### Arquivos afetados
- `app.js`

### Dependências
Nenhuma.

### Critério de conclusão
Os botões aparecem no cabeçalho. Clicando em "Calendário" muda o modo (sem crash, mesmo que a tela de calendário ainda não exista). Preferência persiste após recarregar.

### Teste manual
Clicar em "Calendário" → modo muda (página em branco ou placeholder aceitos). Recarregar → modo calendário ainda ativo.

---

## Tarefa 2 — Grid mensal (estrutura e navegação)

Status: Concluída

### Objetivo
Implementar `renderizarAgendaCalendario()` com o grid mensal (7 colunas, linhas dinâmicas), cabeçalho do mês/ano e setas de navegação. Sem dados ainda — dias apenas com número.

### Arquivos afetados
- `app.js`
- `style.css` (grid básico)

### Dependências
Tarefa 1.

### Critério de conclusão
Grid de calendário mensal renderiza corretamente para qualquer mês. Setas `←` `→` navegam entre meses. Hoje aparece destacado.

### Teste manual
Alternar para modo Calendário → verificar grid. Clicar nas setas → mês muda.

---

## Tarefa 3 — Marcadores de dias e expansão ao clicar

Status: Concluída

### Objetivo
Carregar eventos e consultas do mês visível. Para cada dia, exibir marcadores: ponto de cor primária para consultas, ponto âmbar para eventos de saúde. Ao clicar em um dia com itens, exibir lista compacta dos itens abaixo do grid (ou inline no dia).

### Arquivos afetados
- `app.js`

### Dependências
Tarefa 2.

### Critério de conclusão
Dias com consultas e/ou eventos mostram marcadores. Clicar no dia exibe os itens daquele dia. Clicar em um item do dia abre o modal de detalhe correspondente.

### Teste manual
Ter consultas e eventos cadastrados → abrir calendário → verificar marcadores → clicar em dia com itens → ver lista.

---

## Tarefa 4 — Funções de geração .ics e download

Status: Concluída

### Objetivo
Implementar `gerarICS(consultas)` (string iCalendar RFC 5545) e `baixarArquivo(nome, conteudo, tipo)` (download + Web Share API fallback no mobile).

### Arquivos afetados
- `app.js`

### Dependências
Nenhuma (independente das tarefas de UI).

### Critério de conclusão
`gerarICS([...])` retorna string válida. `baixarArquivo(...)` dispara o download. Arquivo `.ics` importável no Google Agenda.

### Teste manual
Chamar `gerarICS` no console com uma consulta de teste → inspecionar string. Chamar `baixarArquivo` → verificar download.

### Observações
Datas sem hora: usar `DTSTART;VALUE=DATE:YYYYMMDD`. Com hora: `DTSTART:YYYYMMDDTHHmmss`. Não incluir consultas canceladas.

---

## Tarefa 5 — Botões de exportação no detalhe de consulta e cabeçalho

Status: Concluída

### Objetivo
Adicionar ao modal de detalhe de consulta: botão "Exportar .ics" (individual) e botão "Google Agenda" (link direto). Adicionar ao cabeçalho da Agenda (lista e calendário): botão "Exportar todas" que gera .ics em lote.

### Arquivos afetados
- `app.js` (HTML inline do modal de detalhe + cabeçalho)

### Dependências
Tarefa 4.

### Critério de conclusão
Botões aparecem e funcionam. Exportação individual e em lote geram arquivos válidos. Link Google Calendar abre na nova aba com campos preenchidos.

### Teste manual
Abrir detalhe de consulta → clicar "Exportar .ics" → arquivo baixado. Clicar "Google Agenda" → URL correta na nova aba. Clicar "Exportar todas" no cabeçalho → arquivo com todas as consultas não-canceladas.

---

## Tarefa 6 — Link Google Calendar (individual)

Status: Concluída

### Objetivo
Implementar `linkGoogleCalendar(consulta)` que gera a URL do Google Calendar com os campos da consulta preenchidos.

### Arquivos afetados
- `app.js`

### Dependências
Tarefa 4.

### Critério de conclusão
URL gerada contém título, data, local e descrição. Abre o Google Calendar com os campos pré-preenchidos.

### Teste manual
Clicar no botão "Google Agenda" no detalhe de uma consulta → verificar URL e campos no Google Calendar.

### Observações
`action=TEMPLATE` é o parâmetro correto para criar evento sem precisar de autenticação prévia.

---

## Tarefa 7 — CSS do calendário e exportação

Status: Concluída

### Objetivo
Adicionar estilos para `.cal-grid`, `.cal-header`, `.cal-dia`, `.cal-dia-hoje`, `.cal-marcador-consulta`, `.cal-marcador-evento`, `.cal-dia-aberto`, `.cal-itens-dia`, `.btn-toggle-modo`, `.btn-exportar`.

### Arquivos afetados
- `style.css`

### Dependências
Tarefas 2 e 3 (para ver as classes necessárias).

### Critério de conclusão
Calendário visualmente organizado. Hoje destacado. Marcadores visíveis. Botões de toggle e exportar estilizados.

### Teste manual
Inspecionar visualmente no browser em mobile e desktop.

### Observações
Grid responsivo: células quadradas ou com aspect-ratio fixo. Fonte pequena nos dias (12-13px).
