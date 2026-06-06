# Relação de imagens (`img/`)

Inventário das imagens do projeto, seu estado e onde são utilizadas no código.
Atualizado após: troca do ícone de Doença (ursinhodoente → termômetro) e adição dos ícones de categoria vacina/alergia/outro.

## Tratamento visual — silhueta branca

As imagens PNG **continuam sendo a base**, mas são renderizadas como **silhueta branca sobre fundo de cor sólida** via CSS (`filter: brightness(0) invert(1)`), em vez de aparecerem coloridas. Locais com esse tratamento:

- **Ícones de categoria** (`.category-icon-img`): dots da timeline, círculos de "Últimos eventos" (home) e detalhe do evento — fundo na cor sólida da categoria.
- **Imagens ilustrativas** (`.img-icon-ilustracao`): boas-vindas (brinquedo) e estados vazios (ursinho/agenda) — fundo na cor primária do tema.

Exceções (mantidas como imagem original, **sem** silhueta):
- **logo.png** e variantes — identidade da marca (login, carregamento, favicon, ícones PWA).
- **mamadeira.png** — avatar padrão do perfil (placeholder quando não há foto).

As chips de filtro **deixaram de exibir ícone** (ficaram só com texto), pois uma silhueta branca seria invisível no fundo claro da chip.

## ✅ Em uso

- **agenda.png** — `app.js` (`IMG_AGENDA`), estado vazio da Agenda; cache `sw.js`
- **brinquedo.png** — `app.js:385` (`IMG_BRINQUEDO`), ícone de boas-vindas; cache `sw.js`
- **calendario.png** — `app.js` (`IMG_CONSULTA`), categoria Consulta; cache `sw.js`
- **cirurgia.png** — `app.js` (`IMG_CIRURGIA`), categoria Cirurgia; cache `sw.js`
- **curativo.png** — `app.js` (`IMG_ACIDENTE`), categoria Acidente; cache `sw.js`
- **termometro.png** — `app.js` (`IMG_DOENCA`), categoria Doença (substituiu `ursinhodoente.png`); cache `sw.js`
- **hospital.png** — `app.js` (`IMG_EXAMES`), categoria Exames; cache `sw.js`
- **alergia.png** — `app.js` (`IMG_ALERGIA`), categoria Alergia; cache `sw.js`
- **vacina.png** — `app.js` (`IMG_VACINA`), categoria Vacina; cache `sw.js`
- **outro.png** — `app.js` (`IMG_OUTRO`), categoria Outro (renomeado a partir de `caderneta.png`); cache `sw.js`
- **mamadeira.png** — `admin.html:24` e `app.js:402`, perfil do bebê; cache `sw.js`
- **ursinhobem.png** — `app.js` (`IMG_URSINHOBEM`), estado vazio da Timeline; cache `sw.js`
- **logo.png** — `index.html` / `admin.html`, favicon e logo das telas de login
- **logo-180.png** — `index.html` / `admin.html`, `apple-touch-icon`; cache `sw.js`
- **logo-192.png** — `manifest.json`, ícone PWA 192×192; cache `sw.js`
- **logo-512.png** — `manifest.json`, ícone PWA 512×512; cache `sw.js`

## 🗑️ Não utilizadas (candidatas a descarte)

- **ursinhodoente.png** — era a categoria Doença, substituída por `termometro.png`. Sem uso.
- **relogio.png** — o relógio é desenhado via SVG inline (`CLOCK_SVG`).
- **remedios.png** — não há categoria "remédios"; a constante `IMG_REMEDIOS` foi removida do código.
