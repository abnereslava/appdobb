# Especificação: Filtro por Data e Paginação Incremental

## 1. Objetivo

Permitir que o usuário filtre eventos (Histórico) e consultas (Agenda) por intervalo de datas, e carregar os itens de forma incremental (paginação por scroll) para evitar leituras desnecessárias no Firestore e melhorar a performance com históricos longos.

## 2. Contexto

Atualmente o Histórico e a Agenda carregam todos os registros de uma vez via Firestore. Com o crescimento do histórico ao longo dos anos, isso pode gerar lentidão e custo de leituras. Além disso, o usuário não tem como filtrar por período (ex.: "ver apenas eventos de 2024").

## 3. Usuários envolvidos

- Responsável pelo bebê (usuário autenticado).

## 4. Funcionamento esperado

### Filtro por data

- Abaixo da barra de busca do Histórico e da Agenda, exibir um seletor de intervalo de datas (data início / data fim).
- Por padrão, o filtro de data está vazio (sem restrição de período).
- Ao preencher o intervalo, a lista é refiltrada mostrando apenas itens dentro do período selecionado.
- O filtro por data pode ser combinado com o filtro por categoria (Histórico) e com a busca por texto.
- Um botão ou ícone "×" limpa o filtro de data rapidamente.

### Paginação incremental (scroll infinito ou botão "Carregar mais")

- Por padrão, exibir apenas os **N primeiros itens** mais recentes (sugestão: N = 20).
- Conforme o usuário rola a tela ou clica em "Carregar mais", novos lotes são exibidos.
- Os dados podem ser buscados em lotes do Firestore usando `limit()` e `startAfter()` (cursor de paginação), ou carregados todos de uma vez e paginados localmente — [Pendente: definir estratégia de paginação].
- O total de itens deve ser exibido ao usuário (ex.: "Exibindo 20 de 87 eventos").

## 5. Fluxo principal

1. Usuário abre o Histórico (ou Agenda).
2. Sistema carrega os N itens mais recentes e exibe.
3. Usuário opcionalmente define um intervalo de datas.
4. Lista atualiza exibindo apenas itens no intervalo, mantendo paginação ativa.
5. Ao rolar até o final (ou clicar "Carregar mais"), o próximo lote é carregado.
6. Quando todos os itens estão carregados, exibe "Fim do histórico".

## 6. Regras de negócio

- O filtro de data no Histórico filtra por `evento.data`.
- O filtro de data na Agenda filtra por `consulta.data`.
- A paginação deve respeitar os filtros ativos (categoria, busca, data).
- Ao mudar qualquer filtro, a paginação volta para o início (página 1).
- [Inferência] A paginação no Firestore usa `orderBy('data', 'desc')` + `limit(N)` + `startAfter(cursor)`.

## 7. Permissões

- Nenhuma permissão especial além de acesso ao perfil do bebê.

## 8. Dados necessários

- `evento.data` (Histórico) e `consulta.data` (Agenda): campo usado para filtro e ordenação.
- Cursor de paginação do Firestore: último documento carregado para `startAfter`.

## 9. Estados e mensagens

| Estado | Comportamento |
|---|---|
| Carregando mais itens | Spinner inline abaixo da lista |
| Todos os itens carregados | Mensagem "Fim do histórico" |
| Filtro por data sem resultados | Estado vazio com opção de limpar filtro |
| Filtro de data ativo | Badge ou indicador visual no filtro |

## 10. Casos extremos

- Usuário define data fim anterior à data início: exibir aviso e ignorar o filtro.
- Histórico com 0 eventos no intervalo selecionado: estado vazio com botão para limpar filtro.
- Conexão lenta ao carregar mais itens: spinner deve ser visível, sem travar a UI.
- Filtro de data combinado com busca de texto: ambos devem ser aplicados simultaneamente.

## 11. Critérios de aceite

- [ ] Seletor de intervalo de datas disponível no Histórico e na Agenda.
- [ ] A lista respeita o filtro de data em tempo real.
- [ ] Por padrão, apenas N itens são exibidos (sem carregar tudo de uma vez).
- [ ] "Carregar mais" ou scroll infinito funciona corretamente.
- [ ] Filtros de data, categoria e busca são combinados corretamente.
- [ ] Ao mudar qualquer filtro, a lista volta ao início.
- [ ] Indicador de progresso ("Exibindo X de Y").

## 12. Dúvidas respondidas

- [Respondida] Estratégia de paginação: Firestore nativo (`limit/startAfter`) ou carregamento total com paginação local. - O que poupar mais dados no banco de dados sem atrapalhar a experiência do usuário.
- [Respondida] O valor ideal de N para o tamanho inicial da página é de 20.
- [Respondida] Scroll infinito automático.
- [Respondida] O filtro de data deve persistir ao navegar entre abas (Histórico ↔ Agenda). Sim.
