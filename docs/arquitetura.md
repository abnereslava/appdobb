# Arquitetura: Linha do Tempo do Bebê

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
├── sw.js               — Service Worker PWA (network-first)
├── admin.html          — Painel admin (gestão de acessos)
├── admin.js            — Lógica do painel admin
├── manifest.json       — Manifesto PWA
├── img/                — Ícones e imagens ilustrativas
├── docs/               — Documentação do sistema
│   ├── AGENTS.md       — Processo de desenvolvimento orientado por spec
│   ├── sistema-atual.md
│   ├── arquitetura.md
│   ├── guia-de-uso.md
│   └── firebase-setup.md
└── specs/              — Especificações de funcionalidades
    ├── firebase-auth-admin/
    ├── historico-restricao-nascimento/
    ├── filtro-por-data-paginacao/
    ├── exportar-calendario/
    └── aba-calendario/
```

## 3. Responsabilidades por arquivo

### `index.html`
- 5 containers de view: `#view-home`, `#view-timeline`, `#view-agenda`, `#view-calendario` (nova)
- Barra de navegação inferior com 5 botões (Perfil · + · Histórico · Agenda · Calendário)
- Modais: perfil, evento (form + detalhe), consulta (form), confirmação, seletor de bebê
- Carregamento de Firebase SDK (ESM via CDN), CSS e scripts

### `style.css`
- Variáveis CSS de tema em `:root` (beige padrão)
- Temas: `[data-theme="beige"]`, `[data-theme="menino"]`, `[data-theme="menina"]`
- Dark mode base: `[data-theme="dark"]`
- Dark + gênero: `[data-theme="dark"][data-genero="menino/menina"]` — preserva cores primárias no escuro
- Layout mobile (max-width: 480px), barra nav fixa, scroll da view
- Animações de swipe: `slideInFromRight/Left` com `cubic-bezier`
- Componentes: cards, timeline, agenda, calendário (grid), seletor de mês, filtros, badges, toast

### `app.js`
Seções principais:
1. Constantes (ícones SVG/PNG, categorias, tipos)
2. Estado global (filtros, paginação, modo calendário, tema)
3. Wrappers Firestore (carregarPerfil, carregarEventos, etc.)
4. Paginação incremental (eventosCache, consultasCache, IntersectionObserver)
5. Navegação (`showView`, `animarTransicaoVista`, swipe)
6. Renderização do Perfil (`renderizarHome`)
7. Histórico (`renderizarTimeline`) — paginado, com filtro de data e busca
8. Formulário e detalhe de evento
9. Agenda (`renderizarAgendaLista`) — paginada, com filtro de data e busca
10. Calendário (`renderizarAbaCalendario`, `_buildCalendarioHTML`) — grid mensal, seletor de mês/ano
11. Exportação de calendário (`gerarICS`, `baixarArquivo`, `linkGoogleCalendar`)
12. Formulário e detalhe de consulta
13. Barra de topo e seletor de bebê
14. Swipe horizontal com animação

### `firestore-api.js`
Expõe `window._db` com métodos:
- `carregarPerfil`, `gravarPerfil`
- `listarEventos`, `listarEventosPaginados`, `carregarEvento`, `salvarEvento`, `excluirEvento`
- `listarConsultas`, `listarConsultasPaginadas`, `carregarConsulta`, `salvarConsulta`, `excluirConsulta`
- Multi-perfil: `criarNovoPerfil`, `carregarResumosPerfis`
- Admin: `listarAcessos`, `criarAcesso`, `alternarAtivo`, `alterarRole`, `removerAcesso`

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
    "alergias": [{ "id": "string", "tipo": "string", "descricao": "string", "severidade": "string" }]
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
  "titulo": "string", "categoria": "string", "data": "YYYY-MM-DD",
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

## 5. Paginação Firestore

Queries de listagem usam:
```
query(collection, orderBy('data', 'desc'), limit(20), [where(...)], [startAfter(cursor)])
```
- Filtro por data aplicado server-side via `where`
- Filtro por categoria e busca de texto aplicados client-side sobre o batch carregado
- Cursor = `DocumentSnapshot` do último doc retornado
- `IntersectionObserver` no sentinela ao fim da lista dispara o próximo batch

## 6. Temas e modo dark

Dois atributos independentes no `<body>`:
- `data-theme`: `beige | menino | menina | dark` — controla paleta de fundo/texto
- `data-genero`: `beige | menino | menina` — persiste o gênero independente do dark mode

CSS combina `[data-theme="dark"][data-genero="menino/menina"]` para aplicar cores primárias de gênero sobre o fundo escuro.

## 7. PWA

- Service Worker: network-first. Sempre tenta rede; cache offline como fallback.
- Shell pré-cacheado no `install` (HTML, CSS, JS, imagens).
- Cache versionado (`bebe-shell-v2`) — incrementar a versão força atualização em todos os clientes.

## 8. Padrões de implementação

- Funções globais chamadas por `onclick` inline no HTML gerado por `innerHTML`
- Estado global em variáveis de módulo (sem framework de state)
- Escape manual de conteúdo dinâmico com `esc()`
- SVGs inline como constantes JS; imagens ilustrativas como `<img>` PNG
- CSS baseado inteiramente em variáveis customizadas (`--primary`, `--bg`, etc.)

## 9. Riscos técnicos

- `innerHTML` com escape manual: qualquer nova inserção de conteúdo de usuário deve usar `esc()`.
- Paginação client-side de texto: busca ativa pode mostrar batches aparentemente vazios (normal — Firestore não suporta full-text search).
- Calendário carrega todos os eventos/consultas do mês sem paginação — monitorar se volumes crescerem muito.
- SW network-first: sem rede, serve cache; dados do Firestore (dinâmicos) não são cacheados pelo SW.
