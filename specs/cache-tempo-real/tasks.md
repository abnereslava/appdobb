# Tarefas: Cache em tempo real e sincronização entre dispositivos

> **Nota:** tarefas registradas retroativamente, refletindo a implementação já realizada.

## Visão geral

A implementação seguiu da camada de configuração para a de dados e, por fim, para a renderização: habilitar persistência local, expor os listeners, alimentar um cache em memória, converter as renderizações para síncronas e remover a paginação por cursor.

## Tarefa 1 — Habilitar persistência local (IndexedDB)

Status: Concluída

### Objetivo
Inicializar o Firestore com `persistentLocalCache` para servir dados do disco e buscar apenas deltas entre sessões.

### Arquivos afetados
- `firebase-config.js`

### Dependências
Nenhuma.

### Critério de conclusão
`db` é criado via `initializeFirestore(app, { localCache: persistentLocalCache() })` sem erro no console.

### Teste manual
Abrir o app, recarregar e confirmar no console ausência de erro de inicialização; dados aparecem mesmo offline na segunda abertura.

### Observações
Substitui `getFirestore`. IndexedDB necessário; SDK degrada para memória se indisponível.

## Tarefa 2 — Expor listeners onSnapshot

Status: Concluída

### Objetivo
Adicionar `subscribePerfil`, `subscribeEventos`, `subscribeConsultas` em `window._db`, cada um retornando a função de cancelamento.

### Arquivos afetados
- `firestore-api.js`

### Dependências
Tarefa 1.

### Critério de conclusão
Os três métodos existem, importam `onSnapshot` e entregam dados via callback.

### Teste manual
No console, chamar um `subscribe*` e confirmar recebimento de dados e função de unsubscribe.

### Observações
Operações de escrita permanecem inalteradas.

## Tarefa 3 — Cache em memória e ciclo de vida dos listeners

Status: Concluída

### Objetivo
Criar `_perfilCache`/`eventosCache`/`consultasCache`/`_cacheReady`, a função `subscribeAoPerfilAtivo(profileId)` e `_unsubscribeAll()`.

### Arquivos afetados
- `app.js`

### Dependências
Tarefa 2.

### Critério de conclusão
Login abre os 3 listeners; troca de bebê e logout cancelam e reabrem corretamente; `_cacheReady` vira true só após os 3 primeiros disparos.

### Teste manual
Login, troca de bebê e logout sem listeners órfãos; dados corretos por bebê.

### Observações
`_unsubscribeAll()` deve ser idempotente.

## Tarefa 4 — Converter leituras e renderizações para síncronas

Status: Concluída

### Objetivo
`carregarPerfil/Eventos/Consultas` retornam o cache; `renderizarHome/Timeline/AgendaLista/AbaCalendario` e `_buildCalendarioHTML` ficam síncronas com guarda `_cacheReady` (spinner enquanto carrega).

### Arquivos afetados
- `app.js`

### Dependências
Tarefa 3.

### Critério de conclusão
Nenhuma renderização chama o Firestore; todas leem do cache; spinner aparece até o cache ficar pronto.

### Teste manual
Alternar abas e confirmar no Firebase Usage que não há novas leituras por troca de aba.

### Observações
`await` remanescentes sobre as funções de leitura foram removidos.

## Tarefa 5 — Remover paginação e mover filtros para memória

Status: Concluída

### Objetivo
Remover cursores, `IntersectionObserver` de paginação e sentinelas de scroll infinito; aplicar filtros de intervalo de data em memória.

### Arquivos afetados
- `app.js`

### Dependências
Tarefa 4.

### Critério de conclusão
Timeline e Agenda exibem todos os itens via listener; o seletor de datas filtra corretamente sobre o cache; rodapé "Fim do histórico/agenda" exibido.

### Teste manual
Aplicar filtro de datas no Histórico e na Agenda e confirmar resultado correto sem releitura.

### Observações
`resetarERecarregar*` passaram a apenas re-renderizar do cache.

## Tarefa 6 — Teste integrado de sincronização entre dispositivos

Status: Concluída

### Objetivo
Validar o requisito principal: tempo real entre 2+ dispositivos sem releitura por aba.

### Arquivos afetados
Nenhum (validação).

### Dependências
Tarefas 1–5.

### Critério de conclusão
Alteração feita em um dispositivo aparece no outro em tempo real; trocas de aba não geram leituras.

### Teste manual
Abrir em dois dispositivos/abas na mesma conta; criar/editar/excluir em um e observar atualização automática no outro.

### Observações
Confirmar também o comportamento offline (cache local serve os dados).
