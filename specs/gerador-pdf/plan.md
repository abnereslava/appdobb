# Plano Técnico: Gerador de PDF (Relatório de Saúde)

## 1. Resumo da solução

Dois botões de exportação — um no cabeçalho do Histórico, outro no da Agenda — abrem um modal de configuração (categorias/tipos + nível de detalhamento). Ao confirmar, uma função `gerarPdfExport()` monta o documento com a biblioteca **jsPDF** inteiramente no front-end, usando os caches em memória já existentes (`_perfilCache`, `eventosCache`, `consultasCache`) e a foto local do perfil (IndexedDB), e dispara o download do arquivo `.pdf`.

**Decisão de entrega da dependência**: em vez de carregar o jsPDF de um CDN em runtime (como cogitado no spec), a biblioteca é **vendorizada localmente** em `lib/jspdf.umd.min.js` (UMD build 2.5.2, ~357 KB, licença MIT). Motivos: (a) fica same-origin, então o Service Worker a precacheia via `SHELL_FILES` sem tratamento especial de CORS/origem externa; (b) elimina o risco de o CDN estar fora do ar/bloqueado na primeira visita; (c) mantém o princípio do app de funcionar offline de forma previsível. O spec é atendido no requisito essencial (jsPDF + offline); a mudança é apenas no mecanismo de entrega.

## 2. Dependências

- **jsPDF 2.5.2** (UMD, `window.jspdf.jsPDF`) — nova dependência, vendorizada em `lib/`.
- Internos: `_perfilCache`/`carregarPerfil()`, `eventosCache`, `consultasCache`, `buscarAvatarLocal(profileId)` (IndexedDB), `calcularIdade()`, `formatarData()`, `formatarDinheiro()`, `CATEGORIAS`, `TIPOS_CONSULTA`, `TIPOS_ALERGIA`, `SEVERIDADES`, sistema de modais (`abrirModal`/`fecharModal`), `mostrarToast()`.
- Nenhuma chamada nova ao Firestore.

## 3. Arquivos afetados

| Arquivo | Motivo |
|---|---|
| `lib/jspdf.umd.min.js` | **Novo** — biblioteca jsPDF vendorizada. |
| `index.html` | `<script>` do jsPDF (defer) + markup do modal `modal-export-pdf`. |
| `app.js` | Estado do modal de exportação, funções de abertura/toggle/confirmação, builder do PDF (cabeçalho + corpo + quebras de página), botões nos cabeçalhos do Histórico e da Agenda. |
| `style.css` | Estilos do modal de exportação (reutilizando ao máximo `filtro-cat-item` etc.) e do seletor de nível. |
| `sw.js` | Adicionar `./lib/jspdf.umd.min.js` ao `SHELL_FILES`; bump da versão do cache. |
| `dev/diario.md` | Marcar item 3 como concluído ao final. |

## 4. Estrutura de dados

Estado em `app.js` (módulo, não persistido):

```
let _pdfContexto  = null;   // 'eventos' | 'consultas' — qual aba disparou
let _pdfCatsTemp  = [];     // categorias/tipos selecionados no modal
let _pdfNivel     = 'detalhado'; // 'resumido' | 'detalhado'
```

Níveis de detalhamento (definição concreta da inferência do spec):

- **Resumido** — uma linha por item: data + título (eventos) ou data + tipo (consultas), com médico quando houver.
- **Detalhado** — todos os campos preenchidos do item:
  - Eventos: categoria, descrição, tratamento, médico, hospital, medicamentos, custo, observações.
  - Consultas: horário, médico, local, status, observações.

Nenhuma mudança em documentos do Firestore.

## 5. Regras de segurança e permissões

- Sem superfícies novas: a exportação lê apenas dados já carregados do perfil ativo do próprio usuário autenticado.
- O PDF é gerado e baixado localmente; nada é enviado a servidores.
- Texto do usuário entra no PDF como texto puro via API do jsPDF (sem HTML), então não há vetor de injeção.

## 6. Fluxos técnicos

1. `renderizarTimeline()` / `renderizarAgendaLista()` renderizam o botão "Exportar PDF" no cabeçalho da aba.
2. Clique → `abrirExportPdf(contexto)`: monta a lista de categorias (a partir de `eventosCache`) ou tipos (a partir de `consultasCache`), todas pré-selecionadas; nível padrão "Detalhado"; abre `modal-export-pdf`.
3. Interações no modal: `togglePdfCat(valor)`, `setPdfNivel(nivel)` (re-render da lista/segmento).
4. Confirmar → `gerarPdfExport()` (async):
   a. Lê `carregarPerfil()` e `buscarAvatarLocal(profileIdAtivo)` (foto opcional).
   b. Cria `new jspdf.jsPDF({ unit: 'mm', format: 'a4' })`.
   c. Desenha cabeçalho: foto (se houver), nome, idade + data de nascimento, data de emissão, tipo sanguíneo, alergias, doenças crônicas.
   d. Desenha o corpo: itens filtrados pelas seleções, ordenados por data desc, no nível escolhido. Antes de cada item calcula a altura do bloco; se não couber na página, `addPage()` (item nunca é cortado ao meio).
   e. `doc.save('historico-<nome>-<data>.pdf')` ou `agenda-<nome>-<data>.pdf`.
5. `fecharModal('modal-export-pdf')` + toast de sucesso.

## 7. Impactos no sistema existente

- Cabeçalhos do Histórico e da Agenda ganham um botão cada (sem alterar filtros/busca existentes).
- `index.html` carrega +357 KB de script (defer, precacheado pelo SW — custo de rede apenas uma vez por versão do cache).
- Nenhuma alteração em fluxos de dados, autenticação ou Firestore.

## 8. Riscos técnicos

- **Peso da biblioteca**: 357 KB a mais no shell. Mitigado pelo cache do SW (baixa uma vez). Aceito em troca do controle de layout (decisão do spec).
- **Foto do perfil no PDF**: `addImage` requer dataURL válido; a foto já é armazenada como JPEG dataURL 256×256 no IndexedDB, compatível. Se ausente ou corrompida, o cabeçalho renderiza sem foto (try/catch).
- **Acentuação**: fontes padrão do jsPDF (Helvetica core font, WinAnsiEncoding) cobrem o alfabeto latino/português; sem necessidade de embutir fonte custom.
- **Textos muito longos** (observações/descrições): quebrados com `doc.splitTextToSize()`; blocos maiores que uma página inteira são paginados por linhas (caso extremo raro).
- **Conflito recorrente de sw.js em merges**: manter sempre a versão HEAD (maior).

## 9. Estratégia de teste

Manual, no app publicado (ou local):
1. Histórico com eventos de várias categorias → exportar com todas as categorias, nível detalhado → conferir cabeçalho (nome, idade, foto, alergias, doenças), itens completos e ordenação.
2. Repetir com apenas 1 categoria selecionada e nível resumido → conferir filtro e formato de linha única.
3. Agenda → exportar tipos selecionados, conferir status/horário/local.
4. Perfil sem eventos/consultas → PDF só com cabeçalho, sem erro.
5. Modo escuro ativo → PDF permanece claro/legível.
6. Volume grande (>1 página) → nenhum item cortado entre páginas.
7. Offline (após um load online) → exportação continua funcionando.

## 10. Ordem recomendada de implementação

1. **Tarefa 1** — Vendorizar jsPDF + script no `index.html` + `SHELL_FILES`/bump no `sw.js`.
2. **Tarefa 2** — Modal de configuração (markup, estado, CSS).
3. **Tarefa 3** — Botões "Exportar PDF" nos cabeçalhos das duas abas.
4. **Tarefa 4** — Builder do PDF (cabeçalho de perfil + corpo por contexto + níveis + quebras de página + download).
5. **review.md** ao final, comparando com spec/plan/tasks.

## 11. Iteração 3 — remover resumido, período mês/ano, ícones de categoria

### Correção da lacuna da iteração 2

O markup do filtro de período (`export-data-inicio`/`export-data-fim`) e da prévia (`export-pdf-previa`) e o CSS correspondente (`.export-previa*`) nunca chegaram a `index.html`/`style.css` — só a lógica em `app.js` foi commitada (ver `git show 6760878 --stat`, que não lista `index.html`). Esta iteração adiciona esse markup/CSS que faltava, junto com as extensões abaixo.

### Remoção do nível "Resumido"

- Remove estado `_pdfNivel`, funções `setPdfNivel`/`_renderExportPdfNivel`.
- Remove os ramos `if (_pdfNivel === 'resumido')` de `_pdfLinhasEvento`, `_pdfLinhasConsulta`, `_previaItemEvento`, `_previaItemConsulta` — sobra só o corpo "detalhado".
- Remove o bloco `.export-nivel` do modal em `index.html`.

### Período: Intervalo / Mês / Ano

- Novo estado: `_pdfPeriodoModo` (`'intervalo' | 'mes' | 'ano'`), `_pdfMes` (`'YYYY-MM'`), `_pdfAno` (`'YYYY'`), mantendo `_pdfDataInicio`/`_pdfDataFim` para o modo Intervalo.
- Helper `_pdfPeriodoEfetivo()` traduz o modo ativo em `{ inicio, fim }` (strings `YYYY-MM-DD`): Mês vira 1º e último dia do mês; Ano vira `01-01`/`12-31`; Intervalo usa os campos diretos. `_pdfItensSelecionados()` passa a filtrar por esse par em vez de `_pdfDataInicio`/`_pdfDataFim` diretamente.
- UI: três botões de modo (`filter-btn`, mesmo padrão do antigo seletor de nível) + área de campos que troca conforme o modo — dois `<input type="date">` (Intervalo), um `<input type="month">` (Mês), ou uma fileira de `filter-btn` com os anos presentes no cache do contexto ativo (Ano) — sem `<select>` nativo, para manter a linguagem visual do app (o app não usa `<select>` em nenhum outro lugar).
- Trocar de modo limpa a seleção de período anterior (evita herdar um `_pdfDataInicio` de um modo diferente).

### Ícones de categoria no corpo do PDF

- jsPDF 2.5.2 vendorizado não inclui plugin de SVG (`window.jspdf` sem suporte a `svg`), então os ícones (SVG inline Lucide, mesmos de `CATEGORIAS[...].icone`) são **rasterizados em PNG via `<canvas>`** em tempo de execução: desenha um círculo preenchido com a cor de destaque da categoria (mesmas cores de `.event-recent-icon.icon-<categoria>` em `style.css`, replicadas em `_PDF_CAT_COR`), sobrepõe o ícone via `Image` com `src="data:image/svg+xml,..."` (stroke/fill brancos conforme o tipo do ícone) e `ctx.drawImage`, e extrai `canvas.toDataURL('image/png')`.
- Resultado cacheado por categoria (`_pdfIconesCache`, guarda a Promise) — cada categoria é rasterizada uma única vez por sessão, mesmo em exportações repetidas.
- `gerarPdfExport()` pré-calcula os ícones das categorias presentes na seleção (`await Promise.all(...)`) antes de montar o corpo, e repassa o mapa para `_pdfLinhasEvento`, que anexa `icone: <dataURL>` à linha de "data + categoria".
- `_pdfBloco()` ganha suporte a um campo opcional `icone` por linha: desenha a imagem (jsPDF `addImage`) alinhada à linha de texto e desloca o `x` inicial do texto — sem alterar o comportamento das linhas que não usam `icone`.
- A Agenda de Consultas não ganha ícones (não existe um conjunto de ícones por tipo de consulta no app hoje); fora de escopo, sem necessidade de nova decisão.
- Prévia (`_previaItemEvento`) ganha o mesmo badge (`<span class="event-recent-icon icon-<categoria>">`, já usado em outras listas do app) ao lado da data — sem rasterização, é HTML/SVG normal.

### Arquivos afetados (iteração 3)

| Arquivo | Motivo |
|---|---|
| `index.html` | Remove bloco de nível; adiciona campos de período (3 modos) + contêiner da prévia (markup que faltava da iteração 2). |
| `app.js` | Remove `_pdfNivel` e ramos "resumido"; novo estado/funções de período (modo/mês/ano); `_pdfIconeCategoria`/`_pdfRasterizarIcone`/`_PDF_CAT_COR`; `_pdfBloco` com suporte a `icone`; `_pdfLinhasEvento` recebe ícones pré-calculados; `_previaItemEvento`/`_previaItemConsulta` sem ramo resumido, com ícone na prévia. |
| `style.css` | Remove `.export-nivel`; adiciona `.export-periodo-modo`/`.export-periodo-campos`/`.export-periodo-intervalo`/`.export-periodo-anos` e todo o bloco `.export-previa*` que faltava. |
| `sw.js` | Bump de versão do cache (v24 → v25). |

### Riscos técnicos (iteração 3)

- Rasterização de SVG via `canvas`/`Image` depende do navegador suportar `data:image/svg+xml` em `<img>` — suportado em todos os navegadores modernos (Chrome/Safari/Firefox mobile inclusos); sem fallback de rede envolvido, então continua funcionando offline.
- Se a rasterização falhar por algum motivo (`onerror`), a linha simplesmente sai sem o ícone (try/catch em volta do `addImage`) — nunca quebra a exportação.

### Estratégia de teste (iteração 3)

- `node --check app.js` para sintaxe.
- Revisão manual do fluxo de período (mês vira 1º/último dia corretamente, incluindo fevereiro; ano vira 01-01/12-31) e conferência de que nenhuma referência a `_pdfNivel`/"resumido" sobra no código.
- Teste manual no navegador (pendente neste ambiente, igual às iterações anteriores): abrir o modal, alternar os 3 modos de período, conferir prévia com ícones, gerar PDF de fato e inspecionar visualmente os ícones de categoria no corpo.
