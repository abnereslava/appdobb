# Revisão: Filtro por Data e Paginação Incremental

## 1. Status geral

Aprovado

## 2. Resumo da implementação

- `firestore-api.js`: importados `query`, `orderBy`, `limit`, `startAfter`, `where`; adicionados `listarEventosPaginados` e `listarConsultasPaginadas`.
- `app.js`: estado de paginação (`eventosCache`, `eventosCursor`, `eventosEsgotado`, equivalentes para consultas); filtro de data compartilhado (`filtroDataInicio`, `filtroDataFim`); funções `resetarERecarregarEventos/Consultas`, `carregarMaisEventos/Consultas`, `alterarFiltroData`, `limparFiltroData`.
- `renderizarTimeline()` e `renderizarAgendaLista()` refatoradas para usar cache + IntersectionObserver.
- Seletor de datas (dois inputs) adicionado em ambas as telas.
- CSS: `.filtro-datas`, `.filtro-data-input`, `.sentinela-paginacao`, `.paginacao-fim`.

## 3. Critérios de aceite

- [x] Seletor de intervalo de datas disponível no Histórico e na Agenda.
- [x] A lista respeita o filtro de data (via Firestore where).
- [x] Por padrão, apenas 20 itens são carregados.
- [x] Scroll infinito automático via IntersectionObserver.
- [x] Filtros de data, categoria e busca combinados.
- [x] Ao mudar filtro, cache reseta e recarrega do início.
- [x] Indicador de progresso e "Fim do histórico".

## 4. Pendências / Riscos

- O Firestore exige que ao usar `where` num campo e `orderBy` no mesmo campo, o índice automático de campo único cubra a query. Se houver erro de índice, o Firestore retorna um link para criar o índice no console Firebase.
- Filtro por texto + paginação server-side: comportamento esperado e documentado (cada "load more" busca 20 do Firestore; os que não batem na busca são ignorados na UI).
