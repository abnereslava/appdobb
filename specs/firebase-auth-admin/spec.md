# Especificacao: Firebase, login Google e painel administrativo

## 1. Objetivo

Implementar autenticacao com Google via Firebase, substituir o armazenamento local por armazenamento em nuvem e adicionar um painel administrativo para controlar quais emails podem acessar o aplicativo, com papel de usuario ou administrador e permissoes por recurso.

## 2. Contexto

O sistema atual e uma aplicacao web estatica que salva perfil, eventos e consultas no `localStorage`. Isso limita o uso ao navegador atual, nao oferece controle de acesso e nao protege dados sensiveis.

A nova funcionalidade deve mover os dados para Firebase e exigir login Google antes do uso. Apenas emails previamente convidados devem acessar o aplicativo.

## 3. Usuarios envolvidos

- Administrador inicial: email `abner.eslava@gmail.com`, definido manualmente no Firestore como primeiro administrador do sistema, sem hardcode no codigo da aplicacao.
- Administrador convidado: email convidado com papel de administrador.
- Usuario convidado: email convidado com papel de usuario, acesso ao proprio perfil do bebe e acesso a todos os recursos nao administrativos.
- Usuario nao convidado: pessoa autenticada pelo Google, mas sem convite ativo; deve ser bloqueada.

## 4. Funcionamento esperado

O aplicativo deve exibir uma tela de login Google quando nao houver usuario autenticado.

Apos login:

- o sistema verifica se o email autenticado possui convite ativo;
- se nao possuir convite ativo, bloqueia o acesso;
- se possuir convite ativo, carrega os dados do proprio perfil associado ao email;
- se for administrador, exibe acesso ao painel administrativo;
- se for usuario comum, exibe apenas os recursos liberados.

O painel administrativo deve permitir:

- listar convites e usuarios autorizados;
- convidar novo email;
- definir papel como usuario ou administrador;
- definir papel como usuario ou administrador;
- [Inferencia] para usuario comum, liberar todos os recursos do aplicativo exceto painel administrativo;
- ativar ou desativar acesso;
- remover acesso de convidados;
- [Sugestao] visualizar data de criacao, ultimo acesso e quem criou o convite.

## 5. Fluxo principal

1. O administrador inicial configura o Firebase e registra manualmente o email `abner.eslava@gmail.com` como administrador no Firestore.
2. O usuario abre o aplicativo.
3. O aplicativo solicita login com Google.
4. O usuario autentica com uma conta Google.
5. O aplicativo consulta o Firestore para verificar se o email esta autorizado.
6. Se autorizado, o aplicativo carrega o perfil e os dados permitidos.
7. Se administrador, o usuario acessa o painel administrativo.
8. O administrador cadastra convites para outros emails.
9. O convidado acessa com Google usando o email convidado.
10. O sistema aplica as permissoes configuradas.

## 6. Regras de negocio

- Apenas usuarios autenticados pelo Google podem acessar o aplicativo.
- Apenas emails convidados podem acessar dados do aplicativo.
- Um usuario autenticado sem convite ativo deve ver uma mensagem de acesso negado.
- Administradores podem convidar usuarios e outros administradores.
- Usuarios comuns nao podem acessar o painel administrativo.
- Usuarios comuns devem acessar todos os recursos principais do proprio perfil: Perfil, Historico/Eventos e Agenda.
- Usuarios comuns nao devem acessar recursos administrativos.
- Dados atuais do `localStorage` nao devem ser considerados fonte principal apos migracao para Firebase.
- O email administrador inicial nao deve ser hardcoded no codigo; ele deve ser lido a partir dos documentos de acesso do Firestore.
- Nao havera migracao automatica dos dados locais existentes para o Firebase.
- Cada convidado deve acessar um perfil proprio, separado dos demais convidados e do administrador.

## 7. Permissoes

Papeis propostos:

- `admin`: pode acessar o painel administrativo, gerenciar emails autorizados e acessar recursos administrativos.
- `user`: pode acessar todos os recursos principais do proprio perfil, exceto recursos administrativos.

Recursos propostos:

- `perfil`: dados do bebe e alergias.
- `historico`: eventos de saude.
- `agenda`: consultas.
- `admin`: painel administrativo.

Niveis internos propostos por recurso:

- `read`: visualizar.
- `write`: criar ou editar.
- `delete`: excluir.
- `manage`: administrar permissoes, aplicavel ao painel admin.

Decisao confirmada: na experiencia atual, o usuario convidado tera acesso completo a Perfil, Historico/Eventos e Agenda do proprio perfil. O controle granular fica reservado como estrutura interna para evolucao futura, mas nao sera exposto como requisito inicial no painel.

## 8. Dados necessarios

Dados de autenticacao:

- UID do Firebase Auth.
- email.
- nome exibido.
- URL da foto da conta Google, se fornecida.

Dados de autorizacao:

- email convidado ou email administrador inicial;
- papel;
- status ativo/inativo;
- permissoes por recurso;
- perfil de dados associado;
- usuario administrador que criou ou alterou o convite;
- datas de criacao e atualizacao.

Dados do aplicativo:

- perfil do bebe;
- eventos de saude;
- consultas;
- metadados de criacao e atualizacao.

## 9. Estados e mensagens

Estados esperados:

- carregando Firebase;
- nao autenticado;
- autenticando com Google;
- autenticado e verificando convite;
- acesso negado;
- convite inativo;
- permissao insuficiente;
- sem dados;
- erro de rede;
- erro de permissao do Firestore;
- sucesso ao salvar;
- sucesso ao convidar;
- confirmacao antes de remover acesso ou excluir dados.

## 10. Casos extremos

- Usuario tenta entrar com email nao convidado.
- Usuario convidado entra com outro email Google.
- Convite existe, mas esta inativo.
- Administrador remove o proprio acesso.
- Administrador tenta rebaixar o ultimo administrador ativo.
- Permissao e alterada enquanto o usuario esta usando o app.
- Firebase indisponivel ou sem internet.
- Regras do Firestore bloqueiam uma operacao esperada.
- Dados antigos no `localStorage` existem ao mesmo tempo que dados no Firebase.
- Dois administradores alteram o mesmo usuario simultaneamente.

## 11. Criterios de aceite

- [ ] O aplicativo exige login Google antes de exibir dados.
- [ ] Usuario sem convite ativo nao consegue acessar o app.
- [ ] Usuario convidado consegue acessar Perfil, Historico/Eventos e Agenda do proprio perfil.
- [ ] Usuario convidado nao consegue acessar painel ou dados administrativos.
- [ ] Administrador consegue acessar painel administrativo.
- [ ] Administrador consegue convidar email como usuario.
- [ ] Administrador consegue convidar email como administrador.
- [ ] Administrador consegue alterar permissoes de um convidado.
- [ ] Administrador consegue desativar ou remover acesso de convidado.
- [ ] Dados de perfil, eventos e consultas sao salvos no Firestore.
- [ ] Regras de seguranca do Firestore impedem acesso direto a dados por usuarios nao autorizados.
- [ ] A aplicacao nao depende mais de `localStorage` como armazenamento principal.
- [ ] Existe instrucao documentada para definir o primeiro email administrador.

## 12. Duvidas pendentes

- Email administrador inicial confirmado: `abner.eslava@gmail.com`.
- Convidados terao perfil proprio.
- Nao havera migracao dos dados atualmente salvos em `localStorage`.
- Permissoes iniciais de usuario comum: todos os recursos principais, exceto admin.
- [Inferencia] Como o projeto atual e estatico e o usuario nao definiu build step, manter a implementacao sem build step por enquanto, usando Firebase SDK carregado no navegador.
- [Pendente] Deve haver backup/exportacao dos dados?
