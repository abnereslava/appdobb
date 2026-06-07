# Relação de imagens (`img/`)

Inventário das imagens do projeto, seu estado e onde são utilizadas no código.
Atualizado após: **migração dos ícones de categoria e das ilustrações para SVG inline (Lucide)** — os PNGs correspondentes foram removidos.

## Ícones agora são SVG inline (não-PNG)

Os ícones que só serviam como **silhueta branca monocromática** deixaram de ser PNG e passaram a ser **SVG inline** (conjunto [Lucide](https://lucide.dev), o mesmo estilo dos ícones de interface já usados no app: lupa, olho, etc.). Vantagens: sem arquivos/requisições de rede, sem cache, nítidos em qualquer tamanho, e cor controlada por CSS (`currentColor`) em vez do hack `filter: brightness(0) invert(1)`.

- **Ícones de categoria** — constantes `IMG_DOENCA`, `IMG_ACIDENTE`, `IMG_CONSULTA`, `IMG_CIRURGIA`, `IMG_ALERGIA`, `IMG_VACINA`, `IMG_EXAMES`, `IMG_OUTRO` em `app.js`, via classe `.category-icon` (stroke branco sobre o fundo colorido da categoria nos dots da timeline, nos círculos de "Últimos eventos" e no detalhe do evento). Mapeamento Lucide: doença→`thermometer`, acidente→`bandage`, consulta→`stethoscope`, cirurgia→`scissors`, alergia→`flower-2`, vacina→`syringe`, exames→`microscope`, outro→`ellipsis`.
- **Ilustrações** (boas-vindas e estados vazios) — `IMG_BRINQUEDO` (boas-vindas → `heart-pulse`), `IMG_URSINHOBEM` (Histórico vazio → `clipboard-list`), `IMG_AGENDA` (Agenda vazia → `calendar-x`). Renderizadas em branco pelos seletores `.welcome-icon svg` / `.empty-icon svg`.
- **dentes** — categoria "Dentes": SVG inline **desenhado à mão** (`IMG_DENTES`, classe `category-icon category-icon-fill`), pois o Lucide não tem ícone de dente.

> Para trocar/adicionar um ícone de categoria, basta editar o `<path>` da constante em `app.js` — nenhuma imagem ou entrada no `sw.js` é necessária. Pegue o SVG correspondente em lucide.dev e mantenha apenas `viewBox` + os elementos internos, usando `class="category-icon"`.

As chips de filtro **não exibem ícone** (só texto).

## PNGs ainda em uso

As únicas imagens raster restantes são a marca e o avatar:

- **logo.png** — `index.html` / `admin.html`, favicon e logo das telas de login.
- **logo-180.png** — `apple-touch-icon`; cache `sw.js`.
- **logo-192.png** / **logo-512.png** — ícones PWA (`manifest.json`); cache `sw.js`.
- **mamadeira.png** — avatar padrão do perfil (`app.js`, placeholder sem foto; e `admin.html`); cache `sw.js`.

> Dimensões/compressão: `logo*` em 256×256 (e dimensões nominais para os ícones PWA, via quantização de paleta preservando o alfa); `mamadeira` 256×256. Reprocessar com Pillow (`Image.LANCZOS`; `optimize=True`; `quantize(method=FASTOCTREE)` para preservar transparência). Originais em alta resolução ficam no histórico do git e em `dev/icones-originais/`.

## ⏳ Pendentes

- **dentes** — quando houver um desenho melhor, substituir o `<path>` de `IMG_DENTES` (continua SVG inline; não precisa virar PNG).
- **ilustrações com tema infantil → versão neutra** — com a generalização do app para um público geral:
  - `IMG_BRINQUEDO` já foi trocado pelo ícone neutro `heart-pulse`; reavaliar se é o melhor símbolo de boas-vindas.
  - **mamadeira.png** (avatar) ainda tem tema de bebê; mantida provisoriamente. Ao substituir por uma versão neutra, manter nome/dimensões (256×256, fundo transparente).

## 🗑️ Não utilizadas

PNGs de ícone/ilustração foram **removidos do repositório** ao migrar para SVG (`agenda`, `alergia`, `brinquedo`, `calendario`, `cirurgia`, `curativo`, `hospital`, `outro`, `termometro`, `ursinhobem`, `vacina`) — recuperáveis pelo histórico do git se necessário. Também removidos: `remedios.png` (sem categoria correspondente). Permanecem fora de uso no histórico: `ursinhodoente.png`, `relogio.png` (relógio é SVG inline `CLOCK_SVG`).
