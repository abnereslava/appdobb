# Tarefas: Filtro por Data e Paginação Incremental

## Visão geral

5 tarefas. Tarefas 1 e 2 são base; 3 e 4 são as telas; 5 é o CSS.

---

## Tarefa 1 — Métodos paginados no firestore-api.js

Status: Concluída

### Objetivo
Adicionar `listarEventosPaginados` e `listarConsultasPaginadas` em `window._db`, usando `query + orderBy + limit + startAfter + where`.

### Arquivos afetados
- `firestore-api.js`

### Dependências
Nenhuma.

### Critério de conclusão
`window._db.listarEventosPaginados(profileId, null, '', '')` retorna `{ docs: [...], cursor }` com até 20 docs ordenados por data decrescente.

### Teste manual
Abrir DevTools → Console → chamar `window._db.listarEventosPaginados(window.profileIdAtivo, null, '', '')` e verificar o resultado.

### Observações
`startAfter` recebe `null` na primeira chamada (sem cursor). O cursor retornado é o `DocumentSnapshot` do último doc.

---

## Tarefa 2 — Estado de paginação e funções auxiliares em app.js

Status: Concluída

### Objetivo
Adicionar variáveis de estado (`filtroDataInicio`, `filtroDataFim`, `eventosCache`, `eventosCursor`, `eventosEsgotado`, e equivalentes para consultas) e as funções `resetarERecarregarEventos()`, `carregarMaisEventos()`, `resetarERecarregarConsultas()`, `carregarMaisConsultas()`.

### Arquivos afetados
- `app.js`

### Dependências
Tarefa 1.

### Critério de conclusão
As funções existem e resetam/carregam o cache corretamente.

### Teste manual
Verificar no DevTools que após chamar `resetarERecarregarEventos()`, `eventosCache` é populado com até 20 itens.

### Observações
As funções `filtrarPorCategoria`, `buscarEventos`, `buscarAgenda` devem chamar os novos resets ao invés de `renderizarTimeline`/`renderizarAgenda` direto.

---

## Tarefa 3 — Refatorar renderizarTimeline com paginação + filtro de datas

Status: Concluída

### Objetivo
Reescrever `renderizarTimeline()` para:
- Usar `eventosCache` ao invés de buscar tudo
- Adicionar o seletor de datas (início/fim) acima dos filtros de categoria
- Exibir indicador "Exibindo X de Y" (Y estimado ou "X+" se não esgotado)
- Inserir sentinela `#sentinela-timeline` ao final da lista
- Registrar `IntersectionObserver` no sentinela

### Arquivos afetados
- `app.js`

### Dependências
Tarefas 1 e 2.

### Critério de conclusão
Histórico mostra 20 itens inicialmente; scroll até o fim carrega mais automaticamente; filtro de datas filtra corretamente.

### Teste manual
- Abrir Histórico com muitos eventos → verificar que mostra 20 inicialmente.
- Rolar até o fim → novos itens aparecem.
- Preencher data início → lista filtra.
- Clicar "×" → filtro limpo.

### Observações
O `IntersectionObserver` deve ser desconectado quando `eventosEsgotado` for true para não disparar chamadas infinitas.

---

## Tarefa 4 — Refatorar renderizarAgenda com paginação + filtro de datas

Status: Concluída

### Objetivo
Adaptar `renderizarAgenda()` para usar `consultasCache` com a mesma lógica de paginação e seletor de datas da Tarefa 3. O filtro de datas é compartilhado (mesmas variáveis `filtroDataInicio` / `filtroDataFim`).

### Arquivos afetados
- `app.js`

### Dependências
Tarefas 1, 2 e 3.

### Critério de conclusão
Agenda também pagina e o filtro de datas definido no Histórico persiste ao abrir a Agenda.

### Teste manual
- Definir filtro de data no Histórico → ir para Agenda → filtro deve estar ativo.
- Scroll infinito funciona na Agenda também.

### Observações
A divisão proximas/passadas da Agenda é feita no cliente sobre o cache carregado — continua igual, só que sobre `consultasCache`.

---

## Tarefa 5 — CSS do seletor de datas e indicadores

Status: Concluída

### Objetivo
Adicionar estilos para `.filtro-datas`, `.filtro-datas-inputs`, `.filtro-datas-limpar`, `.paginacao-info`, `.sentinela-spinner`.

### Arquivos afetados
- `style.css`

### Dependências
Tarefa 3 (para ver as classes geradas no HTML).

### Critério de conclusão
Seletor de datas aparece compacto e legível; indicador de progresso visível abaixo dos filtros; spinner de carregamento aparece enquanto busca mais itens.

### Teste manual
Inspecionar visualmente no browser.

### Observações
Usar variáveis CSS existentes (`--primary`, `--border`, `--bg-input`, etc.) para manter coerência de tema.
