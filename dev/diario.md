#Esse arquivo é para uso pessoal do desenvolvedor

1. Substituir a exportação manual do calendário por uma opção de vinculo com o Google Calendar (já foi criado spec)

2. Enviar por email o lembrete da consulta ou exame para o usuário um dia antes

3. Geradores de pdf

4. Implementar histórico de medicamentos/tipos de medicamentos, independente da data do evento

5. ~~Animação de parabéns que aparece uma vez quando o aplicativo é aberto na data de aniversário de um dos usuários~~ → feito: chuva de confetes (`dispararConfetes`) + toast de parabéns disparada por `verificarAniversario()` no fim de `renderizarHome`, quando dia/mês de `dataNascimento` batem com hoje. Exibida uma única vez por perfil por ano (guarda em `localStorage`: `aniversario-visto-<profileId>-<ano>`). Teste manual: 15 toques no avatar da conta (canto superior esquerdo).

6. Retrabalhar inserção de eventos (revelando campos aos poucos de acordo com o evento que está sendo registrado).
