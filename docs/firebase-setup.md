# Configuração Firebase — Linha do Tempo do Bebê

> **Status:** Implementação concluída e funcionando em produção.
> Todas as tarefas de autenticação, autorização e migração de dados foram executadas.

## Projeto Firebase

- **Nome do projeto:** app-do-bb
- **Project ID:** app-do-bb
- **Auth domain:** app-do-bb.firebaseapp.com

## Serviços utilizados

- Firebase Authentication (provedor Google)
- Cloud Firestore

## Como configurar o Firebase do zero

### 1. Criar projeto no Firebase Console

1. Acesse [console.firebase.google.com](https://console.firebase.google.com).
2. Clique em "Adicionar projeto" e siga o assistente.

### 2. Habilitar Authentication com Google

1. No menu lateral, acesse **Authentication > Sign-in method**.
2. Clique em **Google** e ative o provedor.
3. Informe um e-mail de suporte e salve.

### 3. Criar banco Cloud Firestore

1. No menu lateral, acesse **Firestore Database**.
2. Clique em **Criar banco de dados**.
3. Escolha o modo de produção e selecione a região mais próxima (ex.: `southamerica-east1`).

### 4. Arquivo de configuração do app

A configuração pública do Firebase está em `firebase-config.js` na raiz do projeto.
Ela contém apenas chaves públicas — não há segredo neste arquivo.
A segurança real é garantida pelas **Firestore Security Rules**.

### 5. Bootstrap do primeiro administrador

O e-mail `abner.eslava@gmail.com` deve ser registrado manualmente como administrador inicial.
Esse registro não está hardcoded no código — o app consulta o Firestore para descobrir o papel de cada usuário.

#### Estrutura de dados necessária

Execute os passos abaixo no **Firebase Console > Firestore Database**:

**Documento 1 — `/appSettings/main`**

```json
{
  "adminProfileId": "admin-main",
  "createdAt": "<timestamp atual>"
}
```

**Documento 2 — `/accessIndex/abner.eslava@gmail.com`**

```json
{
  "email": "abner.eslava@gmail.com",
  "profileId": "admin-main",
  "role": "admin",
  "active": true,
  "permissions": {
    "perfil":    { "read": true, "write": true, "delete": true },
    "historico": { "read": true, "write": true, "delete": true },
    "agenda":    { "read": true, "write": true, "delete": true },
    "admin":     { "read": true, "write": true, "delete": true, "manage": true }
  },
  "createdAt": "<timestamp atual>"
}
```

**Documento 3 — `/profiles/admin-main`**

```json
{
  "babyProfile": {},
  "createdBy": "bootstrap",
  "createdAt": "<timestamp atual>"
}
```

> **Atenção:** Esses documentos podem ser criados pelo Firebase Console manualmente
> ou pelo script de bootstrap já executado no console do navegador.

### 6. Regras de segurança do Firestore

As regras definitivas já foram aplicadas no Firebase Console conforme confirmado pelo administrador.
O arquivo `firestore.rules` será mantido no projeto para versionamento, atualizado nas tarefas seguintes.

## Estrutura de coleções

```
/appSettings/main            — configurações globais do app
/accessIndex/{email}         — índice de autorização por e-mail
/profiles/{profileId}        — perfil do bebê por usuário
/profiles/{profileId}/events/{eventId}               — eventos de saúde
/profiles/{profileId}/consultations/{consultationId} — consultas médicas
```

## Papéis

| Papel   | Acesso                                                      |
|---------|-------------------------------------------------------------|
| `admin` | Painel administrativo + todos os recursos                   |
| `user`  | Perfil, Histórico/Eventos e Agenda do próprio perfil apenas |

## Riscos e cuidados

- Nunca remova ou desative o último administrador ativo — o sistema ficará sem gestão.
- As regras do Firestore são a única barreira real de segurança; bloqueios visuais são complementares.
- Dados de saúde são sensíveis — revise as regras antes de compartilhar acesso.
