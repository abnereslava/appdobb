# Plano Técnico: Agenda de Doses

## 1. Resumo da solução

Dois campos novos no documento de medicamento (`horarioInicio`, `dosesExcecoes`) e uma função pura `_gerarDoses(med)` que devolve a grade calculada. A grade **não é persistida** — é recalculada a cada exibição —, então o custo de armazenamento e de escrita é proporcional apenas às exceções que o usuário marcar, não à duração do tratamento.

A seção de doses é renderizada dentro do modal de detalhe do medicamento já existente; marcar/alterar/desfazer usa um modal pequeno novo.

## 2. Dependências

- Nenhuma biblioteca nova.
- Internos: `gravarMedicamento()`, `abrirDetalheMedicamento()`, `abrirModal`/`fecharModal`, `confirmar({...})`, `mostrarToast()`, `esc()`, `formatarData()`, `_hojeIso()`, `_addDias()`, `REGIMES_MEDICAMENTO`, `set()`.
- Firestore: nenhuma coleção nem regra nova — os campos entram no documento de `medications`, já coberto pela regra existente.

## 3. Arquivos afetados

| Arquivo | Motivo |
|---|---|
| `app.js` | `_gerarDoses()`, `_chaveDose()`, `_excecaoDe()`, render da seção no detalhe, modal de ação da dose, campo de horário no formulário, aviso ao alterar posologia com marcações. |
| `index.html` | Campo `medicamento-horario` no formulário; modal `modal-dose`. |
| `style.css` | Estilos da lista de doses (dia, chip de horário, estados pulada/remarcada). |
| `sw.js` | Bump da versão do cache. |
| `dev/diario.md` | Pendência 8 (notificações) — já registrada. |

## 4. Estrutura de dados

Acréscimos ao documento `profiles/{id}/medications/{id}`:

```
horarioInicio:  'HH:mm' | null
dosesExcecoes:  [ { quando: 'YYYY-MM-DDTHH:mm',
                    status: 'pulada' | 'remarcada',
                    horarioReal: 'HH:mm' | null } ]
```

**Por que lista e não mapa**: um mapa indexado pelo horário seria mais direto de consultar, mas nomes de campo no Firestore têm restrições (o ponto é separador de caminho) e a chave conteria `:` e `-`. Uma lista evita a questão inteiramente, e o tamanho é limitado pelo número de exceções — tipicamente poucas.

**Por que a chave é o horário previsto e não um índice**: o índice se desloca quando a duração muda (estender de 7 para 10 dias renumeraria nada, mas encurtar sim); o horário previsto é estável enquanto início e frequência não mudarem. Quando mudam, as marcações órfãs são detectadas e o usuário é avisado (§6.3).

Nenhum campo existente muda de significado.

## 5. Regras de segurança e permissões

Sem alterações no `firestore.rules`: os campos novos ficam dentro de documentos de `medications`, que já são cobertos por `canUse(profileId, 'historico', ...)`. Nenhuma superfície nova.

O conteúdo é texto do usuário (`horarioReal`) e vai para a tela via `esc()`.

## 6. Fluxos técnicos

### 6.1 Geração da grade — `_gerarDoses(med)`

Função **pura** (sem DOM, sem I/O), o que a torna testável isoladamente:

1. Sai vazia se: regime ≠ `temporario`, sem `horarioInicio`, sem `dataInicio`, ou frequência inválida.
2. Calcula o intervalo em horas: `frequenciaUnidade === 'horas'` → `frequenciaValor`; `'vezesAoDia'` → `24 / frequenciaValor`. Intervalo ≤ 0 ou não finito → grade vazia.
3. Marca o instante inicial a partir de `dataInicio` + `horarioInicio` e soma o intervalo (em minutos) enquanto o instante for **menor que o limite**. O limite é `início + duracaoDias × 24h` (janela de duração), ou o fim do dia de `dataFim` quando `dataFimEditadaManualmente` é verdadeiro. A janela é o que reproduz a prescrição: 7 dias de 8/8h dão 21 doses, com a última às 00:00 do 8º dia — limitar por data de calendário devolveria 20.
4. Devolve `[{ quando: 'YYYY-MM-DDTHH:mm', data: 'YYYY-MM-DD', hora: 'HH:mm' }, ...]`.

**Aritmética de data/hora**: usar `Date` local com soma em milissegundos e reformatar componente a componente (`getFullYear`/`getMonth`/`getDate`/`getHours`/`getMinutes`). Não usar `toISOString()`, que converte para UTC e no fuso do Brasil devolveria dia/hora errados — a mesma armadilha já evitada em `_hojeIso()`.

**Teto de segurança**: um limite rígido de doses geradas (ex.: 2000) evita que um dado inconsistente (duração enorme com intervalo minúsculo) trave a interface num laço gigante. Sem isso, `duracaoDias: 9999` com intervalo de 1h geraria centenas de milhares de itens e congelaria a aba.

### 6.2 Exibição

- Renderizada dentro de `abrirDetalheMedicamento()`, depois dos campos e antes das ações.
- Agrupada por dia: uma linha por data, com os horários como chips.
- Dias inteiramente no passado vêm **recolhidos** por padrão (um resumo "N dias anteriores"), para a lista abrir no ponto útil em tratamentos longos.
- Cada chip mostra: horário previsto; se pulada, riscado com rótulo; se remarcada, o horário real ao lado.

### 6.3 Marcações

- Tocar num chip abre `modal-dose` com o contexto da dose e três ações: "Não tomei esta dose", "Tomei em outro horário" (com `<input type="time">`) e "Voltar ao previsto".
- Confirmar grava o medicamento inteiro com a lista `dosesExcecoes` atualizada (a mesma via de escrita já usada, `gravarMedicamento` → `_escrita`), e re-renderiza o detalhe.
- **Aviso de marcações órfãs**: em `salvarMedicamento()`, se o registro já tem `dosesExcecoes` e algum de `horarioInicio`/`frequenciaValor`/`frequenciaUnidade`/`duracaoDias`/`dataInicio` mudou, pedir confirmação antes de gravar, explicando que as marcações podem deixar de corresponder. Se o usuário confirmar, grava normalmente e as marcações órfãs simplesmente deixam de casar com alguma dose — ficam guardadas, não são apagadas.

### 6.4 Formulário

Campo `<input type="time" id="medicamento-horario">` dentro do bloco de posologia (`#med-campos-posologia`), portanto visível apenas no regime `temporario` — a alternância já existente cuida disso sem código novo.

## 7. Impactos no sistema existente

- Documentos de medicamento ganham dois campos opcionais; registros antigos seguem válidos sem migração (`horarioInicio` ausente = sem agenda).
- O modal de detalhe fica mais longo em tratamentos longos — daí o recolhimento dos dias passados.
- `salvarMedicamento()` ganha um passo condicional de confirmação (só dispara quando há marcações **e** a posologia mudou).
- Nada muda no Histórico, na Agenda, no PDF ou nas regras.

## 8. Riscos técnicos

| Risco | Mitigação |
|---|---|
| Laço infinito/gigante por dado inconsistente | Teto rígido de doses + validação de intervalo > 0 antes do laço. |
| `toISOString()` deslocando dia/hora por UTC | Formatação componente a componente em horário local. |
| Marcações órfãs após mudar posologia | Confirmação antes de salvar; órfãs ignoradas na exibição, nunca apagadas. |
| Modal muito longo em tratamento de 90 dias | Agrupamento por dia + dias passados recolhidos. |
| Intervalo fracionário (`24/5 = 4,8h`) | Trabalhar em minutos e arredondar; grade fica consistente. |
| Expectativa de que o app avise a hora | Fora do escopo, dito explicitamente no spec §4 e registrado no diário (item 8). |

## 9. Estratégia de teste

`_gerarDoses` é pura, então a maior parte é testável sem navegador — mas os testes rodam no Chromium real com o `app.js` de produção, como nas entregas anteriores:

1. 8/8h por 7 dias a partir de 08:00 → 21 doses, primeira `08:00` do dia 1, última dentro do período.
2. Começando 20:00 → confirmar dose às 04:00 atribuída ao **dia seguinte**.
3. `2 vezes ao dia` produz a mesma grade que `de 12 em 12 horas`.
4. Doses não passam de `dataFim`.
5. Virada de mês e de ano dentro da grade.
6. Regimes `continuo` e `sos`, e temporário sem horário → grade vazia.
7. Frequência 0/negativa/ausente → grade vazia, sem exceção.
8. Teto de segurança: duração absurda não gera lista ilimitada.
9. Marcações: pular, remarcar e desfazer refletem no documento; marcação órfã é ignorada sem quebrar o render.
10. Escape de HTML no campo de horário real.

## 10. Ordem recomendada de implementação

1. **Tarefa 1** — `_gerarDoses()` + helpers puros, com bateria de testes.
2. **Tarefa 2** — Campo de horário no formulário + persistência dos dois campos novos.
3. **Tarefa 3** — Renderização da seção de doses no detalhe (agrupamento, recolhimento dos dias passados).
4. **Tarefa 4** — Modal de ação da dose (pular / remarcar / desfazer) + aviso de marcações órfãs.
5. **Tarefa 5** — `review.md` e fechamento.
