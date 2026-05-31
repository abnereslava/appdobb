# Sistema Atual: Linha do Tempo do Bebê

## 1. Visão geral

O aplicativo "Linha do Tempo do Bebê" é uma PWA mobile-first que permite registrar e acompanhar a saúde de um bebê: perfil, histórico de eventos médicos, agenda de consultas e calendário visual. Os dados são armazenados no Firebase Firestore; a autenticação usa Firebase Auth. O app funciona com múltiplos perfis de bebê por conta.

## 2. Público e objetivo

Pais, mães ou responsáveis pelo bebê que desejam manter um histórico organizado de saúde, incluindo:

- perfil completo do bebê (nascimento, alergias, peso, altura);
- eventos de saúde categorizados (doenças, vacinas, cirurgias, etc.);
- agenda de consultas com contagem regressiva;
- calendário mensal unificado de eventos e consultas;
- exportação de consultas para apps de calendário externos.

## 3. Telas principais

### Perfil

Exibe, quando o perfil existe:

- nome completo e idade calculada;
- foto (por URL);
- sexo (com badge de gênero);
- aviso de prematuridade (< 37 semanas);
- peso e altura;
- informações de nascimento (via de parto, local, semanas de gestação, tipos sanguíneos, amamentação);
- alergias agrupadas por tipo;
- total gasto em eventos;
- últimos 3 eventos registrados.

Sem perfil: tela de boas-vindas "Bem-vindo(a)!" com botão para criar.

### Histórico de Saúde

Linha do tempo ilustrada com:

- paginação incremental (20 itens/vez via Firestore `limit/startAfter`);
- scroll infinito automático via `IntersectionObserver`;
- filtro por categoria (doença, acidente, alergia, consulta, vacina, cirurgia, outro);
- busca por título, médico, hospital e observações;
- filtro por intervalo de datas (compartilhado com a Agenda);
- data de nascimento clicável no cabeçalho (redireciona ao Perfil);
- validação de data mínima: eventos não podem ser registrados antes de 45 semanas antes do nascimento;
- criação, edição e exclusão de eventos com formulário completo.

### Agenda de Consultas

Lista de consultas dividida em Próximas e Histórico:

- paginação incremental com scroll infinito;
- busca por médico, local e tipo;
- filtro por intervalo de datas (compartilhado com o Histórico);
- destaque para a próxima consulta;
- contagem regressiva ("Hoje!", "Amanhã", "em X dias");
- marcação como Realizada ou Cancelada;
- no detalhe: botão "Exportar .ics" (individual) e botão "Google Agenda" (link direto).

### Calendário

Aba dedicada na nav bar (após Agenda):

- grid mensal com 7 colunas;
- marcadores por tipo: ponto na cor primária = consulta, ponto âmbar = evento de saúde;
- dia atual destacado;
- clique no nome do mês: abre seletor rápido (12 meses + controle de ano por setas);
- navegação entre meses com setas ← →;
- clique em dia com itens: expande lista abaixo do grid;
- itens clicáveis abrem o modal de detalhe correspondente;
- botão "Exportar" no cabeçalho: gera `.ics` com todas as consultas não-canceladas.

## 4. Navegação

Barra inferior fixa com 5 itens: **Perfil · + · Histórico · Agenda · Calendário**

- O botão "+" abre menu rápido para criar evento ou consulta.
- Swipe horizontal entre abas com animação de slide (entrada da direita/esquerda conforme direção).
- Abas Histórico, Agenda e Calendário ficam desabilitadas visualmente enquanto não há perfil criado.

## 5. Temas visuais

Controlado pelos atributos `data-theme` e `data-genero` no `<body>`:

| `data-theme` | `data-genero` | Resultado |
|---|---|---|
| `beige` | qualquer | Tema bege neutro |
| `menino` | `menino` | Azul |
| `menina` | `menina` | Rosa |
| `dark` | `beige` | Dark neutro |
| `dark` | `menino` | Dark com acentos azuis |
| `dark` | `menina` | Dark com acentos rosa |

O `data-genero` persiste independentemente do modo dark, garantindo que as cores de gênero sejam mantidas ao alternar o tema escuro.

## 6. Exportação de calendário

- **Arquivo .ics**: gerado no cliente (RFC 5545), compatível com Google Agenda, Apple Calendar e Outlook. Disponível individual (modal de consulta) e em lote (cabeçalho do Calendário).
- **Link Google Agenda**: URL `calendar.google.com/render?action=TEMPLATE&...` abre evento pré-preenchido em nova aba. Disponível no modal de consulta individual.
- **Mobile**: usa Web Share API (`navigator.share`) quando disponível, com fallback para download direto.

Não há sincronização bidirecional com Google Calendar (escopo de feature futura).

## 7. Autenticação e multi-perfil

- Login por Google via Firebase Auth.
- Cada conta pode ter múltiplos perfis de bebê.
- Seletor de bebê ativo no cabeçalho (chip com nome + dropdown).
- Papéis: `usuario` (acesso próprio) e `admin` (gerenciamento de acessos via `admin.html`).

## 8. Armazenamento — Firebase Firestore

| Coleção | Documento | Conteúdo |
|---|---|---|
| `profiles/{profileId}` | perfil do bebê | `babyProfile`, contadores |
| `profiles/{profileId}/events/{id}` | evento de saúde | todos os campos do evento |
| `profiles/{profileId}/consultations/{id}` | consulta | todos os campos da consulta |
| `accessIndex/{email}` | acesso do usuário | `profileIds`, `role`, `permissions` |

Queries de listagem usam `orderBy('data', 'desc')` com `limit(20)` e `startAfter` para paginação eficiente.

## 9. PWA e Service Worker

- Manifest com ícones e `display: standalone`.
- Service Worker em `sw.js` (cache `bebe-shell-v2`):
  - **Estratégia: Network-first** — sempre tenta a rede; fallback para cache offline.
  - Shell files (HTML, CSS, JS, imagens) são pré-cacheados no `install`.
  - Requisições externas (Firebase, CDN) não são interceptadas.

## 10. Arquivos principais

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura HTML, todas as views, modais, formulários, nav bar |
| `style.css` | Temas (beige/menino/menina/dark+gênero), layout, componentes |
| `app.js` | Toda a lógica: auth state, renderização, paginação, exportação, swipe, temas |
| `auth.js` | Firebase Auth, controle de acesso, inicialização de sessão |
| `firestore-api.js` | Abstração do Firestore (`window._db`), queries paginadas |
| `firebase-config.js` | Configuração do projeto Firebase |
| `sw.js` | Service Worker PWA (network-first) |
| `admin.html` / `admin.js` | Painel de gerenciamento de acessos (role: admin) |

## 11. Specs de funcionalidades implementadas

| Funcionalidade | Pasta |
|---|---|
| Autenticação Firebase + admin | `specs/firebase-auth-admin/` |
| Data de nascimento no Histórico + restrição de data | `specs/historico-restricao-nascimento/` |
| Filtro por data + paginação incremental | `specs/filtro-por-data-paginacao/` |
| Exportação .ics e Google Agenda | `specs/exportar-calendario/` |
| Aba dedicada de Calendário | `specs/aba-calendario/` |

## 12. Limitações e riscos

- Sem criptografia dos dados no Firestore além das regras de segurança.
- Filtro por texto (busca) não é server-side: combina paginação Firestore com filtragem local, o que pode fazer o "Carregar mais" parecer vazio com buscas muito específicas.
- Calendário carrega todos os eventos/consultas do mês sem paginação (aceitável pelo volume mensal esperado).
- Sem testes automatizados; validação manual obrigatória.
- Sem política de privacidade ou aviso sobre dados sensíveis de saúde.
