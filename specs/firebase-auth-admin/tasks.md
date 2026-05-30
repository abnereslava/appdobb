# Tarefas: Firebase, login Google e painel administrativo

## Visao geral

A implementacao deve ser feita em etapas pequenas: primeiro preparar Firebase e autenticacao, depois autorizacao, em seguida migrar os fluxos de dados para Firestore sem migrar dados locais existentes, e por fim construir o painel administrativo e reforcar as regras de seguranca.

## Tarefa 1 - Preparar configuracao Firebase

Status: Concluida

### Objetivo

Adicionar a configuracao necessaria para que o app consiga inicializar Firebase sem alterar ainda os fluxos de dados existentes.

### Arquivos afetados

- `index.html`
- `app.js`
- `firebase-config.js` ou equivalente
- `docs/firebase-setup.md`

### Dependencias

Projeto Firebase criado e configuracao web fornecida pelo usuario.

### Criterio de conclusao

O app carrega Firebase sem erro no navegador e ainda preserva o comportamento atual local.

### Teste manual

Abrir `index.html` e verificar no console que nao ha erro de inicializacao.

### Observacoes

Nao incluir chaves privadas. A configuracao web do Firebase e publica, mas regras de seguranca continuam obrigatorias.

## Tarefa 2 - Implementar login Google

Status: Concluida

### Objetivo

Adicionar tela de login e autenticacao com Google via Firebase Auth.

### Arquivos afetados

- `index.html`
- `style.css`
- `app.js`

### Dependencias

Tarefa 1 concluida e provedor Google habilitado no Firebase Authentication.

### Criterio de conclusao

Usuario consegue entrar e sair usando Google, e o app reconhece estado autenticado/nao autenticado.

### Teste manual

Entrar com uma conta Google e depois sair. Recarregar a pagina e verificar persistencia do estado de login.

### Observacoes

Nesta tarefa ainda nao liberar dados sem verificacao de convite.

## Tarefa 3 - Criar modelo de autorizacao por convite

Status: Concluida

### Objetivo

Criar a camada que verifica se o email autenticado esta convidado e ativo.

### Arquivos afetados

- `app.js`
- `firestore.rules`
- `docs/firebase-setup.md`

### Dependencias

Tarefa 2 concluida.

### Criterio de conclusao

Email nao convidado e bloqueado; email registrado em `/accessIndex/{email}` com `active: true` consegue passar pela verificacao e usa o proprio `profileId`.

### Teste manual

Entrar com email sem registro em `/accessIndex` e confirmar acesso negado. Criar `/accessIndex/abner.eslava@gmail.com` manualmente no Firestore e confirmar acesso autorizado.

### Observacoes

Esta tarefa deve incluir instrucao clara de bootstrap do primeiro admin.

## Tarefa 4 - Implementar bootstrap do primeiro administrador

Status: Concluida

### Objetivo

Documentar e validar o procedimento para estabelecer o email inicial como administrador.

### Arquivos afetados

- `docs/firebase-setup.md`
- `firestore.rules`
- `app.js`

### Dependencias

Tarefa 3 concluida.

### Criterio de conclusao

O email `abner.eslava@gmail.com`, configurado manualmente em `/accessIndex/abner.eslava@gmail.com`, consegue entrar como administrador global e visualizar acesso ao painel admin.

### Teste manual

Criar o documento `/accessIndex/abner.eslava@gmail.com` no Firebase Console, entrar com esse email e confirmar permissao administrativa.

### Observacoes

Bloquear ou alertar sobre risco de remover o ultimo administrador ativo.

## Tarefa 5 - Migrar perfil do bebe para Firestore

Status: Concluida

### Objetivo

Substituir leitura e escrita do perfil do bebe de `localStorage` para Firestore, sem importar automaticamente dados locais existentes.

### Arquivos afetados

- `app.js`
- `firestore.rules`

### Dependencias

Tarefa 4 concluida.

### Criterio de conclusao

Criar, editar e recarregar o perfil usando dados do Firestore.

### Teste manual

Salvar perfil, recarregar a pagina, entrar novamente e verificar se os dados permanecem.

### Observacoes

Nao havera importacao automatica dos dados locais existentes.

## Tarefa 6 - Migrar eventos para Firestore

Status: Concluida

### Objetivo

Substituir leitura, escrita, edicao e exclusao de eventos por Firestore.

### Arquivos afetados

- `app.js`
- `firestore.rules`

### Dependencias

Tarefa 5 concluida.

### Criterio de conclusao

Historico lista eventos do Firestore e permite criar, editar e excluir conforme permissao.

### Teste manual

Criar evento, editar, excluir e validar persistencia apos recarregar.

### Observacoes

Busca e filtros devem continuar funcionando.

## Tarefa 7 - Migrar consultas para Firestore

Status: Concluida

### Objetivo

Substituir leitura, escrita, status e exclusao de consultas por Firestore.

### Arquivos afetados

- `app.js`
- `firestore.rules`

### Dependencias

Tarefa 6 concluida.

### Criterio de conclusao

Agenda lista consultas do Firestore e permite criar, editar, marcar como realizada, cancelar e excluir conforme permissao.

### Teste manual

Criar consulta futura, marcar como realizada, cancelar outra consulta e validar secoes Proximas/Historico.

### Observacoes

Calculo de proximas consultas deve continuar baseado na data atual do navegador.

## Tarefa 8 - Criar painel administrativo

Status: Concluida

### Objetivo

Adicionar interface para administradores gerenciarem convites, usuarios, papeis e permissoes.

### Arquivos afetados

- `index.html`
- `style.css`
- `app.js`
- `firestore.rules`

### Dependencias

Tarefa 7 concluida.

### Criterio de conclusao

Administrador consegue listar, criar, editar, ativar/desativar e remover acessos de usuarios, criando um `profileId` proprio para cada convidado.

### Teste manual

Entrar como admin, criar acesso de usuario, entrar como usuario e verificar que ele acessa Perfil, Historico/Eventos e Agenda do proprio perfil, sem painel administrativo.

### Observacoes

Nao exibir painel admin para usuarios comuns.

## Tarefa 9 - Aplicar permissoes na interface

Status: Concluida

### Objetivo

Ocultar ou bloquear recursos conforme permissoes do usuario autenticado.

### Arquivos afetados

- `index.html`
- `style.css`
- `app.js`

### Dependencias

Tarefa 8 concluida.

### Criterio de conclusao

Usuarios comuns veem Perfil, Historico/Eventos e Agenda do proprio perfil; administradores veem tambem painel administrativo.

### Teste manual

Testar usuario comum com acesso aos recursos principais e sem acesso ao painel administrativo.

### Observacoes

Bloqueio visual nao substitui regras do Firestore.

## Tarefa 10 - Reforcar e testar regras de seguranca

Status: Concluida

### Objetivo

Validar que o Firestore bloqueia acesso nao autorizado independentemente da interface.

### Arquivos afetados

- `firestore.rules`
- [Sugestao] arquivos de teste do Firebase Emulator Suite

### Dependencias

Tarefa 9 concluida.

### Criterio de conclusao

Regras bloqueiam usuarios nao autenticados, nao convidados e sem permissao.

### Teste manual

Testar operacoes com usuario nao convidado, usuario convidado sem permissao, usuario comum e admin.

### Observacoes

Recomendado usar Firebase Emulator Suite antes de publicar regras em producao.

## Tarefa 11 - Atualizar documentacao e revisao

Status: Concluida

### Objetivo

Registrar como configurar Firebase, como definir o admin inicial e revisar a implementacao contra spec e plano.

### Arquivos afetados

- `docs/firebase-setup.md`
- `docs/arquitetura.md`
- `docs/sistema-atual.md`
- `specs/firebase-auth-admin/review.md`

### Dependencias

Todas as tarefas de implementacao concluidas.

### Criterio de conclusao

Documentacao explica configuracao, uso administrativo, riscos e status final.

### Teste manual

Seguir a documentacao em um ambiente limpo e confirmar que o admin inicial consegue acessar o painel.

### Observacoes

Registrar qualquer desvio de escopo no `review.md`.

## Tarefa 12 — Bloquear navegacao sem perfil cadastrado

Status: Concluida

### Objetivo

Impedir que o usuario acesse Historico, Agenda e o menu de adicionar evento/consulta enquanto nenhum perfil de bebe estiver cadastrado no Firestore.

### Contexto

Identificado durante a Tarefa 5. Nao estava nas specs originais. O fluxo atual permite navegar para Historico e Agenda mesmo sem perfil, o que gera telas vazias sem contexto de qual bebe esta sendo registrado.

### Arquivos afetados

- `app.js`

### Dependencias

Tarefa 5 concluida (perfil lido do Firestore).

### Criterio de conclusao

- Botoes de navegacao para Historico e Agenda ficam desabilitados ou ignoram o clique enquanto nao houver perfil.
- Botao "+" do menu rapido fica desabilitado ou exibe aviso enquanto nao houver perfil.
- Assim que o perfil for criado, a navegacao e liberada automaticamente.

### Teste manual

1. Entrar com email autorizado sem perfil cadastrado.
2. Tentar clicar em Historico, Agenda e "+".
3. Confirmar que nenhuma das acoes abre a tela ou exibe toast explicativo.
4. Criar o perfil e confirmar que a navegacao volta a funcionar normalmente.

### Observacoes

Nao bloquear o botao de editar perfil (lapizinho) — esse deve continuar acessivel para o usuario criar o perfil. O bloqueio e apenas visual/funcional no frontend; as regras do Firestore ja impedem gravacao de eventos/consultas sem perfil valido.

## Tarefa 13 — Substituir emojis e icones SVG por imagens da pasta img/

Status: Concluida

### Objetivo

Substituir os emojis e icones SVG usados como ilustracoes no app por imagens PNG da pasta `img/`, deixando o visual mais expressivo e coerente com a identidade do projeto. Os icones funcionais do menu de navegacao inferior NAO devem ser alterados.

### Contexto

A pasta `img/` contem 13 imagens PNG ilustrativas:
- `mamadeira.png` — icone generativo de bebe/perfil (hoje representado por SVG de mamadeira)
- `ursinhobem.png` — bebe saudavel, sem eventos
- `ursinhodoente.png` — evento de doenca
- `termometro.png` — febre, doenca em geral
- `remedios.png` — medicamentos, tratamento
- `curativo.png` — acidente, ferimento
- `hospital.png` — local de atendimento, cirurgia
- `cirurgia.png` — categoria cirurgia
- `caderneta.png` — historico, linha do tempo
- `agenda.png` — agenda de consultas
- `calendario.png` — data, consulta agendada
- `relogio.png` — horario, consulta proxima
- `brinquedo.png` — estado vazio generico, boas-vindas

### Mapeamento sugerido (a ser revisado na implementacao)

| Contexto atual | Imagem sugerida |
|---|---|
| Icone da tela de boas-vindas (welcome screen) | `brinquedo.png` |
| Avatar padrao do perfil quando sem foto | `mamadeira.png` |
| Estado vazio da timeline (sem eventos) | `ursinhobem.png` |
| Categoria doenca (dot e card da timeline) | `termometro.png` ou `ursinhodoente.png` |
| Categoria acidente | `curativo.png` |
| Categoria cirurgia | `cirurgia.png` ou `hospital.png` |
| Categoria consulta | `calendario.png` |
| Estado vazio da agenda | `agenda.png` |
| Icone da tela de carregamento e login | `mamadeira.png` |
| Icone do painel admin (admin.html) | manter SVG de escudo |

Imagens provavelmente nao aplicaveis nesta tarefa (reservadas para uso futuro ou decorativo):
- `caderneta.png` — sem contexto claro na UI atual
- `relogio.png` — o icone de horario SVG e mais adequado em linha de texto
- `brinquedo.png` — pode ser usado como alternativa ao ursinho em estado vazio

### Favicon

Usar `mamadeira.png` como favicon do `index.html` e `admin.html`, substituindo o SVG inline atual.

### Arquivos afetados

- `index.html`
- `admin.html`
- `app.js` (renderizacoes dinamicas que usam SVG ou emoji como ilustracao)
- `style.css` (se alguma imagem for inserida via CSS)

### Dependencias

Nenhuma dependencia tecnica bloqueante. Pode ser executada apos qualquer tarefa concluida.

### Criterio de conclusao

- Telas de boas-vindas, login, carregamento e estados vazios usam imagens PNG no lugar de SVG/emoji ilustrativos.
- Avatar padrao do perfil usa imagem PNG quando nao ha foto cadastrada.
- Categorias da timeline com imagem disponivel usam PNG no dot ou card.
- Favicon do index.html e admin.html e uma das imagens PNG.
- Icones funcionais do nav (Perfil, Historico, +, Agenda) permanecem como SVG.

### Teste manual

1. Abrir o app sem perfil cadastrado e confirmar que a tela de boas-vindas exibe imagem PNG.
2. Abrir a timeline sem eventos e confirmar estado vazio com imagem PNG.
3. Abrir a agenda sem consultas e confirmar estado vazio com imagem PNG.
4. Verificar favicon no navegador.
5. Confirmar que os botoes do menu de navegacao inferior continuam com seus icones SVG originais.

### Observacoes

Antes de implementar, verificar o tamanho em px das imagens para definir o melhor uso (icone grande, medio ou pequeno). Imagens muito grandes podem precisar de max-width no CSS.


## Tarefa 14 — Ajustes de estilo, responsividade e PWA

Status: Concluida

### Objetivo

Revisar o estilo visual do app em dispositivos moveis e desktop, corrigir desalinhamentos, garantir responsividade adequada e configurar o app como PWA (Progressive Web App) instalavel.

### Contexto

O app ja possui estrutura de layout responsivo, mas apos as multiplas mudancas de implementacao (tela de login, barra de usuario, admin separado, Firestore async) podem ter surgido inconsistencias visuais. Alem disso, a instalacao como PWA exige manifest.json e service worker.

### Sub-tarefas

#### 14a — Revisao e correcao de estilo

Itens a verificar e corrigir:

- Barra de usuario (`user-bar`) sobrepondo o conteudo ou desalinhando com o padding da view.
- Tela de login e tela de carregamento centralizadas corretamente em todas as alturas de tela.
- Tela de acesso negado com botoes empilhados corretamente.
- Cards de evento da timeline alinhados nos dois lados (esquerda/direita).
- Cards de consulta da agenda sem overflow em telas estreitas (320px).
- Modal de formulario com scroll adequado em telas baixas.
- Formulario de perfil: campos `form-row` nao quebrando mal em telas muito pequenas.
- Painel admin (`admin.html`): topbar fixa sem sobrepor conteudo, cards sem overflow de email longo.
- Spinner de carregamento dentro das views centralizado.
- Botoes de acao do detalhe de evento/consulta alinhados.
- Verificar alinhamento vertical de todos os modais — ha relato de pelo menos um modal (possivelmente no admin.html) aparecendo deslocado para baixo em vez de centralizado/ancorado corretamente.

#### 14b — Modo escuro (dark mode)

- Adicionar variante `data-theme="dark"` (ou usar `prefers-color-scheme: dark`) com paleta escura coerente com a identidade do app.
- Garantir que todos os componentes (cards, modais, nav, formularios, toasts, telas de login/admin) respondam corretamente ao tema escuro.
- Adicionar botao de alternancia de tema (claro/escuro) acessivel ao usuario, preferencialmente na barra de usuario ou no topo do app.
- Persistir a preferencia do usuario (localStorage).
- Testar os tres temas existentes (beige, menino, menina) em modo escuro para garantir que as cores de accent funcionem.

#### 14c — Substituir popups nativos por modais customizados

- Substituir todas as chamadas a `confirm()` no `admin.js` (usadas em "Tornar Admin/Usuario" e "Remover acesso") por um modal de confirmacao customizado reutilizavel, alinhado ao estilo visual do app.
- O modal de confirmacao deve ter: titulo, mensagem descritiva, botao de cancelar e botao de confirmar (com variante destrutiva para acoes de remocao).
- Verificar se ha outros `confirm()` ou `alert()` no `app.js` e substituir tambem.
- O modal deve ser acessivel (foco gerenciado, fechamento com Escape) e aparecer centralizado na tela.

#### 14b — PWA: manifest e service worker

Configurar o app como instalavel:

- Criar `manifest.json` com nome, descricao, icones, cor de tema e display standalone.
- Criar ou atualizar `public/sw.js` (service worker) para cachear o shell do app (HTML, CSS, JS, imagens).
- Adicionar `<link rel="manifest">` no `index.html` e `admin.html`.
- Adicionar meta tags de tema (`theme-color`) e `apple-mobile-web-app-*` para iOS.
- Testar instalacao no Chrome (Android/Desktop) e Safari (iOS).

### Arquivos afetados

- `style.css`
- `index.html`
- `admin.html`
- `app.js` (alternancia de tema, registro do service worker, substituicao de confirm())
- `admin.js` (substituicao de confirm())
- `manifest.json` (novo)
- `sw.js` (novo)

### Dependencias

Tarefa 13 concluida (para que os icones PNG estejam disponiveis para o manifest e service worker).

### Criterio de conclusao

- App sem elementos desalinhados ou cortados em telas de 320px, 375px e 414px.
- Modais aparecem corretamente posicionados em index.html e admin.html.
- Modo escuro funcional em todos os componentes, com alternancia persistida.
- Nenhum `confirm()` ou `alert()` nativo restante — todos substituidos por modal customizado.
- App instalavel via Chrome no Android.
- App funciona offline para o shell basico.
- Lighthouse PWA score >= 80.

### Teste manual

1. Abrir o app no Chrome DevTools com viewport de 320px e verificar todos os fluxos.
2. Alternar entre modo claro e escuro e confirmar que a preferencia persiste apos recarregar.
3. Testar acoes destrutivas no admin (remover, rebaixar) e confirmar que o modal customizado aparece no lugar do confirm() nativo.
4. Abrir no Chrome no celular e instalar via "Adicionar a tela inicial".
5. Desativar a internet e recarregar — o shell deve aparecer sem erro.

### Observacoes

O service worker deve versionar o cache para facilitar atualizacoes. Nao cachear chamadas ao Firestore — apenas os arquivos estaticos. O manifest deve referenciar os icones PNG da pasta `img/` para a tela inicial do dispositivo.

## Tarefa 15 — Correcoes do menu de navegacao inferior

Status: Concluida

### Objetivo

Corrigir o alinhamento do botao "+", reposiciona-lo antes de "Historico" e substituir o icone do Historico por um mais adequado para uma linha do tempo de saude.

### Contexto

O botao "+" (FAB) herda `flex-direction: column` do `.nav-btn` e nao tem `justify-content: center` explicito, causando desalinhamento vertical do SVG dentro da bolinha. O icone atual do Historico e um cifrao ($), que nao representa uma linha do tempo de saude.

### Arquivos afetados

- `index.html` — reordenar botoes no nav, trocar SVG do Historico
- `style.css` — corrigir alinhamento do `.nav-fab`

### Dependencias

Nenhuma.

### Criterio de conclusao

- O "+" esta visualmente centralizado na bolinha colorida.
- A ordem do nav e: Perfil · + · Historico · Agenda.
- O icone do Historico e um SVG de atividade/pulso (batimento), sem relacao com dinheiro.

### Teste manual

1. Abrir o app e verificar que o "+" esta centrado na bolinha.
2. Confirmar a nova ordem: Perfil, +, Historico, Agenda.
3. Verificar que o icone do Historico e o novo.

### Observacoes

O botao "+" ainda deve ser o FAB (bolinha colorida). Apenas sua posicao no nav muda.


## Tarefa 16 — Barra superior persistente com melhorias

Status: Concluida

### Objetivo

Tornar a barra superior sempre visivel em todas as abas, substituir os emojis de sol/lua por icones SVG, aumentar a area de toque do botao de tema, e exibir o nome do bebe na barra.

### Contexto

Atualmente a `user-bar` e renderizada dentro do HTML gerado por `renderizarHome()`, sumindo quando o usuario troca de aba. Precisa ser um elemento fixo no topo do `#app`. Os emojis de sol/lua sao inconsistentes com o restante do app que usa SVGs. O nome do bebe da contexto rapido sobre qual perfil esta sendo exibido.

### Arquivos afetados

- `index.html` — adicionar `#barra-topo` como elemento fixo dentro de `#app`
- `style.css` — estilos da barra persistente, botao de tema redondo e maior, chip de nome do bebe
- `app.js` — remover `renderizarBarraUsuario()` das views, adicionar `renderizarBarraTopo()` chamada uma vez pos-auth, funcao `atualizarNomeBebe()` para atualizar o chip apos carregar/salvar perfil

### Dependencias

Tarefa 15 concluida (garante que o nav esta correto antes de ajustar o topo).

### Criterio de conclusao

- A barra aparece em todas as abas (Perfil, Historico, Agenda).
- O botao de tema usa icone SVG lua/sol, e circular (40px), com area de toque confortavel.
- O nome do bebe aparece na barra como chip. Se nao houver perfil cadastrado, exibe "Sem perfil".
- A preferencia de tema continua sendo persistida e aplicada ao carregar.
- Sem regressao: logout, dark mode e nome do bebe continuam funcionando.

### Teste manual

1. Entrar no app, navegar entre Perfil, Historico e Agenda — barra deve permanecer visivel em todas.
2. Clicar no botao de tema — icone deve alternar entre lua e sol (SVG).
3. Recarregar a pagina — tema deve persistir.
4. Verificar que o nome do bebe aparece na barra apos o perfil ser carregado.
5. Salvar perfil com nome diferente — chip do nome deve atualizar.

### Observacoes

A opcao de "selecionar todos" ou trocar de perfil rapidamente nao sera implementada agora — apenas o display do nome do bebe ativo. O chip tera visual de "selecionavel" (borda, cursor pointer) como preparacao para uso futuro, mas o clique nao fara nada ainda. Registrar essa decisao no review.md.


## Tarefa 17 — Suporte a multiplos bebes por usuario

Status: Concluida

### Objetivo

Permitir que um usuario cadastre mais de um bebe e alterne entre os perfis pelo chip na barra superior.

### Decisoes confirmadas

- Somente o proprio usuario logado pode criar novos perfis de bebe (nao o admin).
- Nao ha limite de quantidade de perfis por usuario.
- O painel administrativo exibe, por usuario: quantidade de bebes, total de eventos e total de consultas.

### Modelo de dados

- `/accessIndex/{email}` passa a ter `profileIds: [string]` (array de todos os profileIds do usuario).
- O campo `profileId` original e mantido para compatibilidade com dados existentes.
- Cada `/profiles/{profileId}` ganha campos `eventCount: number` e `consultationCount: number` (contadores mantidos pelo app ao criar/excluir registros).
- O `profileIdAtivo` e uma variavel de sessao no app (nao persistida no Firestore).

### Mudancas de interface

- Chip na barra superior fica clicavel — abre seletor de bebes.
- Seletor exibe lista com nome de cada bebe + botao "+ Novo bebe".
- Ao selecionar bebe diferente, Perfil, Historico e Agenda recarregam com os dados do novo bebe.
- Ao clicar em "+ Novo bebe", um formulario minimo (apenas nome e data de nascimento) permite criar um perfil inicial rapido.
- Painel admin: cada card de usuario exibe contador de bebes, eventos e consultas.

### Mudancas nas regras do Firestore

- `validAccessDoc` passa a aceitar o campo `profileIds` como opcional.
- `ownProfile` passa a verificar se `profileId` esta em `profileIds` (alem do campo `profileId` original para retrocompatibilidade).
- Nova regra: usuario pode atualizar apenas os campos `profileIds` e `updatedAt` do proprio documento em `accessIndex`.
- Regra de criacao de perfil: usuario pode criar `/profiles/{profileId}` se o `profileId` estiver em seu `accessIndex.profileIds`.

### Arquivos afetados

- `firestore-api.js` — novas funcoes para multi-perfil e contadores
- `auth.js` — incluir `profileIds` no objeto de acesso retornado
- `app.js` — `profileIdAtivo`, seletor de bebes, criacao de novo perfil, manutencao de contadores
- `admin.js` — exibir bebeCount, eventCount, consultationCount por usuario
- `index.html` — modal do seletor de bebes
- `style.css` — estilos do seletor

### Criterio de conclusao

- [x] Decisoes de produto documentadas
- [ ] Regras do Firestore atualizadas e aplicadas no Firebase Console
- [ ] Usuario consegue criar segundo bebe pelo chip da barra
- [ ] Chip exibe o nome do bebe ativo e permite troca
- [ ] Trocar de bebe recarrega todas as vistas
- [ ] Admin ve quantidade de bebes, eventos e consultas por usuario
- [ ] Contadores de eventos e consultas sao mantidos corretamente

### Observacoes

O `profileId` original nos documentos existentes (ex: "admin-main") continua funcionando sem migracao automatica. O campo `profileIds` e adicionado apenas quando o usuario criar ou trocar de bebe pelo novo fluxo. Dados existentes nao sao perdidos.


## Tarefa 18 — Espacamento igual entre botoes do menu inferior

Status: Concluida

### Objetivo

Corrigir o espacamento visual do menu de navegacao inferior para que todos os itens (incluindo o FAB "+") tenham o mesmo espaco entre si e em relacao as bordas laterais.

### Contexto

O menu usa `display: flex` com `justify-content: space-around`. O botao FAB tem `flex: 0 0 auto` com 48px fixo, enquanto os demais tem `flex: 1`, o que causa espacamento desigual: o "+" fica colado ao "Perfil" com pouca folga entre eles. Veja print enviado pelo usuario.

A solucao e converter o nav para `display: grid` com `grid-template-columns: repeat(4, 1fr)`, garantindo colunas de largura exatamente igual. O FAB continua sendo um circulo de 48px centrado dentro de sua coluna.

### Arquivos afetados

- `style.css`

### Dependencias

Nenhuma.

### Criterio de conclusao

- Espacamento visual identico entre todos os 4 botoes e entre as bordas do nav.
- O FAB continua sendo uma bolinha colorida centrada em sua coluna.
- Os rotulos "Perfil", "Historico" e "Agenda" continuam visiveis e alinhados.

### Teste manual

1. Abrir o app e verificar o menu inferior — espacamento deve ser visualmente igual entre todos os itens.
2. Testar em viewports de 320px, 375px e 414px para confirmar consistencia.


## Tarefa 19 — Navegacao por swipe horizontal entre vistas (mobile)

Status: Concluida

### Objetivo

Permitir que o usuario deslize o dedo horizontalmente na area principal do app para navegar entre Perfil, Historico e Agenda, sem precisar tocar na barra de navegacao inferior.

### Contexto

A navegacao por swipe e padrao em apps mobile. A ordem das vistas e: Perfil (home) → Historico (timeline) → Agenda. O swipe para a esquerda avanca para a proxima vista; swipe para a direita volta para a anterior. As regras de bloqueio existentes (sem perfil = sem acesso a timeline e agenda) devem ser respeitadas.

### Requisitos tecnicos

- Detectar gestos de toque usando `touchstart`, `touchmove` e `touchend`.
- Definir limiar de swipe (ex: deltaX > 50px) para evitar ativacao por rolagem leve.
- Ignorar swipes predominantemente verticais (deltaY > deltaX) para nao interferir com scroll de conteudo.
- Chamar `showView()` com a vista correta apos detectar o swipe.
- Nao interferir com scroll interno dos modais abertos.
- Bloquear swipe para vistas que exijam perfil quando nao houver perfil cadastrado (comportamento ja implementado em `showView`).

### Arquivos afetados

- `app.js` — adicionar listeners de touch no elemento `#app` ou nas views

### Dependencias

Tarefa 18 concluida (nav correto antes de adicionar gestualidade).

### Criterio de conclusao

- Deslizar para a esquerda na vista Perfil vai para Historico (se perfil existir).
- Deslizar para a direita na vista Historico volta para Perfil.
- Deslizar para a esquerda na vista Historico vai para Agenda.
- Deslizar para a direita na vista Agenda volta para Historico.
- Swipe em Perfil para a direita nao faz nada (ja e a primeira vista).
- Swipe em Agenda para a esquerda nao faz nada (ja e a ultima vista).
- Scroll vertical do conteudo nao e interrompido pelo detector de swipe.
- Bloquear swipe para timeline/agenda quando nao houver perfil, exibindo toast.

### Teste manual

1. Abrir o app em dispositivo real ou DevTools com modo touch ativado.
2. Deslizar para a esquerda na tela de Perfil — deve ir para Historico.
3. Deslizar para a direita — deve voltar para Perfil.
4. Tentar swipe sem perfil cadastrado — deve exibir toast de bloqueio.
5. Verificar que o scroll vertical do conteudo ainda funciona normalmente.

### Observacoes

O swipe deve funcionar apenas na area `#app` (area das vistas), nao nos modais nem na barra de navegacao. Adicionar uma animacao suave de transicao entre vistas pode ser considerada como melhoria opcional na mesma tarefa.


## Tarefa 20 — Animacao de salto no botao Perfil ao bloquear navegacao

Status: Concluida

### Objetivo

Quando o usuario tentar acessar Historico ou Agenda sem ter criado um perfil, o botao "Perfil" na barra inferior deve executar uma animacao de dois saltos (bounce), indicando visualmente onde o usuario precisa ir para resolver o problema.

### Contexto

Atualmente o bloqueio apenas exibe um toast de texto. A animacao complementa o toast com um feedback visual que aponta diretamente para o botao de acao correto, melhorando a usabilidade para usuarios que nao lerem o toast.

### Requisitos tecnicos

- Criar keyframe CSS `@keyframes navBounce` com dois saltos (translateY: 0 → -8px → 0 → -5px → 0).
- Criar classe `.nav-btn-bounce` que aplica a animacao uma unica vez.
- Em `showView()` e `mostrarMenuAdicionar()`, quando bloquear por falta de perfil, adicionar a classe ao `#nav-home`.
- Remover a classe ao fim da animacao (`animationend`) para permitir re-ativacao.

### Arquivos afetados

- `style.css` — keyframe e classe de animacao
- `app.js` — aplicar/remover classe no momento do bloqueio

### Dependencias

Nenhuma.

### Criterio de conclusao

- Ao tentar ir para Historico ou Agenda sem perfil, o botao "Perfil" da dois saltos.
- A animacao ocorre simultaneamente ao toast de bloqueio.
- A animacao nao se acumula (nova tentativa re-aciona corretamente).

### Teste manual

1. Abrir o app sem perfil cadastrado.
2. Clicar em Historico ou Agenda — o botao Perfil deve saltar duas vezes.
3. Clicar novamente — a animacao deve re-acionar normalmente.
4. Verificar que apos criar o perfil a animacao nao mais aparece.
