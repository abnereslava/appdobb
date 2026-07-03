#Esse arquivo é para uso pessoal do desenvolvedor

1. Substituir a exportação manual do calendário por uma opção de vinculo com o Google Calendar (já foi criado spec)

2. Enviar por email o lembrete da consulta ou exame para o usuário um dia antes

3. Geradores de pdf → spec criada em `specs/gerador-pdf/spec.md`, em andamento.

4. Implementar histórico de medicamentos/tipos de medicamentos, independente da data do evento

5. Retrabalhar inserção de eventos (revelando campos aos poucos de acordo com o evento que está sendo registrado).

6. Empacotar o app como aplicativo Android nativo (APK) e publicar na Play Store. Decisão registrada em conversa (não implementar antes de terminar as pendências acima):
   - Tecnologia escolhida: **Capacitor** (não TWA) — TWA é Android-only; Capacitor empacota o mesmo HTML/CSS/JS pra Android **e** iOS a partir da mesma base de código, caso o iOS entre no escopo depois. iOS fica de fora por enquanto.
   - Trade-off do Capacitor vs TWA: o app fica embarcado no binário (não é só uma URL carregada), então toda atualização visual/funcional exige gerar e reenviar um novo build pra loja — diferente de uma PWA pura, que atualiza sozinha via Service Worker.
   - Custo Play Store: taxa única de US$25 na conta de desenvolvedor do Google Play Console (não é anual). Contas novas precisam rodar teste fechado com 20 testers por 14 dias antes de publicar em produção.
   - **[Pendente] Monetização futura**: o app é gratuito hoje, mas a intenção é comercializá-lo. Se a cobrança (assinatura, desbloqueio de recursos) acontecer **dentro** do app Android distribuído pela Play Store, a Google exige o uso do **Google Play Billing** (não dá pra usar Stripe/PayPal direto) e fica com 15% da receita até US$1M/ano (30% acima disso). Alternativa a avaliar: manter a versão da Play Store gratuita/básica e vender o upgrade pago pela versão web (fora da loja), sem repassar comissão — decisão de modelo de negócio a tomar mais à frente, ainda sem spec.
   - Ao decidir avançar, seguir o fluxo do `docs/AGENTS.md`: criar `/specs/empacotamento-android/spec.md` antes de qualquer implementação.

7. Suportar imagens anexadas de fato aos eventos de saúde. Hoje o campo `imagemUrl` do evento aceita apenas um link digitado manualmente — não existe upload/anexo real de arquivo (surgiu ao especificar o gerador de PDF: perguntado se imagens deveriam entrar no relatório exportado, e hoje não há imagens anexadas pra incluir). Avaliar armazenamento (IndexedDB local, como já feito para foto de perfil, ou upload real a um serviço externo). Quando implementado, revisitar `specs/gerador-pdf/spec.md` pra decidir se essas imagens passam a entrar no PDF.
