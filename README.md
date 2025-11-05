# UNDF Achados e Perdidos

Sistema completo de achados e perdidos para campus universitário, com backend FastAPI + Firebase e frontend React com identidade visual UNDF.

## 🏗️ Arquitetura

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI + Python 3.10+
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Auth**: Firebase Authentication

### Fluxo de Dados

```
Frontend (React) → Backend (FastAPI) → Firebase (Firestore/Storage/Auth)
```

- O front **nunca** acessa Firestore diretamente
- Toda autenticação é validada no backend via Firebase Admin SDK
- Upload de fotos via URLs assinadas (signed URLs)
- Busca inteligente com normalização, n-grams e scoring híbrido

## 📦 Instalação

### 1. Pré-requisitos

- Node.js 18+ e npm
- Python 3.10+
- Conta Firebase (plano free)

### 2. Configurar Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto (ou use existente `velta-a7710`)
3. Ative **Authentication** (Email/Password e Google)
4. Ative **Firestore Database** (modo produção)
5. Ative **Storage**
6. Gere credenciais de serviço:
   - Configurações do projeto → Contas de serviço
   - Gerar nova chave privada (JSON)
   - Salve o arquivo como `serviceAccountKey.json`

### 3. Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
# Crie um arquivo .env na raiz do projeto:
```

**Arquivo `.env`:**

```env
FIREBASE_PROJECT_ID=velta-a7710
FIREBASE_CLIENT_EMAIL=<seu-client-email-do-json>
FIREBASE_PRIVATE_KEY=<sua-private-key-do-json>
STORAGE_BUCKET=velta-a7710.firebasestorage.app
```

**Iniciar servidor:**

```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar dev server
npm run dev
```

Acesse: `http://localhost:5173`

## 🔐 Regras de Segurança do Firestore

Cole estas regras no Firebase Console → Firestore → Regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Bloqueia acesso direto do client
    // Apenas o backend (Admin SDK) pode ler/escrever
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🗂️ Modelagem Firestore

### Coleções

#### `users/{uid}`
```json
{
  "uid": "string",
  "name": "string",
  "email": "string",
  "role": "user|staff|admin",
  "campusHome": "string",
  "notifTokens": ["string"],
  "status": "active",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### `items/{itemId}`
```json
{
  "id": "string",
  "ownerUid": "string",
  "type": "FOUND|LOST",
  "title": "string",
  "description": "string",
  "category": "string",
  "tags": ["string"],
  "campusId": "string",
  "campusName": "string",
  "buildingId": "string",
  "buildingName": "string",
  "spot": "string",
  "geo": {
    "lat": 0.0,
    "lng": 0.0,
    "geohash": "string"
  },
  "photos": [{
    "fullUrl": "string",
    "thumbUrl": "string",
    "w": 0,
    "h": 0
  }],
  "status": "OPEN|RESOLVED",
  "resolvedReason": "string",
  "resolvedAt": "timestamp",
  "title_n": "string",
  "desc_n": "string",
  "tags_n": ["string"],
  "ngrams": ["string"],
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "moderation": {}
}
```

#### `threads/{threadId}`
```json
{
  "id": "string",
  "itemId": "string",
  "participants": ["uid1", "uid2"],
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "lastMessage": "string"
}
```

**Subcoleção**: `threads/{threadId}/messages/{msgId}`

#### `alerts/{alertId}`
```json
{
  "id": "string",
  "uid": "string",
  "queryText": "string",
  "tags": ["string"],
  "campusId": "string",
  "radiusKm": 0.0,
  "active": true,
  "createdAt": "timestamp"
}
```

## 🔍 Busca Inteligente

### Normalização
- Remove acentos, converte para minúsculas
- Remove pontuação
- Gera n-grams (trigramas) do título e tags

### Scoring
- **Título**: peso 3
- **Tags**: peso 2
- **Descrição**: peso 1
- **Campus igual**: +5 pontos
- **Prédio igual**: +3 pontos
- **Distância < 0.5km**: +4 pontos
- **Decay temporal**: itens > 30 dias perdem 30%

## 🚀 Endpoints da API

### Items
- `POST /items` - Criar item
- `GET /items?status=OPEN&campusId=X&q=texto` - Listar/buscar
- `GET /items/{id}` - Detalhes
- `PATCH /items/{id}` - Atualizar

### Uploads
- `POST /uploads/url?filename=X&content_type=Y` - Gerar URL assinada

### Threads
- `POST /items/{id}/threads` - Criar thread
- `POST /threads/{id}/messages` - Enviar mensagem
- `GET /threads?mine=true` - Listar threads
- `GET /threads/{id}/messages` - Listar mensagens

### Alerts
- `POST /alerts` - Criar alerta
- `GET /alerts` - Listar alertas
- `PATCH /alerts/{id}` - Atualizar
- `DELETE /alerts/{id}` - Deletar

### Staff
- `POST /staff/items/{id}/receive` - Registrar recebimento
- `GET /staff/reports/daily?campusId=X` - Relatório diário

## 🎨 Identidade Visual UNDF

### Cores
- **Verde primário**: `#6B9E3E`
- **Verde escuro**: `#4A7C2E`
- **Teal primário**: `#1B5E5E`
- **Teal escuro**: `#0D4444`
- **Cinza claro**: `#F5F5F5`

### Componentes
- Header com logo UNDF
- Indicador de passos (3 etapas)
- Cards de resultados
- Formulários estilizados

## 📝 Próximos Passos

1. **Instalar dependências** (frontend e backend)
2. **Configurar Firebase** (criar projeto, ativar serviços)
3. **Configurar .env** (credenciais do Firebase)
4. **Aplicar regras de segurança** no Firestore
5. **Rodar backend** (`uvicorn app.main:app --reload`)
6. **Rodar frontend** (`npm run dev`)
7. **Testar fluxo completo** (criar item, buscar, chat)

## 🔧 Deploy

### Backend
- **Render/Railway/Fly.io** (plano free)
- Configurar variáveis de ambiente
- Cold start esperado (~30s)

### Frontend
- **Vercel/Netlify** (plano free)
- Build: `npm run build`
- Configurar variável `VITE_API_URL`

## 📄 Licença

MIT
