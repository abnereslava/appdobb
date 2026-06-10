# Sistema Atual: Dos tais

## 1. Visão geral

O aplicativo **"Dos tais"** é uma PWA mobile-first para registrar e acompanhar a saúde de qualquer pessoa: perfil individual, histórico de eventos médicos, agenda de consultas e calendário visual. Os dados são armazenados no Firebase Firestore com listeners em tempo real (`onSnapshot`); a autenticação usa Firebase Auth (Google). O app suporta múltiplos perfis por conta e sincroniza automaticamente entre dispositivos logados na mesma conta.

## 2. Público e objetivo

Qualquer pessoa que deseje manter um histórico organizado de saúde próprio ou de alguém sob seus cuidados, incluindo:

- perfil completo (nascimento, alergias, doenças crônicas, cor de tema, foto);
- eventos de saúde categorizados (acidentes, alergias, cirurgias, consultas, doenças, exames, vacinas, dentes, outros);
- agenda de consultas com contagem regressiva;
- calendário mensal unificado de eventos e consultas;
- exportação de consultas para apps de calendário externos.

## 3. Telas principais

### Perfil

Exibe, quando o perfil existe:

- avatar: foto local (IndexedDB) ou ícone SVG de pessoa; badge de câmera clicável (só aparece sem foto);
- nome completo e idade calculada;
- sexo (badge com ícone) e aviso de prematuridade (< 37 semanas);
- peso e altura;
- informações de nascimento (via de parto, local, semanas de gestação, tipos sanguíneos, amamentação);
- alergias agrupadas por tipo e severidade;
- doenças crônicas;
- últimos 3 eventos registrados.

Sem perfil: tela de boas-vindas com botão para criar.

#### Edição do perfil

- Abre modal com formulário completo.
- **Primeira seção: "Foto e cor do perfil"** — troca e remoção de foto (auto-salva no IndexedDB ao selecionar, sem precisar salvar o perfil); 8 swatches de cor com preview ao vivo.
- Ao fechar com alterações não salvas (exceto foto), aparece modal de confirmação "Descartar alterações?".
- Label "Medidas no Nascimento" para peso/altura (não "Medidas Atuais").

### Histórico de Saúde

Dois modos de visualização alternaveis pelo botão de olho:

**Linha do tempo** (padrão):
- cards com fio vertical, bolha de data colorida pela categoria dominante;
- separadores visuais de mês/ano;
- botão flutuante "Hoje" ao rolar.

**Visualização em cartões**:
- grupos por dia, cada um com cabeçalho de data (número grande + dia da semana + mês);
- faixa de fundo alternada a cada dois dias, colorida na cor do tema atual;
- linha vertical decorativa à esquerda.

Ambos os modos compartilham:
- dados em tempo real via `onSnapshot`, sem recarregar ao trocar de aba;
- filtro por categoria;
- busca por título, médico, hospital e observações;
- filtro por intervalo de datas (em memória);
- data de nascimento clicável no rodapé (redireciona ao Perfil);
- validação: eventos não podem ser antes de 45 semanas antes do nascimento;
- criação, edição e exclusão com formulário completo.

### Agenda de Consultas

Lista de consultas dividida em Próximas e Histórico:

- dados em tempo real via `onSnapshot`;
- busca por médico, local e tipo;
- filtro por intervalo de datas (em memória);
- destaque para a próxima consulta;
- contagem regressiva ("Hoje!", "Amanhã", "em X dias");
- marcação como Realizada ou Cancelada;
- no detalhe: botão "Exportar .ics" (individual) e botão "Google Agenda" (link direto).

### Calendário

- Grid mensal com 7 colunas;
- marcadores por tipo: ponto primário = consulta, ponto âmbar = evento;
- dia atual destacado;
- clique no nome do mês: seletor rápido (12 meses + controle de ano por setas);
- navegação entre meses com setas ← →;
- clique em dia com itens: expande lista abaixo do grid;
- itens clicáveis abrem o modal de detalhe;
- botão "Exportar" no cabeçalho: gera `.ics` com todas as consultas não-canceladas.

## 4. Navegação

Barra inferior fixa com 5 itens: **Perfil · Histórico · Agenda · Calendário · +**

- O botão "+" abre menu rápido para criar evento ou consulta.
- Swipe horizontal entre abas com animação de slide.
- Abas Histórico, Agenda e Calendário ficam desabilitadas enquanto não há perfil criado.

## 5. Temas visuais

O tema é controlado por dois atributos no `<body>`:

- **`data-theme`**: `beige | azul | rosa | verde | roxo | ambar | cinza | terracota | dark`
- **`data-genero`**: `beige | azul | rosa | verde | roxo | ambar | cinza | terracota` — persiste a cor do perfil quando o modo dark está ativo.

### 8 cores de perfil (escolhidas pelo usuário no formulário)

| Chave | Cor | Hex |
|---|---|---|
| `beige` | Bege (padrão) | `#b08d70` |
| `azul` | Azul | `#3a82c4` |
| `rosa` | Rosa | `#c4567a` |
| `verde` | Verde | `#3a9d6e` |
| `roxo` | Roxo | `#8a54c8` |
| `ambar` | Âmbar | `#c89a3a` |
| `cinza` | Cinza | `#6a7a8a` |
| `terracota` | Terracota | `#c46040` |

**Compatibilidade retroativa:** perfis antigos com `sexo: 'menino'/'menina'` e sem campo `corPerfil` são mapeados automaticamente para `azul`/`rosa` pela função `corDoPerfil()`.

**Modo dark:** `data-theme="dark"` + `data-genero="<cor>"` combina o fundo escuro com as variáveis primárias da cor escolhida.

**Fundos light:** `--bg` de cada tema colorido é quase neutro (ex.: `#fbfdfe` para azul), preservando a identidade da cor apenas nos detalhes (avatar, badges, botões, faixa alternada).

## 6. Foto do perfil (armazenamento local)

- A foto é armazenada **localmente no IndexedDB** do dispositivo (não no Firestore), banco `appdobb-avatars`, store `avatars`, chave = `profileId`.
- Redimensionada via Canvas API para 256×256 px, crop centralizado, JPEG qualidade 0,82.
- **Auto-salva** ao selecionar ou remover (em perfil já existente) — não requer salvar o perfil.
- Badge de câmera sobre o avatar da home só aparece quando não há foto; ao adicionar foto, some automaticamente.
- A foto aparece no seletor de perfis (substitui a inicial com a letra do nome).

## 7. Exportação de calendário

- **Arquivo .ics**: gerado no cliente (RFC 5545), compatível com Google Agenda, Apple Calendar e Outlook. Individual (modal de consulta) e em lote (cabeçalho do Calendário).
- **Link Google Agenda**: URL `calendar.google.com/render?action=TEMPLATE&...` abre evento pré-preenchido em nova aba.
- **Mobile**: usa Web Share API (`navigator.share`) quando disponível, com fallback para download direto.

Não há sincronização bidirecional com Google Calendar (feature futura planejada — `specs/google-calendar-sync/`).

## 8. Autenticação e multi-perfil

- Login por Google via Firebase Auth.
- Cada conta pode ter múltiplos perfis.
- Seletor de perfil ativo no cabeçalho (chip com nome + dropdown).
  - Cada card do seletor exibe fundo e borda na cor escolhida para aquele perfil; a foto substitui a inicial quando existe.
- Papéis: `usuario` (acesso próprio) e `admin` (gerenciamento de acessos via `admin.html`).

## 9. Armazenamento — Firebase Firestore

| Coleção | Conteúdo |
|---|---|
| `profiles/{profileId}` | `babyProfile` (dados do perfil), contadores |
| `profiles/{profileId}/events/{id}` | evento de saúde |
| `profiles/{profileId}/consultations/{id}` | consulta |
| `accessIndex/{email}` | `profileIds`, `role`, `permissions` |

**Estratégia de leitura:** listeners `onSnapshot` ficam ativos durante a sessão do perfil ativo. Trocar de aba não dispara nenhuma leitura Firestore — os dados são servidos do cache em memória. Alterações em outro dispositivo chegam automaticamente via listener.

**Persistência entre sessões:** `persistentLocalCache` (IndexedDB do SDK) armazena os dados localmente; ao reabrir, o Firestore busca apenas os deltas desde o último acesso.

## 10. PWA e Service Worker

- Manifest com ícones (`logo-192.png`, `logo-512.png`) e `display: standalone`. `start_url: "./"` compatível com GitHub Pages em subdiretório.
- Service Worker em `sw.js` (cache `bebe-shell-v13`):
  - **Estratégia: Network-first** — sempre tenta a rede; fallback para cache offline.
  - Firebase CDN (SDK ESM): cache-first — pré-cacheado na primeira carga online.
  - Shell files pré-cacheados com caminhos relativos (`./`) no `install`.

## 11. Arquivos principais

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura HTML, todas as views, modais, formulários, nav bar |
| `style.css` | 8 temas de cor + dark mode, layout, todos os componentes visuais |
| `app.js` | Toda a lógica: auth state, cache onSnapshot, renderização, exportação, swipe, temas, IndexedDB de fotos |
| `auth.js` | Firebase Auth, controle de acesso, inicialização de sessão |
| `firestore-api.js` | Abstração do Firestore (`window._db`): operações de escrita e listeners onSnapshot |
| `firebase-config.js` | Configuração do projeto Firebase (com `persistentLocalCache`) |
| `sw.js` | Service Worker PWA (network-first, cache v13) |
| `admin.html` / `admin.js` | Painel de gerenciamento de acessos (role: admin) |

## 12. Specs de funcionalidades implementadas

| Funcionalidade | Pasta |
|---|---|
| Autenticação Firebase + admin | `specs/firebase-auth-admin/` |
| Data de nascimento no Histórico + restrição de data | `specs/historico-restricao-nascimento/` |
| Filtro por data | `specs/filtro-por-data-paginacao/` |
| Exportação .ics e Google Agenda | `specs/exportar-calendario/` |
| Aba dedicada de Calendário | `specs/aba-calendario/` |
| Cache em memória por onSnapshot | `specs/cache-tempo-real/` |
| Integração Google Calendar (planejado) | `specs/google-calendar-sync/` |

## 13. Limitações e riscos

- Foto do perfil é local (IndexedDB do dispositivo) — não sincroniza entre dispositivos.
- Sem criptografia dos dados no Firestore além das regras de segurança.
- Filtro por texto (busca) é client-side: aplicado sobre os dados já em memória.
- Sem testes automatizados; validação manual obrigatória.
- Sem política de privacidade ou aviso sobre dados sensíveis de saúde.
