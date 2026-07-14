# Especificação: Gerador de PDF (Relatório de Saúde)

## 1. Objetivo

Permitir que o usuário exporte relatórios em PDF com os dados de saúde de um perfil — pensado principalmente para ser levado a consultas médicas ou mantido como registro pessoal.

## 2. Contexto

O app já possui Histórico de Eventos (timeline, com filtro por categoria) e Agenda de Consultas (com filtro por tipo), além dos dados de perfil (alergias, doenças crônicas, tipo sanguíneo etc.) exibidos na Home. O gerador de PDF se encaixa como duas ações de exportação independentes — uma no Histórico, outra na Agenda —, reaproveitando os dados já carregados em cache local (`_perfilCache`, `eventosCache`, `consultasCache`), sem necessidade de novas leituras ao Firestore.

## 3. Usuários envolvidos

- Usuário autenticado com um perfil ativo (responsável pelo perfil de saúde em questão).
- [Inferência] Não há indicação de restrição adicional por papel/permissão (o sistema `usuario`/`admin` existente parece ligado apenas ao painel administrativo em `admin.html`, não a esta funcionalidade).

## 4. Funcionamento esperado

Cada aba — Histórico de Eventos e Agenda de Consultas — tem seu próprio botão de exportar PDF, gerando um tipo de relatório específico daquela aba (não existe exportação combinada num único PDF).

Ao tocar no botão, abre-se um **modal de configuração** onde o usuário escolhe:
- Quais categorias (Histórico) ou tipos de consulta (Agenda) deseja incluir no relatório.
- O nível de detalhamento desejado para os itens exportados (ex.: resumido vs. detalhado — os campos exatos por nível ficam a definir no `plan.md`).

Essa escolha no modal é independente dos filtros que estejam ativos na tela no momento — a exportação não herda automaticamente o filtro visível na tela.

Após confirmar, o sistema monta o documento (cabeçalho do perfil, incluindo foto, + a lista configurada) e gera o PDF.

## 5. Fluxo principal — Exportar Histórico de Eventos

1. Usuário está na aba Histórico com um perfil ativo.
2. Usuário toca em "Exportar PDF" (botão específico do Histórico).
3. Sistema abre o modal de configuração: categorias de evento disponíveis (a partir das categorias existentes em `eventosCache`) + seleção de nível de detalhamento.
4. Usuário seleciona as categorias desejadas (ou todas) e o nível de detalhamento, confirma.
5. Sistema monta o documento — cabeçalho do perfil (nome, idade, foto) + lista de eventos filtrada pelas categorias escolhidas, no nível de detalhe escolhido.
6. PDF é gerado e disponibilizado para download/salvar.

## 6. Fluxo principal — Exportar Agenda de Consultas

1. Usuário está na aba Agenda com um perfil ativo.
2. Usuário toca em "Exportar PDF" (botão específico da Agenda).
3. Sistema abre o modal de configuração: tipos de consulta disponíveis (a partir de `TIPOS_CONSULTA` presentes em `consultasCache`) + seleção de nível de detalhamento.
4. Usuário seleciona os tipos desejados e o nível de detalhamento, confirma.
5. Sistema monta o documento — cabeçalho do perfil (nome, idade, foto) + lista de consultas filtrada pelos tipos escolhidos, no nível de detalhe escolhido.
6. PDF é gerado e disponibilizado para download/salvar.

## 7. Regras de negócio

- Dois pontos de exportação independentes (Histórico e Agenda); cada um gera um PDF do seu próprio domínio de dados.
- A exportação é sempre precedida do modal de configuração — nunca dispara direto sem perguntar categorias/tipos e nível de detalhamento.
- A geração acontece inteiramente no front-end, sem chamadas ao servidor.
- O relatório contém apenas dados do perfil ativo no momento da exportação — nunca de múltiplos perfis simultaneamente.
- Cabeçalho do relatório inclui: nome do perfil, idade calculada, data de nascimento, foto do perfil (avatar local do IndexedDB, quando existir) e data de emissão do documento.
- Imagens anexadas a eventos individuais estão fora do escopo desta funcionalidade: atualmente não existe anexo real de imagem no app (o campo `imagemUrl` aceita apenas um link digitado manualmente). Necessidade registrada em `dev/diario.md` (item 7) para revisão futura.
- O relatório deve ser legível em preto e branco / impressão física, independente do tema (claro/escuro/cor do perfil) ativo na tela no momento da exportação.
- **Abordagem técnica**: geração via **jsPDF** (carregado via CDN), por oferecer maior controle de estilização de layout do que `window.print()` + CSS de impressão — mesmo exigindo mais esforço de implementação (nova dependência externa, que precisa entrar no `SHELL_FILES` do `sw.js` para funcionar offline).
- [Inferência] O nível de detalhamento provavelmente controla quais campos aparecem por item — por exemplo, "Resumido" mostrando só título/tipo + data, e "Detalhado" incluindo todos os campos preenchidos (descrição, médico, hospital, tratamento, medicamentos, custo e observações para eventos; médico, local, horário, observações e status para consultas). A definição exata dos campos por nível fica para o `plan.md`.

## 8. Permissões

- [Inferência] Qualquer usuário autenticado com acesso ao perfil ativo pode exportar seus próprios dados. Não há necessidade de permissão adicional além do acesso já existente ao perfil.

## 9. Dados necessários

- Perfil: `nomeCompleto`, `dataNascimento`, `sexo`, `tipoBebe`/`tipoMae` (tipo sanguíneo), `alergias[]`, `doencasCronicas[]`, `peso`, `altura`, foto local (IndexedDB).
- Eventos (`eventosCache`): `titulo`, `categoria`, `data`, `descricao`, `tratamento`, `medico`, `hospital`, `medicamentos[]`, `custo`, `observacoes`.
- Consultas (`consultasCache`): `tipo`, `data`, `horario`, `medico`, `local`, `observacoes`, `status`.
- [Inferência] Todos os dados acima já estão disponíveis localmente via cache em memória (`onSnapshot`), sem necessidade de nova leitura ao Firestore no momento da exportação.

## 10. Estados e mensagens

| Estado | Comportamento |
|---|---|
| Exportação acionada | Abre o modal de configuração (categorias/tipos + nível de detalhamento) |
| Perfil sem eventos (Histórico) ou sem consultas (Agenda), ou nenhum item na seleção escolhida | Exporta o PDF normalmente, contendo apenas o cabeçalho de dados do perfil — não bloqueia a exportação |
| Perfil sem foto/alergias/doenças | Seção correspondente do cabeçalho omitida ou exibida como "Nenhum(a) registrado(a)", seguindo o padrão já usado na Home |

## 11. Casos extremos

- Grande volume de eventos/consultas: itens não devem ser cortados ao meio entre páginas (requer controle de quebra de página).
- Perfil sem `dataNascimento`: não deveria ocorrer (campo obrigatório no formulário), mas o relatório não deve quebrar caso aconteça.
- Modo escuro ativo no momento da exportação: o relatório deve sempre usar cores claras/imprimíveis, independente do tema ativo na tela.
- [Inferência] Exportação deve funcionar offline, já que os dados já estão em cache local e o jsPDF (uma vez cacheado pelo Service Worker) não depende de rede.
- Múltiplos perfis cadastrados: a exportação é sempre do perfil ativo no momento; não há exportação em lote de vários perfis de uma vez.
- Nenhuma categoria/tipo disponível para seleção no modal (perfil sem nenhum evento ou consulta ainda): modal deve permitir confirmar mesmo assim, resultando no PDF apenas com o cabeçalho do perfil.

## 12. Critérios de aceite

- [ ] Botão "Exportar PDF" disponível na aba Histórico, específico para eventos.
- [ ] Botão "Exportar PDF" disponível na aba Agenda, específico para consultas.
- [ ] Ao tocar em qualquer um dos botões, abre modal de configuração com seleção de categorias/tipos e nível de detalhamento.
- [ ] PDF gerado contém cabeçalho do perfil (nome, idade, tipo sanguíneo, alergias, doenças crônicas, foto).
- [ ] PDF do Histórico contém apenas os eventos das categorias selecionadas, no nível de detalhe escolhido.
- [ ] PDF da Agenda contém apenas as consultas dos tipos selecionados, no nível de detalhe escolhido.
- [ ] Layout legível em impressão preto e branco, sem elementos de navegação do app.
- [ ] Funciona offline (sem novas leituras ao Firestore durante a exportação).
- [ ] Itens de eventos/consultas não são cortados ao meio entre páginas.
- [ ] Perfil sem dados na seleção escolhida gera PDF apenas com o cabeçalho, sem erro.

## 13. Dúvidas respondidas

- [Respondida] Onde disparar a exportação? Um botão por aba (Histórico e Agenda), cada um gerando um tipo de relatório específico daquela aba.
- [Respondida] A exportação respeita os filtros ativos na tela? Não — o botão abre um modal dedicado onde o usuário escolhe categorias/tipos e nível de detalhamento, independente do filtro ativo na tela no momento.
- [Respondida] Imagens anexadas aos eventos entram no PDF? Não — hoje não existem imagens anexadas de fato no app (apenas um campo de URL manual). Item registrado em `dev/diario.md` para tratar futuramente.
- [Respondida] A foto do perfil aparece no cabeçalho? Sim.
- [Respondida] Perfil sem eventos/consultas? Exporta normalmente, só com os dados do perfil no cabeçalho.
- [Respondida] Abordagem técnica? jsPDF (via CDN) — prioriza controle de estilização do layout, mesmo exigindo mais esforço de implementação do que `window.print()` + CSS de impressão.

## 14. Iteração 2 — refinamento visual, prévia e filtro por período

Melhorias solicitadas após a primeira entrega:

1. **Visual mais elegante (sem exagerar)**: uso restrito da cor do perfil como acento — régua sob o cabeçalho, títulos de seção ("Alergias", "Doenças crônicas", título da seção principal) e a data de cada item. Texto do corpo permanece escuro; documento continua legível em preto e branco.
2. **Data/categoria antes do título**: cada item começa por uma linha discreta com a data (na cor de acento) e a categoria/status, seguida do título em negrito maior.
3. **Rótulos de campo em negrito**: cada campo do nível Detalhado é renderizado como `Rótulo:` em negrito + valor normal, com quebra de linha respeitando a largura útil (continuações alinhadas à margem).
4. **Prévia (exemplo) no modal**: representação em HTML que imita a folha impressa (cabeçalho + até 2 primeiros itens), atualizada ao vivo conforme categorias/tipos, nível e período mudam. É uma amostra fiel do estilo — não o PDF real embutido —, escolha feita por robustez no mobile (visualizador de PDF em iframe é irregular nos navegadores móveis).
5. **Filtro por período**: dois campos de data (início/fim) no modal restringem os itens que entram no PDF, com botão de limpar. Estado próprio (`_pdfDataInicio`/`_pdfDataFim`), independente dos filtros da aba.

Notas de implementação:
- A cor de acento vem de `corDoPerfil(perfil)` → `CORES_PERFIL[...].hex`, convertida para RGB em `_PDF.accent` no início de cada geração.
- Separador fino entre itens (régua clara) que acompanha a quebra de página.
- Prévia e geração compartilham `_pdfItensSelecionados()` (mesma seleção de categorias/tipos + período), garantindo que o exemplo reflita o resultado.

### Critérios de aceite (iteração 2)

- [x] Data e categoria/status aparecem antes do título em cada item.
- [x] Rótulos dos campos em negrito no nível Detalhado.
- [x] Acento na cor do perfil aplicado com moderação (cabeçalho, seções, datas).
- [x] Prévia ao vivo no modal refletindo categorias/tipos, nível e período.
- [x] Filtro por período (início/fim) restringe os itens exportados; botão de limpar.
