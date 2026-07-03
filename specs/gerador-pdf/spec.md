# Especificação: Gerador de PDF (Relatório de Saúde)

## 1. Objetivo

Permitir que o usuário exporte um relatório em PDF com os dados de saúde de um perfil — pensado principalmente para ser levado a consultas médicas ou mantido como registro pessoal.

## 2. Contexto

O app já possui Histórico de Eventos (timeline, com filtros por categoria/data/busca) e Agenda de Consultas (com filtros por tipo/data/busca), além dos dados de perfil (alergias, doenças crônicas, tipo sanguíneo etc.) exibidos na Home. O gerador de PDF se encaixa como uma ação de exportação que reaproveita os dados já carregados em cache local (`_perfilCache`, `eventosCache`, `consultasCache`), sem necessidade de novas leituras ao Firestore.

## 3. Usuários envolvidos

- Usuário autenticado com um perfil ativo (responsável pelo perfil de saúde em questão).
- [Inferência] Não há indicação de restrição adicional por papel/permissão (o sistema `usuario`/`admin` existente parece ligado apenas ao painel administrativo em `admin.html`, não a esta funcionalidade).

## 4. Funcionamento esperado

O usuário aciona a exportação a partir de algum ponto do app (local exato: ver Dúvidas pendentes). O sistema monta uma versão "para impressão" dos dados do perfil ativo — cabeçalho com identificação do perfil, seguido do histórico de eventos e/ou das consultas — e aciona a interface nativa de impressão do navegador (`window.print()`), onde o usuário escolhe "Salvar como PDF".

## 5. Fluxo principal

1. Usuário está com um perfil ativo carregado (Home, Histórico ou Agenda).
2. Usuário toca em "Exportar PDF".
3. Sistema monta o conteúdo do relatório a partir dos dados já em cache (perfil + eventos e/ou consultas).
4. Sistema aciona `window.print()`.
5. Usuário escolhe "Salvar como PDF" (ou imprime fisicamente) no diálogo nativo do navegador/SO.

## 6. Regras de negócio

- O relatório contém apenas dados do perfil ativo no momento da exportação — nunca de múltiplos perfis simultaneamente.
- A geração acontece inteiramente no front-end, sem chamadas ao servidor (mesmo princípio já usado na exportação `.ics` da Agenda).
- [Pendente] O conteúdo exportado deve respeitar os filtros ativos na tela de origem (categoria, tipo, período, busca) ou sempre exportar o conjunto completo de dados do perfil, independente do que estiver filtrado na tela?
- [Sugestão] Cabeçalho do relatório com nome do perfil, idade calculada, data de nascimento e data de emissão do documento.
- [Pendente] A foto do perfil (avatar local, armazenado no IndexedDB) deve aparecer no cabeçalho do relatório?
- [Pendente] Imagens anexadas a eventos individuais (campo `imagemUrl`) devem ser incluídas no corpo do relatório, ou omitidas para manter o documento leve e rápido de gerar?
- O relatório deve ser legível em preto e branco / impressão física, independente do tema (claro/escuro/cor do perfil) ativo na tela no momento da exportação.

## 7. Permissões

- [Inferência] Qualquer usuário autenticado com acesso ao perfil ativo pode exportar seus próprios dados. Não há necessidade de permissão adicional além do acesso já existente ao perfil.

## 8. Dados necessários

- Perfil: `nomeCompleto`, `dataNascimento`, `sexo`, `tipoBebe`/`tipoMae` (tipo sanguíneo), `alergias[]`, `doencasCronicas[]`, `peso`, `altura`.
- Eventos (`eventosCache`): `titulo`, `categoria`, `data`, `descricao`, `tratamento`, `medico`, `hospital`, `medicamentos[]`, `custo`, `observacoes`.
- Consultas (`consultasCache`): `tipo`, `data`, `horario`, `medico`, `local`, `observacoes`, `status`.
- [Inferência] Todos os dados acima já estão disponíveis localmente via cache em memória (`onSnapshot`), sem necessidade de nova leitura ao Firestore no momento da exportação.

## 9. Estados e mensagens

| Estado | Comportamento |
|---|---|
| Exportação acionada | Abre o diálogo nativo de impressão do navegador |
| Perfil sem eventos e sem consultas | [Pendente] Exportar mesmo assim (só os dados do perfil), bloquear com toast informativo, ou perguntar ao usuário? |
| Perfil sem foto/alergias/doenças | Seção correspondente omitida ou exibida como "Nenhum(a) registrado(a)", seguindo o padrão já usado na Home |

## 10. Casos extremos

- Grande volume de eventos/consultas: cards não devem ser cortados ao meio entre páginas (requer controle de quebra de página no CSS de impressão).
- Perfil sem `dataNascimento`: não deveria ocorrer (campo obrigatório no formulário), mas o relatório não deve quebrar caso aconteça.
- Modo escuro ativo no momento da exportação: o relatório impresso deve sempre usar cores claras/imprimíveis, independente do tema ativo na tela.
- [Inferência] Exportação deve funcionar offline, já que os dados já estão em cache local (mesmo princípio da exportação `.ics` existente).
- Múltiplos perfis cadastrados: a exportação é sempre do perfil ativo no momento; não há exportação em lote de vários perfis de uma vez.

## 11. Critérios de aceite

- [ ] Ação de exportar PDF acessível a partir do(s) ponto(s) definido(s) na Dúvida 1.
- [ ] Relatório contém dados do perfil ativo (nome, idade, tipo sanguíneo, alergias, doenças crônicas).
- [ ] Relatório contém histórico de eventos (respeitando ou não filtros, conforme Dúvida 2).
- [ ] Relatório contém consultas (respeitando ou não filtros, conforme Dúvida 2).
- [ ] Layout legível em impressão preto e branco, sem elementos de navegação do app.
- [ ] Funciona offline (sem novas leituras ao Firestore durante a exportação).
- [ ] Cards de eventos/consultas não são cortados ao meio entre páginas.

## 12. Dúvidas pendentes

1. **Onde disparar a exportação?** Um único botão (ex.: na tela de Perfil/Home) que gera um relatório completo com tudo, ou botões de exportação separados no Histórico e na Agenda, cada um respeitando os filtros ativos daquela aba?
2. **O relatório deve respeitar os filtros ativos** (categoria, tipo, busca, período) no momento do clique, ou sempre exportar o conjunto completo de dados do perfil?
3. **Imagens anexadas aos eventos** (`imagemUrl`) entram no PDF ou ficam de fora?
4. **A foto do perfil** (avatar local) aparece no cabeçalho do relatório?
5. **Perfil sem nenhum evento/consulta**: exporta só os dados do perfil, bloqueia com aviso, ou outra ação?
6. **Abordagem técnica**: confirma `window.print()` + CSS de impressão (`@media print`), sem dependência nova, reavaliando uma biblioteca como jsPDF apenas se o resultado nativo não for satisfatório?
