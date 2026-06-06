# Especificação: Cache em tempo real e sincronização entre dispositivos

> **Nota:** esta especificação foi criada **retroativamente** após a implementação,
> para documentar uma mudança arquitetural significativa conforme exige `docs/AGENTS.md`.
> O conteúdo descreve fielmente a solução implementada no commit
> `feat: substitui getDocs por onSnapshot com persistentLocalCache`.

## 1. Objetivo

Eliminar o consumo excessivo de leituras do Firestore e habilitar a sincronização em tempo real entre múltiplos dispositivos logados na mesma conta. Antes, cada troca de aba relia os dados do banco; agora os dados são carregados uma vez por listener em tempo real e reaproveitados em memória, com atualização automática quando outro dispositivo altera algo.

## 2. Contexto

O app armazena perfil, eventos e consultas no Firestore. A implementação anterior usava `getDocs` (leitura pontual) em cada renderização de aba:

- **Histórico** e **Agenda**: recarregavam via paginação por cursor (`limit(20)` + `startAfter`) a cada visita à aba.
- **Calendário**: lia as coleções **inteiras** (`listarEventos` + `listarConsultas`) toda vez que era aberto.

Resultado: alternar entre abas consumia leituras repetidamente, e não havia qualquer sincronização entre dispositivos — uma alteração feita no dispositivo A só aparecia no dispositivo B após uma releitura manual.

## 3. Usuários envolvidos

- Responsável pelo bebê (usuário autenticado), especialmente quando usa o app em mais de um dispositivo (ex.: pai e mãe, ou celular + tablet) na mesma conta.

## 4. Funcionamento esperado

- Ao entrar no app (ou trocar de bebê), o app abre listeners em tempo real para perfil, eventos e consultas do bebê ativo.
- Trocar de aba **não gera nenhuma leitura** ao Firestore: a renderização usa os dados já em memória.
- Quando o usuário cria, edita ou exclui algo, a mudança aparece **imediatamente** (otimisticamente, via cache local do SDK).
- Quando **outro dispositivo** logado na mesma conta altera um dado, a mudança chega ao dispositivo atual **em tempo real**, sem ação do usuário.
- Ao reabrir o app numa nova sessão, os dados são servidos do cache local em disco (IndexedDB) e apenas as diferenças desde o último acesso são buscadas no servidor.

## 5. Fluxo principal

1. Usuário faz login → `subscribeAoPerfilAtivo(profileId)` ativa 3 listeners (`onSnapshot`).
2. Os três listeners disparam pela primeira vez → o cache fica pronto (`_cacheReady`) → a tela renderiza.
3. Usuário navega entre Perfil / Histórico / Agenda / Calendário → render a partir do cache, 0 leituras.
4. Usuário (ou outro dispositivo) salva uma consulta → o listener correspondente dispara → a aba ativa é re-renderizada automaticamente.
5. Usuário troca de bebê → listeners antigos são cancelados, novos são abertos para o novo bebê.
6. Usuário sai (logout) → todos os listeners são cancelados e o cache é limpo.

## 6. Regras de negócio

- Os listeners ativos correspondem sempre ao **bebê ativo** (`profileIdAtivo`). Apenas um bebê tem listeners de cada vez.
- A primeira renderização das abas só ocorre quando os três listeners (perfil, eventos, consultas) já trouxeram dados ao menos uma vez.
- Os filtros (intervalo de data, categoria, busca de texto) são aplicados **em memória**, não geram queries.
- As operações de **escrita** (gravar/excluir perfil, evento, consulta) permanecem inalteradas; o listener reflete a mudança automaticamente.
- O seletor de outros bebês (`carregarResumosPerfis`) continua sendo uma leitura pontual sob demanda (não usa listener).

## 7. Permissões

- Sem mudança de permissões. Os listeners operam sob as mesmas regras de segurança do Firestore já existentes (`firestore.rules`), restritas ao usuário autorizado.

## 8. Dados necessários

- Nenhuma mudança no modelo de dados. As mesmas coleções são lidas:
  - `profiles/{profileId}` (perfil)
  - `profiles/{profileId}/events` (eventos)
  - `profiles/{profileId}/consultations` (consultas)
- Novo estado **apenas em memória** (não persiste no Firestore): `_perfilCache`, `eventosCache`, `consultasCache`, `_cacheReady` e os handles de cancelamento dos listeners.

## 9. Estados e mensagens

| Estado | Comportamento |
|---|---|
| Carregando (cache não pronto) | Cada view mostra spinner (`carregando-view`) até `_cacheReady` |
| Cache pronto | Render normal da aba ativa |
| Mudança recebida (local ou remota) | A aba ativa é re-renderizada automaticamente |
| Troca de bebê | Cache limpo + spinner até os novos listeners responderem |
| Logout | Listeners cancelados, cache zerado |

## 10. Casos extremos

- **Sem internet na primeira abertura**: o `persistentLocalCache` serve os últimos dados conhecidos do IndexedDB; ao voltar a conexão, o listener sincroniza os deltas.
- **Troca rápida de bebê**: `_unsubscribeAll()` é chamado antes de abrir os novos listeners, evitando listeners órfãos e vazamento de memória.
- **Escrita offline**: o SDK aplica a mudança no cache local imediatamente e envia ao servidor quando a conexão voltar.
- **Múltiplas abas do navegador**: `persistentLocalCache` padrão suporta uma aba primária; abas adicionais compartilham o cache via gerenciamento interno do SDK.

## 11. Critérios de aceite

- [x] Trocar de aba não dispara leituras ao Firestore (dados vêm do cache em memória).
- [x] Uma alteração feita em outro dispositivo aparece automaticamente em tempo real.
- [x] O app abre e funciona offline servindo dados do cache local (IndexedDB).
- [x] Criar/editar/excluir reflete imediatamente na aba ativa.
- [x] Troca de bebê cancela os listeners antigos e abre os do novo bebê.
- [x] Logout cancela todos os listeners e limpa o cache.
- [x] Filtros de data, categoria e busca continuam funcionando (agora em memória).

## 12. Dúvidas pendentes

- [Inferência] Para o volume de dados de um app de saúde de bebê (dezenas a poucas centenas de documentos por bebê), ouvir a subcoleção inteira é seguro e simples. Caso um bebê acumule milhares de eventos no futuro, pode ser necessário reintroduzir uma janela/limite no listener — não previsto neste MVP.
