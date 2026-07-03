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
