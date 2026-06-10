# Arquitetura: Dos tais

## 1. Tipo de aplicação

PWA (Progressive Web App) mobile-first, SPA de página única. Sem framework frontend; JavaScript ES6+ puro com Firebase como único backend.

## 2. Estrutura de arquivos

```text
/
├── index.html          — SPA: todas as views, modais, formulários, nav bar
├── style.css           — 8 temas de cor + dark mode, layout, componentes
├── app.js              — Toda a lógica de aplicação (~2500+ linhas)
├── auth.js             — Firebase Auth, controle de acesso e sessão
├── firestore-api.js    — Abstração Firestore (window._db)
├── firebase-config.js  — Configuração do projeto Firebase
├── sw.js               — Service Worker PWA (network-first, cache v13)
├── admin.html          — Painel admin (gestão de acessos)
├── admin.js            — Lógica do painel admin
├── manifest.json       — Manifesto PWA (nome: "Dos tais", start_url: "./")
├── img/                — Ícones e imagens ilustrativas
│   ├── logo.png / logo-180.png / logo-192.png / logo-512.png
│   ├── alergia / cirurgia / curativo / hospital / ...  (ícones PNG de categoria)
│   └── nao_utilizadas/ — ícones fora de uso
├── docs/               — Documentação do sistema
├── specs/              — Especificações de funcionalidades
└── dev/                — Notas de desenvolvimento (diario.md, imagens.md)
```

## 3. Responsabilidades por arquivo

### `index.html`
- 4 containers de view: `#view-home`, `#view-timeline`, `#view-agenda`, `#view-calendario`
- Barra de navegação inferior com 5 botões: **Perfil · Histórico · Agenda · Calendário · +**
- Botão flutuante `#btn-topo` — visível ao rolar a Timeline; chama `scrollParaHoje()`
- Modais: perfil, evento (form + detalhe), consulta (form + detalhe), confirmação, seletor de bebê, novo bebê, filtro de categorias
- Carregamento de Firebase SDK (ESM via CDN), CSS e scripts

### `style.css`
- Variáveis CSS de tema em `:root` (bege padrão)
- **8 temas de cor** (selecionados pelo usuário): `beige`, `azul` (compat: `menino`), `rosa` (compat: `menina`), `verde`, `roxo`, `ambar`, `cinza`, `terracota`
- **Dark mode**: `[data-theme="dark"]` com overrides por `[data-genero="<cor>"]` para preservar as cores primárias no escuro
- Layout mobile (max-width: 480px), barra nav fixa, scroll da view
- Animações de swipe: `slideInFromRight/Left` com `cubic-bezier`
- Timeline: faixa alternada com `color-mix(var(--primary) 10%)` + `isolation: isolate` no grupo para `z-index: -1` funcionar corretamente
- Componentes: cards, timeline (linha do tempo + cartões), separadores de mês/ano, agenda, calendário (grid), seletor de mês, filtros, badges, toast, avatar, swatches de cor

### `app.js`
Seções principais:
1. Constantes (ícones SVG inline: `IMG_PESSOA`, `CAMERA_SVG`, `IMG_DENTES`, etc.; `CORES_PERFIL` com 8 entradas; categorias, tipos)
2. Estado global (filtros, modo calendário, cache onSnapshot, estado do form de perfil)
3. Helpers de IndexedDB para avatar (`_abrirAvatarDB`, `salvarAvatarLocal`, `buscarAvatarLocal`, `excluirAvatarLocal`)
4. Leitura síncrona do cache em memória (`carregarPerfil`, `carregarEventos`, `carregarConsultas`)
5. Gerenciamento de listeners (`_unsubscribeAll`, `subscribeAoPerfilAtivo`)
6. Navegação (`showView`, `animarTransicaoVista`, swipe)
7. Renderização do Perfil (`renderizarHome`) — avatar + foto assíncrona do IndexedDB, badge câmera condicional
8. Formulário de perfil — foto auto-salva, 8 swatches de cor com preview ao vivo, snapshot para detectar alterações não salvas, modal de confirmação ao fechar
9. Histórico (`renderizarTimeline`) — dois modos: linha do tempo e cartões por data
10. Formulário e detalhe de evento
11. Agenda (`renderizarAgendaLista`)
12. Calendário (`renderizarAbaCalendario`, `_buildCalendarioHTML`)
13. Exportação de calendário (`gerarICS`, `baixarArquivo`, `linkGoogleCalendar`)
14. Formulário e detalhe de consulta
15. Seletor e criação de perfis — cards coloridos por perfil, foto substitui inicial
16. Barra de topo
17. Autenticação (`_onAuthStateChange`)

### `firestore-api.js`
Expõe `window._db` com métodos:
- **Leitura pontual:** `carregarPerfil`, `carregarEvento`, `carregarConsulta`
- **Resumos:** `carregarResumosPerfis` — retorna `nomeCompleto`, `corPerfil`, `eventCount`, `consultationCount` por perfil
- **Escrita:** `gravarPerfil`, `salvarEvento`, `excluirEvento`, `salvarConsulta`, `excluirConsulta`
- **Listeners em tempo real:** `subscribePerfil`, `subscribeEventos`, `subscribeConsultas` — retornam `unsubscribe`
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
    "corPerfil": "beige | azul | rosa | verde | roxo | ambar | cinza | terracota",
    "viaNascimento": "normal | cesarea | null",
    "semanasGestacao": "string | null",
    "localNascimento": "hospital | casa | percurso | null",
    "tipoBebe": "string | null",
    "tipoMae": "string | null",
    "amamentacao": "sim | nao | outro | null",
    "amamentacaoOutro": "string | null",
    "peso": "string | null",
    "altura": "string | null",
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

> **Nota:** a foto do perfil **não** é armazenada no Firestore. Fica no IndexedDB local do dispositivo (banco `appdobb-avatars`, store `avatars`, chave = `profileId`). Não sincroniza entre dispositivos.

> **Retrocompatibilidade:** perfis antigos com `sexo: 'menino'/'menina'` sem campo `corPerfil` são mapeados para `azul`/`rosa` pela função `corDoPerfil()`.

### `profiles/{profileId}/events/{id}`
```json
{
  "titulo": "string",
  "categoria": "acidente | alergia | cirurgia | consulta | doenca | exames | vacina | dentes | outro",
  "data": "YYYY-MM-DD",
  "descricao": "string | null",
  "tratamento": "string | null",
  "medico": "string | null",
  "hospital": "string | null",
  "medicamentos": ["string"],
  "custo": "string | null",
  "imagemUrl": "string | null",
  "observacoes": "string | null",
  "criadoEm": "ISO datetime",
  "updatedAt": "timestamp"
}
```

### `profiles/{profileId}/consultations/{id}`
```json
{
  "tipo": "rotina | especialista | retorno | exame | urgencia | outro",
  "data": "YYYY-MM-DD",
  "hora": "HH:mm | null",
  "medico": "string | null",
  "local": "string | null",
  "observacoes": "string | null",
  "status": "agendada | realizada | cancelada",
  "criadoEm": "ISO datetime",
  "updatedAt": "timestamp"
}
```

### `accessIndex/{email}`
```json
{
  "email": "string",
  "profileIds": ["string"],
  "role": "usuario | admin",
  "active": true,
  "permissions": {}
}
```

## 5. Estratégia de dados em tempo real

Ao fazer login (ou trocar de perfil), `subscribeAoPerfilAtivo(profileId)` ativa três listeners `onSnapshot`:

| Listener | Coleção | Cache local |
|---|---|---|
| `subscribePerfil` | `profiles/{id}` | `_perfilCache` |
| `subscribeEventos` | `.../events` | `eventosCache` |
| `subscribeConsultas` | `.../consultations` | `consultasCache` |

**Comportamento:**
- **Primeira carga:** todos os três listeners precisam disparar antes de renderizar; até lá, as views mostram spinner.
- **Trocar de aba:** custo zero de leituras Firestore — render a partir do cache em memória.
- **Escrita:** o SDK aplica a mudança otimisticamente no cache local; o listener dispara imediatamente.
- **Outro dispositivo:** o listener recebe o documento alterado em tempo real automaticamente.
- **Logout / troca de perfil:** `_unsubscribeAll()` cancela os três listeners e limpa o cache.

**Persistência entre sessões** (`persistentLocalCache` / IndexedDB): ao reabrir, o Firestore serve do disco local e busca apenas os deltas — não recarrega a coleção inteira.

Filtros por data são aplicados **em memória** — não há queries Firestore para filtros.

## 6. Armazenamento local de fotos (IndexedDB)

- Banco: `appdobb-avatars` (versão 1), object store `avatars`, keyed by `profileId`.
- Foto redimensionada via Canvas API: crop centralizado, 256×256 px, JPEG qualidade 0,82.
- **Auto-salva** ao selecionar/remover em perfil existente, sem precisar salvar o perfil inteiro.
- Em perfil novo (sem `profileId` ainda), a foto fica em estado preparado (`_avatarFormDataUrl`) e é persistida junto com o primeiro `salvarPerfil`.
- Funções: `salvarAvatarLocal(profileId, dataUrl)`, `buscarAvatarLocal(profileId)`, `excluirAvatarLocal(profileId)`.

## 7. Temas e modo dark

Dois atributos independentes no `<body>`:
- `data-theme`: `beige | azul | rosa | verde | roxo | ambar | cinza | terracota | dark`
- `data-genero`: `beige | azul | rosa | verde | roxo | ambar | cinza | terracota`

**Fluxo:** `aplicarTema(cor)` define `data-theme` (se não dark) e `data-genero` (sempre). Em dark, `data-theme="dark"` persiste e `data-genero` garante as cores primárias corretas via seletores CSS combinados.

**Live preview:** ao selecionar uma cor nos swatches do formulário de perfil, `aplicarTema(cor)` é chamado imediatamente. Se o usuário cancelar, `fecharFormPerfil()` restaura a cor salva.

**Fundos:** `--bg` é quase neutro em todos os temas light para evitar aspecto muito colorido; a identidade da cor aparece nos detalhes (avatar, badges, faixa alternada, botões primários).

## 8. PWA

- Service Worker `sw.js`: network-first. Sempre tenta rede; cache offline como fallback.
- Firebase CDN (SDK ESM): cache-first — pré-cacheado na primeira visita online.
- Shell pré-cacheado no `install` com caminhos **relativos** (`./`) — compatível com GitHub Pages (subdiretório `/appdobb/`).
- Cache versionado (`bebe-shell-v13`) — incrementar força atualização em todos os clientes.
- `manifest.json`: `start_url: "./"`, ícones `logo-192.png` e `logo-512.png`.
- Dados dinâmicos do Firestore **não** são cacheados pelo SW; são persistidos pelo `persistentLocalCache` do SDK.

## 9. Padrões de implementação

- Funções globais chamadas por `onclick` inline no HTML gerado por `innerHTML`
- Estado global em variáveis de módulo (sem framework de state)
- Escape manual de conteúdo dinâmico com `esc()`
- SVGs inline como constantes JS (`IMG_PESSOA`, `CAMERA_SVG`, `IMG_DENTES`, etc.)
- Imagens ilustrativas como `<img>` PNG exibidas como silhueta branca via `filter: brightness(0) invert(1)`
- CSS baseado inteiramente em variáveis customizadas (`--primary`, `--bg`, etc.)

## 10. Riscos técnicos

- `innerHTML` com escape manual: qualquer nova inserção de conteúdo de usuário deve usar `esc()`.
- Foto local no IndexedDB: não sincroniza entre dispositivos — comportamento esperado e documentado.
- Filtro por texto: client-side sobre o cache em memória.
- `onSnapshot` mantém conexão WebSocket aberta enquanto o app está ativo.
- Faixa alternada da timeline usa `color-mix()` — suportado nos navegadores modernos; fallback `rgba(0,0,0,0.05)` para navegadores antigos.
