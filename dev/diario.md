#Esse arquivo é para uso pessoal do desenvolvedor

1. Substituir a exportação manual do calendário por uma opção de vinculo com o Google Calendar (já foi criado spec)

2. Enviar por email o lembrete da consulta ou exame para o usuário um dia antes

3. ~~Geradores de pdf~~ → feito: exportação em PDF no Histórico e na Agenda (botão no cabeçalho de cada aba → modal de categorias/tipos + nível de detalhamento → jsPDF vendorizado em `lib/`). Spec completa em `specs/gerador-pdf/` (spec/plan/tasks/review). Falta só validação manual no dispositivo (foto no cabeçalho + offline).

4. ~~Implementar histórico de medicamentos/tipos de medicamentos, independente da data do evento~~ → feito: tela própria de Medicamentos (subcoleção `medications`), com três regimes de uso (contínuo / por tempo determinado com posologia / conforme necessário), autocomplete, aviso de alergia cruzando com o perfil, vínculo opcional a um evento e atalho ao salvar evento com medicamentos. Aba "Remédios" na barra inferior (entre Histórico e Agenda) + swipe. Spec completa em `specs/historico-medicamentos/`. Falta: exportação em PDF dessa tela (entra como iteração de `specs/gerador-pdf/`) e validação manual no dispositivo.

8. **[Pendente] Notificações de horário de dose** — avisar ativamente "está na hora de tomar o remédio". Deliberadamente **fora** do escopo da agenda de doses (`specs/agenda-de-doses/`), que apenas exibe e permite marcar doses, sem alertar. Pontos a considerar antes de especificar:
   - Numa PWA estática, exige Service Worker + Notification API + agendamento; não há servidor para disparar push.
   - `setTimeout`/`setInterval` não sobrevivem ao app fechado — precisaria de `Notification Triggers` (suporte limitado) ou push real com backend.
   - No iOS, notificação de PWA em segundo plano é irregular; pode ser que só funcione de fato depois do empacotamento com Capacitor (item 6), onde notificação local é nativa e confiável.
   - Conversa diretamente com o item 2 (lembrete de consulta) — vale especificar os dois juntos como um único assunto de "lembretes", em vez de duas soluções separadas.

5. Retrabalhar inserção de eventos (revelando campos aos poucos de acordo com o evento que está sendo registrado).

6. Empacotar o app como aplicativo Android nativo (APK) e publicar na Play Store. Decisão registrada em conversa (não implementar antes de terminar as pendências acima):
   - Tecnologia escolhida: **Capacitor** (não TWA) — TWA é Android-only; Capacitor empacota o mesmo HTML/CSS/JS pra Android **e** iOS a partir da mesma base de código, caso o iOS entre no escopo depois. iOS fica de fora por enquanto.
   - Trade-off do Capacitor vs TWA: o app fica embarcado no binário (não é só uma URL carregada), então toda atualização visual/funcional exige gerar e reenviar um novo build pra loja — diferente de uma PWA pura, que atualiza sozinha via Service Worker.
   - Custo Play Store: taxa única de US$25 na conta de desenvolvedor do Google Play Console (não é anual). Contas novas precisam rodar teste fechado com 20 testers por 14 dias antes de publicar em produção.
   - **[Pendente] Monetização futura**: o app é gratuito hoje, mas a intenção é comercializá-lo. Se a cobrança (assinatura, desbloqueio de recursos) acontecer **dentro** do app Android distribuído pela Play Store, a Google exige o uso do **Google Play Billing** (não dá pra usar Stripe/PayPal direto) e fica com 15% da receita até US$1M/ano (30% acima disso). Alternativa a avaliar: manter a versão da Play Store gratuita/básica e vender o upgrade pago pela versão web (fora da loja), sem repassar comissão — decisão de modelo de negócio a tomar mais à frente, ainda sem spec.
   - Ao decidir avançar, seguir o fluxo do `docs/AGENTS.md`: criar `/specs/empacotamento-android/spec.md` antes de qualquer implementação.

7. Suportar imagens anexadas de fato aos eventos de saúde. Hoje o campo `imagemUrl` do evento aceita apenas um link digitado manualmente — não existe upload/anexo real de arquivo (surgiu ao especificar o gerador de PDF: perguntado se imagens deveriam entrar no relatório exportado, e hoje não há imagens anexadas pra incluir). Avaliar armazenamento (IndexedDB local, como já feito para foto de perfil, ou upload real a um serviço externo). Quando implementado, revisitar `specs/gerador-pdf/spec.md` pra decidir se essas imagens passam a entrar no PDF.
