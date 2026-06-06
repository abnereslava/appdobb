# Plano Técnico: Cache em tempo real e sincronização entre dispositivos

> **Nota:** plano criado retroativamente para documentar a solução implementada.

## 1. Resumo da solução

Substituir as leituras pontuais (`getDocs`) e a paginação por cursor por **listeners `onSnapshot`** do Firestore, mantendo os dados em **cache de módulo (memória)** no `app.js`. Habilitar **`persistentLocalCache`** (IndexedDB) na inicialização do Firestore para persistência entre sessões e busca por deltas.

Três listeners são abertos por bebê ativo (perfil, eventos, consultas). As funções de leitura passam de assíncronas (`await getDocs`) para **síncronas** (retornam o cache em memória). As renderizações deixam de buscar dados e passam a consumir o cache, re-renderizando quando os listeners disparam.

## 2. Dependências

- **Firebase Firestore SDK v11.8.1** (já em uso via CDN ESM).
  - `initializeFirestore`, `persistentLocalCache` (substituem `getFirestore`).
  - `onSnapshot` (novo import em `firestore-api.js`).
- Nenhuma dependência externa nova.

## 3. Arquivos afetados

| Arquivo | Motivo |
|---|---|
| `firebase-config.js` | Trocar `getFirestore` por `initializeFirestore` + `persistentLocalCache` (IndexedDB). |
| `firestore-api.js` | Adicionar `onSnapshot` ao import e expor `subscribePerfil`, `subscribeEventos`, `subscribeConsultas` em `window._db`. |
| `app.js` | Converter `carregarPerfil/Eventos/Consultas` para leitura síncrona do cache; adicionar `subscribeAoPerfilAtivo` e `_unsubscribeAll`; ligar/desligar listeners no login, troca de bebê e logout; remover paginação por cursor e sentinelas de scroll infinito; aplicar filtros de data em memória. |

## 4. Estrutura de dados

Sem alteração no Firestore. Novo estado **em memória** no `app.js`:

```text
_perfilCache     : objeto do perfil (ou null)
eventosCache     : array de eventos (ordenado por data desc)
consultasCache   : array de consultas
_cacheReady      : boolean — true após os 3 listeners responderem
_unsubPerfil     : função de cancelamento do listener de perfil
_unsubEventos    : função de cancelamento do listener de eventos
_unsubConsultas  : função de cancelamento do listener de consultas
```

## 5. Regras de segurança e permissões

- Inalteradas. Os listeners respeitam as `firestore.rules` existentes.
- `persistentLocalCache` armazena dados no IndexedDB do dispositivo — aceitável para um app pessoal de saúde, mas significa que dados ficam em cache local até o logout limpar o estado em memória (o IndexedDB do SDK persiste; limpeza completa exigiria `clearIndexedDbPersistence`, fora do escopo).

## 6. Fluxos técnicos

### Abertura de listeners
`subscribeAoPerfilAtivo(profileId)`:
1. Chama `_unsubscribeAll()` (idempotente).
2. Abre os 3 listeners; cada um, no primeiro disparo, marca seu flag de "pronto".
3. Quando os 3 estiverem prontos, define `_cacheReady = true` e renderiza a aba ativa.
4. Disparos subsequentes re-renderizam apenas a(s) view(s) afetada(s).

### Leitura
`carregarPerfil()` / `carregarEventos()` / `carregarConsultas()` retornam o cache em memória de forma síncrona.

### Escrita
Inalterada (`salvarEvento`, `excluirConsulta`, etc.). O listener reflete a escrita automaticamente — não há mais necessidade de `resetarERecarregar*` após salvar; `atualizarVistaAtiva()` apenas re-renderiza.

### Encerramento
`_unsubscribeAll()` cancela os 3 listeners e zera o cache. Chamado no logout e antes de trocar de bebê.

## 7. Impactos no sistema existente

- **Removidos**: `listarEventosPaginados`, `listarConsultasPaginadas` deixam de ser usados pelo app (mantidos no `firestore-api.js` por ora, sem chamadas); `eventosCursor`, `consultasCursor`, `IntersectionObserver` de paginação, sentinelas de scroll infinito.
- **Alterados**: `renderizarHome`, `renderizarTimeline`, `renderizarAgendaLista`, `renderizarAbaCalendario`, `_buildCalendarioHTML` passam de `async` para síncronas e ganham guarda `_cacheReady`.
- **Filtros de data**: antes server-side (`where`), agora em memória.

## 8. Riscos técnicos

- **Volume de dados**: ouvir a coleção inteira escala mal se houver milhares de docs por bebê. Aceitável para o domínio atual; mitigável no futuro com listener por janela de data.
- **Conexão persistente**: `onSnapshot` mantém um canal aberto enquanto o app está ativo (consumo de banda baixo, mas contínuo).
- **Compatibilidade de persistência**: `persistentLocalCache` requer IndexedDB; navegadores muito antigos ou modo privado restrito podem cair no cache em memória apenas (degradação graciosa pelo SDK).

## 9. Estratégia de teste

Testes manuais (o projeto não tem testes automatizados):
1. Alternar abas e confirmar no painel "Network"/"Usage" do Firebase que não há novas leituras por troca de aba.
2. Abrir o app em dois dispositivos/abas na mesma conta; criar uma consulta em um e ver aparecer no outro em tempo real.
3. Desligar a rede, abrir o app, confirmar que os dados carregam do cache.
4. Criar/editar/excluir e confirmar atualização imediata da aba ativa.
5. Trocar de bebê e confirmar que os dados corretos aparecem sem vazamento do bebê anterior.
6. Logout e novo login, confirmando reabertura limpa dos listeners.

## 10. Ordem recomendada de implementação

1. `firebase-config.js` — habilitar `persistentLocalCache`.
2. `firestore-api.js` — adicionar os três `subscribe*`.
3. `app.js` — cache em memória + `subscribeAoPerfilAtivo` / `_unsubscribeAll`.
4. `app.js` — converter renderizações para síncronas + guarda `_cacheReady`.
5. `app.js` — remover paginação/sentinelas e mover filtros de data para memória.
6. `app.js` — ligar/desligar listeners no login, troca de bebê e logout.
7. Teste manual completo.
