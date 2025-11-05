# 🎓 UNDF Achados e Perdidos - Sistema Completo

Sistema profissional de achados e perdidos para a Universidade do Distrito Federal (UnDF).

## 🚀 Features Implementadas

### ✅ Core
- [x] Listagem de objetos em tempo real
- [x] Busca inteligente com exemplos
- [x] Filtros avançados (campus, categoria, status)
- [x] Cadastro com upload de foto
- [x] Modal de detalhes completo
- [x] Design responsivo (mobile-first)
- [x] UX nível profissional

### ✅ Supabase Integration
- [x] PostgreSQL database
- [x] Storage para fotos
- [x] Row Level Security
- [x] Realtime subscriptions
- [x] Auth (pronto para implementar)

### 🔧 Em Desenvolvimento
- [ ] Modo TV por prédio
- [ ] Cartazes QR automáticos
- [ ] Alertas por palavra-chave
- [ ] Balcão Oficial (staff)
- [ ] Ranking esperto de relevância

## 📦 Tecnologias

**Frontend:**
- React 18 + TypeScript
- Vite
- Supabase Client
- CSS Modules

**Backend:**
- Supabase (PostgreSQL + Storage)
- Row Level Security
- PostGIS para geolocalização

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/raggizzz/achadosEPerdidos.git
cd achadosEPerdidos
```

### 2. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o schema SQL (`supabase_schema.sql`)
3. Crie o bucket `items-photos` (público)
4. Copie as credenciais

### 3. Configure as variáveis de ambiente

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Instale as dependências

```bash
cd frontend
npm install
```

### 5. Rode o projeto

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 📱 Campus da UNDF

- Asa Norte
- Samambaia
- Riacho Fundo
- Lago Norte

## 🎨 Design

- Cores oficiais UnDF
- UX nível campus PRO
- Acessibilidade AA
- Performance otimizada

## 📄 Licença

MIT

## 👥 Contribuindo

Pull requests são bem-vindos!

## 📞 Suporte

Issues: https://github.com/raggizzz/achadosEPerdidos/issues
