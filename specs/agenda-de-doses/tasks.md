# Tarefas: Agenda de Doses

## Visão geral

Cinco tarefas, começando pelo núcleo puro (o cálculo da grade) e subindo para a interface. A ordem é deliberada: `_gerarDoses()` é a peça de maior risco lógico e a mais fácil de testar isoladamente, então vem primeiro e já entra coberta por testes.

## Tarefa 1 — Cálculo da grade de doses

Status: Concluída

### Objetivo

Função pura `_gerarDoses(med)` que devolve todas as doses previstas de um medicamento, sem tocar em DOM nem em rede.

### Arquivos afetados

- `app.js` (`_gerarDoses`, `_chaveDose`, `_excecaoDe`, helper de formatação de data/hora local)

### Dependências

Nenhuma.

### Critério de conclusão

Devolve a grade correta para as duas unidades de frequência, cobre a janela de N × 24h da duração (respeitando a data de fim quando fixada à mão), atribui doses ao dia real (inclusive cruzando a meia-noite), devolve vazio para regimes sem agenda ou dados inválidos, e nunca ultrapassa o teto de segurança.

### Teste manual

Via console: `_gerarDoses({regime:'temporario', dataInicio:'2026-03-01', duracaoDias:7, horarioInicio:'08:00', frequenciaValor:8, frequenciaUnidade:'horas'})` deve devolver **21 doses**, a última em `2026-03-08T00:00`.

### Observações

Formatação de data/hora **componente a componente em horário local** — `toISOString()` converte para UTC e erraria dia e hora no fuso do Brasil (mesma armadilha já evitada em `_hojeIso()`). Teto rígido de doses para impedir laço gigante com dado inconsistente.

## Tarefa 2 — Horário de início no formulário

Status: Concluída

### Objetivo

Capturar e persistir o horário da primeira dose, e o campo `dosesExcecoes`.

### Arquivos afetados

- `index.html` (`<input type="time" id="medicamento-horario">` dentro de `#med-campos-posologia`)
- `app.js` (`abrirFormMedicamento` carrega o valor; `salvarMedicamento` grava `horarioInicio` e preserva `dosesExcecoes`)

### Dependências

Tarefa 1.

### Critério de conclusão

Campo aparece só no regime "por tempo determinado"; valor salva e recarrega na edição; medicamentos antigos sem horário continuam salvando sem erro; `dosesExcecoes` não é perdido ao editar o medicamento.

### Teste manual

Criar um temporário com horário, reabrir para editar e conferir o campo preenchido; alternar para contínuo e ver o campo sumir; editar um medicamento antigo (sem horário) e salvar sem erro.

### Observações

O campo entra dentro do bloco de posologia que já alterna por regime — sem código novo de alternância. **Cuidado**: `salvarMedicamento` monta o objeto do zero; se `dosesExcecoes` não for explicitamente preservado, editar o medicamento apaga todas as marcações do usuário.

## Tarefa 3 — Exibição da agenda no detalhe

Status: Concluída

### Objetivo

Mostrar as doses previstas agrupadas por dia dentro do modal de detalhe do medicamento.

### Arquivos afetados

- `app.js` (render da seção em `abrirDetalheMedicamento`, agrupamento por dia, recolhimento dos dias passados)
- `style.css` (lista de dias, chips de horário, estados pulada/remarcada)

### Dependências

Tarefas 1 e 2.

### Critério de conclusão

Seção aparece só quando há grade; total de doses exibido; agrupamento por dia com doses de madrugada no dia correto; dias inteiramente passados recolhidos por padrão, expansíveis; estados visuais de pulada e remarcada corretos.

### Teste manual

Abrir um tratamento de 7 dias e conferir os 7 grupos; criar um que comece às 20:00 e conferir a dose de 04:00 no dia seguinte; abrir um tratamento já iniciado e ver os dias passados recolhidos.

### Observações

Nada de grade persistida — sempre recalculada na exibição.

## Tarefa 4 — Marcar dose e aviso de marcações órfãs

Status: Concluída

### Objetivo

Permitir marcar dose como não tomada, alterar o horário real e desfazer; e avisar quando uma mudança de posologia puder invalidar marcações existentes.

### Arquivos afetados

- `index.html` (`modal-dose`)
- `app.js` (`abrirAcaoDose`, `aplicarAcaoDose`, confirmação em `salvarMedicamento`)
- `style.css` (estilos do modal)

### Dependências

Tarefa 3.

### Critério de conclusão

As três ações funcionam e persistem; reabrir o medicamento mostra as marcações; alterar posologia de um medicamento com marcações pede confirmação; marcação órfã não quebra a exibição.

### Teste manual

Marcar uma dose como não tomada e reabrir; remarcar o horário de outra e conferir os dois horários; desfazer; mudar a duração de um medicamento com marcações e conferir o aviso.

### Observações

Gravar pela via existente (`gravarMedicamento` → `_escrita`), mantendo o indicador de sincronização offline coerente. Marcações órfãs são ignoradas na exibição, mas **não apagadas** — não se descarta dado do usuário sem ele pedir.

## Tarefa 5 — Revisão e fechamento

Status: Concluída

### Objetivo

Registrar a revisão e fechar a funcionalidade.

### Arquivos afetados

- `specs/agenda-de-doses/review.md` (novo)
- `sw.js` (bump de cache)

### Dependências

Tarefas 1–4.

### Critério de conclusão

`review.md` comparando o implementado com spec/plan/tasks, com critérios de aceite, pendências e riscos.

### Teste manual

N/A (documentação).

### Observações

Registrar explicitamente que notificações ficaram fora e onde a pendência está anotada (`dev/diario.md`, item 8).
