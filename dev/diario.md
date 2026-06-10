#Esse arquivo é para uso pessoal do desenvolvedor

1. Substituir a exportação manual do calendário por uma opção de vinculo com o Google Calendar (já foi criado spec)

2. ~~Verificar possibilidades de anexação de imagens~~ → solução definida: salvar apenas localmente (IndexedDB), sem upload para servidores externos.

3. Enviar por email o lembrete da consulta ou exame para o usuário um dia antes

4. Geradores de pdf

5. Implementar histórico de medicamentos/tipos de medicamentos, independente da data do evento

6. Animação de parabéns que aparece uma vez quando o aplicativo é aberto na data de aniversário de um dos usuários

7. ~~Implementar cache em memória por bebê (profileId) para perfil/eventos/consultas, reaproveitado entre as abas~~ → feito: `onSnapshot` mantém três listeners ativos (`subscribePerfil`, `subscribeEventos`, `subscribeConsultas`) com cache local em `_perfilCache`, `eventosCache`, `consultasCache`. Trocar de aba não dispara nenhuma leitura Firestore; dados só recarregam quando há escrita ou troca de perfil.

9. (Opcional) Melhorar o desenho do ícone de **Dentes** — hoje é um SVG inline feito à mão (`IMG_DENTES`), já que o Lucide não tem ícone de dente. Não precisa virar PNG; basta refinar o `<path>`.

10. ~~Avatar do perfil (`mamadeira.png`) ainda tem tema de bebê~~ → substituído por ícone SVG de pessoa (`IMG_PESSOA`); o usuário agora pode colocar a própria foto (salva localmente no IndexedDB, auto-salva ao selecionar). Badge de câmera aparece só quando não há foto. Foto também aparece no seletor de perfis.

11. Retrabalhar inserção de eventos (revelando campos aos poucos de acordo com o evento que está sendo registrado).

12. ~~Permitir ao usuário poder escolher a cor do perfil~~ → feito: 8 cores pré-selecionadas (bege/azul/rosa/verde/roxo/âmbar/cinza/terracota) no formulário de perfil, com live preview. Substituiu a antiga pintura automática por gênero. Compatibilidade retroativa: perfis antigos com `sexo` sem `corPerfil` são mapeados para azul/rosa via `corDoPerfil()`. Seletor de perfis exibe a cor e foto de cada perfil.
