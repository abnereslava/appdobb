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
Mapear uma consulta para o payload do evento e implementar `POST`/`PATCH`/`DELETE` na Calendar API.

### Arquivos afetados
- `google-calendar.js`

### Dependências
Tarefas 2 e 3.

### Critério de conclusão
Criar retorna `googleEventId`; atualizar altera o mesmo evento; excluir remove (404 tratado como já removido). Consulta sem hora vira evento de dia inteiro.

### Teste manual
Criar, editar e excluir um evento de teste e conferir no Google Agenda.

### Observações
Fuso `America/Sao_Paulo`. Título inclui o nome do bebê.

## Tarefa 5 — Persistência: preferência de sync e campos na consulta

Status: Pendente

### Objetivo
Criar a coleção `calendarSync/{uid}` (`enabled`, `calendarId`) e adicionar `googleEventId`/`syncPendente` à consulta; regra de segurança correspondente.

### Arquivos afetados
- `firestore-api.js`
- `firestore.rules`

### Dependências
Tarefa 4.

### Critério de conclusão
App lê/grava `calendarSync/{uid}`; só o próprio usuário acessa; consulta aceita os novos campos.

### Teste manual
Gravar a preferência, recarregar e confirmar persistência; testar regra com outro usuário (deve negar).

### Observações
Nenhum token é gravado aqui.

## Tarefa 6 — Consentimento na 1ª consulta + badge de status

Status: Pendente

### Objetivo
Ao salvar a primeira consulta sem sync ativa, perguntar se deseja ativar (e se quer sincronizar o histórico); exibir badge de "Google Agenda vinculado".

### Arquivos afetados
- `index.html`
- `app.js`

### Dependências
Tarefa 5.

### Critério de conclusão
A pergunta aparece uma única vez; ao aceitar, ativa a sync e mostra o badge; ao recusar, não pergunta de novo de forma intrusiva.

### Teste manual
Salvar a 1ª consulta, aceitar, conferir badge; recarregar e confirmar estado vinculado.

### Observações
Pergunta acoplada ao botão de salvar, conforme pedido do usuário.

## Tarefa 7 — Acoplar sync ao salvar e excluir consulta

Status: Pendente

### Objetivo
Após salvar/excluir uma consulta com sync ativa, criar/atualizar/remover o evento silenciosamente; falha marca `syncPendente` + toast não-bloqueante.

### Arquivos afetados
- `app.js`

### Dependências
Tarefa 6.

### Critério de conclusão
Salvar cria/atualiza o evento sem clique extra; excluir remove; o salvamento local nunca falha por causa do Google.

### Teste manual
Criar/editar/cancelar consultas e conferir reflexo no Google Agenda; simular offline e ver `syncPendente` + toast.

### Observações
Sincronização sempre best-effort; nunca bloqueia o fluxo principal.

## Tarefa 8 — Histórico, pendências e desvincular

Status: Pendente

### Objetivo
Sincronizar consultas já cadastradas (se o usuário optou), reprocessar `syncPendente` ao abrir o app, e oferecer "Desvincular Google Agenda".

### Arquivos afetados
- `app.js`

### Dependências
Tarefa 7.

### Critério de conclusão
Histórico sincroniza em lote quando escolhido; pendências são reprocessadas ao abrir com rede; desvincular para novas sincronizações (eventos antigos permanecem).

### Teste manual
Ativar com histórico e conferir criação em lote; gerar pendência, reabrir e ver reprocessamento; desvincular e confirmar que novas consultas não sincronizam.

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
