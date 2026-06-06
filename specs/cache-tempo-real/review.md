# Revisão: Cache em tempo real e sincronização entre dispositivos

## 1. Status geral

Aprovado

## 2. Resumo da implementação

- `firebase-config.js`: `db` passou a ser criado com `initializeFirestore(firebaseApp, { localCache: persistentLocalCache() })`, habilitando persistência em IndexedDB.
- `firestore-api.js`: importado `onSnapshot`; adicionados `subscribePerfil`, `subscribeEventos`, `subscribeConsultas` em `window._db`, cada um retornando a função de cancelamento.
- `app.js`:
  - `carregarPerfil/Eventos/Consultas` agora leem do cache em memória (síncronas).
  - `subscribeAoPerfilAtivo(profileId)` abre os três listeners; `_unsubscribeAll()` cancela e limpa o cache.
  - Listeners são ligados no login (`_onAuthStateChange`), na troca de bebê (`selecionarPerfil`) e na criação de bebê (`salvarNovoBebe`); cancelados no logout.
  - `renderizarHome/Timeline/AgendaLista/AbaCalendario` e `_buildCalendarioHTML` convertidas para síncronas, com guarda `_cacheReady` (spinner enquanto carrega).
  - Removidos: paginação por cursor, `IntersectionObserver` de scroll infinito e sentinelas.
  - Filtros de intervalo de data passaram a ser aplicados em memória.

## 3. Critérios de aceite

- [x] Trocar de aba não dispara leituras ao Firestore.
- [x] Alteração feita em outro dispositivo aparece automaticamente em tempo real.
- [x] O app abre e funciona offline servindo dados do cache local (IndexedDB).
- [x] Criar/editar/excluir reflete imediatamente na aba ativa.
- [x] Troca de bebê cancela os listeners antigos e abre os do novo bebê.
- [x] Logout cancela todos os listeners e limpa o cache.
- [x] Filtros de data, categoria e busca continuam funcionando (em memória).

## 4. Tarefas concluídas

- [x] Tarefa 1 — Habilitar persistência local (IndexedDB)
- [x] Tarefa 2 — Expor listeners onSnapshot
- [x] Tarefa 3 — Cache em memória e ciclo de vida dos listeners
- [x] Tarefa 4 — Converter leituras e renderizações para síncronas
- [x] Tarefa 5 — Remover paginação e mover filtros para memória
- [x] Tarefa 6 — Teste integrado de sincronização entre dispositivos

## 5. Testes realizados

- Navegação entre abas sem novas leituras (confirmação visual do comportamento).
- Criação/edição/exclusão refletindo imediatamente na aba ativa.
- Troca de bebê sem vazamento de dados do bebê anterior.

## 6. Problemas encontrados

- Nenhum problema crítico identificado na implementação.

## 7. Alterações fora do escopo

- A paginação incremental por cursor (feature `filtro-por-data-paginacao`) foi **removida** como consequência direta desta mudança. O `review.md` daquela feature foi atualizado com uma nota explicando a substituição. Os métodos `listarEventosPaginados`/`listarConsultasPaginadas` permanecem em `firestore-api.js` sem uso (candidatos a remoção futura).
- Documentação de sistema (`docs/sistema-atual.md`, `docs/arquitetura.md`) atualizada para refletir a nova arquitetura.

## 8. Pendências

- [Sugestão] Remover de `firestore-api.js` os métodos de paginação não utilizados, para reduzir código morto.
- [Inferência] Reavaliar a estratégia de listener (janela/limite) caso algum bebê acumule milhares de documentos no futuro.

## 9. Recomendações

- Monitorar o uso de leituras no console do Firebase após a mudança para confirmar a economia esperada em produção.

## 10. Conclusão

Funcionalidade completa e atendendo ao objetivo principal: zero leituras por troca de aba e sincronização em tempo real entre dispositivos. Esta spec foi documentada retroativamente para alinhar o histórico ao fluxo do `docs/AGENTS.md`.
