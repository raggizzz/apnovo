# 🚀 Guia Completo de Instalação - UNDF Achados e Perdidos

## 📋 Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.10+ ([Download](https://www.python.org/downloads/))
- **Git** ([Download](https://git-scm.com/))
- Conta **Firebase** (gratuita)

---

## 🔥 Parte 1: Configurar Firebase

### 1.1 Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nome do projeto: `velta-a7710` (ou outro nome)
4. Desabilite Google Analytics (opcional para desenvolvimento)
5. Clique em "Criar projeto"

### 1.2 Ativar Authentication

1. No menu lateral, clique em **Authentication**
2. Clique em "Começar"
3. Ative os provedores:
   - ✅ **Email/Senha**
   - ✅ **Google**
4. Em "Configurações" → "Domínios autorizados", adicione:
   - `localhost`
   - Seu domínio de produção (se houver)

### 1.3 Ativar Firestore Database

1. No menu lateral, clique em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Selecione **Modo de produção** (vamos configurar regras depois)
4. Escolha localização: `southamerica-east1` (São Paulo)
5. Clique em "Ativar"

### 1.4 Configurar Regras do Firestore

1. Vá em **Firestore Database** → **Regras**
2. Cole as seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Bloqueia todo acesso direto do client
    // Apenas o backend com Admin SDK pode ler/escrever
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Clique em "Publicar"

### 1.5 Ativar Storage

1. No menu lateral, clique em **Storage**
2. Clique em "Começar"
3. Aceite as regras padrão
4. Clique em "Concluído"

### 1.6 Configurar Regras do Storage

1. Vá em **Storage** → **Regras**
2. Cole as seguintes regras:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Leitura permitida para usuários autenticados
    // Escrita apenas via signed URLs do backend
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

3. Clique em "Publicar"

### 1.7 Obter Credenciais do Frontend

1. Vá em **Configurações do projeto** (ícone de engrenagem)
2. Role até "Seus aplicativos"
3. Clique no ícone **Web** (`</>`)
4. Registre o app com nome: "UNDF Web"
5. **Copie as credenciais** que aparecem (vamos usar depois)

### 1.8 Obter Credenciais do Backend

1. Vá em **Configurações do projeto** → **Contas de serviço**
2. Clique em "Gerar nova chave privada"
3. Confirme e baixe o arquivo JSON
4. **Salve o arquivo** como `serviceAccountKey.json` (não commitar no Git!)

---

## 💻 Parte 2: Configurar Backend

### 2.1 Instalar Dependências Python

```bash
# Navegue até a pasta do backend
cd backend

# Crie um ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt
```

### 2.2 Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto:

```bash
# Windows PowerShell:
New-Item -Path ".env" -ItemType File

# Linux/Mac:
touch .env
```

2. Abra o arquivo `.env` e adicione:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=velta-a7710
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@velta-a7710.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
STORAGE_BUCKET=velta-a7710.firebasestorage.app

# Optional - Firestore Emulator (para desenvolvimento local)
# FIRESTORE_EMULATOR_HOST=localhost:8080
```

**Como preencher:**

- Abra o arquivo `serviceAccountKey.json` que você baixou
- `FIREBASE_PROJECT_ID`: valor de `project_id`
- `FIREBASE_CLIENT_EMAIL`: valor de `client_email`
- `FIREBASE_PRIVATE_KEY`: valor de `private_key` (mantenha as aspas e `\n`)
- `STORAGE_BUCKET`: `{project_id}.firebasestorage.app`

### 2.3 Inicializar Banco de Dados

```bash
# Execute o script de inicialização
python app/scripts/init_database.py
```

Isso vai criar:
- ✅ 4 Campus (Darcy Ribeiro, Planaltina, Ceilândia, Gama)
- ✅ 10+ Prédios
- ✅ 1 Usuário demo
- ✅ 8 Itens de exemplo

### 2.4 Rodar Testes

```bash
# Instale pytest se ainda não tiver
pip install pytest pytest-cov

# Execute os testes
pytest app/tests/ -v

# Com cobertura
pytest app/tests/ --cov=app --cov-report=html
```

### 2.5 Iniciar Servidor Backend

```bash
# Desenvolvimento (com hot reload)
uvicorn app.main:app --reload --port 8000

# Produção
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Acesse: `http://localhost:8000/docs` para ver a documentação interativa da API.

---

## 🎨 Parte 3: Configurar Frontend

### 3.1 Instalar Dependências Node

```bash
# Navegue até a pasta do frontend
cd frontend

# Instale as dependências
npm install
```

### 3.2 Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na pasta `frontend`:

```bash
# Windows PowerShell:
New-Item -Path ".env" -ItemType File

# Linux/Mac:
touch .env
```

2. Adicione as credenciais do Firebase (da etapa 1.7):

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=velta-a7710.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=velta-a7710
VITE_FIREBASE_STORAGE_BUCKET=velta-a7710.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# URL do backend
VITE_API_URL=http://localhost:8000
```

### 3.3 Atualizar Configuração do Firebase

Abra `frontend/src/lib/firebase.ts` e verifique se está assim:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```

### 3.4 Iniciar Servidor Frontend

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

Acesse: `http://localhost:5173`

---

## 🧪 Parte 4: Testar o Sistema

### 4.1 Testar Landing Page

1. Abra `http://localhost:5173`
2. Você deve ver a landing page profissional com:
   - ✅ Header com logo UnDF
   - ✅ Hero section com animações
   - ✅ Seção de recursos (6 cards)
   - ✅ Como funciona (3 passos)
   - ✅ Estatísticas
   - ✅ Depoimentos
   - ✅ CTA e Footer

### 4.2 Testar Fluxo de Cadastro

1. Clique em "Perdi um Objeto"
2. Preencha o formulário de 3 passos:
   - **Passo 1**: Contato (nome, telefone, email)
   - **Passo 2**: Objeto (categoria, cor, descrição)
   - **Passo 3**: Resultados (busca e matches)

### 4.3 Testar API Backend

```bash
# Health check
curl http://localhost:8000/health

# Listar itens (requer autenticação)
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:8000/items?status=OPEN&limit=10

# Buscar itens
curl -H "Authorization: Bearer SEU_TOKEN" \
  "http://localhost:8000/items?q=iphone&campusId=campus-darcy-ribeiro"
```

### 4.4 Testar Autenticação

1. No frontend, clique em "Entrar"
2. Crie uma conta com email institucional
3. Verifique o email de confirmação
4. Faça login
5. Token JWT deve ser armazenado automaticamente

---

## 📊 Parte 5: Monitoramento e Logs

### 5.1 Ver Logs do Backend

```bash
# Logs em tempo real
tail -f logs/app.log

# Filtrar erros
grep "ERROR" logs/app.log
```

### 5.2 Monitorar Firestore

1. Acesse Firebase Console → Firestore Database
2. Veja as coleções criadas:
   - `users`
   - `items`
   - `threads`
   - `alerts`
   - `campuses`
   - `audits`

### 5.3 Métricas de Performance

```bash
# Instale Prometheus (opcional)
pip install prometheus-client

# Acesse métricas
curl http://localhost:8000/metrics
```

---

## 🚀 Parte 6: Deploy em Produção

### 6.1 Deploy do Backend (Render)

1. Crie conta em [Render.com](https://render.com)
2. Conecte seu repositório GitHub
3. Crie novo **Web Service**
4. Configurações:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3.10
5. Adicione variáveis de ambiente (do `.env`)
6. Deploy!

### 6.2 Deploy do Frontend (Vercel)

1. Crie conta em [Vercel.com](https://vercel.com)
2. Importe projeto do GitHub
3. Configurações:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Adicione variáveis de ambiente (do `.env`)
5. Deploy!

### 6.3 Configurar Domínio Customizado

**Backend:**
```
api.achados.undf.edu.br → Render
```

**Frontend:**
```
achados.undf.edu.br → Vercel
```

### 6.4 Configurar CORS

No `backend/app/main.py`, atualize:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://achados.undf.edu.br"  # Seu domínio
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔒 Parte 7: Segurança

### 7.1 Checklist de Segurança

- [ ] `.env` no `.gitignore`
- [ ] `serviceAccountKey.json` no `.gitignore`
- [ ] Regras do Firestore configuradas (acesso bloqueado)
- [ ] Regras do Storage configuradas
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativo
- [ ] HTTPS em produção
- [ ] Variáveis de ambiente seguras

### 7.2 Backup do Firestore

```bash
# Instale gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Faça backup
gcloud firestore export gs://velta-a7710-backups/$(date +%Y%m%d)
```

### 7.3 Monitoramento de Erros

Configure Sentry (opcional):

```bash
pip install sentry-sdk

# No app/main.py
import sentry_sdk
sentry_sdk.init(dsn="YOUR_SENTRY_DSN")
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'react'"

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Firebase Admin SDK not initialized"

Verifique:
1. Arquivo `.env` existe e está correto
2. `FIREBASE_PRIVATE_KEY` tem `\n` preservados
3. Caminho do `serviceAccountKey.json` está correto

### Erro: "CORS policy blocked"

Adicione seu domínio no `allow_origins` do backend.

### Erro: "Firestore permission denied"

Verifique:
1. Regras do Firestore estão corretas
2. Token JWT está sendo enviado no header
3. Backend está validando o token corretamente

### Performance lenta na busca

1. Verifique se índices compostos foram criados
2. Limite o número de resultados (use paginação)
3. Use cache Redis para queries frequentes

---

## 📚 Recursos Adicionais

- [Documentação Firebase](https://firebase.google.com/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

## 🎉 Pronto!

Seu sistema de achados e perdidos está funcionando! 🚀

**Próximos passos:**
1. Personalize cores e logos
2. Adicione mais campus e prédios
3. Configure notificações push (FCM)
4. Implemente analytics
5. Adicione testes E2E

**Suporte:**
- 📧 Email: suporte@undf.edu.br
- 💬 Discord: [Link do servidor]
- 📖 Wiki: [Link da documentação]

---

**Desenvolvido com ❤️ para a comunidade UnDF**
