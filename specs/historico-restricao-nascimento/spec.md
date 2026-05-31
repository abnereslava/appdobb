# Especificação: Restrição de Histórico por Data de Nascimento

## 1. Objetivo

Exibir a data de nascimento do bebê como referência visual no topo do Histórico de Saúde e bloquear a inserção de eventos com data anterior a 45 semanas antes do nascimento, evitando registros fora do período biologicamente válido.

## 2. Contexto

O Histórico de Saúde é uma linha do tempo de eventos médicos do bebê. Qualquer evento deve ocorrer após o início do período de gestação viável (aproximadamente 40 semanas, com 5 semanas de tolerância = 45 semanas antes do nascimento). A data de nascimento já é salva no perfil do bebê (`perfil.dataNascimento`).

## 3. Usuários envolvidos

- Responsável pelo bebê (usuário autenticado com acesso ao perfil).

## 4. Funcionamento esperado

- No topo do Histórico, logo abaixo do título "Histórico de Saúde", exibir uma linha discreta com a data de nascimento do bebê (ex.: "Nascido em 12/03/2024").
- Ao salvar um novo evento no Histórico, validar se a data do evento é anterior a `dataNascimento - 45 semanas`. Se for, exibir mensagem de erro e impedir o salvamento.
- A validação deve ocorrer no front-end (formulário) e idealmente também no módulo de persistência.
- A restrição NÃO se aplica à Agenda (consultas futuras ou retrospectivas de qualquer data são permitidas).

## 5. Fluxo principal

1. Usuário abre o Histórico.
2. Sistema exibe data de nascimento no cabeçalho da seção.
3. Usuário clica em "+ Novo" e preenche o formulário de evento.
4. Usuário seleciona uma data anterior a 45 semanas antes do nascimento.
5. Sistema exibe mensagem de erro inline no campo de data: "Data inválida: anterior ao início da gestação viável."
6. Botão de salvar permanece bloqueado (ou exibe toast de erro ao tentar salvar).
7. Se a data for válida, o fluxo segue normalmente.

## 6. Regras de negócio

- Data mínima permitida = `dataNascimento - 315 dias` (45 semanas × 7 dias).
- Se o perfil não tiver `dataNascimento`, a restrição não é aplicada (campo indefinido).
- A data de nascimento no cabeçalho só é exibida se `dataNascimento` estiver preenchida no perfil.
- A restrição se aplica apenas ao formulário de **novo evento** e **edição de evento** no Histórico.

## 7. Permissões

- Qualquer usuário com acesso ao perfil do bebê pode visualizar a data de nascimento exibida.
- A validação se aplica a todos os usuários que tentam inserir ou editar eventos.

## 8. Dados necessários

- `perfil.dataNascimento` (string ISO `YYYY-MM-DD`): lida ao renderizar o cabeçalho e ao abrir o formulário de evento.
- `evento.data` (string ISO `YYYY-MM-DD`): validada no submit do formulário.

## 9. Estados e mensagens

| Estado | Mensagem |
|---|---|
| Data anterior ao permitido | "Data inválida: anterior ao início da gestação viável (antes de DD/MM/AAAA)." |
| Perfil sem data de nascimento | Nenhuma restrição exibida; data de nascimento não aparece no cabeçalho. |
| Perfil com data de nascimento | Exibe "Nascido(a) em DD/MM/AAAA" no cabeçalho do Histórico. |

## 10. Casos extremos

- Bebê prematuro (nascido antes de 37 semanas): a janela de 45 semanas antes pode ser anterior ao início real da gestação. [Inferência: ainda assim a regra de 45 semanas é razoável como mínimo seguro.]
- Perfil sem `dataNascimento` preenchido: nenhuma validação de data mínima é aplicada.
- Edição de evento já salvo com data inválida (criado antes da regra): [Pendente: bloquear a edição também? Ou apenas ao salvar mudança de data?]
- Usuário altera a data de nascimento do perfil após ter salvo eventos: os eventos existentes não são retroativamente invalidados.

## 11. Critérios de aceite

- [ ] Data de nascimento exibida no cabeçalho do Histórico quando disponível no perfil.
- [ ] Formulário de evento bloqueia salvamento se a data for anterior a `dataNascimento - 45 semanas`.
- [ ] Mensagem de erro clara e contextual exibida no campo de data.
- [ ] Agenda não é afetada pela restrição.
- [ ] Se perfil não tem `dataNascimento`, nenhuma restrição é aplicada.

## 12. Dúvidas respondidas

- [Respondida] A edição de eventos já existentes com data inválida deve ser bloqueada também.
- [Respondida] O texto exibido deve ser "Nascido em" ou "Nascida em" (dependendo do gênero do bebê). Já, o texto de boas vindas "Bem-vinda" deve ser atualizado para "Bem-vindo(a)"
- [Respondida] A data de nascimento no cabeçalho deve ser clicável para redirecionar ao perfil.
