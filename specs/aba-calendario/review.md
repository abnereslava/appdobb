# Revisão: Aba de Calendário

## 1. Status geral

Aprovado

## 2. Resumo da implementação

- `index.html`: `#view-calendario` + botão `#nav-calendario` na nav bar (5 colunas).
- `app.js`: `showView('calendario')` e `atualizarVistaAtiva` reconhecem a nova aba; `renderizarAbaCalendario` + `_buildCalendarioHTML` (builder compartilhado); `renderizarAgendaCalendario` removida (código duplicado eliminado).
- Toggle Lista/Calendário removido da Agenda; `renderizarAgenda` chama direto `renderizarAgendaLista`.
- Seletor de mês/ano: `toggleSeletorMes`, `selecionarMesAno`, `_renderizarSeletorMes` — grid de 12 meses + controle de ano, abre/fecha ao clicar no título do mês.
- `style.css`: nav de 4 → 5 colunas; font-size dos labels reduzido para 9px; `.cal-mes-titulo-btn`, `.cal-seletor-mes`, `.cal-seletor-grid`, `.cal-seletor-mes-btn`.

## 3. Critérios de aceite

- [x] Botão "Calendário" na nav bar, após "Agenda".
- [x] Aba abre com o grid mensal.
- [x] Eventos e consultas com marcadores distintos.
- [x] Navegação de meses com setas.
- [x] Clicar no nome do mês abre seletor rápido (12 meses + ano).
- [x] Selecionar mês/ano fecha o seletor e navega.
- [x] Clicar em dia expande itens; itens abrem modal de detalhe.
- [x] Botão "Exportar" disponível.
- [x] Toggle removido da Agenda.
- [x] Sem perfil → aba bloqueada com toast.

## 4. Como testar

1. Abrir o app → verificar 5 botões na nav bar.
2. Clicar em "Calendário" → grid do mês atual.
3. Clicar no nome do mês (ex.: "Maio 2026") → seletor abre com 12 meses e controle de ano.
4. Selecionar outro mês → grid atualiza.
5. Clicar nas setas ← → → navega entre meses.
6. Dia com consulta/evento → marcador visível → clicar → lista expandida → clicar item → modal de detalhe.
7. Abrir aba Agenda → confirmar que o toggle Lista/Calendário não existe mais.
