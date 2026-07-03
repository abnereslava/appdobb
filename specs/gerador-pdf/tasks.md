# Tarefas: Gerador de PDF (Relatório de Saúde)

## Visão geral

Quatro tarefas sequenciais: (1) infraestrutura da biblioteca jsPDF, (2) modal de configuração, (3) botões de disparo nas abas, (4) geração do PDF em si. Cada tarefa é testável isoladamente.

## Tarefa 1 — Infraestrutura jsPDF (biblioteca + cache offline)

Status: Pendente

### Objetivo

Disponibilizar o jsPDF no app, carregado localmente e precacheado pelo Service Worker para funcionar offline.

### Arquivos afetados

- `lib/jspdf.umd.min.js` (novo — UMD build 2.5.2 vendorizada)
- `index.html` (tag `<script src="./lib/jspdf.umd.min.js" defer>`)
- `sw.js` (adicionar ao `SHELL_FILES`; bump de versão do cache)

### Dependências

Nenhuma.

### Critério de conclusão

`window.jspdf.jsPDF` disponível no console do app carregado; arquivo listado em `SHELL_FILES`.

### Teste manual

Abrir o app, executar `new jspdf.jsPDF()` no console sem erro. Em DevTools → Application → Cache Storage, confirmar `./lib/jspdf.umd.min.js` no cache do shell.

### Observações

Caminho relativo (`./lib/...`) por causa do subpath do GitHub Pages. Conflito recorrente de `sw.js` em merges: manter versão HEAD.

## Tarefa 2 — Modal de configuração da exportação

Status: Pendente

### Objetivo

Modal único (`modal-export-pdf`) reutilizado pelas duas abas: lista de categorias (Histórico) ou tipos (Agenda) com seleção múltipla pré-marcada, seletor de nível de detalhamento (Resumido/Detalhado) e botões Cancelar/Gerar PDF.

### Arquivos afetados

- `index.html` (markup do modal)
- `app.js` (estado `_pdfContexto`/`_pdfCatsTemp`/`_pdfNivel`; funções `abrirExportPdf(contexto)`, `_renderExportPdfLista()`, `togglePdfCat(v)`, `setPdfNivel(n)`)
- `style.css` (estilos do seletor de nível; lista reutiliza `filtro-cat-item`)

### Dependências

Nenhuma (pode ser feita antes da Tarefa 1, mas o botão Gerar só funciona após a Tarefa 4).

### Critério de conclusão

Chamar `abrirExportPdf('eventos')` e `abrirExportPdf('consultas')` no console abre o modal com as listas corretas (a partir dos caches), tudo pré-selecionado, nível padrão Detalhado, toggles funcionando.

### Teste manual

Via console (botões chegam na Tarefa 3): abrir os dois contextos, alternar seleções e nível, cancelar e reabrir (estado reinicia pré-selecionado).

### Observações

Perfil sem eventos/consultas: modal mostra aviso amigável no lugar da lista, mas o botão Gerar permanece habilitado (spec: exporta só o cabeçalho).

## Tarefa 3 — Botões "Exportar PDF" no Histórico e na Agenda

Status: Pendente

### Objetivo

Adicionar o botão de exportação no cabeçalho de cada aba, disparando `abrirExportPdf` com o contexto correto.

### Arquivos afetados

- `app.js` (`renderizarTimeline()` e `renderizarAgendaLista()`: botão `btn-ghost` com ícone de download/documento no `.tl-header`)

### Dependências

Tarefa 2.

### Critério de conclusão

Botão visível nas duas abas; clique abre o modal com o contexto certo.

### Teste manual

Navegar até Histórico e Agenda, tocar no botão, conferir título e lista do modal em cada aba.

### Observações

No Histórico o cabeçalho já tem o botão de alternância de visualização (olho) — o novo botão fica ao lado, mesmo estilo `btn-ghost btn-sm`.

## Tarefa 4 — Geração do PDF (cabeçalho + corpo + download)

Status: Pendente

### Objetivo

Implementar `gerarPdfExport()`: montar o documento A4 com cabeçalho do perfil (foto, nome, idade, nascimento, emissão, tipo sanguíneo, alergias, doenças crônicas) e corpo com os itens filtrados pela seleção do modal, no nível escolhido, com quebras de página que não cortam itens ao meio; salvar o arquivo.

### Arquivos afetados

- `app.js` (função `gerarPdfExport()` + helpers de desenho `_pdfCabecalho`, `_pdfItemEvento`, `_pdfItemConsulta`)

### Dependências

Tarefas 1 e 2.

### Critério de conclusão

Todos os critérios de aceite do spec relativos ao conteúdo do PDF: cabeçalho completo (com foto quando existir), corpo filtrado pela seleção, dois níveis funcionando, itens não cortados entre páginas, perfil sem dados gera PDF só com cabeçalho, arquivo nomeado `historico-<nome>-<data>.pdf` / `agenda-<nome>-<data>.pdf`.

### Teste manual

Roteiro da seção 9 do plan.md (7 cenários, incluindo offline e modo escuro).

### Observações

Cores fixas claras (independentes do tema); texto puro via API do jsPDF; foto em try/catch para nunca quebrar a exportação.
