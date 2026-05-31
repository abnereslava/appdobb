# Especificação: Aba de Calendário

## 1. Objetivo

Transformar a visualização de calendário em uma aba independente na barra de navegação inferior, aparecendo após "Agenda". O calendário exibirá eventos do Histórico de Saúde e consultas da Agenda no mesmo grid mensal, com marcadores distintos para cada tipo.

## 2. Contexto

Atualmente o calendário existe como um modo alternativo dentro da aba Agenda (toggle Lista/Calendário). Com esta feature, ele ganha espaço próprio na navegação, ficando acessível diretamente. O toggle Lista/Calendário dentro da Agenda deve ser **removido**, pois o calendário passa a ter sua própria aba. As funcionalidades de exportação (.ics, Google Agenda) permanecem disponíveis na nova aba.

## 3. Usuários envolvidos

- Responsável pelo bebê (usuário autenticado com perfil criado).

## 4. Funcionamento esperado

- A barra de navegação inferior passa de 4 para 5 itens: **Perfil · + · Histórico · Agenda · Calendário**.
- A nova aba exibe o grid mensal já implementado (`renderizarAgendaCalendario`), porém como tela independente com seu próprio `view`.
- O grid mostra eventos do Histórico (marcador âmbar) e consultas da Agenda (marcador na cor primária), exatamente como já funciona.
- Navegação entre meses (setas ← →) e expansão de itens ao clicar no dia permanecem iguais.
- Botão "Exportar" no cabeçalho da aba permanece.
- O toggle Lista/Calendário é removido da aba Agenda (que volta a ter apenas a visualização em lista).
- O estado `modoAgenda` e `mesCalendarioAtivo` continuam existindo, mas `modoAgenda` deixa de ser necessário para o toggle (pode ser mantido internamente sem uso de UI).

## 5. Fluxo principal

1. Usuário toca no botão "Calendário" na barra de navegação.
2. Sistema exibe o grid mensal do mês atual.
3. Usuário navega entre meses ou clica em dias para ver itens.
4. Usuário pode exportar via botão no cabeçalho.
5. Qualquer item clicado no calendário abre o modal de detalhe correspondente.

## 6. Regras de negócio

- A aba Calendário só é acessível se o usuário tiver um perfil criado (mesma regra de Histórico e Agenda).
- O calendário deve carregar os dados do mês visível a cada vez que a aba é aberta ou o mês é trocado.
- Consultas canceladas não aparecem no calendário (já implementado).
- O `diaCalendarioAberto` reseta ao trocar de mês ou ao abrir a aba.

## 7. Permissões

- Mesmas permissões de Histórico e Agenda: apenas usuários autenticados com perfil.

## 8. Dados necessários

- `carregarEventos()` — lista todos os eventos do Histórico.
- `carregarConsultas()` — lista todas as consultas da Agenda.
- Sem novos campos no Firestore.

## 9. Estados e mensagens

| Estado | Comportamento |
|---|---|
| Mês sem nenhum item | Grid exibido normalmente, sem marcadores. Mensagem abaixo: "Nenhum evento ou consulta neste mês." |
| Carregando | Spinner enquanto os dados são buscados |
| Sem perfil | Toast de erro + animação no botão Perfil (mesmo comportamento de Histórico e Agenda) |

## 10. Casos extremos

- Usuário abre a aba Calendário diretamente após login: dados carregados normalmente.
- Mês com muitos itens: todos os marcadores renderizados; lista expandida ao clicar no dia não tem limite de itens.
- Largura estreita (< 320px): grid de 7 colunas pode ficar muito apertado — células devem ter tamanho mínimo funcional.

## 11. Critérios de aceite

- [ ] Botão "Calendário" aparece na barra de navegação inferior, após "Agenda".
- [ ] Clicar no botão abre a aba de Calendário (nova `view`).
- [ ] Grid mensal exibe eventos e consultas com marcadores distintos.
- [ ] Navegação entre meses funciona.
- [ ] Clicar em dia com itens expande a lista; clicar em item abre modal de detalhe.
- [ ] Botão "Exportar" funciona (exporta todas as consultas não-canceladas como `.ics`).
- [ ] Toggle Lista/Calendário removido da aba Agenda.
- [ ] Aba Calendário bloqueada sem perfil (mesma regra das outras abas).
- [ ] Estado da navegação (botão ativo) reflete corretamente a aba aberta.

## 12. Dúvidas pendentes

Nenhuma. Todas as funcionalidades já estão implementadas — esta spec apenas as move para uma aba dedicada.
