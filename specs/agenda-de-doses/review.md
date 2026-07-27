# Revisão: Agenda de Doses

## 1. Status geral

Aprovado — as 5 tarefas do `tasks.md` implementadas e cobertas por teste automatizado em navegador real.

## 2. Resumo da implementação

- **Cálculo** (`_gerarDoses`): função pura que devolve a grade a partir de regime, data/horário de início, frequência e duração. Nunca persistida — recalculada a cada exibição, então o custo de escrita e armazenamento é proporcional só às marcações do usuário.
- **Campos novos**: `horarioInicio` e `dosesExcecoes` no documento de medicamento. Ambos opcionais; registros antigos seguem válidos sem migração.
- **Exibição**: seção "Doses previstas" no detalhe do medicamento, agrupada pelo dia real de cada dose, com total e contagem de marcações. Dias já passados vêm recolhidos.
- **Marcações**: modal com três ações — não tomei, tomei em outro horário, voltar ao previsto. Idempotentes (a marcação anterior da mesma dose é removida antes de aplicar a nova, então nunca duplica).
- **Proteção**: alterar posologia de um medicamento com marcações pede confirmação antes de salvar.

## 3. Critérios de aceite

- [x] Campo de horário no formulário, só no regime "por tempo determinado".
- [x] Detalhe mostra todas as doses agrupadas por dia, com o total.
- [x] Doses que cruzam a meia-noite aparecem no dia correto.
- [x] `2 vezes ao dia` e `de 12 em 12 horas` produzem grades idênticas.
- [x] A grade cobre a janela de N × 24h da duração, e respeita a data de fim quando fixada manualmente.
- [x] Marcar como não tomada, alterar horário real e desfazer — os três funcionam e persistem.
- [x] Alterar posologia com marcações existentes pede confirmação.
- [x] Medicamentos já cadastrados (sem horário) continuam funcionando, sem migração.
- [x] Nenhuma notificação é disparada em momento nenhum.

## 4. Tarefas concluídas

Tarefas 1 a 5 do `tasks.md`.

## 5. Testes realizados

`node --check` e duas baterias em Chromium real (Playwright) com o `app.js` de produção.

**Cálculo da grade**
- 8/8h por 7 dias a partir das 08:00 → **21 doses**, primeira `2026-03-01T08:00`, última `2026-03-08T00:00`.
- Início às 20:00 → dose seguinte às 04:00 atribuída ao **dia seguinte** (`2026-03-02`), não ao dia da anterior.
- `2 vezes ao dia` ≡ `de 12 em 12 horas` (grades idênticas por comparação profunda); 14 doses em 7 dias.
- Data de fim fixada manualmente corta a grade: 8 doses, última em `2026-03-03T16:00`.
- Virada de mês (fev→mar) e de ano (dez→jan) corretas.
- `continuo`, `sos` e temporário sem horário → grade vazia.
- Frequência 0, negativa e ausente → grade vazia, sem exceção.
- Teto de segurança: duração de 30000 dias com intervalo de 1h para em 2000 doses em vez de travar a aba.
- Intervalo fracionário (5x ao dia = 4,8h) → `08:00, 12:48, 17:36, 22:24, 03:12`.

**Exibição e marcações**
- Seção renderiza com total correto e destaque do dia de hoje.
- Marcar como não tomada grava e exibe riscado; remarcar grava horário real e exibe; desfazer limpa.
- **Idempotência**: marcar a mesma dose duas vezes seguidas mantém uma única entrada em `dosesExcecoes`.
- Marcação órfã (horário que não corresponde a nenhuma dose) é ignorada sem quebrar a exibição.
- Regime contínuo não renderiza a seção.
- Escape de HTML: `<img src=x onerror=...>` gravado como horário real não vira elemento no DOM.
- Nenhum `pageerror` em nenhuma bateria.

## 6. Problemas encontrados

- **Regra de limite corrigida durante a Tarefa 1.** O `spec.md` original definia que a `dataFim` limitava a grade. O teste mostrou que isso devolvia **20 doses** para "8/8h por 7 dias", descartando a última (00:00 do 8º dia) — que o paciente de fato toma. A regra foi trocada para uma janela de N × 24h a partir da primeira dose, que devolve as 21 corretas, e spec/plan/tasks foram atualizados. Consequência aceita e documentada: a grade pode exibir uma data além da `dataFim` do medicamento, porque `dataFim` é por dia e a posologia é por hora.
- **Armadilha evitada na Tarefa 2**: `salvarMedicamento()` monta o objeto do zero, então `dosesExcecoes` precisou ser explicitamente preservado — sem isso, editar qualquer campo do medicamento apagaria silenciosamente todas as marcações do usuário.
- Nenhum bug funcional remanescente nos cenários testados.

## 7. Alterações fora do escopo

Nenhuma. Nenhum arquivo fora dos previstos no `plan.md` foi tocado; `firestore.rules` não precisou mudar (os campos entram em documentos de `medications`, já cobertos).

## 8. Pendências

- **Notificações de horário de dose** — deliberadamente fora desta funcionalidade, registrado como **item 8 do `dev/diario.md`** com as restrições técnicas levantadas (Service Worker, ausência de backend para push, comportamento irregular no iOS, e a recomendação de tratar junto com o lembrete de consulta do item 2).
- Teste manual no dispositivo: `<input type="time">` no teclado móvel e legibilidade da grade num tratamento longo.
- [Sugestão] A decisão de derivar "N vezes ao dia" por intervalo puro (24÷N) faz 3x ao dia gerar uma dose de madrugada. É previsível e ajustável dose a dose, mas se incomodar na prática, vale reavaliar para distribuição numa janela de vigília.

## 9. Recomendações

- Ao implementar a exportação em PDF dos medicamentos (pendência de `specs/historico-medicamentos/`), considerar se a grade de doses deve entrar no relatório — é informação útil para levar à consulta.

## 10. Conclusão

Funcionalidade pronta e completa em relação ao spec. O único desvio em relação ao planejado foi a correção da regra de limite da grade, feita durante a implementação porque o teste expôs que a regra original perdia uma dose — corrigida no código e nos três documentos da spec.
