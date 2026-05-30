# Sistema Atual: Linha do Tempo do Bebe

## 1. Visao geral

O aplicativo "Linha do Tempo do Bebe" e uma aplicacao web estatica, pensada para uso em tela mobile, que permite registrar informacoes basicas de um bebe, acompanhar eventos de saude em uma linha do tempo e organizar consultas medicas em uma agenda.

O sistema roda diretamente no navegador e armazena os dados localmente em `localStorage`. Nao ha backend, autenticacao, banco de dados remoto ou sincronizacao entre dispositivos no codigo atual.

## 2. Publico e objetivo

O objetivo do aplicativo e ajudar responsaveis a manter um historico organizado da saude do bebe, incluindo:

- perfil do bebe;
- dados de nascimento;
- alergias;
- eventos de saude;
- medicamentos usados em eventos;
- gastos associados a eventos;
- consultas agendadas, realizadas ou canceladas.

[Inferencia] O publico principal sao pais, maes ou responsaveis pelo bebe.

## 3. Telas principais

### Perfil

Arquivo relacionado: `index.html` e `app.js`.

A tela de perfil e a primeira visualizacao do aplicativo. Quando nao existe perfil salvo, o sistema exibe uma tela de boas-vindas com botao para criar o perfil do bebe.

Quando o perfil existe, a tela exibe:

- nome completo;
- idade calculada a partir da data de nascimento;
- foto por URL ou inicial do nome;
- sexo, quando informado;
- aviso de prematuridade quando a gestacao tem menos de 37 semanas;
- quantidade total de eventos;
- peso e altura, quando informados;
- informacoes de nascimento;
- alergias agrupadas por tipo;
- total gasto em eventos;
- ultimos eventos registrados.

### Historico de saude

A tela de historico mostra os eventos de saude em formato de linha do tempo ilustrada.

Recursos identificados:

- listagem de eventos em ordem decrescente de data;
- alternancia visual dos itens entre esquerda e direita;
- filtros por categoria;
- busca por titulo, medico, hospital e observacoes;
- estado vazio quando nao ha eventos ou resultados;
- abertura de detalhes do evento;
- criacao, edicao e exclusao de eventos.

Categorias existentes:

- doenca;
- acidente;
- alergia;
- consulta;
- vacina;
- cirurgia;
- outro.

### Agenda de consultas

A tela de agenda organiza consultas em duas secoes:

- proximas consultas: consultas nao canceladas com data igual ou posterior ao dia atual;
- historico: consultas canceladas ou com data passada.

Recursos identificados:

- criacao e edicao de consultas;
- exibicao de tipo, data, horario, medico, local e status;
- destaque visual para a proxima consulta;
- contagem regressiva simples, como "Hoje", "Amanha" ou "em X dias";
- marcacao de consulta como realizada;
- cancelamento de consulta;
- exclusao de consulta.

## 4. Formularios e modais

O aplicativo usa modais tipo bottom sheet para edicao e visualizacao.

### Modal de perfil

Campos identificados:

- nome completo;
- data de nascimento;
- sexo;
- via de nascimento;
- semanas de gestacao;
- local de nascimento;
- tipo sanguineo do bebe;
- tipo sanguineo da mae;
- amamentacao;
- peso;
- altura;
- URL da foto;
- alergias com tipo, descricao e severidade.

Validacoes identificadas:

- nome completo obrigatorio;
- data de nascimento obrigatoria;
- aviso visual para prematuridade abaixo de 37 semanas.

### Modal de evento

Campos identificados:

- titulo;
- categoria;
- data;
- descricao;
- tratamento;
- medico;
- hospital ou postinho;
- medicamentos;
- custo;
- URL de imagem;
- observacoes.

Validacoes identificadas:

- titulo obrigatorio;
- categoria obrigatoria;
- data obrigatoria;
- medicamento duplicado no mesmo evento e bloqueado.

### Modal de detalhe de evento

Exibe os dados preenchidos do evento e permite:

- editar;
- excluir.

### Modal de consulta

Campos identificados:

- tipo de consulta;
- data;
- horario;
- medico;
- local ou clinica;
- observacoes;
- status.

Status existentes:

- agendada;
- realizada;
- cancelada.

Validacoes identificadas:

- tipo obrigatorio;
- data obrigatoria.

## 5. Armazenamento de dados

Os dados sao salvos no `localStorage` do navegador usando as seguintes chaves:

- `bebe_perfil`;
- `bebe_eventos`;
- `bebe_consultas`.

Impactos desse modelo:

- os dados ficam apenas no navegador/dispositivo atual;
- limpar dados do navegador pode apagar os registros;
- outro navegador, perfil de usuario ou aparelho nao tera acesso aos dados;
- nao ha controle de versao, backup automatico ou recuperacao remota.

## 6. Temas visuais

O tema e controlado pelo atributo `data-theme` no elemento `body`.

Temas existentes:

- `beige`: tema padrao;
- `menino`: tema azul;
- `menina`: tema rosa.

O tema e aplicado com base no sexo salvo no perfil. Quando o sexo nao e informado ou nao corresponde aos valores esperados, o sistema usa o tema padrao.

## 7. Navegacao

A navegacao principal e feita por uma barra inferior fixa com quatro acoes:

- Perfil;
- Historico;
- botao central de adicionar;
- Agenda.

O botao central abre um menu rapido com opcoes para criar:

- novo evento de saude;
- nova consulta.

## 8. Estados e mensagens

Estados identificados:

- perfil inexistente;
- lista de eventos vazia;
- busca sem resultado;
- agenda sem proximas consultas;
- evento ou consulta nao encontrada;
- confirmacao antes de excluir evento ou consulta.

Mensagens sao exibidas em um toast fixo na parte inferior da tela. Tipos usados:

- sucesso;
- erro.

## 9. Arquivos principais

- `index.html`: estrutura HTML, containers das telas, barra de navegacao, modais e formularios.
- `style.css`: temas, layout mobile, componentes visuais, modais, formularios, timeline e agenda.
- `app.js`: regras de dados, renderizacao das telas, navegacao, formularios, persistencia local, filtros, busca, calculos e interacoes.
- `docs/AGENTS.md`: instrucoes de processo para documentacao, especificacao e implementacao de funcionalidades.

## 10. Limitacoes e riscos

- Nao ha autenticacao ou controle de acesso.
- Nao ha backend ou sincronizacao.
- Nao ha criptografia dos dados salvos localmente.
- URLs de fotos e imagens sao carregadas diretamente; se a URL estiver indisponivel, a imagem e ocultada.
- O aplicativo depende de JavaScript habilitado.
- [Nao confirmado] Nao ha manifest, service worker ou instalacao PWA no codigo analisado.
- [Nao confirmado] Nao ha suite de testes automatizados no projeto atual.
- [Nao confirmado] Nao ha politica de privacidade ou aviso sobre armazenamento local de dados sensiveis de saude.

## 11. Pontos pouco claros

- [Nao confirmado] O projeto nao define processo de deploy.
- [Nao confirmado] O projeto nao indica se deve funcionar offline alem do carregamento local dos arquivos.
- [Nao confirmado] O projeto nao indica requisitos formais de acessibilidade.
- [Nao confirmado] O projeto nao indica publico exato, responsavel legal ou contexto medico.

