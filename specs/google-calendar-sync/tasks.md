# Tarefas: Sincronização com Google Calendar

## Visão geral

Implementação client-side (Google Identity Services + Calendar API v3), em etapas pequenas: primeiro a configuração OAuth e o módulo de token, depois as operações de calendário, em seguida a persistência (preferência + ids), e por fim o acoplamento ao fluxo de salvar/excluir consulta, histórico, pendências e desvinculação.

## Tarefa 1 — Configurar OAuth Client ID e carregar o GIS

Status: Pendente

### Objetivo
Criar o OAuth Client ID (tipo Web) no Google Cloud, registrar o `client_id` no app e carregar a biblioteca Google Identity Services.

### Arquivos afetados
- `index.html` (script do GIS)
- `google-calendar.js` (constante `CLIENT_ID`)

### Dependências
Usuário cria o OAuth Client ID no Google Cloud Console e fornece o `client_id`; origens JS autorizadas configuradas (URL do GitHub Pages + localhost).

### Critério de conclusão
A biblioteca GIS carrega sem erro e `google.accounts.oauth2` está disponível no console.

### Teste manual
Abrir o app, verificar no console que `window.google?.accounts?.oauth2` existe.

### Observações
O `client_id` é público (vai no front-end); a segurança vem das origens autorizadas e do escopo mínimo.

## Tarefa 2 — Obtenção de token (consentimento e silencioso)

Status: Pendente

### Objetivo
Implementar em `google-calendar.js` a obtenção de token de acesso com `initTokenClient`: com `prompt:'consent'` na 1ª vez e `prompt:''` (silencioso) nas seguintes.

### Arquivos afetados
- `google-calendar.js`

### Dependências
Tarefa 1.

### Critério de conclusão
Função que resolve um access token válido; primeira chamada mostra consentimento, chamadas seguintes obtêm token sem UI quando a sessão Google está ativa.

### Teste manual
Chamar a função, aprovar consentimento, recarregar e confirmar obtenção silenciosa.

### Observações
Token vive só em memória; nunca é persistido.

## Tarefa 3 — Criar/localizar calendário dedicado

Status: Pendente

### Objetivo
Criar (ou localizar, se já existir) um calendário dedicado "Saúde do Bebê" e retornar seu `calendarId`.

### Arquivos afetados
- `google-calendar.js`

### Dependências
Tarefa 2.

### Critério de conclusão
Função retorna um `calendarId` válido; não cria duplicado se já existir um com o mesmo nome.

### Teste manual
Executar e conferir no Google Agenda que o calendário foi criado uma única vez.

### Observações
Conforme decisão da spec: não usar o `primary`.

## Tarefa 4 — Operações de evento (criar/atualizar/excluir)

Status: Pendente

### Objetivo
Mapear **consulta e evento** para o payload do Google Calendar e implementar `POST`/`PATCH`/`DELETE` na Calendar API.

### Arquivos afetados
- `google-calendar.js`

### Dependências
Tarefas 2 e 3.

### Critério de conclusão
Criar retorna `googleEventId`; atualizar altera o mesmo evento; excluir remove (404 tratado como já removido). Item sem hora vira evento de dia inteiro. Há mapeamento para os dois tipos (consulta: tipo/médico/local; evento: categoria/título).

### Teste manual
Criar, editar e excluir um item de cada tipo e conferir no Google Agenda.

### Observações
Fuso `America/Sao_Paulo`. Título inclui o nome do bebê e o tipo do item.

## Tarefa 5 — Persistência: preferência de sync e campos nos itens

Status: Pendente

### Objetivo
Criar a coleção `calendarSync/{uid}` (`enabled`, `calendarId`, `syncTipos`) e adicionar `googleEventId`/`syncPendente` **tanto a consultas quanto a eventos**; regra de segurança correspondente.

### Arquivos afetados
- `firestore-api.js`
- `firestore.rules`

### Dependências
Tarefa 4.

### Critério de conclusão
App lê/grava `calendarSync/{uid}` incluindo `syncTipos`; só o próprio usuário acessa; consultas e eventos aceitam os novos campos.

### Teste manual
Gravar a preferência (com tipos), recarregar e confirmar persistência; testar regra com outro usuário (deve negar).

### Observações
Nenhum token é gravado aqui.

## Tarefa 6 — Tela de opt-in (visual + seleção de tipos) + badge de status

Status: Pendente

### Objetivo
Ao salvar o primeiro item sem sync ativa, exibir a **tela de opt-in do app**: ilustração do sentido **app → Google Agenda** (deixando claro que o inverso não ocorre), seleção do que sincronizar (**só consultas / só eventos / ambos**) e opção de incluir o histórico. Após confirmar, dispara o consentimento do Google. Exibir badge de "Google Agenda vinculado".

### Arquivos afetados
- `index.html` (markup/estilo da tela de opt-in e do badge)
- `style.css` (ilustração/visual)
- `app.js` (lógica do fluxo)

### Dependências
Tarefa 5.

### Critério de conclusão
A tela aparece uma única vez, com o apoio visual e os três modos de seleção; ao confirmar, salva `syncTipos`, ativa a sync e mostra o badge; ao recusar, não reaparece de forma intrusiva.

### Teste manual
Salvar o 1º item, escolher um modo de sincronização, aceitar, conferir badge; recarregar e confirmar estado vinculado e tipos salvos.

### Observações
Tela acoplada ao botão de salvar, conforme pedido do usuário. A ilustração é da tela **do app** — a tela oficial do Google não é customizável.

## Tarefa 7 — Acoplar sync ao salvar e excluir (consultas e eventos)

Status: Pendente

### Objetivo
Após salvar/excluir uma **consulta ou evento** cujo tipo esteja habilitado em `syncTipos`, criar/atualizar/remover o evento no Google Agenda silenciosamente; falha marca `syncPendente` + toast não-bloqueante.

### Arquivos afetados
- `app.js`

### Dependências
Tarefa 6.

### Critério de conclusão
Salvar cria/atualiza o evento sem clique extra (apenas para tipos habilitados); excluir remove; itens de tipo desabilitado são ignorados; o salvamento local nunca falha por causa do Google.

### Teste manual
Com cada configuração de `syncTipos`, criar/editar/cancelar consultas e eventos e conferir reflexo (ou ausência) no Google Agenda; simular offline e ver `syncPendente` + toast.

### Observações
Sincronização sempre best-effort; nunca bloqueia o fluxo principal.

## Tarefa 8 — Histórico, pendências e configurações (alterar tipos / desvincular)

Status: Pendente

### Objetivo
Sincronizar itens já cadastrados dos tipos habilitados (se o usuário optou), reprocessar `syncPendente` ao abrir o app, e oferecer configurações para **alterar os tipos sincronizados** e **desvincular**.

### Arquivos afetados
- `app.js`
- `index.html` (configurações)

### Dependências
Tarefa 7.

### Critério de conclusão
Histórico sincroniza em lote (apenas tipos habilitados) quando escolhido; pendências são reprocessadas ao abrir com rede; o usuário consegue alterar `syncTipos` depois; desvincular para novas sincronizações (eventos antigos permanecem).

### Teste manual
Ativar com histórico e conferir criação em lote; alterar os tipos e confirmar o novo comportamento; gerar pendência, reabrir e ver reprocessamento; desvincular e confirmar que novos itens não sincronizam.

### Observações
Desvincular não apaga eventos já criados no Google Agenda.

## Tarefa 9 — Revisão e documentação

Status: Pendente

### Objetivo
Criar `review.md` comparando a implementação com spec/plan/tasks e atualizar a documentação de sistema.

### Arquivos afetados
- `specs/google-calendar-sync/review.md`
- `docs/sistema-atual.md`, `docs/arquitetura.md`

### Dependências
Tarefas 1–8.

### Critério de conclusão
`review.md` criado com critérios de aceite verificados; docs refletindo a nova integração.

### Teste manual
Revisar checklist de critérios de aceite da spec (seção 12).

### Observações
Registrar o desvio de arquitetura (client-side em vez de server-side) e as notas de escopo/Play Store.
