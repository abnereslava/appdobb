# Relação de imagens (`img/`)

Inventário das imagens do projeto, seu estado e onde são utilizadas no código.
Atualizado após: troca do ícone de Doença (ursinhodoente → termômetro) e adição dos ícones de categoria vacina/alergia/outro.

## ✅ Em uso

- **agenda.png** — `app.js` (`IMG_AGENDA`), estado vazio da Agenda; cache `sw.js`
- **brinquedo.png** — `app.js:385` (`IMG_BRINQUEDO`), ícone de boas-vindas; cache `sw.js`
- **calendario.png** — `app.js` (`IMG_CONSULTA`), categoria Consulta; cache `sw.js`
- **cirurgia.png** — `app.js` (`IMG_CIRURGIA`), categoria Cirurgia; cache `sw.js`
- **curativo.png** — `app.js` (`IMG_ACIDENTE`), categoria Acidente; cache `sw.js`
- **termometro.png** — `app.js` (`IMG_DOENCA`), categoria Doença (substituiu `ursinhodoente.png`); cache `sw.js`
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
- **hospital.png** — não referenciada em nenhum lugar.
- **relogio.png** — o relógio é desenhado via SVG inline (`CLOCK_SVG`).
- **remedios.png** — não há categoria "remédios"; a constante `IMG_REMEDIOS` foi removida do código.
