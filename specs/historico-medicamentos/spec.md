# Especificação: Histórico de Medicamentos

## 1. Objetivo

Dar visibilidade ao histórico de medicamentos usados por um perfil ao longo da vida, como um registro próprio e independente — incluindo medicamentos de uso contínuo (vitamina, hormônio, remédio de pressão) que não nascem de um evento pontual do Histórico (doença, cirurgia, vacina etc.).

## 2. Contexto

Hoje, medicamento só existe como o campo `medicamentos[]` dentro de um evento (`eventosCache`), servindo apenas para registrar "o que foi dado durante aquele atendimento". Não existe forma de listar ou consultar medicamentos de uso contínuo/crônico que nunca foram amarrados a um evento específico. Essa lacuna está registrada como pendência no `dev/diario.md` (item 4: "Implementar histórico de medicamentos/tipos de medicamentos, independente da data do evento").

Discussão prévia (registrada no chat, resumida aqui): cogitou-se inicialmente fazer do histórico de medicamentos um índice derivado de `evento.medicamentos[]`, mas isso não cobre o caso comum de medicação contínua sem evento associado — por isso a abordagem escolhida é tratar medicamento como uma **entidade própria**, com vínculo a um evento **opcional**, inspirada no modelo do app "Medications" da Apple Health (medicamento é independente; associar a uma condição/evento é sugestão, não obrigação).

## 3. Usuários envolvidos

- Usuário autenticado com um perfil ativo (mesmo público das demais funcionalidades do app).
- [Inferência] Sem permissão adicional além do acesso já existente ao perfil — mesmo padrão do Histórico/Agenda/gerador de PDF.

## 4. Funcionamento esperado

Nova aba "Medicamentos" na navegação principal, listando os medicamentos registrados do perfil ativo — cada um com nome, período de uso (data de início e, opcionalmente, data de fim — sem data de fim significa uso contínuo/em andamento) e, opcionalmente, dosagem/frequência, observações e um vínculo a um evento do Histórico.

O campo `evento.medicamentos[]` que já existe hoje **não é alterado nem migrado** — os dois modelos convivem: o campo do evento continua sendo a tag rápida de "o que foi dado nesse atendimento específico"; a nova aba é o registro de uso ao longo do tempo, amarrado a um evento só quando fizer sentido.

## 5. Fluxo principal

1. Usuário abre a aba "Medicamentos" com um perfil ativo.
2. Vê a lista de medicamentos do perfil, com destaque visual para os que estão "em uso" (sem data de fim) versus os já encerrados.
3. Toca em "+ Novo Medicamento": preenche nome (com autocomplete — ver seção 6), data de início, data de fim (opcional), dosagem/frequência (opcional), observações (opcional) e, opcionalmente, associa a um evento existente do Histórico (busca/seleção).
4. Confirma; o medicamento passa a aparecer na lista.
5. Ao tocar num item da lista, vê o detalhe (mesmos campos, editável) e, se houver evento relacionado, um link que abre o detalhe desse evento (reaproveitando a tela/modal de detalhe do evento já existente no Histórico).

## 6. Regras de negócio

- Medicamento é uma entidade própria (nova subcoleção no Firestore, paralela a `eventos`/`consultas` dentro do perfil), não um campo dentro de evento.
- Vínculo com evento é opcional e **unidirecional**: o medicamento pode referenciar o id de um evento; o evento não guarda referência de volta.
- Ausência de data de fim = medicamento "em uso"/contínuo até hoje.
- Medicamentos com o mesmo nome em períodos diferentes (ex.: usou Amoxicilina em anos diferentes) são registros distintos — nunca mesclados automaticamente.
- Autocomplete de nome de medicamento combina: (a) uma lista estática curada, embutida no app (sem dependência de rede/API externa, mantendo o app 100% offline); (b) os nomes que o próprio perfil já usou antes (extraídos dos medicamentos já cadastrados). Entrada livre (nome fora da lista) é sempre permitida.
- Exclusão de um evento vinculado a um medicamento **não exclui o medicamento em cascata** — o vínculo apenas se torna inválido/vazio (ver seção 10).

## 7. Permissões

- [Inferência] Mesmas permissões do restante do app: qualquer usuário autenticado com acesso ao perfil ativo pode ver, criar, editar e excluir os medicamentos desse perfil.

## 8. Dados necessários

Novo documento `medicamento` (por perfil):
- `nome` (texto, obrigatório)
- `dataInicio` (data, obrigatório)
- `dataFim` (data, opcional — vazio = em uso)
- `dosagem` (texto, opcional)
- `frequencia` (texto, opcional)
- `observacoes` (texto, opcional)
- `eventoRelacionadoId` (opcional, referência a um documento de `eventos`)

Lista estática curada de nomes de medicamentos comuns, embutida no app (formato e fonte a definir no `plan.md`).

## 9. Estados e mensagens

| Estado | Comportamento |
|---|---|
| Perfil sem nenhum medicamento cadastrado | Lista vazia com mensagem/ilustração convidando a cadastrar o primeiro, seguindo o padrão já usado no Histórico/Agenda vazios |
| Medicamento sem `dataFim` | Exibido com indicação visual de "em uso" |
| Medicamento com `eventoRelacionadoId` apontando para um evento que foi excluído depois | Medicamento continua existindo normalmente; o vínculo simplesmente deixa de oferecer o link (ver seção 10) |

## 10. Casos extremos

- Evento relacionado excluído posteriormente: o medicamento não é excluído em cascata; o campo `eventoRelacionadoId` fica "órfão" — ao exibir o medicamento, o app deve tratar essa referência ausente sem quebrar (omitir o link, não tentar abrir um evento inexistente).
- Nome de medicamento digitado que não está na lista estática nem no histórico do perfil: aceito normalmente como entrada livre.
- Dois medicamentos com o mesmo nome e períodos sobrepostos (ex.: trocou de dosagem no meio do tratamento): tratados como registros independentes — sem validação de sobreposição nesta versão.
- [Pendente] Múltiplos perfis: assim como Histórico/Agenda/PDF, a aba deve mostrar apenas os medicamentos do perfil ativo no momento — sem exportação/visão combinada de vários perfis.

## 11. Critérios de aceite

- [ ] Nova aba "Medicamentos" na navegação, com CRUD (criar, listar, editar, excluir) de medicamentos do perfil ativo.
- [ ] Cada medicamento tem nome, data de início, data de fim opcional, dosagem/frequência opcional, observações opcionais e evento relacionado opcional.
- [ ] Lista distingue visualmente medicamentos "em uso" (sem data de fim) dos encerrados.
- [ ] Campo de nome tem autocomplete combinando lista estática curada + histórico do próprio perfil, mas aceita entrada livre.
- [ ] Medicamento com evento relacionado oferece um link que abre o detalhe desse evento.
- [ ] Excluir o evento relacionado não exclui o medicamento nem quebra a tela.
- [ ] `evento.medicamentos[]` (campo já existente) continua funcionando exatamente como hoje, sem migração.

## 12. Dúvidas pendentes

- [Pendente] Nome definitivo da aba na navegação (ex.: "Medicamentos") e o ícone a usar.
- [Pendente] Onde essa aba entra na navegação inferior — o app já tem Home/Histórico/Agenda/Perfil (a confirmar a lista atual exata); adicionar uma 5ª aba pode apertar o espaço no mobile. Alternativas a considerar: aba própria mesmo (conforme pedido), ou pendurada num menu/"mais" se a barra já estiver cheia.
- [Pendente] Fonte e tamanho da lista estática de medicamentos comuns (quantos itens, só nomes genéricos ou também comerciais, en/pt-BR).
- [Pendente] O gerador de PDF (`specs/gerador-pdf/`) deve futuramente incluir uma opção de exportar o histórico de medicamentos? Fica fora do escopo desta spec por padrão, a menos que confirmado.
- [Sugestão] Botão "encerrar uso hoje" no detalhe do medicamento (preenche `dataFim` com a data atual num toque), em vez de exigir digitar a data manualmente.
