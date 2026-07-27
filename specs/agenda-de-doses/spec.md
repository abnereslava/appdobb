# Especificação: Agenda de Doses

## 1. Objetivo

Para medicamentos de uso por tempo determinado, mostrar **todas as doses previstas** (data e horário) calculadas a partir da posologia, e permitir registrar depois o que fugiu do previsto: uma dose que não foi tomada ou que foi tomada em outro horário.

## 2. Contexto

A tela de Medicamentos (`specs/historico-medicamentos/`) já guarda frequência (`frequenciaValor` + `frequenciaUnidade`), duração (`duracaoDias`) e data de início — mas **não guarda horário**, então hoje é impossível derivar quando cada dose acontece. O usuário vê "de 8 em 8 horas por 7 dias" sem saber quais são os 21 momentos.

Esta funcionalidade preenche essa lacuna acrescentando o horário de início e uma visualização da grade resultante, dentro do detalhe do medicamento.

## 3. Usuários envolvidos

- Usuário autenticado com um perfil ativo — mesmo público e mesmas permissões do restante do app.

## 4. Funcionamento esperado

No detalhe de um medicamento de regime **por tempo determinado** que tenha horário de início definido, aparece a seção "Doses previstas": a lista de todas as doses do tratamento, agrupadas por dia, cada uma com seu horário.

Tocar numa dose permite marcá-la como **não tomada** ou **alterar o horário** em que ela de fato foi tomada — e desfazer qualquer das duas.

A grade **não é armazenada**: é recalculada a cada exibição a partir da posologia. Só as exceções (doses puladas ou remarcadas) são persistidas.

**Fora do escopo**: nenhuma notificação, alarme ou lembrete ativo. A tela mostra e registra; não avisa. Registrado como pendência 8 do `dev/diario.md`.

## 5. Fluxo principal

1. Usuário cadastra/edita um medicamento com regime "por tempo determinado", informando também o **horário da primeira dose**.
2. Abre o detalhe do medicamento e vê "Doses previstas", com o total (ex.: "21 doses") e a lista agrupada por dia.
3. Toca numa dose e escolhe:
   - **Não tomei esta dose** → a dose passa a aparecer riscada/marcada como pulada.
   - **Tomei em outro horário** → informa o horário real; a dose passa a exibir o horário original e o real.
   - **Voltar ao previsto** → remove a marcação.
4. As marcações ficam salvas e reaparecem ao abrir o medicamento de novo, em qualquer dispositivo.

## 6. Regras de negócio

- A agenda existe **apenas** para o regime `temporario`. Contínuo não tem fim (geraria lista infinita) e SOS não tem horário previsível.
- A agenda só é exibida quando há **horário de início** preenchido. Medicamentos temporários já cadastrados sem horário continuam funcionando normalmente, apenas sem a seção — sem migração de dados.
- **Cálculo dos horários**: as duas unidades de frequência são reduzidas a um intervalo em horas — `de X em X horas` usa X; `N vezes ao dia` usa `24 ÷ N`. A primeira dose é no início informado; cada dose seguinte soma o intervalo. Uma dose pode cair no dia seguinte (ex.: 8/8h começando às 20:00 gera uma dose às 04:00) e é exibida no dia real em que ocorre, não no dia da anterior.
  - [Decisão] Optou-se pelo intervalo puro em vez de distribuir as doses numa janela de vigília. É previsível e corresponde ao que o usuário informa; o custo é que posologias como 3x ao dia geram uma dose de madrugada. Como cada dose pode ter o horário alterado individualmente, o ajuste já está disponível. Reavaliar se incomodar na prática.
- **Limite da grade**: "tomar por N dias" é interpretado como uma **janela de N × 24 horas contada da primeira dose**, não como N datas de calendário. A diferença é concreta: 8/8h por 7 dias a partir das 08:00 são **21 doses**, e a última cai às 00:00 do 8º dia — limitar por data de calendário geraria 20 e descartaria uma dose prescrita (interromper um antibiótico antes do fim é dano real, não só imprecisão).
  - **Exceção**: se o usuário fixou a data de fim manualmente (interrompeu o tratamento antes do previsto — a trava já existente em `dataFimEditadaManualmente`), essa data passa a mandar e a grade para no fim daquele dia.

- **Coerência entre a data de fim e a grade (requisito de segurança)**: quando existe grade, a `dataFim` do medicamento é **a data da última dose**, não o último dia de calendário da duração. Sem isso o app se contradiz — diria "Fim: 07/03" e listaria uma dose em 08/03 —, e quem lesse não saberia qual das duas informações vale, podendo tanto tomar dose a mais quanto encerrar o tratamento antes da hora. Duas medidas complementares reforçam o limite:
  - A **última dose é marcada explicitamente** na grade, para que não se suponha que a posologia continua no dia seguinte.
  - O **total de doses** é exibido com o convite a conferir contra o que foi prescrito e contra a quantidade em mãos — é a checagem que pega erro de digitação na posologia.
- **Exceções são identificadas pelo horário previsto** da dose. Se a posologia mudar (horário de início, frequência ou duração), a grade se desloca e marcações antigas podem deixar de corresponder a alguma dose. Nesse caso o sistema **avisa antes de salvar**, para o usuário decidir — nunca descarta em silêncio. Marcações órfãs são ignoradas na exibição.
- Marcar dose **não** é obrigatório: o estado normal de uma dose é "prevista". Só o que fugiu do previsto vira registro — o app não é um controle de adesão que exige confirmar cada dose.

## 7. Permissões

- Mesmas do medicamento a que a dose pertence (permissão `historico`, ver `specs/historico-medicamentos/plan.md` §5). Nenhuma superfície nova.

## 8. Dados necessários

Dois campos novos no documento de medicamento:

- `horarioInicio` (`'HH:mm'`, opcional) — horário da primeira dose.
- `dosesExcecoes` (lista, opcional) — apenas as doses que fugiram do previsto:
  ```
  [
    { quando: '2026-03-01T08:00', status: 'pulada' },
    { quando: '2026-03-02T08:00', status: 'remarcada', horarioReal: '10:30' },
  ]
  ```

Nenhuma coleção nova. Nenhuma alteração nos campos existentes.

## 9. Estados e mensagens

| Estado | Comportamento |
|---|---|
| Medicamento contínuo ou SOS | Seção de doses não aparece |
| Temporário sem horário de início | Seção não aparece; o formulário sugere preencher o horário para habilitá-la |
| Temporário com horário, dentro do período | Lista de doses agrupada por dia, com o total |
| Dose pulada | Exibida riscada, com rótulo "não tomada" |
| Dose remarcada | Exibe horário previsto e horário real |
| Posologia alterada com marcações existentes | Confirmação avisando que as marcações podem não corresponder mais |
| Grade calculada | `dataFim` passa a ser a data da última dose; a última dose é marcada como tal |

## 10. Casos extremos

- **Duração muito longa** (ex.: 8/8h por 90 dias = 270 doses): a lista é agrupada por dia, então são 90 linhas — utilizável, mas os dias já passados são recolhidos por padrão para a lista abrir no ponto útil.
- **Frequência inválida ou ausente** (0, negativa, vazia): nenhuma dose é gerada, sem erro — a seção simplesmente não aparece.
- `N vezes ao dia` com N que não divide 24 (ex.: 5): o intervalo vira fracionário (4,8h). Os horários são arredondados para o minuto.
- **Marcação órfã** após mudança de posologia: ignorada na exibição, mantida no documento (não se apaga dado do usuário sem ele pedir).
- **Horário real de uma dose remarcada** pode cair em outro dia; ele é exibido junto da dose original, sem mover a dose de lugar na lista.

## 11. Critérios de aceite

- [ ] Formulário de medicamento tem campo de horário de início, exibido apenas no regime "por tempo determinado".
- [ ] Detalhe de medicamento temporário com horário mostra todas as doses previstas, agrupadas por dia, com o total.
- [ ] Doses que cruzam a meia-noite aparecem no dia correto.
- [ ] `N vezes ao dia` e `de X em X horas` produzem a mesma grade quando equivalentes (ex.: 2x ao dia = de 12 em 12 horas).
- [ ] A grade cobre a janela de N × 24h da duração (7 dias de 8/8h = 21 doses), e para na data de fim quando ela foi fixada manualmente.
- [ ] A data de fim do medicamento coincide com a data da última dose — o app nunca exibe uma dose depois do fim declarado.
- [ ] A última dose do tratamento é marcada visualmente e o total de doses é exibido.
- [ ] Dá para marcar uma dose como não tomada, alterar o horário real e desfazer as duas coisas.
- [ ] As marcações persistem e reaparecem ao reabrir o medicamento.
- [ ] Alterar a posologia de um medicamento com marcações pede confirmação antes de salvar.
- [ ] Medicamentos já cadastrados (sem horário) continuam funcionando, sem migração.
- [ ] Nenhuma notificação é disparada em nenhum momento.

## 12. Dúvidas respondidas

- [Respondida] Notificações de horário? **Não** nesta funcionalidade — registrado como pendência 8 do `dev/diario.md`, para ser tratado junto com o lembrete de consulta (item 2) e provavelmente só depois do empacotamento nativo (item 6).
- [Respondida] Como derivar horários de "N vezes ao dia"? Intervalo de `24 ÷ N` horas a partir do horário de início, com ajuste individual por dose disponível.
- [Respondida] Dose que cruza a meia-noite? Exibida no dia real em que ocorre.
- [Respondida] Contagem de doses × data de fim? A **duração manda**, como janela de N × 24h a partir da primeira dose — é o que reproduz a prescrição (7 dias de 8/8h = 21 doses). A grade pode então alcançar a data seguinte à `dataFim`. Se o usuário fixou a data de fim à mão, ela passa a mandar. Descoberto ao testar a Tarefa 1: a regra anterior (data de fim manda) devolvia 20 doses e descartava a última.
- [Respondida] Regimes contínuo e SOS têm agenda? Não.
