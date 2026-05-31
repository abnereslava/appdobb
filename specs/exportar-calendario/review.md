# Revisão: Visualização em Calendário e Exportação para Apps de Calendário

## 1. Status geral

Aprovado

## 2. Resumo da implementação

- `app.js`: estado `modoAgenda`, `mesCalendarioAtivo`, `diaCalendarioAberto`; funções `alternarModoAgenda`, `renderizarAgendaCalendario`, `abrirDiaCalendario`, `navegarMesCalendario`.
- `renderizarAgenda()` virou dispatcher → `renderizarAgendaLista()` ou `renderizarAgendaCalendario()`.
- Grid mensal gerado em JS puro: 7 colunas, marcadores por tipo (ponto azul/rosa para consultas, âmbar para eventos), dia atual destacado com fundo circular.
- Ao clicar em dia com itens → expande lista abaixo do grid. Itens clicáveis → abre modal de detalhe.
- Exportação: `gerarICS`, `baixarArquivo` (com Web Share API no mobile), `linkGoogleCalendar`, `exportarTodasConsultas`, `exportarConsultaICS`.
- Botões "Exportar" e toggle no cabeçalho (ambos os modos).
- Botões "Exportar .ics" e "Google Agenda" no modal de detalhe de consulta.
- CSS: grid, marcadores, toggle, botões de exportação.

## 3. Critérios de aceite

- [x] Toggle Lista/Calendário no cabeçalho, persiste em localStorage.
- [x] Grid mensal renderiza corretamente.
- [x] Navegação entre meses.
- [x] Marcadores em dias com consultas (primário) e eventos (âmbar).
- [x] Clique em dia → lista de itens com link para detalhe.
- [x] Exportação individual (.ics) no detalhe de consulta.
- [x] Link Google Calendar no detalhe de consulta.
- [x] Exportação em lote no cabeçalho da Agenda.
- [x] Web Share API no mobile (fallback para download).
- [x] Consultas canceladas excluídas da exportação.

## 4. Pendências / Riscos

- Calendário usa `carregarEventos()` e `carregarConsultas()` completos (sem paginação) — aceitável pois o contexto do mês é pequeno e os dados já são carregados em outras partes do app.
- O botão `.ics` no detalhe de consulta é vinculado via `document.getElementById('btn-ics-detalhe').onclick` após renderização; funciona porque o modal é síncrono.
- A separação dia/mês/ano no grid assume datas no formato `YYYY-MM-DD` (padrão do app).
