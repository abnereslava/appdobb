# Arquitetura: Linha do Tempo do Bebe

## 1. Tipo de aplicacao

O projeto e uma aplicacao web estatica composta por HTML, CSS e JavaScript puro.

Nao foram identificados:

- framework frontend;
- gerenciador de pacotes;
- backend;
- API externa propria;
- banco de dados remoto;
- build step;
- testes automatizados.

## 2. Estrutura de arquivos

```text
/
├── app.js
├── index.html
├── style.css
└── docs/
    ├── AGENTS.md
    ├── arquitetura.md
    ├── guia-de-uso.md
    └── sistema-atual.md
```

## 3. Responsabilidades por arquivo

### `index.html`

Define a estrutura base da aplicacao:

- containers das tres views principais;
- barra inferior de navegacao;
- menu rapido de adicao;
- modal de perfil;
- modal de evento;
- modal reutilizado para detalhe de evento e consulta;
- modal de consulta;
- toast de notificacao;
- carregamento de fontes, CSS e JavaScript.

### `style.css`

Centraliza toda a aparencia do aplicativo:

- variaveis CSS de tema;
- temas `beige`, `menino` e `menina`;
- layout mobile com largura maxima de 480px;
- barra de navegacao fixa;
- cartoes de perfil;
- linha do tempo;
- agenda de consultas;
- botoes;
- formularios;
- modais;
- badges;
- toast;
- responsividade basica.

### `app.js`

Contem a logica da aplicacao:

- leitura e escrita no `localStorage`;
- navegacao entre views;
- aplicacao de tema;
- renderizacao do perfil;
- edicao do perfil;
- gerenciamento de alergias;
- renderizacao da timeline;
- filtro e busca de eventos;
- criacao, edicao, detalhe e exclusao de eventos;
- renderizacao da agenda;
- criacao, edicao, detalhe, cancelamento, realizacao e exclusao de consultas;
- formatacao de data, idade e moeda;
- exibicao de toasts.

## 4. Modelo de dados

### Perfil

Chave: `bebe_perfil`

Estrutura salva pelo codigo:

```json
{
  "nomeCompleto": "string",
  "dataNascimento": "YYYY-MM-DD",
  "sexo": "menino | menina | null",
  "viaNascimento": "normal | cesarea | null",
  "semanasGestacao": "string | null",
  "localNascimento": "hospital | casa | percurso | null",
  "tipoBebe": "string | null",
  "tipoMae": "string | null",
  "amamentacao": "sim | nao | outro | null",
  "amamentacaoOutro": "string | null",
  "peso": "string | null",
  "altura": "string | null",
  "fotoUrl": "string | null",
  "alergias": [
    {
      "id": "string",
      "tipo": "alimentar | medicamentosa | respiratoria | outra",
      "descricao": "string",
      "severidade": "leve | moderada | grave | string"
    }
  ],
  "atualizadoEm": "ISO datetime"
}
```

### Eventos

Chave: `bebe_eventos`

Estrutura salva pelo codigo:

```json
[
  {
    "id": "string",
    "titulo": "string",
    "categoria": "doenca | acidente | alergia | consulta | vacina | cirurgia | outro",
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
    "atualizadoEm": "ISO datetime"
  }
]
```

### Consultas

Chave: `bebe_consultas`

Estrutura salva pelo codigo:

```json
[
  {
    "id": "string",
    "tipo": "rotina | especialista | retorno | exame | urgencia | outro",
    "data": "YYYY-MM-DD",
    "hora": "HH:mm | null",
    "medico": "string | null",
    "local": "string | null",
    "observacoes": "string | null",
    "status": "agendada | realizada | cancelada",
    "criadoEm": "ISO datetime",
    "atualizadoEm": "ISO datetime"
  }
]
```

## 5. Fluxos tecnicos

### Inicializacao

1. O navegador carrega `index.html`.
2. O CSS e aplicado a partir de `style.css`.
3. O script `app.js` e carregado.
4. No evento `DOMContentLoaded`, o app le o perfil do `localStorage`.
5. Se houver sexo no perfil, aplica o tema correspondente.
6. Renderiza a tela de perfil.

### Navegacao

1. Os botoes da barra inferior chamam `showView(nome)`.
2. A funcao remove a classe `active` das views e botoes.
3. A view solicitada recebe a classe `active`.
4. A funcao de renderizacao da view e chamada.

### Persistencia

1. Formularios coletam dados do DOM.
2. O codigo valida campos obrigatorios.
3. Objetos JavaScript sao montados.
4. Os dados sao serializados com `JSON.stringify`.
5. Os dados sao gravados no `localStorage`.
6. A tela ativa e renderizada novamente.

## 6. Dependencias externas

Dependencias identificadas:

- Google Fonts para as familias `Playfair Display` e `Inter`.

Nao foram identificadas bibliotecas JavaScript externas.

## 7. Seguranca e privacidade

Os dados registrados incluem informacoes pessoais e de saude. No modelo atual:

- os dados ficam acessiveis a qualquer pessoa com acesso ao navegador/perfil local;
- nao ha senha, sessao ou usuario;
- nao ha criptografia local implementada;
- nao ha consentimento, termo de uso ou aviso de privacidade no codigo;
- nao ha mecanismo de backup ou exportacao.

[Sugestao] Antes de uso real com dados sensiveis, adicionar aviso claro sobre armazenamento local e avaliar requisitos de privacidade.

## 8. Padroes de implementacao

Padroes observados:

- funcoes globais chamadas diretamente por `onclick` no HTML;
- renderizacao por `innerHTML`;
- estado global simples para filtro, busca, alergias temporarias e medicamentos temporarios;
- SVGs inline como constantes JavaScript;
- CSS baseado em variaveis customizadas;
- escape manual de textos dinamicos com a funcao `esc`.

## 9. Riscos tecnicos

- Uso amplo de `innerHTML` exige manter o escape correto de qualquer conteudo inserido pelo usuario.
- Dados locais podem se perder se o usuario limpar o armazenamento do navegador.
- Sem validacao estrutural de dados antigos, registros corrompidos no `localStorage` podem gerar comportamentos inesperados.
- O modal de detalhe e reutilizado para eventos e consultas, o que exige cuidado em futuras alteracoes.
- Eventos e consultas usam datas em formato ISO local, mas comparacoes dependem de `Date`; mudancas de fuso ou parsing podem afetar alguns calculos.

