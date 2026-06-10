# Guia de Uso: Dos tais

## 1. Acesso

O aplicativo está hospedado no GitHub Pages. Acesse pelo navegador no celular ou computador. Para usar, faça login com sua conta Google — sem cadastro manual.

Para instalar como app (PWA): no Chrome/Safari, use "Adicionar à tela inicial" ou "Instalar app".

## 2. Criar o primeiro perfil

1. Após o login, a tela de boas-vindas aparece. Toque em **"Criar Perfil"**.
2. Preencha pelo menos o nome completo e a data de nascimento.
3. Opcionalmente, defina foto, cor do perfil, sexo, dados de nascimento, tipo sanguíneo, alergias etc.
4. Toque em **"Salvar Perfil"**.

Após salvar, a tela principal mostra o card do perfil com idade calculada, alergias, estatísticas e últimos eventos.

## 3. Foto do perfil

- Toque no avatar ou no ícone de câmera (aparece quando não há foto).
- Selecione uma imagem do dispositivo — ela é cortada em círculo e salva automaticamente, sem precisar salvar o perfil inteiro.
- Para remover, abra o formulário de perfil e toque em **"Remover"**.

> A foto fica salva apenas no dispositivo atual (não sincroniza com outros aparelhos).

## 4. Cor do perfil

- No formulário de perfil, a primeira seção mostra 8 bolinhas de cor.
- Toque em uma para ver o preview ao vivo. A cor é aplicada em botões, badges e fundos do app.
- Se fechar sem salvar, a cor anterior é restaurada.

## 5. Múltiplos perfis

- Toque no nome do perfil ativo no topo para abrir o seletor.
- Cada card exibe as cores e foto do respectivo perfil.
- Para criar um novo: toque em **"+ Novo perfil"** no seletor.

## 6. Registrar um evento de saúde

1. Toque no botão **+** na barra inferior.
2. Escolha **"Novo Evento de Saúde"**.
3. Preencha título, categoria e data (obrigatórios).
4. Opcionalmente, informe descrição, tratamento, médico, hospital, medicamentos, custo e observações.
5. Toque em **"Salvar"**.

## 7. Consultar o histórico

1. Toque em **Histórico** na barra inferior.
2. Alterne entre linha do tempo e visualização em cartões com o botão de olho (canto superior direito).
3. Use a busca para procurar por título, médico, hospital ou observações.
4. Use os filtros de categoria e intervalo de datas para refinar.
5. Toque em um item para ver detalhes, editar ou excluir.

## 8. Agendar uma consulta

1. Toque no botão **+** na barra inferior.
2. Escolha **"Nova Consulta"**.
3. Preencha tipo e data (obrigatórios).
4. Opcionalmente, informe horário, médico, local, observações e status.
5. Toque em **"Salvar Consulta"**.

## 9. Gerenciar consultas

1. Toque em **Agenda** na barra inferior.
2. Consultas futuras aparecem em "Próximas" com contagem regressiva.
3. Toque em uma consulta para editar, marcar como realizada, cancelar ou excluir.
4. No detalhe, use **"Exportar .ics"** para adicionar ao calendário do dispositivo, ou **"Google Agenda"** para abrir direto no Google Calendar.

## 10. Calendário

1. Toque em **Calendário** na barra inferior.
2. Navegue entre meses com as setas, ou toque no nome do mês para o seletor rápido.
3. Toque em um dia marcado para ver os eventos e consultas daquele dia.
4. No cabeçalho, use **"Exportar"** para baixar todas as consultas em formato `.ics`.

## 11. Modo escuro

Toque no ícone de lua (🌙) no topo para alternar entre tema claro e escuro. A cor do perfil é preservada nos dois modos.

## 12. Onde os dados ficam

| Dado | Onde |
|---|---|
| Perfil, eventos, consultas | Firebase Firestore — sincroniza entre dispositivos logados na mesma conta |
| Foto do perfil | IndexedDB local do dispositivo — não sincroniza |
| Preferência de tema (dark/light) | LocalStorage do dispositivo |

> Limpar dados do navegador pode apagar a foto do perfil salva localmente.

## 13. Painel administrativo (apenas admins)

Acessível em `admin.html`. Permite criar e gerenciar acessos de usuários, definir papéis (`usuario` / `admin`) e ativar/desativar contas.
