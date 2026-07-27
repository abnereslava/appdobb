# Especificação: Histórico de Medicamentos

## 1. Objetivo

Dar visibilidade ao histórico de medicamentos usados por um perfil ao longo da vida, como um registro próprio e independente — incluindo medicamentos de uso contínuo (vitamina, hormônio, remédio de pressão) que não nascem de um evento pontual do Histórico (doença, cirurgia, vacina etc.) e medicamentos de uso por tempo determinado com posologia (ex.: antibiótico de 8 em 8 horas por 7 dias).

## 2. Contexto

Hoje, medicamento só existe como o campo `medicamentos[]` dentro de um evento (`eventosCache`), servindo apenas para registrar "o que foi dado durante aquele atendimento". Não existe forma de listar ou consultar medicamentos de uso contínuo/crônico que nunca foram amarrados a um evento específico, nem de acompanhar uma posologia (frequência + duração). Essa lacuna está registrada como pendência no `dev/diario.md` (item 4: "Implementar histórico de medicamentos/tipos de medicamentos, independente da data do evento").

Discussão prévia (registrada no chat, resumida aqui): cogitou-se inicialmente fazer do histórico de medicamentos um índice derivado de `evento.medicamentos[]`, mas isso não cobre o caso comum de medicação contínua sem evento associado — por isso a abordagem escolhida é tratar medicamento como uma **entidade própria**, com vínculo a um evento **opcional**, inspirada no modelo do app "Medications" da Apple Health (medicamento é independente; associar a uma condição/evento é sugestão, não obrigação).

Hoje a navegação inferior já tem 4 destinos (Perfil/Home, Histórico, Agenda, Calendário) + o botão flutuante central de adicionar — sem espaço confortável para um 5º ícone fixo.

## 3. Usuários envolvidos

- Usuário autenticado com um perfil ativo (mesmo público das demais funcionalidades do app).
- [Inferência] Sem permissão adicional além do acesso já existente ao perfil — mesmo padrão do Histórico/Agenda/gerador de PDF.

## 4. Funcionamento esperado

Uma tela "Medicamentos" lista os medicamentos registrados do perfil ativo — cada um com nome, período de uso, dose/quantidade e regime de uso (contínuo, por tempo determinado com posologia, ou conforme necessário/SOS), observações, e um vínculo opcional a um evento do Histórico. Tem seu próprio botão de exportação em PDF, seguindo o mesmo padrão do `specs/gerador-pdf/`.

**Acesso pela navegação**: em vez de ocupar um 5º ícone fixo na barra inferior, a tela de Medicamentos é alcançada por **gesto de arrastar/swipe** a partir da navegação principal — reaproveitando a linguagem de gesto que o app já usa para trocar de perfil (swipe). O mecanismo exato (de qual tela o swipe parte, direção) fica para o `plan.md` — aqui fica definido que **não** será um ícone fixo adicional na nav, e que **deve existir algum indício visual** (borda, seta, "peek" da tela seguinte etc.) sinalizando que há mais conteúdo a puxar, para não deixar a funcionalidade inteira invisível para quem não descobrir o gesto por acaso.

O campo `evento.medicamentos[]` que já existe hoje **não é alterado nem migrado** — os dois modelos convivem: o campo do evento continua sendo a tag rápida de "o que foi dado nesse atendimento específico"; a nova tela é o registro de uso ao longo do tempo, amarrado a um evento só quando fizer sentido.

**Ponte entre os dois modelos**: para reduzir o risco de digitar o mesmo medicamento duas vezes (uma no evento, outra na tela de Medicamentos), ao salvar um evento que tenha algum item em `medicamentos[]`, o app oferece um atalho de um toque — "Registrar também no histórico de medicamentos?" — que pré-preenche nome e evento relacionado no formulário de novo medicamento. É sempre opcional, nunca automático/obrigatório.

## 5. Fluxo principal

1. Usuário arrasta/dá swipe a partir da navegação principal e chega na tela "Medicamentos" do perfil ativo.
2. Vê a lista de medicamentos do perfil, com destaque visual para os que estão "em uso" (contínuo ou SOS sem data de fim, ou dentro do período de um tratamento por tempo determinado) versus os já encerrados.
3. Toca em "+ Novo Medicamento":
   - Nome, com autocomplete (ver seção 6).
   - Dose/quantidade: valor numérico + unidade (mg, ml, comprimido(s), gota(s), UI, mcg, g ou outra digitada).
   - Regime de uso: **Contínuo** (sem data de fim definida), **Por tempo determinado** (com posologia: frequência — de quantas em quantas horas ou quantas vezes ao dia — e duração em dias; a data de fim é sugerida automaticamente a partir da data de início + duração, mas pode ser ajustada manualmente) ou **Conforme necessário/SOS** (sem data de fim nem posologia fixa — para medicamentos tomados só quando preciso, ex.: analgésico para dor ocasional).
   - Data de início (obrigatória).
   - Observações (opcional).
   - Evento relacionado (opcional, busca/seleção entre os eventos existentes do Histórico).
   - Se o nome digitado bater com alguma alergia do tipo "Medicamentosa" já registrada no perfil, o app mostra um aviso (não bloqueia o cadastro, só alerta).
4. Confirma; o medicamento passa a aparecer na lista.
5. Ao tocar num item da lista, vê o detalhe (mesmos campos, editável), um botão **"Encerrar uso hoje"** (preenche a data de fim com a data atual num toque, disponível nos três regimes) e, se houver evento relacionado, um link que abre o detalhe desse evento (reaproveitando a tela/modal de detalhe do evento já existente no Histórico).
6. Tela tem seu próprio botão "Exportar PDF" no cabeçalho, abrindo o mesmo tipo de modal de configuração já usado no Histórico/Agenda (`specs/gerador-pdf/`), gerando um relatório específico dos medicamentos.

## 6. Regras de negócio

- Medicamento é uma entidade própria (nova subcoleção no Firestore, paralela a `eventos`/`consultas` dentro do perfil), não um campo dentro de evento.
- Vínculo com evento é opcional e **unidirecional**: o medicamento pode referenciar o id de um evento; o evento não guarda referência de volta.
- Regime **Contínuo**: sem data de fim definida no cadastro; considerado "em uso" até ser encerrado manualmente (edição ou botão "Encerrar uso hoje").
- Regime **Por tempo determinado**: tem frequência (de X em X horas, ou X vezes ao dia) e duração (em dias); a data de fim é calculada como `dataInicio + duracaoDias` **enquanto o usuário não editar a data de fim manualmente**. Assim que a data de fim é editada à mão (diretamente ou via "Encerrar uso hoje"), ela fica "fixada": mudanças posteriores em frequência/duração não a recalculam mais, evitando perder um ajuste manual (ex.: parou o tratamento antes do fim planejado, depois corrige a duração só como anotação).
- Regime **Conforme necessário/SOS**: sem data de fim nem posologia fixa; considerado "em uso" indefinidamente, igual ao contínuo, até ser encerrado manualmente.
- Um medicamento "em uso" é: contínuo ou SOS sem data de fim, OU por tempo determinado cuja data de fim (calculada ou ajustada) ainda não passou.
- Ao cadastrar/editar um medicamento, o nome é comparado (sem diferenciar maiúsculas/acentos) com as alergias do tipo "Medicamentosa" do perfil (`perfil.alergias`); havendo correspondência, mostra um aviso — nunca bloqueia o cadastro, é só um alerta informativo.
- Medicamentos com o mesmo nome em períodos diferentes (ex.: usou Amoxicilina em anos diferentes) são registros distintos — nunca mesclados automaticamente.
- Autocomplete de nome de medicamento combina: (a) uma lista estática curada, embutida no app (sem dependência de rede/API externa, mantendo o app 100% offline), cada item mostrando o **nome comercial** e, quando aplicável, o **princípio ativo entre parênteses** (ex.: "Tylenol (Paracetamol)"; para o genérico puro, só o nome, ex.: "Paracetamol"); (b) os nomes que o próprio perfil já usou antes (extraídos dos medicamentos já cadastrados). Entrada livre (nome fora da lista) é sempre permitida.
- **Tamanho da lista estática**: enxuta e de alta confiança (~60–80 dos medicamentos mais comuns no Brasil), priorizando **precisão sobre cobertura**. Como é dado de saúde, um princípio ativo incorreto seria exibido ao usuário como verdade; por isso a lista cobre só o que é possível afirmar com segurança, e cresce na prática com o histórico do próprio perfil. Ampliá-la depois exige uma fonte verificável (bulário/ANVISA) — registrado como melhoria futura, fora do escopo desta entrega.
- **Implementação do autocomplete**: `<datalist>` nativo do HTML — funciona offline, usa o seletor nativo do teclado no mobile, é acessível por padrão e mantém a entrada livre sem código extra.
- Exclusão de um evento vinculado a um medicamento **não exclui o medicamento em cascata** — o vínculo apenas se torna inválido/vazio (ver seção 10).
- Exportação em PDF da tela de Medicamentos segue o mesmo padrão de modal de configuração (filtros + confirmação) do `specs/gerador-pdf/` — os detalhes técnicos dessa integração (novo botão, novo tipo de relatório) entram como uma iteração nova daquele spec quando chegar a hora de implementar.

## 7. Permissões

- [Inferência] Mesmas permissões do restante do app: qualquer usuário autenticado com acesso ao perfil ativo pode ver, criar, editar e excluir os medicamentos desse perfil.

## 8. Dados necessários

Novo documento `medicamento` (por perfil):
- `nome` (texto, obrigatório)
- `quantidade` (número, opcional)
- `unidade` (texto/escolha, opcional — mg, ml, comprimido(s), gota(s), UI, mcg, g ou livre)
- `regime` (`'continuo'` | `'temporario'` | `'sos'`, obrigatório)
- `frequenciaValor` (número, obrigatório se `regime = 'temporario'` — ex.: 8)
- `frequenciaUnidade` (`'horas'` | `'vezesAoDia'`, obrigatório se `regime = 'temporario'`)
- `duracaoDias` (número, obrigatório se `regime = 'temporario'` — usado para sugerir `dataFim`)
- `dataInicio` (data, obrigatório)
- `dataFim` (data, opcional — vazio em regime contínuo/SOS; sugerida automaticamente em regime temporário, editável)
- `dataFimEditadaManualmente` (booleano, interno — controla se `dataFim` ainda deve ser recalculada ao mudar frequência/duração, ver seção 6)
- `observacoes` (texto, opcional)
- `eventoRelacionadoId` (opcional, referência a um documento de `eventos`)

Lista estática curada de medicamentos comuns, embutida no app: nome comercial + princípio ativo (quando aplicável), o máximo de itens populares que for viável reunir. Formato exato do arquivo (JSON em `dados/` ou similar) a definir no `plan.md`.

## 9. Estados e mensagens

| Estado | Comportamento |
|---|---|
| Perfil sem nenhum medicamento cadastrado | Lista vazia com mensagem/ilustração convidando a cadastrar o primeiro, seguindo o padrão já usado no Histórico/Agenda vazios |
| Medicamento em uso (contínuo sem fim, ou temporário com data de fim futura) | Exibido com indicação visual de "em uso" |
| Medicamento por tempo determinado com data de fim já passada | Exibido como encerrado (mesmo que ninguém tenha tocado em "Encerrar uso hoje" manualmente — a data calculada/ajustada já define o estado) |
| Medicamento com `eventoRelacionadoId` apontando para um evento que foi excluído depois | Medicamento continua existindo normalmente; o vínculo simplesmente deixa de oferecer o link (ver seção 10) |
| Nome do medicamento bate com uma alergia "Medicamentosa" do perfil | Aviso informativo exibido no formulário; cadastro não é bloqueado |
| Evento salvo com itens em `medicamentos[]` | Oferece atalho opcional "Registrar também no histórico de medicamentos?" |

## 10. Casos extremos

- Evento relacionado excluído posteriormente: o medicamento não é excluído em cascata; o campo `eventoRelacionadoId` fica "órfão" — ao exibir o medicamento, o app deve tratar essa referência ausente sem quebrar (omitir o link, não tentar abrir um evento inexistente).
- Nome de medicamento digitado que não está na lista estática nem no histórico do perfil: aceito normalmente como entrada livre.
- Dois medicamentos com o mesmo nome e períodos sobrepostos (ex.: trocou de dosagem no meio do tratamento): tratados como registros independentes — sem validação de sobreposição nesta versão.
- Regime "por tempo determinado" sem duração informada: não deveria ocorrer (campo obrigatório nesse regime), mas se acontecer, o app não deve travar — trata como se não desse pra calcular `dataFim` automaticamente, exigindo preenchimento manual.
- "Encerrar uso hoje" tocado num medicamento por tempo determinado cuja data de fim calculada já é anterior a hoje: apenas confirma/ajusta a data de fim para hoje (idempotente, sem erro).
- Múltiplos perfis: assim como Histórico/Agenda/PDF, a tela deve mostrar apenas os medicamentos do perfil ativo no momento — sem visão combinada de vários perfis.

## 11. Critérios de aceite

- [ ] Tela "Medicamentos" com CRUD (criar, listar, editar, excluir) de medicamentos do perfil ativo, acessível por gesto de swipe (sem ícone fixo novo na nav inferior), com algum indício visual de que a tela existe (não é 100% "escondida").
- [ ] Cada medicamento tem nome, dose/quantidade opcional, regime (contínuo, por tempo determinado com posologia, ou conforme necessário/SOS), data de início, data de fim (manual ou calculada), observações opcionais e evento relacionado opcional.
- [ ] Lista distingue visualmente medicamentos "em uso" dos encerrados, considerando os três regimes.
- [ ] Regime "por tempo determinado" sugere a data de fim a partir da frequência/duração informadas; edição manual da data de fim "trava" o valor contra recálculos futuros por mudança de frequência/duração.
- [ ] Botão "Encerrar uso hoje" no detalhe do medicamento, disponível nos três regimes.
- [ ] Campo de nome tem autocomplete combinando lista estática curada (nome comercial + princípio ativo) + histórico do próprio perfil, mas aceita entrada livre.
- [ ] Nome que bate com alergia "Medicamentosa" do perfil dispara um aviso não bloqueante.
- [ ] Evento salvo com `medicamentos[]` oferece atalho opcional para registrar no histórico de medicamentos.
- [ ] Medicamento com evento relacionado oferece um link que abre o detalhe desse evento.
- [ ] Excluir o evento relacionado não exclui o medicamento nem quebra a tela.
- [ ] Botão de exportar PDF na tela de Medicamentos, seguindo o padrão do gerador de PDF existente.
- [ ] `evento.medicamentos[]` (campo já existente) continua funcionando exatamente como hoje, sem migração.

## 12. Dúvidas respondidas

- [Respondida] Nome da tela? "Medicamentos".
- [Respondida] Onde entra na navegação, já que a barra inferior está cheia (4 destinos + FAB)? Não vira ícone fixo — acessada por gesto de swipe, reaproveitando o padrão de gesto já usado pra trocar de perfil. [Inferência] O mecanismo exato do gesto (de onde parte, direção, indicador visual) fica para o `plan.md`.
- [Respondida] Fonte/tamanho da lista estática de autocomplete? Nomes genéricos **e** comerciais, com o princípio ativo entre parênteses nos comerciais (ex.: "Tylenol (Paracetamol)"). Além disso, o cadastro ganha campos estruturados de dose/quantidade (valor + unidade), não só texto livre. **Revisto na etapa de planejamento**: a intenção original era "o máximo de itens que for viável reunir", mas isso foi trocado por uma lista **enxuta de alta confiança** (~60–80 itens) — por ser dado de saúde, um princípio ativo errado seria mostrado ao usuário como verdade, então precisão vale mais que cobertura. Ampliação futura só a partir de fonte verificável.
- [Respondida] Como implementar o autocomplete? `<datalist>` nativo (offline, teclado nativo no mobile, acessível, mantém entrada livre).
- [Respondida] O gerador de PDF deve exportar esse histórico também? Sim — a tela terá seu próprio botão de exportação, no mesmo padrão do `specs/gerador-pdf/` (vira uma iteração nova daquele spec quando for implementado).
- [Respondida] Botão "Encerrar uso hoje"? Sim, incluído — disponível nos três regimes de uso.
- [Respondida] Como registrar uso por tempo determinado (ex.: antibiótico de 8 em 8 horas por 7 dias)? Via o regime "Por tempo determinado": frequência (de X em X horas, ou X vezes ao dia) + duração em dias, com a data de fim sugerida automaticamente (editável).

## 13. Melhorias incorporadas de uma autorrevisão de UX/uso prático

Antes de seguir para o `plan.md`, foi feita uma revisão crítica pensando em UX e uso real de medicamentos, e as seguintes melhorias foram incorporadas ao spec acima (não são adicionais opcionais — já refletidas nas seções 4, 6, 8, 9, 10 e 11):

- **Descoberta do gesto de swipe**: exigência de algum indício visual de que a tela existe, para não depender só do usuário descobrir o gesto por acaso.
- **Ponte com `evento.medicamentos[]`**: atalho opcional ao salvar um evento com medicamentos, evitando digitar o mesmo remédio duas vezes.
- **Regime "Conforme necessário/SOS"**: cobre o uso comum de medicamento tomado só quando preciso (ex.: analgésico ocasional), que não é nem contínuo nem por tempo determinado.
- **Regra de "trava" da data de fim editada manualmente**: resolve a ambiguidade de o que acontece quando o usuário ajusta a data de fim à mão e depois muda frequência/duração.
- **Aviso de possível alergia**: cruza o nome do medicamento com `perfil.alergias` (tipo "Medicamentosa") e avisa sem bloquear — usa dado que já existe no app, sem custo de coleta novo.

