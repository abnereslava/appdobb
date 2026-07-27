# Plano Técnico: Histórico de Medicamentos

## 1. Resumo da solução

Nova view `view-medicamentos` alimentada por uma nova subcoleção `medications` dentro de `profiles/{profileId}`, seguindo exatamente o mesmo padrão já usado por `events` e `consultations`: API em `firestore-api.js`, cache em memória alimentado por `onSnapshot`, render por função `renderizarMedicamentos()`, formulário em modal e detalhe em modal.

Conforme decidido no `spec.md` (§4 e §12), a tela **não ganha botão fixo na barra de navegação** — é alcançada pelo gesto de swipe que o app já implementa entre views (`ORDEM_VISTAS`, `app.js:2897`), com indício visual para não ficar invisível.

Três decisões técnicas centrais, todas motivadas por riscos concretos encontrados na leitura do código (detalhadas nas seções 5, 8 e 6):

1. **Reaproveitar a permissão `historico`** para a subcoleção `medications`, em vez de criar uma permissão nova — evita uma migração obrigatória em todos os documentos de `accessIndex` já existentes.
2. **Não incluir a nova subscrição no "portão" de `_cacheReady`** — evita que uma falha de leitura dos medicamentos trave o app inteiro na tela de carregamento.
3. **Lista estática de medicamentos como arquivo JS embutido** (`dados/medicamentos.js`), não `fetch` de JSON — garante offline sem depender de acerto no Service Worker.

## 2. Dependências

- Nenhuma biblioteca externa nova.
- Internos reaproveitados: `_escrita()`, `gerarId()`, `abrirModal`/`fecharModal`, `confirmar({...})`, `mostrarToast()`, `esc()`, `formatarData()`, `atualizarVistaAtiva()`, `showView()`, `animarTransicaoVista()`, `ORDEM_VISTAS`, `CORES_PERFIL`/`corDoPerfil()`, `abrirDetalheEvento()` (para o link do evento relacionado), `TIPOS_ALERGIA` (para o aviso de alergia), e toda a infraestrutura de PDF de `specs/gerador-pdf/` (`_pdfBloco`, `_pdfCampo`, `_pdfCabecalho`, `abrirExportPdf`, `gerarPdfExport`).
- Firestore: novas chamadas na subcoleção `medications` (mesmas funções do SDK já importadas em `firestore-api.js` — nenhum import novo necessário).

## 3. Arquivos afetados

| Arquivo | Motivo |
|---|---|
| `dados/medicamentos.js` | **Novo** — lista estática curada (`const MEDICAMENTOS_COMUNS = [...]`), carregada por `<script>`. |
| `index.html` | `<div id="view-medicamentos" class="view">`; `<script>` da lista; modal de formulário (`modal-medicamento-form`) e de detalhe (`modal-medicamento-detalhe`); `<datalist id="lista-medicamentos-sugestoes">`; item "Novo Medicamento" no menu do FAB. |
| `firestore-api.js` | `listarMedicamentos`, `carregarMedicamento`, `salvarMedicamento`, `excluirMedicamento`, `subscribeMedicamentos`. |
| `app.js` | Cache/estado; `ORDEM_VISTAS`; `showView`/`atualizarVistaAtiva`/`subscribeAoPerfilAtivo`; `renderizarMedicamentos()`; CRUD + formulário; detalhe; aviso de alergia; ponte a partir de `salvarEvento`; integração com o gerador de PDF. |
| `style.css` | Estilos da lista de medicamentos, badges de regime/status, indicador visual de swipe. |
| `firestore.rules` | Bloco `match /medications/{medicationId}` reutilizando a permissão `historico`. |
| `sw.js` | `./dados/medicamentos.js` em `SHELL_FILES` + bump da versão do cache. |
| `dev/diario.md` | Marcar o item 4 como concluído ao final. |

## 4. Estrutura de dados

### Documento `profiles/{profileId}/medications/{medicationId}`

```
{
  nome:                       string,   // obrigatório
  quantidade:                 number|null,
  unidade:                    string|null,   // 'mg' | 'ml' | 'comprimido' | 'gota' | 'UI' | 'mcg' | 'g' | livre
  regime:                     'continuo' | 'temporario' | 'sos',
  frequenciaValor:            number|null,   // só em 'temporario'
  frequenciaUnidade:          'horas' | 'vezesAoDia' | null,
  duracaoDias:                number|null,   // só em 'temporario'
  dataInicio:                 'YYYY-MM-DD',  // obrigatório
  dataFim:                    'YYYY-MM-DD'|null,
  dataFimEditadaManualmente:  boolean,       // trava o recálculo (spec §6)
  observacoes:                string|null,
  eventoRelacionadoId:        string|null,
  criadoEm:                   ISO string,
  updatedAt:                  serverTimestamp()
}
```

**Sem contador `medicationCount` no documento do perfil.** `events`/`consultations` mantêm contadores porque o seletor de perfis os exibe (`carregarResumosPerfis`); medicamentos não aparecem lá. Evitar o contador poupa uma escrita extra por operação e elimina a possibilidade de o número desincronizar do real.

### Estado em `app.js`

```
let medicamentosCache   = [];
let _unsubMedicamentos  = null;
let medicamentoFormTemp = {};   // regime/datas em edição, p/ recálculo de dataFim
```

### Lista estática (`dados/medicamentos.js`)

```
const MEDICAMENTOS_COMUNS = [
  { nome: 'Paracetamol' },
  { nome: 'Tylenol', ativo: 'Paracetamol' },
  ...
];
```

Conforme decidido: **lista enxuta de alta confiança** (~60–80 dos mais comuns no Brasil), priorizando precisão sobre cobertura — é dado de saúde, e um princípio ativo errado seria exibido ao usuário como verdade. A lista cresce naturalmente com o histórico do próprio perfil (ver §6). Ampliar depois a partir de fonte verificável (bulário/ANVISA) fica registrado como melhoria futura, não como parte desta entrega.

## 5. Regras de segurança e permissões

**Risco identificado e evitado (crítico).** O caminho "natural" seria criar uma permissão nova e escrever:

```
allow read: if isAdmin() || canUse(profileId, 'medicamentos', 'read');
```

Isso **quebraria para todos os usuários já existentes**. `canUse()` faz `access().data.permissions[resourceName][actionName]`, e os documentos de `accessIndex` já criados só têm as chaves `perfil`, `historico`, `agenda` e `admin` (ver `PERMISSOES_USUARIO`/`PERMISSOES_ADMIN` em `firestore-api.js:28-40`). Acessar uma chave inexistente em regra do Firestore gera erro de avaliação → acesso negado. Ou seja: sem uma migração de todos os documentos de acesso, ninguém conseguiria ler nem gravar medicamentos.

**Decisão**: reutilizar a permissão `historico`, que já existe em todo documento de acesso e é semanticamente adequada (medicamento é parte do histórico de saúde):

```
match /medications/{medicationId} {
  allow read:           if isAdmin() || canUse(profileId, 'historico', 'read');
  allow create, update: if isAdmin() || canUse(profileId, 'historico', 'write');
  allow delete:         if isAdmin() || canUse(profileId, 'historico', 'delete');
}
```

Zero migração, zero risco de usuário legado ficar de fora. Se um dia for preciso separar a permissão, aí sim se faz a migração de forma consciente e isolada.

Demais pontos: nenhuma superfície nova de exposição — os dados ficam sob o mesmo `profiles/{profileId}` já protegido por `ownProfile()`; todo texto do usuário é escapado com `esc()` na renderização; o PDF continua sendo gerado localmente.

## 6. Fluxos técnicos

### 6.1 Navegação por swipe (sem botão na nav)

- `ORDEM_VISTAS` passa de `['home','timeline','agenda','calendario']` para `['home','timeline','medicamentos','agenda','calendario']`.

  **Posição escolhida: logo após `timeline`**, não no fim. Motivos: (a) fica a 2 swipes da Home em vez de 4; (b) adjacência semântica com o Histórico de Saúde; (c) — o mais importante para a exigência de descoberta do spec — quem hoje faz swipe de `timeline` para `agenda` vai *passar por* Medicamentos e descobrir a tela naturalmente, o que transforma o gesto na principal via de descoberta em vez de depender de sorte. Custo aceito: `agenda` e `calendario` deslocam uma posição na sequência de swipe; ambas continuam a um toque de distância pelos próprios botões da nav, então ninguém fica preso.

- `showView('medicamentos')` funciona sem alteração estrutural: a função já é tolerante à ausência do botão (`if (navBtn) navBtn.classList.add('active')`, `app.js:461`).

- **Por que não simplesmente adicionar um 6º botão**: medição no CSS atual — `.bottom-nav` usa `grid-template-columns: repeat(5, 1fr)` com `max-width: 480px` e rótulo de `font-size: 9px`. Com 6 colunas, cada uma cairia para ~80px no máximo e ~60px num aparelho de 360px de largura; "Medicamentos" (12 caracteres) não cabe legível nesse espaço, e "Calendário" já é o limite hoje. A restrição de espaço do spec se confirma na prática.

- **Problema a resolver**: como não existe `#nav-medicamentos`, ao entrar na tela a barra fica com *nenhum* item destacado — o usuário perde a referência de onde está. Três medidas combinadas, todas sem custo de espaço na nav:
  1. **Porta de entrada tocável no cabeçalho do Histórico** — um botão ao lado dos que já existem lá (toggle de visualização e exportar PDF), seguindo o mesmo padrão `btn-ghost btn-sm`. Dá um caminho descobrível e acessível por toque, sem depender de o usuário conhecer o gesto, e reforça a relação semântica "Histórico de Saúde → Medicamentos".
  2. **Estado "relacionado" no `nav-timeline`** quando a view ativa for `medicamentos` — a barra deixa de ficar completamente apagada e comunica "você está na área do Histórico". Implementado como uma classe própria (`nav-btn-contexto`), visualmente mais fraca que `.active` para não mentir dizendo que se está na aba Histórico.
  3. **Cabeçalho próprio na view** com o título "Medicamentos" e um indicador de posição no swipe (pager), padrão consagrado para telas navegadas por gesto — é o "indício visual" exigido pelo spec §4.

- `showView` ganha `'medicamentos'` na guarda de `!temPerfil` (`app.js:449`), junto de timeline/agenda/calendario.

- `atualizarVistaAtiva()` (`app.js:2791`) e o dispatch de views dentro de `subscribeAoPerfilAtivo` (`app.js:374-378`, `396-399`) ganham o caso `view-medicamentos`.

### 6.2 Carga de dados — e por que ela NÃO entra no portão de `_cacheReady`

`subscribeAoPerfilAtivo` hoje só libera a renderização quando as três subscrições chegam (`_perfilPronto && _eventosPronto && _consultasPronto`, `app.js:369-379`). Acrescentar um quarto flag obrigatório significa que **qualquer** falha na leitura de `medications` (regra mal publicada, índice, erro transitório) deixaria `_cacheReady` eternamente `false` — e, como o app mostra spinner enquanto `!_cacheReady`, o app **inteiro** ficaria travado carregando, inclusive Histórico e Agenda, por causa de uma feature nova.

**Decisão**: `_unsubMedicamentos` é registrada normalmente e atualiza `medicamentosCache`, mas **fora** da condição de `_aoCarregarTudo()`. A view de medicamentos exibe seu próprio estado de carregamento local até os dados chegarem. Assim, a feature nova nunca pode derrubar o que já funciona — princípio que vale a pena manter para qualquer subscrição futura.

### 6.3 Formulário e recálculo de `dataFim`

- Campos revelados conforme o regime: `temporario` mostra frequência + duração; `continuo` e `sos` escondem ambos.
- `_recalcularDataFim()`: se `regime === 'temporario'` **e** `dataFimEditadaManualmente === false`, calcula `dataFim = dataInicio + duracaoDias` (via `Date` em UTC para não sofrer com fuso) e escreve no campo. Qualquer edição manual do campo de data de fim (ou o botão "Encerrar uso hoje") seta `dataFimEditadaManualmente = true`, e a partir daí mudanças em frequência/duração não sobrescrevem mais o valor — regra do spec §6.
- Validação de data reaproveita o padrão do formulário de evento (mínimo derivado da data de nascimento, `app.js:1979-1991`).
- Autocomplete: `<input list="lista-medicamentos-sugestoes">` + `<datalist>` preenchido pela união de `MEDICAMENTOS_COMUNS` (exibindo `Nome (Princípio ativo)`) com os nomes já usados no `medicamentosCache` do perfil, deduplicados. Entrada livre continua valendo, que é o comportamento nativo do `datalist`.

### 6.4 Aviso de alergia

Ao sair do campo de nome (e na submissão), compara o nome normalizado (minúsculas, sem acentos via `normalize('NFD')`) com `perfil.alergias` filtradas por `tipo === 'medicamentosa'`, testando conter em ambos os sentidos. Havendo correspondência, exibe um aviso inline no formulário. **Nunca bloqueia o salvamento** — é informativo, conforme spec §6.

### 6.5 Ponte a partir de `evento.medicamentos[]`

Em `salvarEvento()` (`app.js:2031`), após o sucesso da gravação e apenas quando o evento tiver itens em `medicamentos[]`, dispara `confirmar({...})` oferecendo registrar no histórico. Aceitando, abre o formulário de medicamento pré-preenchido com o nome (o primeiro item, ou um por vez) e `eventoRelacionadoId` já apontando para o evento recém-salvo. Recusando, nada acontece. O fluxo atual de salvar evento não muda em nada quando não há medicamentos.

### 6.6 Detalhe e vínculo com evento

O modal de detalhe mostra os campos preenchidos e, havendo `eventoRelacionadoId`, um botão que chama `abrirDetalheEvento(id)`. Como o evento pode ter sido excluído depois (spec §10), a existência é verificada antes de oferecer o link — `carregarEvento` devolve `null` e nesse caso o botão simplesmente não é renderizado, sem erro.

### 6.7 Exportação em PDF

Estende o modal existente com um terceiro contexto (`_pdfContexto === 'medicamentos'`), reaproveitando `_pdfBloco`/`_pdfCampo`/`_pdfCabecalho`.

Dois pontos de atenção reais na integração:

- `_pdfItensSelecionados()` filtra e ordena por `x.data`, campo que **não existe** em medicamento (que tem `dataInicio`/`dataFim`). É preciso generalizar o acessor de data por contexto, senão o filtro de período silenciosamente não casa nada e a ordenação quebra.
- A lista de seleção do modal hoje assume categorias de evento ou tipos de consulta. Para medicamentos, os "filtros" naturais são o **regime** (contínuo / por tempo determinado / SOS) e o **status** (em uso / encerrado).

Conforme o spec §6, essa integração entra como uma **iteração nova do `specs/gerador-pdf/`** (com seu próprio registro em spec/plan/tasks/review daquele feature), não como mudança silenciosa naquele código.

## 7. Impactos no sistema existente

- **Sequência de swipe muda**: `agenda` e `calendario` deslocam uma posição. Nenhuma delas fica inacessível (ambas têm botão na nav).
- **`salvarEvento` ganha um passo opcional** ao final, só quando há medicamentos no evento.
- **Uma subscrição a mais por perfil ativo** (custo de leitura do Firestore proporcional ao nº de medicamentos, tipicamente pequeno).
- `evento.medicamentos[]`, `eventCount`, `consultationCount` e o seletor de perfis: **inalterados**.
- `index.html` cresce com os dois modais novos; `sw.js` precisa de bump de cache (conflito recorrente em merge — manter sempre a versão maior).

## 8. Riscos técnicos

| Risco | Mitigação |
|---|---|
| **Permissão nova quebraria usuários existentes** (§5) | Reutilizar `historico`; nenhuma migração. |
| **4ª subscrição travando o app inteiro no spinner** (§6.2) | Manter `medications` fora do portão de `_cacheReady`. |
| **Lista de medicamentos com dado incorreto** (risco de saúde) | Lista enxuta só com itens de alta confiança; ampliação futura só a partir de fonte verificável. |
| **Descoberta da tela** (sem botão na nav, por decisão do spec) | Posição no meio da sequência de swipe (§6.1) + indicador de pager + título na view. Continua sendo o ponto mais frágil da feature — vale reavaliar após uso real. |
| Fuso horário no cálculo de `dataFim` | Aritmética em UTC (`Date.UTC`), como já se faz ao comparar datas `YYYY-MM-DD` como string no restante do app. |
| Filtro de período do PDF não casar nada em medicamentos (§6.7) | Generalizar o acessor de data por contexto e testar explicitamente o caso. |
| Regra de segurança publicada depois do deploy do front | Publicar `firestore.rules` **antes** de liberar a feature, senão a tela abre vazia com erro no console. |

## 9. Estratégia de teste

Automatizado/local, no espírito do que já foi feito no gerador de PDF (Chromium real via Playwright disponível no ambiente, `NODE_PATH=/opt/node22/lib/node_modules`, executável em `/opt/pw-browsers/chromium`):

1. `node --check app.js` após cada tarefa.
2. Lógica pura, testável sem Firebase: cálculo de `dataFim` (incluindo virada de mês/ano e fevereiro), a trava de `dataFimEditadaManualmente`, a classificação "em uso" × "encerrado" nos três regimes, e o casamento do aviso de alergia (com acento, maiúsculas, substring).
3. Navegação: confirmar que `ORDEM_VISTAS` leva a `medicamentos` nos dois sentidos e que nenhuma view fica inalcançável.
4. Renderização da lista com `medicamentosCache` populado por stub — incluindo lista vazia e `eventoRelacionadoId` órfão (evento excluído).
5. Cenário de regressão específico do risco §6.2: simular falha na subscrição de medicamentos e confirmar que Histórico/Agenda continuam carregando normalmente.
6. Manual no dispositivo (pendência recorrente do projeto): gesto de swipe real, teclado do `datalist` no mobile, e o PDF.

## 10. Ordem recomendada de implementação

1. **Tarefa 1** — Regra de segurança (`firestore.rules`) + API (`firestore-api.js`). Base de tudo; publicar a regra antes do resto.
2. **Tarefa 2** — Cache/subscrição em `app.js` (fora do portão de `_cacheReady`) + view vazia + entrada no `ORDEM_VISTAS`/`showView`/`atualizarVistaAtiva`, com o indicador visual.
3. **Tarefa 3** — Lista estática (`dados/medicamentos.js`) + `sw.js` + `<datalist>`.
4. **Tarefa 4** — Formulário (CRUD): regimes, recálculo travável de `dataFim`, autocomplete, aviso de alergia.
5. **Tarefa 5** — Lista renderizada (em uso × encerrados) + modal de detalhe + "Encerrar uso hoje" + link para o evento relacionado.
6. **Tarefa 6** — Ponte a partir de `salvarEvento`.
7. **Tarefa 7** — `review.md` + `dev/diario.md` (item 4).
8. **Depois, como iteração própria de `specs/gerador-pdf/`** — exportação em PDF da tela de Medicamentos (§6.7).
