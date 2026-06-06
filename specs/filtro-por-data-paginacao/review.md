# Revisão: Filtro por Data e Paginação Incremental

## 1. Status geral

Aprovado — parcialmente substituído (ver nota de atualização)

> **Nota de atualização (feature `cache-tempo-real`):** a paginação incremental
> por cursor (`listarEventosPaginados` / `listarConsultasPaginadas`, `eventosCursor`,
> `IntersectionObserver`, scroll infinito) foi **removida** quando a camada de dados
> migrou de `getDocs` para `onSnapshot` + `persistentLocalCache`. Os eventos e consultas
> agora chegam completos via listener em tempo real, e a filtragem (data, categoria,
> busca) passou a ser **inteiramente em memória**. O **seletor de intervalo de datas**
> permanece funcionando — apenas a paginação por trás dele mudou. Ver
> `specs/cache-tempo-real/`.

## 2. Resumo da implementação

- `firestore-api.js`: importados `query`, `orderBy`, `limit`, `startAfter`, `where`; adicionados `listarEventosPaginados` e `listarConsultasPaginadas`.
- `app.js`: estado de paginação (`eventosCache`, `eventosCursor`, `eventosEsgotado`, equivalentes para consultas); filtro de data compartilhado (`filtroDataInicio`, `filtroDataFim`); funções `resetarERecarregarEventos/Consultas`, `carregarMaisEventos/Consultas`, `alterarFiltroData`, `limparFiltroData`.
- `renderizarTimeline()` e `renderizarAgendaLista()` refatoradas para usar cache + IntersectionObserver.
- Seletor de datas (dois inputs) adicionado em ambas as telas.
- CSS: `.filtro-datas`, `.filtro-data-input`, `.sentinela-paginacao`, `.paginacao-fim`.

## 3. Critérios de aceite

> Critérios marcados com 🔄 foram alterados pela feature `cache-tempo-real`.

- [x] Seletor de intervalo de datas disponível no Histórico e na Agenda.
- [x] 🔄 A lista respeita o filtro de data (~~via Firestore where~~ → agora filtrado em memória).
- [ ] 🔄 ~~Por padrão, apenas 20 itens são carregados.~~ (Substituído: todos os itens chegam via `onSnapshot`.)
- [ ] 🔄 ~~Scroll infinito automático via IntersectionObserver.~~ (Removido — não há mais paginação.)
- [x] Filtros de data, categoria e busca combinados.
- [ ] 🔄 ~~Ao mudar filtro, cache reseta e recarrega do início.~~ (Substituído: re-render direto do cache, sem releitura.)
- [x] 🔄 Indicador de "Fim do histórico" (o spinner de paginação foi removido).

## 4. Pendências / Riscos

- O Firestore exige que ao usar `where` num campo e `orderBy` no mesmo campo, o índice automático de campo único cubra a query. Se houver erro de índice, o Firestore retorna um link para criar o índice no console Firebase.
- Filtro por texto + paginação server-side: comportamento esperado e documentado (cada "load more" busca 20 do Firestore; os que não batem na busca são ignorados na UI).
