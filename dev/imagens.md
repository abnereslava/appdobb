# Relação de imagens (`img/`)

Inventário das imagens do projeto, seu estado e onde são utilizadas no código.
Atualizado após: troca do ícone de Doença (ursinhodoente → termômetro) e adição dos ícones de categoria vacina/alergia/outro.

## Tratamento visual — silhueta branca

> **Convenção do projeto:** as imagens enviadas pelo desenvolvedor **sempre têm fundo transparente** quando necessário (alpha nos cantos/área externa à forma). Isso é pré-requisito para o tratamento de silhueta funcionar — o `filter` pinta de branco apenas a forma, deixando o entorno transparente.

As imagens PNG **continuam sendo a base**, mas são renderizadas como **silhueta branca sobre fundo de cor sólida** via CSS (`filter: brightness(0) invert(1)`), em vez de aparecerem coloridas. Locais com esse tratamento:

- **Ícones de categoria** (`.category-icon-img`): dots da timeline, círculos de "Últimos eventos" (home) e detalhe do evento — fundo na cor sólida da categoria.
- **Imagens ilustrativas** (`.img-icon-ilustracao`): boas-vindas (brinquedo) e estados vazios (ursinho/agenda) — fundo na cor primária do tema.

Exceções (mantidas como imagem original, **sem** silhueta):
- **logo.png** e variantes — identidade da marca (login, carregamento, favicon, ícones PWA).
- **mamadeira.png** — avatar padrão do perfil (placeholder quando não há foto).

As chips de filtro **deixaram de exibir ícone** (ficaram só com texto), pois uma silhueta branca seria invisível no fundo claro da chip.

## Compressão / dimensões

Para acelerar o carregamento do app, as imagens são salvas **no tamanho realmente usado** (com folga para telas retina), não em alta resolução. Total de `img/` caiu de ~4,6 MB para ~0,7 MB.

- **Ícones de categoria** (`alergia`, `calendario`, `cirurgia`, `curativo`, `hospital`, `outro`, `termometro`, `vacina`): **96×96** (exibidos ≤22 px).
- **Ilustrações** (`agenda`, `brinquedo`, `ursinhobem`): **256×256** (exibidas ≤72 px).
- **mamadeira** (avatar): **256×256** (exibido ≤88 px).
- **logo.png** (marca/favicon): **256×256** (exibido ≤88 px) — era 1079×1105 / 2,5 MB.
- **logo-180 / logo-192 / logo-512** (ícones PWA/Apple): **mantêm as dimensões nominais**; reduzidos via quantização de paleta (256 cores) preservando o alfa.

> Reprocessar com Pillow (`Image.LANCZOS` para redimensionar; `optimize=True`; `quantize(method=FASTOCTREE)` quando precisar preservar transparência). Os PNGs originais em alta resolução ficam preservados no histórico do git e em `dev/icones-originais/`.

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

## ⏳ Pendentes (categoria sem PNG)

- **dentes** — categoria "Dentes" (eventos). Ainda **sem imagem**; usa um SVG inline preenchido (`IMG_DENTES`, classe `category-icon category-icon-fill`) como silhueta branca provisória. Quando houver o PNG (fundo transparente, 96×96), substituir o SVG por `<img class="category-icon-img">` como as demais categorias.

## 🗑️ Não utilizadas (candidatas a descarte)

- **ursinhodoente.png** — era a categoria Doença, substituída por `termometro.png`. Sem uso.
- **relogio.png** — o relógio é desenhado via SVG inline (`CLOCK_SVG`).
- **remedios.png** — não há categoria "remédios"; a constante `IMG_REMEDIOS` foi removida do código.
