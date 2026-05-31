# Plano Técnico: Visualização em Calendário e Exportação para Apps de Calendário

## 1. Resumo da solução

**Três blocos independentes:**

### A. Toggle Lista/Calendário
- Variável de estado `modoAgenda` (`'lista'` | `'calendario'`) persistida em `localStorage`.
- `renderizarAgenda()` delega para `renderizarAgendaLista()` ou `renderizarAgendaCalendario()` conforme o modo.
- O botão de toggle fica no cabeçalho da Agenda.

### B. Visualização em Calendário
- Grid mensal gerado em JS puro (sem biblioteca).
- Navega mês a mês via `mesCalendarioAtivo` (estado: `{ ano, mes }` — número 0-11).
- Cada dia do grid verifica se há eventos (Histórico) ou consultas (Agenda) naquele dia.
- Dois tipos de marcadores: ponto azul/rosa (consultas) e ponto âmbar (eventos de saúde).
- Ao clicar em um dia, expande abaixo do grid uma lista dos itens daquele dia.

### C. Exportação .ics e Google Calendar
- Geração de `.ics` no cliente: string no formato iCalendar (RFC 5545).
- Download via `<a download>` temporário ou `navigator.share` (mobile).
- Exportação individual: botão no modal de detalhe de consulta.
- Exportação em lote: botão no cabeçalho da Agenda (lista e calendário).
- Google Calendar link direto: URL `https://calendar.google.com/calendar/render?action=TEMPLATE&...` aberta em nova aba.

## 2. Dependências

- `carregarEventos()` e `carregarConsultas()` — já existentes (sem paginação para o calendário, que precisa de todos os itens do mês visível).
- `window.navigator.share` — verificado em runtime, fallback para download.
- Sem novas bibliotecas.

## 3. Arquivos afetados

| Arquivo | Motivo |
|---|---|
| `app.js` | Estado `modoAgenda`, `mesCalendarioAtivo`; funções de calendário, export .ics, Google Calendar link |
| `style.css` | Grid de calendário, marcadores de dias, botões de toggle, botão exportar |

## 4. Estrutura de dados

### Estado novo em `app.js`

```js
let modoAgenda          = localStorage.getItem('modo-agenda') || 'lista';
let mesCalendarioAtivo  = { ano: new Date().getFullYear(), mes: new Date().getMonth() };
let diaCalendarioAberto = null;  // dia clicado (número 1-31) ou null
```

### Formato iCalendar (.ics)

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Linha do Tempo do Bebê//PT
BEGIN:VEVENT
UID:{id}@linhatempobebeapp
DTSTART;VALUE=DATE:{YYYYMMDD}
DTSTART:{YYYYMMDDTHHmmssZ} (se tiver hora)
SUMMARY:{tipo} - {medico}
LOCATION:{local}
DESCRIPTION:{observacoes}
END:VEVENT
...
END:VCALENDAR
```

## 5. Regras de segurança e permissões

- A geração de `.ics` é 100% client-side. Nenhuma dado é enviado a terceiros exceto ao abrir o link do Google Calendar (apenas dados da consulta individual, na URL).
- Não inclui consultas canceladas na exportação.

## 6. Fluxos técnicos

### Toggle de modo
1. Clique em "Calendário" → `modoAgenda = 'calendario'`, salva localStorage, re-renderiza.
2. Clique em "Lista" → `modoAgenda = 'lista'`, salva localStorage, re-renderiza.

### Renderização do calendário
1. Carrega eventos e consultas do mês visível (ou usa os caches já carregados).
2. Agrupa por `data` (string `YYYY-MM-DD`).
3. Renderiza grid: 7 colunas (Dom-Sáb), linhas conforme o mês.
4. Cada célula de dia mostra: número do dia + marcadores de tipo.
5. Setas `←` `→` mudam `mesCalendarioAtivo.mes` e re-renderizam.
6. Clique em dia: `diaCalendarioAberto = dia`, lista items daquele dia abaixo do grid.

### Geração de .ics
- `gerarICS(consultas)` → string iCalendar
- `baixarArquivo(nomeArquivo, conteudo, tipo)` → cria `<a>` temporário com `URL.createObjectURL(blob)` e clica
- Mobile: `if (navigator.share && navigator.canShare)` → usa Web Share API

### Link Google Calendar (individual)
```js
function linkGoogleCalendar(consulta) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${TIPOS_CONSULTA[consulta.tipo]} - ${consulta.medico || ''}`,
    dates: `${consulta.data.replace(/-/g,'')}/${consulta.data.replace(/-/g,'')}`,
    details: consulta.observacoes || '',
    location: consulta.local || '',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
```

## 7. Impactos no sistema existente

- `renderizarAgenda()` passa a ser um dispatcher que chama `renderizarAgendaLista()` ou `renderizarAgendaCalendario()`.
- Modal de detalhe de consulta (`abrirDetalheConsulta`) ganha dois botões novos: "Adicionar ao Google Agenda" e exportar .ics individual.
- A Agenda em modo lista fica idêntica ao comportamento atual + paginação (da feature 2).

## 8. Riscos técnicos

- **iOS Safari**: `navigator.share` existe mas `navigator.canShare` pode ser inconsistente. Fallback seguro para download.
- **Bloqueadores de popup/download**: o download via `<a>` temporário é geralmente permitido em resposta a interação do usuário — sem problema.
- **Grid de calendário sem dados paginados**: o calendário precisa de todos os eventos/consultas do mês visível. Usa `carregarEventos()` / `carregarConsultas()` completos (sem paginação), o que é aceitável pois o contexto de um mês é pequeno e o cache paginado já tem os dados recentes.
- **Fuso horário**: datas armazenadas como `YYYY-MM-DD` sem timezone. O `.ics` usa `VALUE=DATE` (dia inteiro) para evitar problemas de fuso.

## 9. Estratégia de teste

Manual:
- Alternar Lista ↔ Calendário e verificar que a preferência persiste após recarregar.
- Navegar meses e verificar que os marcadores aparecem nos dias corretos.
- Clicar em dia com consulta → ver lista de itens.
- Exportar consulta individual como .ics → importar no Google Agenda.
- Usar botão "Google Agenda" → verificar que a URL abre com os campos corretos.
- Exportar todas as consultas em lote → importar no Google Agenda.
- Testar no mobile: verificar Web Share API.

## 10. Ordem recomendada de implementação

1. Toggle Lista/Calendário (estado + botões no cabeçalho)
2. Grid mensal (renderização básica com navegação)
3. Marcadores de dias e clique para expandir
4. Funções de geração de .ics e download
5. Botões de exportação no detalhe de consulta e cabeçalho da Agenda
6. Link Google Calendar
7. CSS do calendário e botões de exportação
