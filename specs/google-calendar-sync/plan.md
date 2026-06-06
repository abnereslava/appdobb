# Plano Técnico: Sincronização com Google Calendar

## 0. Decisão de arquitetura (importante)

A `spec.md` deixou a escolha entre **client-side** e **server-side** a cargo da implementação.
**Decisão: client-side**, usando **Google Identity Services (GIS) — token model**, pelos seguintes motivos:

- **Custo zero** e sem necessidade do plano Blaze do Firebase (o app é hospedado em GitHub Pages, site estático).
- **Mais privado**: nenhum token de longa duração (refresh token) é armazenado; só um token de acesso de curta duração (~1h) que vive na memória do navegador.
- Atende ao requisito real do usuário: **sincronização unidirecional (app → Google Agenda)**, acionada quando o usuário cria/edita/cancela uma consulta.

### Consequência no modelo de dados da spec

A `spec.md` (seção 9) previa `userTokens/{uid}` com `googleRefreshToken` — isso era para a abordagem **server-side** e **não se aplica** ao client-side. Substituição:

- **Não** armazenamos `googleAccessToken` nem `googleRefreshToken` no Firestore.
- Guardamos apenas a **preferência de sincronização** e o **id do calendário dedicado** (ver seção 4).

## 0.1 Notas registradas a pedido do usuário

- **[Anotação — escopo sensível]** `https://www.googleapis.com/auth/calendar.events` é um escopo **sensível** do Google. Enquanto o projeto OAuth não passar pela **verificação do Google**, o app funciona para o dono e até 100 usuários de teste, exibindo um aviso de "app não verificado" (basta avançar). Para uso familiar isso é suficiente. Remover o aviso exige **verificação OAuth** (gratuita para escopos sensíveis: política de privacidade + revisão da tela de consentimento).
- **[Anotação — futuro, fora de escopo, NÃO planejado]** Há intenção futura de transformar esta PWA em um app Android e distribuí-lo pela Play Store (viável via TWA/Bubblewrap/PWABuilder). **Importante:** publicar na Play Store **não** resolve, por si só, o escopo sensível — quem resolve é a verificação OAuth, que vale tanto para a web quanto para o app empacotado (mesmo client OAuth). Este item fica apenas registrado; não há planejamento técnico para ele nesta feature.

## 1. Resumo da solução

Carregar a biblioteca **Google Identity Services** (`https://accounts.google.com/gsi/client`) e usar `google.accounts.oauth2.initTokenClient` para obter um token de acesso com escopo `calendar.events`.

Fluxo guiado pelo **botão de salvar** da consulta (conforme pedido do usuário):
- **Primeiro salvamento** com sync ainda não ativada → o app pergunta uma única vez se o usuário quer enviar consultas ao Google Agenda; se sim, dispara o consentimento OAuth e (opcionalmente) cria um calendário dedicado "Saúde do Bebê".
- **Salvamentos seguintes** → o app obtém um token **silenciosamente** (`prompt: ''`) e cria/atualiza o evento no Google Agenda automaticamente, sem novos cliques.
- **Exclusão/cancelamento** → remove o evento correspondente no Google Agenda.

O `googleEventId` retornado é salvo no documento da consulta para permitir atualizações/remoções futuras.

## 2. Dependências

- **Google Identity Services** (GIS) — script externo do Google (gratuito).
- **Google Calendar API v3** — chamadas REST diretas via `fetch` (gratuita no volume esperado).
- **Google Cloud OAuth Client ID** (tipo "Aplicativo Web") — **precisa ser criado pelo usuário** no Google Cloud Console, com as *Origens JavaScript autorizadas* apontando para a URL do GitHub Pages e `http://localhost` (dev). Será o único item de configuração manual necessário.
- Firestore (já em uso) para persistir preferência de sync, `calendarId` e `googleEventId`.

## 3. Arquivos afetados

| Arquivo | Motivo |
|---|---|
| `index.html` | Incluir o `<script>` do GIS; pequenos elementos de UI (pergunta de consentimento, badge de status). |
| `google-calendar.js` (novo) | Módulo isolado: init do GIS, obtenção de token (com/sem prompt), criar/achar calendário dedicado, criar/atualizar/excluir evento. Expõe uma API em `window._gcal`. |
| `firestore-api.js` | Métodos para ler/gravar a preferência de sync (`calendarSync/{uid}`) e atualizar `googleEventId`/`syncPendente` na consulta. |
| `app.js` | Acoplar a sincronização ao `salvarConsulta` e `excluirConsulta`; fluxo de consentimento na 1ª vez; badge de status; opção "Desvincular"; processamento de pendências ao abrir o app. |
| `firestore.rules` | Regra para a nova coleção `calendarSync/{uid}` (somente o próprio usuário lê/escreve). |

## 4. Estrutura de dados

**`calendarSync/{uid}`** (nova coleção — substitui o `userTokens` da spec):
```json
{
  "enabled": true,
  "calendarId": "string (id do calendário dedicado no Google)",
  "updatedAt": "timestamp"
}
```
> Nenhum token é armazenado. O token de acesso vive apenas em memória durante a sessão.

**`profiles/{profileId}/consultations/{id}`** (campos adicionais):
```json
{
  "googleEventId": "string | null",
  "syncPendente": "boolean (true se salvou local mas falhou ao sincronizar)"
}
```

**Payload do evento** (igual ao da spec, seção 9): `summary` com nome do bebê, `location`, `description`, `start`/`end` com `timeZone: America/Sao_Paulo`; consultas sem hora viram evento de dia inteiro (`date`).

## 5. Regras de segurança e permissões

- `calendarSync/{uid}`: leitura/escrita apenas quando `request.auth.uid == uid`.
- Escopo OAuth mínimo: `calendar.events` (não dá acesso a ler outros calendários além de criar/editar eventos).
- Sem credenciais sensíveis persistidas (não há refresh token). Risco de vazamento de token reduzido ao mínimo (token efêmero, em memória).

## 6. Fluxos técnicos

### 6.1 Primeira ativação (no salvar)
1. Usuário salva uma consulta; `enabled` ainda é `false`/inexistente.
2. App pergunta: "Enviar suas consultas para o Google Agenda?" + "Sincronizar também as consultas já cadastradas?" (sim/não).
3. Se sim → `initTokenClient` + `requestAccessToken({ prompt: 'consent' })`.
4. Com o token: cria (ou localiza) o calendário dedicado "Saúde do Bebê"; salva `{ enabled:true, calendarId }` em `calendarSync/{uid}`.
5. Cria o evento da consulta atual; se o usuário escolheu, percorre o histórico e cria os eventos faltantes.

### 6.2 Salvar consulta (sync já ativa)
1. Salva no Firestore (comportamento atual, inalterado).
2. Obtém token silencioso (`prompt: ''`).
3. Se a consulta tem `googleEventId` → `PATCH` o evento; senão → `POST` cria e salva o `googleEventId`.
4. Falha de rede/token → marca `syncPendente: true` e mostra toast não-bloqueante.

### 6.3 Excluir/cancelar consulta
1. Exclui/atualiza no Firestore.
2. Se houver `googleEventId` → `DELETE` o evento no Google Agenda (404 é tratado como já removido).

### 6.4 Pendências
- Ao abrir o app com sync ativa e conexão, processa as consultas com `syncPendente: true` (best-effort, sem fila persistente complexa).

### 6.5 Desvincular
- Botão "Desvincular Google Agenda" → `enabled:false` em `calendarSync/{uid}`. Eventos já criados permanecem no Google Agenda (não são apagados retroativamente).

## 7. Impactos no sistema existente

- `salvarConsulta`/`excluirConsulta` ganham um passo extra **não-bloqueante** de sincronização (o salvamento local nunca falha por causa do Google).
- A exportação `.ics` e o link Google Agenda **permanecem** como fallback (não são removidos).
- Listeners `onSnapshot` continuam refletindo `googleEventId`/`syncPendente` normalmente.

## 8. Riscos técnicos

- **Renovação silenciosa**: na maioria das vezes funciona sem clique (sessão Google ativa). Em casos de token revogado/sessão expirada, o app precisa pedir reconsentimento (toast + ação) — tratado como caso de erro previsto.
- **Sincroniza só com o app aberto e vinculado naquele dispositivo** (limitação inerente ao client-side, aceita pelo usuário).
- **Verificação OAuth**: enquanto não verificado, aviso de "app não verificado" (aceitável para uso familiar; ver nota 0.1).
- **Fuso horário**: fixado em `America/Sao_Paulo`; revisar se houver uso fora desse fuso.

## 9. Estratégia de teste

Testes manuais:
1. Ativar sync ao salvar a 1ª consulta; aprovar consentimento; ver o evento aparecer no Google Agenda (calendário dedicado).
2. Editar a consulta e confirmar atualização do mesmo evento (não duplica).
3. Cancelar/excluir e confirmar remoção do evento.
4. Optar por sincronizar histórico e conferir criação em lote.
5. Forçar erro (sem rede) e confirmar `syncPendente` + toast; reabrir com rede e ver reprocessamento.
6. Desvincular e confirmar que novas consultas não sincronizam.
7. Recarregar a página e confirmar que a sync segue funcionando sem novo login.

## 10. Ordem recomendada de implementação

1. Configuração: criar o OAuth Client ID no Google Cloud (usuário) e registrar o `client_id` no app.
2. `google-calendar.js`: init do GIS + obtenção de token (consentimento e silencioso).
3. `google-calendar.js`: criar/localizar calendário dedicado.
4. `google-calendar.js`: criar/atualizar/excluir evento (mapeamento consulta → payload).
5. `firestore-api.js` + `firestore.rules`: coleção `calendarSync/{uid}` e campos na consulta.
6. `app.js`: fluxo de consentimento na 1ª consulta + badge de status.
7. `app.js`: acoplar sync ao salvar/excluir consulta.
8. `app.js`: opção de sincronizar histórico + processamento de pendências + desvincular.
9. Teste manual completo.
