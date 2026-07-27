# Tarefas: Histórico de Medicamentos

## Visão geral

Sete tarefas sequenciais, da base para a superfície: regra de segurança + API, depois cache/navegação, lista estática, formulário, lista/detalhe, ponte com eventos e fechamento. A exportação em PDF **não** está aqui — por decisão do `spec.md` §6, ela entra como iteração própria de `specs/gerador-pdf/` depois que esta feature estiver pronta.

Cada tarefa é implementável e testável isoladamente. Regra do projeto: uma tarefa por vez, marcando o status ao concluir.

## Tarefa 1 — Regra de segurança + API do Firestore

Status: Pendente

### Objetivo

Permitir ler/gravar a subcoleção `medications` com segurança, sem exigir migração dos documentos de acesso existentes.

### Arquivos afetados

- `firestore.rules` (bloco `match /medications/{medicationId}` reutilizando a permissão `historico`)
- `firestore-api.js` (`listarMedicamentos`, `carregarMedicamento`, `salvarMedicamento`, `excluirMedicamento`, `subscribeMedicamentos`)

### Dependências

Nenhuma.

### Critério de conclusão

Regra publicada; `window._db.salvarMedicamento(...)` e `window._db.listarMedicamentos(...)` funcionam pelo console num perfil real, e um usuário **não** admin (permissão `historico` padrão) consegue ler e gravar.

### Teste manual

Pelo console do app logado: gravar um medicamento de teste, listar, carregar por id e excluir. Confirmar no Firebase Console que o documento nasce em `profiles/<id>/medications/`.

### Observações

**Não criar uma permissão `medicamentos` nova** — `canUse()` acessa `permissions[recurso][acao]`, e essa chave não existe nos documentos de `accessIndex` já criados; a regra erraria e negaria acesso a todos os usuários atuais (ver `plan.md` §5). Publicar a regra **antes** de liberar a interface. Sem contador `medicationCount` no perfil (justificativa no `plan.md` §4).

## Tarefa 2 — Cache, subscrição e navegação por swipe

Status: Pendente

### Objetivo

Criar a view `view-medicamentos`, colocá-la na sequência de swipe e mantê-la alimentada em tempo real — sem que uma falha nessa subscrição possa travar o resto do app.

### Arquivos afetados

- `index.html` (`<div id="view-medicamentos" class="view">`)
- `app.js` (`medicamentosCache`, `_unsubMedicamentos`, `_unsubscribeAll`, `subscribeAoPerfilAtivo`, `ORDEM_VISTAS`, `showView`, `atualizarVistaAtiva`)
- `style.css` (indicador visual de posição/pager e cabeçalho da view)

### Dependências

Tarefa 1.

### Critério de conclusão

Swipe a partir do Histórico chega em Medicamentos (e volta); a view mostra estado de carregamento e depois a lista crua dos dados; `showView('medicamentos')` respeita a guarda de "crie um perfil primeiro"; nenhuma outra view fica inalcançável.

### Teste manual

Percorrer toda a sequência de swipe nos dois sentidos (`home ↔ timeline ↔ medicamentos ↔ agenda ↔ calendario`); conferir que Agenda e Calendário continuam acessíveis pelos botões; entrar na tela e confirmar que o indicador visual mostra onde se está.

### Observações

`ORDEM_VISTAS` recebe `'medicamentos'` **após `'timeline'`** (justificativa de descoberta no `plan.md` §6.1). A subscrição fica **fora** da condição de `_aoCarregarTudo()`/`_cacheReady` — incluí-la ali faria qualquer erro de leitura travar o app inteiro no spinner (`plan.md` §6.2). Como não há `#nav-medicamentos`, nenhum botão da nav fica destacado nessa tela: por isso a view precisa do próprio cabeçalho com título + indicador.

## Tarefa 3 — Lista estática de medicamentos + autocomplete

Status: Pendente

### Objetivo

Disponibilizar a base de sugestões de nomes, funcionando offline.

### Arquivos afetados

- `dados/medicamentos.js` (novo — `const MEDICAMENTOS_COMUNS = [...]`)
- `index.html` (`<script src="./dados/medicamentos.js">` + `<datalist id="lista-medicamentos-sugestoes">`)
- `sw.js` (adicionar ao `SHELL_FILES` + bump de versão do cache)
- `app.js` (função que popula o `datalist` unindo a lista estática com os nomes já usados no perfil)

### Dependências

Tarefa 2 (para ter `medicamentosCache` de onde tirar os nomes já usados).

### Critério de conclusão

`MEDICAMENTOS_COMUNS` disponível no console; `datalist` populado com a união (estática + histórico do perfil), sem duplicatas; arquivo presente no Cache Storage do Service Worker.

### Teste manual

Abrir o formulário, digitar duas ou três letras e ver as sugestões; cadastrar um nome fora da lista e conferir que ele passa a ser sugerido depois; testar offline após um carregamento online.

### Observações

Lista **enxuta e de alta confiança** (~60–80 itens), não exaustiva: é dado de saúde, e um princípio ativo errado apareceria ao usuário como verdade. Formato `{ nome, ativo? }`, exibido como `Nome (Princípio ativo)`. Caminho relativo (`./dados/...`) por causa do subpath do GitHub Pages. Arquivo JS carregado por `<script>`, não `fetch` de JSON — garante offline sem depender de acerto na estratégia do SW.

## Tarefa 4 — Formulário de medicamento (criar/editar)

Status: Pendente

### Objetivo

Cadastrar e editar medicamentos com os três regimes de uso, recálculo travável da data de fim, autocomplete e aviso de alergia.

### Arquivos afetados

- `index.html` (`modal-medicamento-form`)
- `app.js` (`abrirFormMedicamento`, `salvarMedicamento`, `_recalcularDataFim`, alternância de campos por regime, `_verificarAlergiaMedicamento`)
- `style.css` (campos condicionais e aviso de alergia)

### Dependências

Tarefas 1–3.

### Critério de conclusão

Cria e edita medicamentos nos três regimes; em `temporario`, a data de fim é sugerida a partir de início + duração e **para** de ser recalculada assim que editada à mão; nome que bate com alergia "Medicamentosa" do perfil dispara aviso sem bloquear o salvamento.

### Teste manual

Cadastrar um contínuo (vitamina), um temporário (antibiótico 8/8h por 7 dias — conferir a data de fim sugerida) e um SOS (analgésico); editar a data de fim à mão, depois mudar a duração e confirmar que a data editada **não** é sobrescrita; cadastrar um medicamento com nome de uma alergia registrada e conferir o aviso.

### Observações

Aritmética de data em UTC para não errar por fuso. Validação de data mínima reaproveita o padrão do formulário de evento (`app.js:1979-1991`). Comparação de alergia normalizando acentos e caixa, testando substring nos dois sentidos.

## Tarefa 5 — Lista, detalhe e "Encerrar uso hoje"

Status: Pendente

### Objetivo

Renderizar a lista separando em uso × encerrados, com modal de detalhe, encerramento em um toque e link para o evento relacionado.

### Arquivos afetados

- `index.html` (`modal-medicamento-detalhe`)
- `app.js` (`renderizarMedicamentos`, `abrirDetalheMedicamento`, `encerrarUsoHoje`, `excluirMedicamentoConfirmado`)
- `style.css` (cartões, badges de regime e de status)

### Dependências

Tarefa 4.

### Critério de conclusão

Lista distingue "em uso" de "encerrado" corretamente nos três regimes (incluindo temporário com data de fim já vencida, que conta como encerrado mesmo sem ação manual); detalhe abre com os campos preenchidos; "Encerrar uso hoje" preenche a data de fim e marca a trava; link do evento relacionado abre o detalhe do evento.

### Teste manual

Com medicamentos nos três regimes e um temporário já vencido, conferir a separação da lista; encerrar um contínuo pelo botão; abrir um medicamento vinculado a um evento e seguir o link; excluir o evento vinculado e reabrir o medicamento — deve continuar funcionando, só sem o link.

### Observações

Verificar a existência do evento antes de oferecer o link (`carregarEvento` devolve `null` para evento excluído — spec §10). "Encerrar uso hoje" é idempotente, inclusive em temporário já vencido. Estado vazio seguindo o padrão do Histórico/Agenda.

## Tarefa 6 — Ponte a partir de `evento.medicamentos[]`

Status: Pendente

### Objetivo

Oferecer, ao salvar um evento que tenha medicamentos, o atalho opcional para registrá-los também no histórico de medicamentos.

### Arquivos afetados

- `app.js` (`salvarEvento` — passo opcional ao final)

### Dependências

Tarefa 4.

### Critério de conclusão

Salvar um evento com medicamentos oferece o atalho; aceitando, abre o formulário pré-preenchido com nome e `eventoRelacionadoId`; recusando, nada muda. Salvar evento **sem** medicamentos mantém o fluxo atual idêntico.

### Teste manual

Salvar evento com um medicamento e aceitar o atalho (conferir pré-preenchimento e vínculo); repetir recusando; salvar um evento sem medicamentos e confirmar que nada mudou no fluxo.

### Observações

Não alterar o comportamento existente de `evento.medicamentos[]` (sem migração — spec §11). O atalho é oferecido só após a gravação bem-sucedida, para não atrapalhar o salvamento em caso de erro.

## Tarefa 7 — Revisão e fechamento

Status: Pendente

### Objetivo

Registrar a revisão da implementação e atualizar o diário do projeto.

### Arquivos afetados

- `specs/historico-medicamentos/review.md` (novo)
- `dev/diario.md` (item 4)

### Dependências

Tarefas 1–6.

### Critério de conclusão

`review.md` comparando o implementado com spec/plan/tasks, com critérios de aceite marcados, pendências e riscos; item 4 do diário atualizado.

### Teste manual

N/A (documentação).

### Observações

Registrar explicitamente as pendências de teste em dispositivo real e o ponto frágil conhecido (descoberta da tela sem botão na nav), para reavaliação após uso.
