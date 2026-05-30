# Plano Tecnico: Firebase, login Google e painel administrativo

## 1. Resumo da solucao

A solucao proposta usa Firebase Authentication com provedor Google para autenticar usuarios e Cloud Firestore para armazenar dados e permissoes.

O armazenamento atual em `localStorage` sera substituido por uma camada de dados capaz de ler e gravar no Firestore. A interface atual sera preservada tanto quanto possivel, mas passara a depender do estado de autenticacao e das permissoes do usuario.

Modelo recomendado:

- Firebase Auth identifica o usuario por Google login.
- Firestore guarda acessos por email, membros e dados do bebe por perfil.
- Firestore Security Rules validam se o email/UID autenticado esta autorizado.
- Painel administrativo gerencia convites e permissoes.

Para evitar backend nesta primeira etapa, o primeiro administrador sera criado manualmente no Firestore. O email inicial confirmado e `abner.eslava@gmail.com`. Esse email nao deve ser hardcoded no codigo; o app deve consultar os documentos de acesso do Firestore. O administrador sera tratado como administrador global para criar acessos e perfis de convidados.

Cada usuario convidado tera um `profileId` proprio. Usuarios comuns terao acesso completo aos recursos principais do proprio perfil: Perfil, Historico/Eventos e Agenda. Eles nao terao acesso ao painel administrativo.

## 2. Dependencias

Dependencias externas:

- Firebase Authentication.
- Cloud Firestore.
- Firebase JavaScript SDK.
- Conta/projeto Firebase criado pelo usuario.
- Provedor Google habilitado no Firebase Authentication.

Dependencias internas:

- `index.html`: estrutura de login e painel admin.
- `style.css`: estilos para login, estados bloqueados e painel admin.
- `app.js`: estado de auth, camada de dados Firestore, permissoes, renderizacao condicional e painel admin.
- [Sugestao] `firebase-config.js`: configuracao publica do app Firebase.
- [Sugestao] `firestore.rules`: regras de seguranca versionadas no projeto.
- [Sugestao] `docs/firebase-setup.md`: guia operacional para configurar Firebase e primeiro admin.

Referencias oficiais consultadas:

- Firebase Auth Google Web: https://firebase.google.com/docs/auth/web/google-signin
- Cloud Firestore Security Rules: https://firebase.google.com/docs/firestore/security/get-started
- Firestore role-based access: https://firebase.google.com/docs/firestore/solutions/role-based-access
- Firebase custom claims: https://firebase.google.com/docs/auth/admin/custom-claims

Observacao tecnica: custom claims sao uteis para papeis globais, mas exigem ambiente privilegiado com Firebase Admin SDK. Como o app atual nao possui backend, o plano inicial usa documentos no Firestore e regras de seguranca.

Sobre "build step": e um processo de compilacao/empacotamento com ferramentas como npm, Vite ou Webpack. Como o projeto atual e HTML/CSS/JS puro e o usuario nao quer decidir isso agora, a implementacao planejada continua estatica, com Firebase SDK carregado diretamente no navegador.

## 3. Arquivos afetados

- `index.html`: adicionar tela/area de login, area de usuario autenticado e containers do painel administrativo.
- `style.css`: adicionar estilos para login, usuario autenticado, acesso negado, painel admin e controles de permissao.
- `app.js`: integrar Firebase Auth, Firestore, estado de usuario, camada de dados remota, verificacao de permissoes e painel administrativo.
- `firebase-config.js` ou bloco equivalente: armazenar configuracao publica do app Firebase.
- `firestore.rules`: definir regras de seguranca do Firestore.
- `docs/firebase-setup.md`: orientar configuracao do Firebase, Google provider e primeiro admin.
- `specs/firebase-auth-admin/review.md`: atualizar apos implementacao.

## 4. Estrutura de dados

Estrutura proposta no Firestore:

```text
/appSettings/main
/accessIndex/{email}
/profiles/{profileId}
/profiles/{profileId}/members/{uid}
/profiles/{profileId}/events/{eventId}
/profiles/{profileId}/consultations/{consultationId}
```

### `/appSettings/main`

Uso proposto:

```json
{
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "adminProfileId": "admin-main"
}
```

### `/accessIndex/{email}`

Indice de descoberta por email. Permite que o usuario autenticado descubra a qual perfil pertence sem o email administrador estar hardcoded no app.

Documento inicial recomendado: `/accessIndex/abner.eslava@gmail.com`.

```json
{
  "email": "abner.eslava@gmail.com",
  "profileId": "admin-main",
  "role": "admin",
  "active": true,
  "permissions": {
    "perfil": { "read": true, "write": true, "delete": true },
    "historico": { "read": true, "write": true, "delete": true },
    "agenda": { "read": true, "write": true, "delete": true },
    "admin": { "read": true, "write": true, "delete": true, "manage": true }
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Para usuarios convidados, o painel administrativo criara um documento semelhante com:

```json
{
  "email": "convidado@example.com",
  "profileId": "profile-gerado-para-o-convidado",
  "role": "user",
  "active": true,
  "permissions": {
    "perfil": { "read": true, "write": true, "delete": true },
    "historico": { "read": true, "write": true, "delete": true },
    "agenda": { "read": true, "write": true, "delete": true },
    "admin": { "read": false, "write": false, "delete": false, "manage": false }
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `/profiles/{profileId}`

Representa o perfil de dados do bebe de um usuario. Cada convidado tem seu proprio documento de perfil.

```json
{
  "babyProfile": {
    "nomeCompleto": "string",
    "dataNascimento": "YYYY-MM-DD",
    "sexo": "menino | menina | null",
    "viaNascimento": "normal | cesarea | null",
    "semanasGestacao": "string | null",
    "localNascimento": "string | null",
    "tipoBebe": "string | null",
    "tipoMae": "string | null",
    "amamentacao": "string | null",
    "amamentacaoOutro": "string | null",
    "peso": "string | null",
    "altura": "string | null",
    "fotoUrl": "string | null",
    "alergias": []
  },
  "createdBy": "uid",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `/profiles/{profileId}/members/{uid}`

Usuario que ja entrou pelo Google e foi vinculado ao perfil.

```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string | null",
  "photoURL": "string | null",
  "role": "admin | user",
  "active": true,
  "permissions": {
    "perfil": { "read": true, "write": true, "delete": false },
    "historico": { "read": true, "write": true, "delete": true },
    "agenda": { "read": true, "write": true, "delete": true },
    "admin": { "read": true, "write": true, "delete": true, "manage": true }
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "lastLoginAt": "timestamp"
}
```

### Eventos e consultas

Eventos atuais devem migrar de `bebe_eventos` para `/profiles/{profileId}/events/{eventId}`.

Consultas atuais devem migrar de `bebe_consultas` para `/profiles/{profileId}/consultations/{consultationId}`.

## 5. Regras de seguranca e permissoes

Regras necessarias:

- negar tudo por padrao;
- exigir `request.auth != null`;
- permitir leitura do proprio documento em `/accessIndex/{email}`;
- permitir que administradores globais leiam e gerenciem documentos de acesso;
- permitir acesso ao perfil somente para membro ativo;
- permitir escrita em perfil/eventos/consultas apenas no `profileId` associado ao email autenticado;
- permitir gerenciar acessos e membros somente para administradores ativos com permissao `admin.manage`;
- bloquear remocao/rebaixamento do ultimo administrador ativo;
- validar campos esperados para reduzir escrita de dados indevidos.

Risco importante: nao confiar apenas em esconder botoes no frontend. As regras do Firestore precisam bloquear o acesso indevido mesmo se alguem tentar chamar o banco diretamente.

## 6. Fluxos tecnicos

### Login

1. Inicializar Firebase.
2. Observar estado de autenticacao.
3. Se nao autenticado, renderizar tela de login.
4. Ao clicar em login, abrir fluxo Google.
5. Ao autenticar, carregar membro/convite.
6. Se autorizado, carregar permissoes e dados.
7. Se nao autorizado, mostrar acesso negado e opcao de sair.

### Bootstrap do primeiro administrador

1. Criar projeto Firebase.
2. Habilitar Authentication com provedor Google.
3. Criar banco Cloud Firestore.
4. Publicar regras iniciais de seguranca.
5. Criar manualmente um perfil inicial e um convite/admin ou membro/admin para o email definido.
6. Entrar no app com esse email.
7. Confirmar que o painel administrativo aparece.

Instrucao operacional proposta:

- usar o Firebase Console ou script de navegador para criar `/appSettings/main` com `adminProfileId: "admin-main"`;
- usar o Firebase Console ou script de navegador para criar `/accessIndex/abner.eslava@gmail.com` com `profileId: "admin-main"`, `role: "admin"`, `active: true` e permissao total;
- usar o Firebase Console ou script de navegador para criar `/profiles/admin-main` como perfil inicial administrativo;
- apos o primeiro login, o app cria ou vincula `/profiles/{profileId}/members/{uid}`;
- depois disso, novos administradores e usuarios sao criados pelo painel.

Decisao confirmada: o primeiro admin sera configurado por documento Firestore manual, nao por hardcode e nao por custom claim.

### Painel administrativo

1. Verificar permissao `admin.manage`.
2. Listar membros e convites.
3. Permitir criar acesso por email.
4. Permitir escolher papel.
5. Para usuarios comuns, atribuir automaticamente acesso completo aos recursos principais e bloquear admin.
6. Permitir ativar, desativar ou remover acesso.
7. Recarregar permissoes quando houver alteracao.

### Dados do app

1. Substituir `carregarPerfil`, `gravarPerfil`, `carregarEventos`, `gravarEventos`, `carregarConsultas` e `gravarConsultas` por versoes assicronas baseadas em Firestore.
2. Ajustar renderizacoes para aguardar dados remotos.
3. Atualizar formularios para salvar no Firestore.
4. Manter compatibilidade visual com a interface atual.

## 7. Impactos no sistema existente

- Funcoes hoje sincronas passarao a depender de chamadas assincronas.
- Renderizacao precisara lidar com estados de carregamento e erro.
- O app deixara de funcionar como app totalmente local.
- Dados passarao a depender de internet e disponibilidade do Firebase.
- A barra de navegacao e menus deverao esconder recursos sem permissao.
- Exclusoes e alteracoes deverao respeitar permissoes do Firestore.

## 8. Riscos tecnicos

- Regras de seguranca mal definidas podem expor dados sensiveis.
- Implementar permissoes apenas no frontend seria inseguro.
- Migrar de funcoes sincronas para assincronas pode quebrar renderizacoes atuais.
- O app atual nao tem build step; usar SDK modular via CDN exige organizacao cuidadosa.
- Criar administradores pelo cliente exige regras bem restritas.
- Se o primeiro admin for configurado incorretamente, nenhum usuario conseguira administrar o sistema.
- Dados de saude exigem cautela com privacidade e acesso em dispositivos compartilhados.

## 9. Estrategia de teste

Testes manuais minimos:

- Login com email nao convidado deve ser bloqueado.
- Login com email admin inicial deve abrir painel admin.
- Admin deve criar acesso de usuario.
- Usuario convidado deve entrar e ver Perfil, Historico/Eventos e Agenda do proprio perfil.
- Usuario convidado nao deve conseguir acessar painel administrativo.
- Usuario convidado nao deve conseguir ler ou escrever dados de outro `profileId`.
- Admin deve convidar outro admin.
- Admin nao deve conseguir remover/rebaixar o ultimo admin ativo.
- Regras do Firestore devem bloquear acesso indevido mesmo alterando chamadas no console/devtools.

Testes tecnicos recomendados:

- usar Firebase Emulator Suite para testar regras de seguranca;
- validar casos de `request.auth == null`;
- validar acesso por email convidado e nao convidado;
- validar cada combinacao de permissao relevante.

## 10. Ordem recomendada de implementacao

1. Criar projeto Firebase e obter configuracao web.
2. Adicionar arquivo de configuracao local do Firebase.
3. Integrar Firebase SDK e tela de login Google.
4. Criar camada de autorizacao e estados de acesso.
5. Criar estrutura Firestore e regras iniciais.
6. Implementar bootstrap do primeiro admin.
7. Migrar perfil para Firestore.
8. Migrar eventos para Firestore.
9. Migrar consultas para Firestore.
10. Criar painel administrativo.
11. Aplicar permissoes na UI.
12. Validar permissoes nas regras do Firestore.
13. Documentar configuracao final e atualizar review.
