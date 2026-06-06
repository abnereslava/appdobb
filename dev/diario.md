#Esse arquivo é para uso pessoal do desenvolvedor

1. Substituir a exportação manual do calendário por uma opção de vinculo com o Google Calendar (já foi criado spec)

2. Verificar possibilidades de anexação de imagens (solução: anexar apenas no local!)

3. Enviar por email o lembrete da consulta ou exame para o usuário um dia antes

4. Geradores de pdf

5. Implementar histórico de medicamentos/tipos de medicamentos, independente da data do evento

6. Animação de parabéns que aparece uma vez quando o aplicativo é aberto na data de aniversário de um dos usuários

7. implementar: um cache em memória por bebê (profileId) para perfil/eventos/consultas, reaproveitado entre as abas, com invalidação apenas quando: (1) você cria/edita/exclui um evento/consulta/perfil, ou (2) troca de bebê. Assim, navegar entre abas não dispara novas leituras; só recarrega quando os dados realmente mudam.

8. Criar histórico de medicamentos.

9. Criar imagem PNG para a categoria **Dentes** (96×96 px, fundo transparente). Enquanto isso, a categoria usa um SVG inline provisório. Ao criar o PNG, substituir `IMG_DENTES` em `app.js` por `<img src="img/dentes.png" class="category-icon-img">` e adicionar `dentes.png` ao cache do `sw.js`.