# Plano Técnico: Aba de Calendário

## 1. Resumo da solução

4 mudanças cirúrgicas:

1. **index.html** — adicionar `<div id="view-calendario" class="view">` e o botão `#nav-calendario` na nav bar.
2. **app.js** — conectar `showView('calendario')` ao novo botão; mover `renderizarAgendaCalendario` para ser chamada ao abrir a aba; remover o toggle Lista/Calendário da `renderizarAgendaLista`.
3. **app.js** — seletor rápido de mês/ano: ao clicar no título `.cal-mes-titulo`, abre um popover inline com grid de 12 meses + seletor de ano.
4. **style.css** — ajuste de largura da nav bar para 5 itens + estilos do seletor de mês/ano.

## 2. Arquivos afetados

| Arquivo | Motivo |
|---|---|
| `index.html` | Nova view + botão nav |
| `app.js` | `showView` + nova aba + remover toggle + seletor de mês/ano |
| `style.css` | Nav 5 itens + seletor de mês/ano |

## 3. Seletor de mês/ano

- Estado: `seletorMesAberto = false` (toggle ao clicar no título).
- Ao abrir: renderiza um painel inline abaixo do cabeçalho do calendário com 12 botões de mês (Jan–Dez) + controles de ano (← ano →).
- Selecionar um mês fecha o painel e navega direto para aquele mês/ano.
- Clicar fora (ou clicar de novo no título) fecha o painel sem navegar.

## 4. Ordem de implementação

1. Nova view e botão nav no `index.html`
2. `showView` e `atualizarVistaAtiva` reconhecem `'calendario'`
3. Remover toggle da Agenda; `renderizarAgenda` chama direto `renderizarAgendaLista`
4. Seletor de mês/ano inline
5. CSS (nav 5 itens + seletor)
