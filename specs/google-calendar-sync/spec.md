# Especificação: Sincronização com Google Calendar

## 1. Objetivo

Substituir a exportação manual de `.ics` por uma integração real com o Google Calendar: o usuário vincula sua conta Google e, a partir daí, consultas criadas/editadas/canceladas no app são automaticamente criadas/atualizadas/removidas no Google Agenda (e vice-versa, se viável).

## 2. Contexto

Atualmente o app oferece:
- Exportação de arquivo `.ics` (importação manual no Google Agenda)
- Link direto `calendar.google.com/render?action=TEMPLATE&...` para criar evento avulso

Ambas as opções exigem ação manual do usuário a cada mudança. Esta feature cria um canal de sincronização persistente usando a Google Calendar API v3 via OAuth 2.0.

## 3. Usuários envolvidos

- Responsável pelo bebê (usuário autenticado no app com conta Google via Firebase Auth).

### Nota sobre as duas telas de consentimento

Há duas telas distintas:
- **Tela de opt-in do app** (criada por nós, *antes* do Google): explica que a sincronização é **unidirecional (app → Google Agenda)** com um apoio visual/ilustração, e permite ao usuário **escolher o que sincronizar** (só consultas, só eventos do histórico, ou ambos).
- **Tela oficial do Google** (controlada pelo Google): pede a autorização do escopo `calendar.events`. Não é customizável além de nome/logo do app; aparece **depois** do opt-in do app.

## 4. Funcionamento esperado

### Vinculação (setup, acoplada ao salvar)

1. Ao salvar a primeira consulta/evento com a sincronização ainda inativa, o app exibe a **tela de opt-in**:
   - Ilustração indicando o sentido **app → Google Agenda** (e deixando claro que o inverso não ocorre).
   - Seleção do que sincronizar: **só consultas**, **só eventos**, ou **ambos**.
   - Opção de sincronizar também os itens já cadastrados (histórico).
2. Se o usuário confirma, o app solicita a autorização OAuth (`calendar.events`) na tela do Google.
3. O usuário aprova; o app obtém um token de acesso (de curta duração, em memória).
4. O app cria/localiza um calendário dedicado e grava a preferência (`enabled` + tipos escolhidos).
5. Uma confirmação visual (badge) indica que o Google Agenda está vinculado.

### Sincronização de itens

Conforme os tipos escolhidos pelo usuário (consultas e/ou eventos):
- **Criar item** → evento criado no Google Agenda com título, data, hora (quando houver), local e descrição.
- **Editar item** → evento existente atualizado via `PATCH`.
- **Cancelar/excluir item** → evento removido do Google Agenda.
- O app armazena o `googleEventId` retornado pela API junto com o item (consulta ou evento) no Firestore, para identificar o evento nas operações futuras.

### Desvinculação

- Botão "Desvincular Google Agenda" nas configurações.
- Remove o token salvo; futuros eventos não são mais sincronizados.
- Eventos já criados no Google Agenda permanecem (não são deletados retroativamente).

## 5. Fluxo principal — primeira vinculação

1. Usuário toca em "Vincular Google Agenda".
2. App abre popup/redirect OAuth com escopo `calendar.events`.
3. Usuário aprova.
4. App recebe tokens e salva `googleCalendarToken` no Firestore (campo do perfil do usuário, não do bebê).
5. App exibe badge "Google Agenda vinculado ✓".
6. As próximas consultas criadas/editadas são automaticamente sincronizadas.

## 6. Fluxo principal — sincronização ao criar consulta

1. Usuário salva nova consulta no app.
2. App salva no Firestore normalmente.
3. Se Google Calendar estiver vinculado: chama `POST /calendar/v3/calendars/primary/events`.
4. Armazena o `id` retornado como `googleEventId` no documento da consulta no Firestore.
5. Nenhuma mensagem extra ao usuário (processo transparente). Em caso de erro de sync, exibe toast de aviso não-bloqueante: "Salvo localmente. Falha ao sincronizar com Google Agenda."

## 7. Regras de negócio

- O usuário escolhe **o que** sincronizar: **só consultas**, **só eventos** do Histórico de Saúde, ou **ambos**. A escolha é feita na tela de opt-in e pode ser alterada depois nas configurações.
- Apenas os tipos habilitados são sincronizados; itens do tipo desabilitado são ignorados.
- Consultas canceladas disparam remoção do evento no Google Agenda. Eventos/consultas excluídos no app também removem o evento correspondente.
- A sincronização é **unidirecional neste MVP**: app → Google Agenda. Eventos criados direto no Google Agenda não aparecem no app.
- O Google Calendar vinculado é sempre o `primary` do usuário (sem seleção de calendário personalizado neste MVP).
- O token OAuth é armazenado no Firestore vinculado ao `uid` do usuário (não ao perfil do bebê), pois um usuário pode ter múltiplos bebês mas uma única conta Google.
- Consultas de outros bebês do mesmo usuário também são sincronizadas no mesmo calendário Google (distinguidas pelo nome do bebê no título do evento: "Consulta - [Nome do Bebê] - Pediatra").
- Se o `googleEventId` não existir numa consulta já criada (consultas anteriores à vinculação), ao editar ou cancelar, o app tenta criar o evento no Google Agenda e salva o `googleEventId`.

## 8. Permissões e segurança

- Escopo OAuth mínimo: `https://www.googleapis.com/auth/calendar.events` (acesso apenas a eventos, não ao calendário completo).
- O access token deve ser armazenado de forma segura no Firestore, associado ao `uid` do usuário, não exposto ao cliente diretamente.
- O refresh token deve ser trocado por um novo access token server-side (via Firebase Cloud Functions) para evitar exposição de credentials no client.
- [Pendente] Definir se a renovação do token é feita via Cloud Function (server-side, mais seguro) ou diretamente no client (mais simples, menos seguro).

## 9. Dados necessários

### Novos campos no Firestore

**`userTokens/{uid}`** (nova coleção):
```json
{
  "googleAccessToken": "string",
  "googleRefreshToken": "string",
  "googleTokenExpiry": "timestamp",
  "googleCalendarConnected": true
}
```

**`profiles/{profileId}/consultations/{id}`** (campo adicional):
```json
{
  "googleEventId": "string | null"
}
```

### Google Calendar Event (payload enviado)

```json
{
  "summary": "[Tipo] - [Médico] ([Nome do Bebê])",
  "location": "[Local]",
  "description": "[Observações]",
  "start": { "dateTime": "YYYY-MM-DDTHH:mm:ss", "timeZone": "America/Sao_Paulo" },
  "end":   { "dateTime": "YYYY-MM-DDTHH:mm:ss", "timeZone": "America/Sao_Paulo" }
}
```
Consultas sem hora: usar `"date": "YYYY-MM-DD"` (evento de dia inteiro).

## 10. Estados e mensagens

| Estado | Comportamento |
|---|---|
| Google Agenda vinculado | Badge verde no cabeçalho do Calendário; botão vira "Desvincular" |
| Não vinculado | Botão "Vincular Google Agenda" visível |
| Erro de sincronização (rede) | Toast não-bloqueante: "Salvo. Falha ao sincronizar com Google Agenda." |
| Token expirado / revogado | Toast: "Sincronização pausada. Reconecte o Google Agenda." + botão de re-vincular |
| Sincronizando | Ícone de loading junto ao badge |

## 11. Casos extremos

- Usuário revoga o acesso no painel Google: próxima chamada à API retorna 401 → app detecta, limpa o token e exibe aviso.
- Usuário tem múltiplos bebês: título do evento inclui o nome do bebê para diferenciação.
- Evento no Google Agenda deletado manualmente pelo usuário: `googleEventId` permanece no Firestore; ao editar a consulta, a chamada `PATCH` retorna 404 → app cria um novo evento e atualiza o `googleEventId`.
- Sem internet ao criar consulta: salva no Firestore; sincroniza com Google Agenda na próxima abertura do app com internet (fila de sincronização pendente).
- [Pendente] A fila de sincronização offline não está especificada em detalhe — avaliar se é necessária no MVP ou se basta sync best-effort.

## 12. Critérios de aceite

- [ ] A tela de opt-in do app aparece antes da autorização, com apoio visual indicando o sentido **app → Google Agenda** (e que o inverso não ocorre).
- [ ] Na tela de opt-in o usuário escolhe o que sincronizar: só consultas, só eventos, ou ambos.
- [ ] A escolha de tipos pode ser revista depois nas configurações.
- [ ] Fluxo OAuth completo funciona (opt-in → consentimento Google → badge confirmado).
- [ ] Item de um tipo habilitado, ao ser criado no app, aparece automaticamente no Google Agenda.
- [ ] Item editado no app atualiza o evento correspondente no Google Agenda.
- [ ] Item cancelado ou excluído remove o evento do Google Agenda.
- [ ] Item de um tipo **não** habilitado não é sincronizado.
- [ ] `googleEventId` é salvo no Firestore junto com o item (consulta ou evento).
- [ ] Erro de sync exibe toast não-bloqueante sem impedir o salvamento local.
- [ ] Botão "Desvincular" para a sincronização (eventos já criados permanecem).
- [ ] Token expirado/revogado dispara aviso e opção de reconectar.
- [ ] A exportação `.ics` e o link Google Agenda permanecem disponíveis como fallback.

## 13. Dúvidas respondidas

- [Respondida] A renovação do OAuth token deve ser feita via Firebase Cloud Function (server-side) ou diretamente no client? Cloud Function é mais seguro mas adiciona infraestrutura. - Não entendo sobre isso, faça o que você compreender que é melhor e me avise (evidenciando o que você fez) após a implementação 
- [Respondida] Sincronização bidirecional (Google Agenda → app) é desejada no MVP ou apenas em versão futura? - Quero que o app envie para o calendário e não o inverso
- [Respondida] Qual calendário usar: `primary` (padrão) ou permitir ao usuário escolher/criar um calendário dedicado "Saúde do Bebê"? - Escolher/criar (não usar primary por padrão)
- [Respondida] Fila de sync offline: implementar no MVP ou apenas sync best-effort (sem retry)? - O que você considerar melhor (me avise e explique após implementação)
- [Respondida] Sincronizar apenas consultas futuras ou também o histórico de consultas já realizadas? - Deixe isso à escolha do usuário.
