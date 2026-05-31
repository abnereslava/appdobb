# Plano Técnico: Restrição de Histórico por Data de Nascimento

## 1. Resumo da solução

Três mudanças independentes em `app.js`:

1. **"Bem-vinda!" → gendered** — a tela de boas-vindas usará "Bem-vindo(a)!" por padrão. Como o perfil ainda não existe nessa tela, não há como determinar o gênero, então o texto neutro é o correto.
2. **Data de nascimento no cabeçalho do Histórico** — após o título, inserir um elemento clicável com a data formatada, visível apenas se `perfil.dataNascimento` estiver preenchido.
3. **Validação de data mínima no formulário de evento** — ao submeter `salvarEvento`, calcular a data mínima (`dataNascimento - 315 dias`); se `evento.data` for anterior, exibir toast de erro e abortar. A mesma validação bloqueia edições.

O perfil não é cacheado em variável global — `carregarPerfil()` faz uma leitura do Firestore. Para evitar leitura extra, `renderizarTimeline()` já chama `carregarEventos()`; carregaremos o perfil uma única vez junto no início de `renderizarTimeline()` e passaremos `dataNascimento` para onde for necessário.

Para a validação no formulário, o `dataNascimento` precisa estar disponível no momento do submit. A abordagem mais simples é armazená-lo em um campo hidden no DOM quando o formulário é aberto (`abrirFormEvento`).

## 2. Dependências

- `carregarPerfil()` — já existente, async, retorna `{ dataNascimento, sexo, ... }`.
- `formatarDataCurta()` ou lógica inline de formatação `DD/MM/AAAA`.
- `mostrarToast()` — já existente.
- Nenhuma dependência nova.

## 3. Arquivos afetados

| Arquivo | Motivo |
|---|---|
| `app.js` | Todas as mudanças de lógica e renderização |

## 4. Estrutura de dados

Nenhuma mudança no Firestore. Apenas leitura de `perfil.dataNascimento` (string `YYYY-MM-DD` já existente).

Campo hidden a adicionar no `modal-evento-form` (HTML inline no `index.html`):
```html
<input type="hidden" id="evento-data-min" />
```

## 5. Regras de segurança e permissões

Validação no front-end. Não há regra Firestore a alterar — a data do evento já é validada pelo front antes de chamar `gravarEvento`.

## 6. Fluxos técnicos

### Boas-vindas
- Substituir "Bem-vinda!" por "Bem-vindo(a)!" no texto estático da welcome screen.

### Histórico — cabeçalho com data de nascimento
1. `renderizarTimeline()` já chama `carregarEventos()`. Adicionar `carregarPerfil()` em paralelo.
2. Se `perfil.dataNascimento` existir, renderizar abaixo do `tl-header` um elemento clicável:
   ```html
   <div class="historico-nascimento" onclick="navegarParaAba('home')">
     🍼 Nascido(a) em DD/MM/AAAA
   </div>
   ```
   O texto usa o sexo do perfil: "Nascido em" (menino) / "Nascida em" (menina) / "Nascido(a) em" (sem sexo).

### Formulário de evento — data mínima
1. Em `abrirFormEvento(id)`, após carregar o perfil, gravar `perfil.dataNascimento` no campo `#evento-data-min`.
2. Calcular `dataMin = dataNascimento - 315 dias` e definir o atributo `min` no `input[type=date]` do campo `#evento-data`.
3. Em `salvarEvento()`, ler `#evento-data-min`, calcular `dataMin`, comparar com `data`; se anterior, exibir toast e retornar.

## 7. Impactos no sistema existente

- `renderizarTimeline()`: passa a fazer 2 leituras paralelas (perfil + eventos), leve overhead.
- `abrirFormEvento()`: passa a ler o perfil. Já é uma função async — sem mudança de assinatura.
- Texto "Bem-vinda!" na welcome screen: mudança cosmética, sem impacto funcional.

## 8. Riscos técnicos

- Se `carregarPerfil()` falhar silenciosamente, `dataNascimento` será `null` e nenhuma restrição é aplicada — comportamento seguro.
- O atributo `min` no `<input type="date">` bloqueia no browser nativo, mas não substitui a validação no submit (browsers antigos ou mobile podem ignorar).

## 9. Estratégia de teste

Manual:
- Criar evento com data anterior à janela → deve bloquear com toast.
- Criar evento com data válida → deve salvar normalmente.
- Perfil sem `dataNascimento` → sem restrição.
- Editar evento existente alterando a data para inválida → deve bloquear.
- Verificar texto "Nascido em" / "Nascida em" conforme sexo do bebê.
- Verificar clique na data de nascimento no cabeçalho → navega para perfil.

## 10. Ordem recomendada de implementação

1. Texto "Bem-vindo(a)!" na welcome screen.
2. Campo hidden `#evento-data-min` no `index.html`.
3. Data de nascimento no cabeçalho do Histórico (`renderizarTimeline`).
4. Validação de data mínima no formulário (`abrirFormEvento` + `salvarEvento`).
