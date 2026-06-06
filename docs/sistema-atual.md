# Sistema Atual: Dos tais

## 1. Visão geral

O aplicativo **"Dos tais"** é uma PWA mobile-first que permite registrar e acompanhar a saúde de um bebê: perfil, histórico de eventos médicos, agenda de consultas e calendário visual. Os dados são armazenados no Firebase Firestore com listeners em tempo real (`onSnapshot`); a autenticação usa Firebase Auth. O app funciona com múltiplos perfis de bebê por conta e sincroniza automaticamente entre dispositivos logados na mesma conta.

## 2. Público e objetivo

Pais, mães ou responsáveis pelo bebê que desejam manter um histórico organizado de saúde, incluindo:

- perfil completo do bebê (nascimento, alergias, doenças crônicas, peso, altura);
- eventos de saúde categorizados (acidentes, alergias, cirurgias, consultas, doenças, exames, vacinas, outros);
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
- doenças crônicas;
- últimos 3 eventos registrados.

Sem perfil: tela de boas-vindas com botão para criar.

### Histórico de Saúde

Linha do tempo ilustrada com:

- dados carregados em tempo real via `onSnapshot` (sem paginação por cursor);
- separadores visuais de mês/ano entre grupos de eventos;
- botão flutuante "Hoje" (aparece ao rolar) que centraliza o item mais próximo da data atual;
- filtro por categoria (acidente, alergia, cirurgia, consulta, doença, exames, vacina, outro);
- busca por título, médico, hospital e observações;
- filtro por intervalo de datas — aplicado em memória;
- data de nascimento clicável no rodapé da timeline (redireciona ao Perfil);
- validação de data mínima: eventos não podem ser registrados antes de 45 semanas antes do nascimento;
- criação, edição e exclusão de eventos com formulário completo.

### Agenda de Consultas

Lista de consultas dividida em Próximas e Histórico:

- dados em tempo real via `onSnapshot`;
- busca por médico, local e tipo;
- filtro por intervalo de datas — aplicado em memória;
- destaque para a próxima consulta;
- contagem regressiva ("Hoje!", "Amanhã", "em X dias");
- marcação como Realizada ou Cancelada;
- no detalhe: botão "Exportar .ics" (individual) e botão "Google Agenda" (link direto).

### Calendário

Aba dedicada na nav bar:

- grid mensal com 7 colunas;
- marcadores por tipo: ponto na cor primária = consulta, ponto âmbar = evento de saúde;
- dia atual destacado;
- clique no nome do mês: abre seletor rápido (12 meses + controle de ano por setas);
- navegação entre meses com setas ← →;
- clique em dia com itens: expande lista abaixo do grid;
- itens clicáveis abrem o modal de detalhe correspondente;
- botão "Exportar" no cabeçalho: gera `.ics` com todas as consultas não-canceladas.

## 4. Navegação

Barra inferior fixa com 5 itens: **Perfil · Histórico · Agenda · Calendário · +**

- O botão "+" fica no canto direito e abre menu rápido para criar evento ou consulta.
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

**Estratégia de leitura:** listeners `onSnapshot` ficam ativos durante toda a sessão do perfil ativo. A troca de aba não dispara nenhuma leitura ao Firestore — os dados são servidos do cache em memória. Alterações feitas por outro dispositivo chegam automaticamente via listener.

**Persistência entre sessões:** `persistentLocalCache` (IndexedDB) armazena os dados localmente; ao reabrir o app, o Firestore busca apenas os deltas desde o último acesso.

## 9. PWA e Service Worker

- Manifest com ícones (`logo-192.png`, `logo-512.png`) e `display: standalone`. `start_url: "./"` garante compatibilidade com hospedagem em subdiretório (GitHub Pages).
- Service Worker em `sw.js` (cache `bebe-shell-v7`):
  - **Estratégia: Network-first** — sempre tenta a rede; fallback para cache offline.
  - Shell files (HTML, CSS, JS, imagens) são pré-cacheados com caminhos **relativos** (`./`) no `install`.
  - Requisições externas (Firebase, CDN) não são interceptadas.

## 10. Arquivos principais

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura HTML, todas as views, modais, formulários, nav bar |
| `style.css` | Temas (beige/menino/menina/dark+gênero), layout, componentes |
| `app.js` | Toda a lógica: auth state, cache onSnapshot, renderização, exportação, swipe, temas |
| `auth.js` | Firebase Auth, controle de acesso, inicialização de sessão |
| `firestore-api.js` | Abstração do Firestore (`window._db`): operações de escrita e listeners onSnapshot |
| `firebase-config.js` | Configuração do projeto Firebase (com `persistentLocalCache`) |
| `sw.js` | Service Worker PWA (network-first, cache v7) |
| `admin.html` / `admin.js` | Painel de gerenciamento de acessos (role: admin) |

## 11. Specs de funcionalidades implementadas

| Funcionalidade | Pasta |
|---|---|
| Autenticação Firebase + admin | `specs/firebase-auth-admin/` |
| Data de nascimento no Histórico + restrição de data | `specs/historico-restricao-nascimento/` |
| Filtro por data | `specs/filtro-por-data-paginacao/` |
| Exportação .ics e Google Agenda | `specs/exportar-calendario/` |
| Aba dedicada de Calendário | `specs/aba-calendario/` |
| Integração Google Calendar (planejado) | `specs/google-calendar-sync/` |

## 12. Limitações e riscos

- Sem criptografia dos dados no Firestore além das regras de segurança.
- Filtro por texto (busca) é client-side: aplicado sobre os dados já em memória.
- Sem testes automatizados; validação manual obrigatória.
- Sem política de privacidade ou aviso sobre dados sensíveis de saúde.
