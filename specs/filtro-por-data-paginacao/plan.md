# Plano Técnico: Filtro por Data e Paginação Incremental

## 1. Resumo da solução

**Paginação:** Firestore nativo com `query + orderBy('data','desc') + limit(20) + startAfter(cursor)`. A cada "próxima página", o último documento retornado serve como cursor para a próxima query. Isso minimiza leituras — só busca 20 documentos por vez.

**Filtro por data:** Adicionado via `where('data', '>=', dataInicio)` / `where('data', '<=', dataFim)` na mesma query do Firestore. Por ser filtro no mesmo campo que o `orderBy`, não exige índice composto.

**Filtros de categoria e busca de texto:** Mantidos no cliente (aplicados sobre os docs já carregados), pois Firestore não suporta full-text search.

**Scroll infinito:** `IntersectionObserver` em um elemento sentinela (`#sentinela-timeline`, `#sentinela-agenda`) no final da lista. Quando visível, dispara `carregarMaisEventos()` / `carregarMaisConsultas()`.

**Filtro persiste entre abas:** Estado `filtroDataInicio` e `filtroDataFim` são variáveis globais no `app.js` — compartilhadas entre Histórico e Agenda.

## 2. Dependências

- Firestore SDK: importar adicionalmente `query`, `orderBy`, `limit`, `startAfter`, `where` em `firestore-api.js`.
- `IntersectionObserver` (nativo em todos os browsers modernos, incluindo mobile).

## 3. Arquivos afetados

| Arquivo | Motivo |
|---|---|
| `firestore-api.js` | Adicionar imports e novos métodos paginados para eventos e consultas |
| `app.js` | Estado de paginação/filtros; refatorar `renderizarTimeline` e `renderizarAgenda`; funções de filtro |
| `style.css` | Estilo do seletor de intervalo de datas; indicador "Exibindo X de Y"; sentinela/spinner de carregamento |

## 4. Estrutura de dados

### Estado novo em `app.js`

```js
// Filtro de data (persistido entre abas)
let filtroDataInicio = '';  // 'YYYY-MM-DD' ou ''
let filtroDataFim    = '';  // 'YYYY-MM-DD' ou ''

// Paginação de eventos
let eventosCache     = [];       // todos os docs carregados até agora
let eventosCursor    = null;     // último DocumentSnapshot para startAfter
let eventosEsgotado  = false;    // true quando não há mais docs

// Paginação de consultas
let consultasCache   = [];
let consultasCursor  = null;
let consultasEsgotado = false;
```

### Novos métodos em `window._db`

```js
// Eventos
listarEventosPaginados(profileId, cursor, dataInicio, dataFim)
// → { docs: [...], cursor: DocumentSnapshot | null }

// Consultas
listarConsultasPaginadas(profileId, cursor, dataInicio, dataFim)
// → { docs: [...], cursor: DocumentSnapshot | null }
```

Cada chamada retorna até 20 documentos + o cursor do último doc. Se retornar menos de 20, significa que não há mais dados.

## 5. Regras de segurança e permissões

Sem mudança nas regras Firestore. A query usa os mesmos indexes que já existem (campo `data` com ordenação descendente é um índice automático de campo único).

## 6. Fluxos técnicos

### Carregar primeira página (ao abrir a aba ou mudar filtro)

1. Zera o cache e cursor: `eventosCache = []; eventosCursor = null; eventosEsgotado = false`
2. Chama `listarEventosPaginados(profileId, null, filtroDataInicio, filtroDataFim)`
3. Appenda os docs ao cache
4. Renderiza a lista (aplicando filtros de categoria/texto no cliente)
5. Insere o sentinela no final da lista
6. `IntersectionObserver` observa o sentinela

### Carregar próxima página (scroll atingiu o sentinela)

1. Chama `listarEventosPaginados(profileId, eventosCursor, ...)`
2. Appenda ao cache
3. Re-renderiza apenas os novos itens (ou re-renderiza tudo — mais simples)
4. Se retornou < 20 docs: `eventosEsgotado = true`, remove o sentinela

### Mudar filtro (categoria, texto, data)

1. Zera o cache e cursor
2. Recarrega do zero (primeira página)

### Seletor de datas

- Dois inputs `<input type="date">` (início e fim) acima dos filtros de categoria
- Mudança dispara reset + recarga
- Botão "×" limpa o filtro de datas e recarrega

## 7. Impactos no sistema existente

- `carregarEventos()` e `carregarConsultas()` (wrappers em app.js que chamam `listarEventos`/`listarConsultas`) deixam de ser usados nas telas principais. **Mantidos** para uso em outras partes do app (home stats, etc.).
- `renderizarTimeline()` e `renderizarAgenda()` passam a usar o novo fluxo paginado.
- `filtrarPorCategoria`, `buscarEventos`, `buscarAgenda` passam a chamar `resetarERecarregarEventos()` / `resetarERecarregarConsultas()` ao invés de renderizar direto.

## 8. Riscos técnicos

- **Filtro de texto + paginação server-side**: se o usuário filtrar por texto e só 1 em 20 docs corresponder, o "carregar mais" busca 20 do Firestore para mostrar poucos. Aceitável — Firestore não suporta full-text search.
- **`startAfter` exige o DocumentSnapshot** (não apenas o id ou o dado). O método `listarEventosPaginados` deve retornar o snapshot raw.
- **Reordenação de campos `data`**: os documentos precisam ter o campo `data` preenchido para `orderBy`. Docs sem `data` (inválidos) serão excluídos da query ordenada. Sem impacto — o formulário exige data.

## 9. Estratégia de teste

Manual:
- Verificar que apenas 20 itens aparecem inicialmente com muitos eventos.
- Rolar até o final → novos itens aparecem automaticamente.
- Definir filtro de data → lista atualiza; filtro de categoria + data combinados funcionam.
- Botão "×" no filtro de data → lista volta ao normal.
- Indicador "Exibindo X de Y" atualiza corretamente.
- "Fim do histórico" aparece quando todos os docs foram carregados.

## 10. Ordem recomendada de implementação

1. Novos métodos paginados em `firestore-api.js`
2. Estado de paginação e filtros de data em `app.js`
3. Seletor de datas no HTML do Histórico e Agenda (inline no JS de renderização)
4. Refatorar `renderizarTimeline()` para paginação + scroll infinito
5. Refatorar `renderizarAgenda()` para paginação + scroll infinito
6. Estilo CSS do seletor de datas e indicador de progresso
