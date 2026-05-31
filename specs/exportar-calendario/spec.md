# Especificação: Visualização em Calendário e Exportação para Apps de Calendário

## 1. Objetivo

Oferecer uma visualização alternativa da Agenda em formato de calendário (mensal) e permitir exportar consultas (individualmente ou todas) para apps de calendário externos, como Google Agenda, Apple Calendar e outros compatíveis com o formato iCalendar (.ics).

## 2. Contexto

Atualmente a Agenda exibe consultas em formato de lista vertical. Uma visão de calendário facilita a percepção de consultas próximas e a distribuição ao longo do mês. A integração com apps de calendário externos é altamente desejada pelos usuários para receber lembretes nativos do dispositivo.

## 3. Usuários envolvidos

- Responsável pelo bebê (usuário autenticado).

## 4. Funcionamento esperado

### Alternância de visualização: Lista ↔ Calendário

- No cabeçalho da Agenda, adicionar dois botões de toggle: "Lista" e "Calendário".
- No modo Calendário, exibir um grid mensal com os dias do mês.
- Dias com consultas agendadas recebem um indicador visual (ponto colorido ou badge).
- Ao clicar em um dia com consulta, exibe as consultas daquele dia (pode ser um pop-over ou expandir abaixo).
- Navegação entre meses via setas "←" e "→".
- O modo lista permanece como padrão.

### Exportação para app de calendário

#### Opção A — Arquivo .ics (iCalendar)
- Botão "Exportar" no cabeçalho da Agenda (ou no detalhe de cada consulta).
- Ao exportar uma consulta individual: gera um arquivo `.ics` com aquela consulta.
- Ao exportar todas as consultas: gera um arquivo `.ics` com todos os eventos agendados.
- O arquivo `.ics` pode ser aberto pelo Google Agenda, Apple Calendar, Outlook e qualquer app compatível.

#### Opção B — Google Calendar (link direto) [Sugestão]
- Além do `.ics`, oferecer um botão "Adicionar ao Google Agenda" que gera a URL no formato `https://calendar.google.com/calendar/render?action=TEMPLATE&...` e abre em nova aba.
- Disponível apenas para consultas individuais (não para exportação em lote via URL, pois a URL é longa).

#### Vinculação com Google Calendar via CalDAV [Sugestão avançada]
- [Pendente] Seria possível vincular o calendário do app diretamente ao Google Calendar via CalDAV/Google Calendar API, de modo que consultas criadas no app apareçam automaticamente no Google Agenda. Requer OAuth e configuração de projeto no Google Cloud. Escopo fora do MVP desta spec.

## 5. Fluxo principal — Exportar consulta individual

1. Usuário abre o detalhe de uma consulta.
2. Usuário toca em "Exportar" ou "Adicionar ao Calendário".
3. Sistema exibe opções: "Arquivo .ics" e "Google Agenda" (link direto).
4. Ao escolher `.ics`: arquivo é gerado e download iniciado (ou Web Share API no mobile).
5. Ao escolher "Google Agenda": URL do Google Calendar é aberta em nova aba com os dados preenchidos.

## 6. Fluxo principal — Exportar todas as consultas

1. Usuário clica em "Exportar" no cabeçalho da Agenda.
2. Sistema gera um arquivo `.ics` com todas as consultas visíveis (respeitando filtros ativos).
3. Download iniciado automaticamente (ou Web Share API no mobile).

## 7. Regras de negócio

- O arquivo `.ics` deve conter: título (tipo de consulta + médico), data, hora (se disponível), local, descrição/observações e status.
- Consultas canceladas podem ser incluídas opcionalmente (com nota de cancelamento).
- A geração do `.ics` é feita no front-end (sem chamadas ao servidor).
- O link do Google Agenda deve preencher automaticamente: título, data/hora, local e descrição.
- A visualização em calendário exibe apenas consultas (não eventos do Histórico de Saúde).

## 8. Permissões

- Qualquer usuário com acesso ao perfil pode exportar.
- Nenhuma permissão especial de sistema é necessária para gerar `.ics`.
- O Google Calendar OAuth (vinculação bidirecional) não está no escopo desta spec.

## 9. Dados necessários

- `consulta.data`, `consulta.hora`, `consulta.medico`, `consulta.local`, `consulta.tipo`, `consulta.observacoes`, `consulta.status`.
- Nome do bebê (para o título do arquivo `.ics` e dos eventos).

## 10. Estados e mensagens

| Estado | Comportamento |
|---|---|
| Exportação gerada com sucesso | Download iniciado silenciosamente (sem toast necessário) |
| Nenhuma consulta para exportar | Toast: "Nenhuma consulta para exportar." |
| Modo calendário sem consultas no mês | Mensagem inline "Sem consultas neste mês" |

## 11. Casos extremos

- Consulta sem hora definida: evento no `.ics` gerado como dia inteiro (`DTSTART;VALUE=DATE`).
- Consulta cancelada incluída no `.ics`: adicionar descrição "(Cancelada)" no campo de notas.
- Mobile: usar Web Share API (`navigator.share`) ao invés de download direto quando disponível, para integração nativa com apps de calendário.
- Navegadores que bloqueiam downloads automáticos: oferecer link de download alternativo.
- [Pendente] Consultas com recorrência (ex.: retornos mensais): não há campo de recorrência atualmente; fora do escopo desta spec.

## 12. Critérios de aceite

- [ ] Botão de toggle Lista/Calendário disponível no cabeçalho da Agenda.
- [ ] Visualização mensal mostra corretamente os dias com consultas.
- [ ] Navegação entre meses funciona.
- [ ] Ao clicar em dia com consulta, exibe as consultas daquele dia.
- [ ] Exportação individual gera arquivo `.ics` válido com todos os campos relevantes.
- [ ] Exportação em lote gera arquivo `.ics` com todas as consultas visíveis.
- [ ] Botão "Adicionar ao Google Agenda" abre URL correta em nova aba.
- [ ] No mobile, Web Share API é usada quando disponível.
- [ ] Arquivo `.ics` pode ser importado com sucesso no Google Agenda e Apple Calendar.

## 13. Dúvidas respondidas

- [Respondida] A visualização de calendário deve incluir também eventos do Histórico, ou apenas consultas da Agenda? - Os dois, porém, destacados diferentemente, para fácil distinção pelo usuário.
- [Respondida] O toggle Lista/Calendário deve persistir como preferência do usuário (localStorage)? - Sim!
- [Respondida] Consultas canceladas devem ser incluídas na exportação `.ics` por padrão. Não!
- [Respondida] Vinculação bidirecional com Google Calendar (CalDAV/API) é desejada em versão futura. A princípio, não. Quem sabe mais pra frente.
