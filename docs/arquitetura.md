# Arquitetura: Dos tais

## 1. Tipo de aplicação

PWA (Progressive Web App) mobile-first, SPA de página única. Sem framework frontend; JavaScript ES6+ puro com Firebase como único backend.

## 2. Estrutura de arquivos

```text
/
├── index.html          — SPA: todas as views, modais, formulários, nav bar
├── style.css           — Temas, layout, todos os componentes visuais
├── app.js              — Toda a lógica de aplicação (~2000+ linhas)
├── auth.js             — Firebase Auth, controle de acesso e sessão
├── firestore-api.js    — Abstração Firestore (window._db)
├── firebase-config.js  — Configuração do projeto Firebase
├── sw.js               — Service Worker PWA (network-first, cache v7)
├── admin.html          — Painel admin (gestão de acessos)
├── admin.js            — Lógica do painel admin
├── manifest.json       — Manifesto PWA (nome: "Dos tais", start_url: "./")
├── img/                — Ícones e imagens ilustrativas
│   ├── logo.png / logo-180.png / logo-192.png / logo-512.png  — identidade visual
│   ├── alergia / cirurgia / curativo / hospital / ...          — ícones de categoria
│   └── nao_utilizadas/ — ícones fora de uso
├── docs/               — Documentação do sistema
│   ├── AGENTS.md       — Processo de desenvolvimento orientado por spec
│   ├── sistema-atual.md
│   ├── arquitetura.md
│   ├── guia-de-uso.md
│   └── firebase-setup.md
├── specs/              — Especificações de funcionalidades
│   ├── firebase-auth-admin/
│   ├── historico-restricao-nascimento/
│   ├── filtro-por-data-paginacao/
│   ├── exportar-calendario/
│   ├── aba-calendario/
│   └── google-calendar-sync/
└── dev/                — Notas de desenvolvimento
    ├── diario.md
    └── imagens.md
```

## 3. Responsabilidades por arquivo

### `index.html`
- 5 containers de view: `#view-home`, `#view-timeline`, `#view-agenda`, `#view-calendario`
- Barra de navegação inferior com 5 botões: **Perfil · Histórico · Agenda · Calendário · +**
  - O botão "+" fica no canto direito (último item)
- Botão flutuante `#btn-topo` (clock icon) — visível ao rolar a Timeline; chama `scrollParaHoje()`
- Modais: perfil, evento (form + detalhe), consulta (form), confirmação, seletor de bebê, novo bebê
- Carregamento de Firebase SDK (ESM via CDN), CSS e scripts

### `style.css`
- Variáveis CSS de tema em `:root` (beige padrão)
- Temas: `[data-theme="beige"]`, `[data-theme="menino"]`, `[data-theme="menina"]`
- Dark mode base: `[data-theme="dark"]`
- Dark + gênero: `[data-theme="dark"][data-genero="menino/menina"]` — preserva cores primárias no escuro
- Layout mobile (max-width: 480px), barra nav fixa, scroll da view
- Animações de swipe: `slideInFromRight/Left` com `cubic-bezier`
- Componentes: cards, timeline, separadores de mês/ano, agenda, calendário (grid), seletor de mês, filtros, badges, toast, botão topo

### `app.js`
Seções principais:
1. Constantes (ícones SVG/PNG, categorias, tipos de consulta, tipos de alergia)
2. Estado global (filtros, modo calendário, tema, cache onSnapshot)
3. Funções de leitura síncrona do cache em memória (`carregarPerfil`, `carregarEventos`, `carregarConsultas`)
4. Gerenciamento de listeners (`_unsubscribeAll`, `subscribeAoPerfilAtivo`)
5. Navegação (`showView`, `animarTransicaoVista`, swipe)
6. Renderização do Perfil (`renderizarHome`)
7. Histórico (`renderizarTimeline`) — dados do cache, filtro de data em memória, separadores de mês/ano, botão "Hoje"
8. Formulário e detalhe de evento
9. Agenda (`renderizarAgendaLista`) — dados do cache, filtro de data em memória
10. Calendário (`renderizarAbaCalendario`, `_buildCalendarioHTML`) — grid mensal, seletor de mês/ano
11. Exportação de calendário (`gerarICS`, `baixarArquivo`, `linkGoogleCalendar`)
12. Formulário e detalhe de consulta
13. Barra de topo e seletor de bebê
14. Swipe horizontal com animação
15. Autenticação (`_onAuthStateChange`)

### `firestore-api.js`
Expõe `window._db` com métodos:
- **Leitura pontual:** `carregarPerfil`, `carregarEvento`, `carregarConsulta`, `carregarResumosPerfis`
- **Escrita:** `gravarPerfil`, `salvarEvento`, `excluirEvento`, `salvarConsulta`, `excluirConsulta`
- **Listeners em tempo real:** `subscribePerfil`, `subscribeEventos`, `subscribeConsultas` — retornam função de cancelamento (`unsubscribe`)
- **Multi-perfil:** `criarNovoPerfil`
- **Admin:** `listarAcessos`, `criarAcesso`, `alternarAtivo`, `alterarRole`, `removerAcesso`

### `firebase-config.js`
- Inicializa o app Firebase
- Cria `db` via `initializeFirestore` com `persistentLocalCache()` — habilita IndexedDB para persistência entre sessões

## 4. Modelo de dados — Firestore

### `profiles/{profileId}`
```json
{
  "babyProfile": {
    "nomeCompleto": "string",
    "dataNascimento": "YYYY-MM-DD",
    "sexo": "menino | menina | null",
    "viaNascimento": "normal | cesarea | null",
    "semanasGestacao": "string | null",
    "localNascimento": "hospital | casa | percurso | null",
    "tipoBebe": "string | null",
    "tipoMae": "string | null",
    "amamentacao": "sim | nao | outro | null",
    "peso": "string | null",
    "altura": "string | null",
    "fotoUrl": "string | null",
    "alergias": [{ "id": "string", "tipo": "string", "descricao": "string", "severidade": "string" }],
    "doencasCronicas": [{ "id": "string", "descricao": "string", "observacao": "string" }]
  },
  "eventCount": 0,
  "consultationCount": 0,
  "createdBy": "uid",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `profiles/{profileId}/events/{id}`
```json
{
  "titulo": "string",
  "categoria": "acidente | alergia | cirurgia | consulta | doenca | exames | vacina | outro",
  "data": "YYYY-MM-DD",
  "descricao": "string | null", "tratamento": "string | null",
  "medico": "string | null", "hospital": "string | null",
  "medicamentos": ["string"], "custo": "string | null",
  "imagemUrl": "string | null", "observacoes": "string | null",
  "criadoEm": "ISO datetime", "updatedAt": "timestamp"
}
```

### `profiles/{profileId}/consultations/{id}`
```json
{
  "tipo": "rotina | especialista | retorno | exame | urgencia | outro",
  "data": "YYYY-MM-DD", "hora": "HH:mm | null",
  "medico": "string | null", "local": "string | null",
  "observacoes": "string | null", "status": "agendada | realizada | cancelada",
  "criadoEm": "ISO datetime", "updatedAt": "timestamp"
}
```

### `accessIndex/{email}`
```json
{
  "email": "string", "profileId": "string", "profileIds": ["string"],
  "role": "usuario | admin", "active": true,
  "permissions": { "perfil": {}, "historico": {}, "agenda": {}, "admin": {} }
}
```

## 5. Estratégia de dados em tempo real

Ao fazer login (ou trocar de bebê), `subscribeAoPerfilAtivo(profileId)` ativa três listeners `onSnapshot`:

| Listener | Coleção | Cache local |
|---|---|---|
| `subscribePerfil` | `profiles/{id}` | `_perfilCache` |
| `subscribeEventos` | `.../events` | `eventosCache` |
| `subscribeConsultas` | `.../consultations` | `consultasCache` |

**Comportamento:**
- **Primeira carga**: todos os três listeners precisam disparar antes de `_cacheReady = true`; até lá, as views mostram spinner.
- **Trocar de aba**: custo zero de leituras Firestore — render a partir do cache em memória.
- **Escrita local**: o SDK do Firestore aplica a mudança otimisticamente no cache local antes da confirmação da rede; o listener dispara imediatamente com o dado atualizado.
- **Outro dispositivo**: o listener recebe o documento alterado em tempo real sem nenhuma ação do usuário.
- **Logout / troca de bebê**: `_unsubscribeAll()` cancela os três listeners e limpa o cache.

**Persistência entre sessões** (`persistentLocalCache` / IndexedDB): ao reabrir o app, o Firestore serve do disco local e busca apenas os deltas (`resumeToken`) — não recarrega a coleção inteira.

Filtros por data são aplicados **em memória** sobre `eventosCache`/`consultasCache` — não há queries Firestore para filtros.

## 6. Temas e modo dark

Dois atributos independentes no `<body>`:
- `data-theme`: `beige | menino | menina | dark` — controla paleta de fundo/texto
- `data-genero`: `beige | menino | menina` — persiste o gênero independente do dark mode

CSS combina `[data-theme="dark"][data-genero="menino/menina"]` para aplicar cores primárias de gênero sobre o fundo escuro.

## 7. PWA

- Service Worker `sw.js`: network-first. Sempre tenta rede; cache offline como fallback.
- Shell pré-cacheado no `install` com caminhos **relativos** (`./`) — compatível com GitHub Pages (subdiretório).
- Cache versionado (`bebe-shell-v7`) — incrementar a versão força atualização em todos os clientes.
- `manifest.json`: `start_url: "./"`, ícones `logo-192.png` e `logo-512.png`.
- Dados dinâmicos do Firestore **não** são cacheados pelo SW; são persistidos pelo `persistentLocalCache` do SDK.

## 8. Padrões de implementação

- Funções globais chamadas por `onclick` inline no HTML gerado por `innerHTML`
- Estado global em variáveis de módulo (sem framework de state)
- Escape manual de conteúdo dinâmico com `esc()`
- SVGs inline como constantes JS; imagens ilustrativas como `<img>` PNG
- CSS baseado inteiramente em variáveis customizadas (`--primary`, `--bg`, etc.)

## 9. Riscos técnicos

- `innerHTML` com escape manual: qualquer nova inserção de conteúdo de usuário deve usar `esc()`.
- Filtro por texto (busca): aplicado client-side sobre o cache em memória. Se o volume de eventos crescer muito, pode haver lentidão de filtro (improvável para o uso esperado).
- Calendário renderiza todos os eventos/consultas do mês a partir do cache — sem custo de leitura.
- SW network-first: sem rede, serve cache do SW (shell); dados dinâmicos vêm do IndexedDB do Firestore SDK.
- `onSnapshot` mantém uma conexão WebSocket aberta enquanto o app está ativo — consumo mínimo de banda para polling, mas conexão persistente.
