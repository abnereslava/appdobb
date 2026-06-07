#Esse arquivo é para uso pessoal do desenvolvedor

1. Substituir a exportação manual do calendário por uma opção de vinculo com o Google Calendar (já foi criado spec)

2. Verificar possibilidades de anexação de imagens (solução: anexar apenas no local!)

3. Enviar por email o lembrete da consulta ou exame para o usuário um dia antes

4. Geradores de pdf

5. Implementar histórico de medicamentos/tipos de medicamentos, independente da data do evento

6. Animação de parabéns que aparece uma vez quando o aplicativo é aberto na data de aniversário de um dos usuários

7. implementar: um cache em memória por bebê (profileId) para perfil/eventos/consultas, reaproveitado entre as abas, com invalidação apenas quando: (1) você cria/edita/exclui um evento/consulta/perfil, ou (2) troca de bebê. Assim, navegar entre abas não dispara novas leituras; só recarrega quando os dados realmente mudam.

8. Criar histórico de medicamentos.

9. (Opcional) Melhorar o desenho do ícone de **Dentes** — hoje é um SVG inline feito à mão (`IMG_DENTES`), já que o Lucide não tem ícone de dente. Não precisa virar PNG; basta refinar o `<path>`.

10. Avatar do perfil (`mamadeira.png`) ainda tem tema de bebê → criar **versão neutra** para o público geral, mantendo nome/dimensões (256×256, fundo transparente). (O antigo ícone de boas-vindas já virou o SVG neutro `heart-pulse`.)

11. Retrabalhar inserção de eventos (revelando campos aos poucos de acordo com o evento que está sendo registrado).

12. Permitir ao usuário poder escolher a cor do perfil.