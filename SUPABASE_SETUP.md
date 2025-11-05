# 🚀 Migração para Supabase - UNDF Achados e Perdidos

## 📋 Por que Supabase?

- ✅ **Storage funcional** (problema do Firebase resolvido)
- ✅ **PostgreSQL** (banco relacional robusto)
- ✅ **Row Level Security** (segurança nativa)
- ✅ **API REST automática** (gerada do schema)
- ✅ **Realtime** (WebSockets nativos)
- ✅ **Free tier generoso** (500MB storage, 2GB bandwidth)

---

## 🔧 Configuração do Supabase

### 1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma conta (GitHub recomendado)
4. Clique em "New Project"
5. Preencha:
   - **Name**: `undf-achados-perdidos`
   - **Database Password**: (gere uma senha forte)
   - **Region**: `South America (São Paulo)`
6. Clique em "Create new project"

### 2. Obter Credenciais

Após criar o projeto, vá em **Settings** → **API**:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Configurar Storage

1. Vá em **Storage** no menu lateral
2. Clique em "Create a new bucket"
3. Nome: `items-photos`
4. **Public bucket**: ✅ (marque como público)
5. Clique em "Create bucket"

### 4. Executar SQL Schema

Vá em **SQL Editor** e execute o script completo (ver arquivo `supabase_schema.sql`)

---

## 📊 Schema do Banco de Dados

### Tabelas Principais

1. **users** - Usuários do sistema
2. **items** - Objetos perdidos/encontrados
3. **item_photos** - Fotos dos objetos
4. **threads** - Conversas
5. **messages** - Mensagens
6. **alerts** - Alertas de notificação
7. **campuses** - Campus
8. **buildings** - Prédios
9. **audits** - Logs de auditoria

---

## 🔐 Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com políticas específicas:

- **SELECT**: Usuários autenticados podem ler
- **INSERT**: Usuários podem criar seus próprios registros
- **UPDATE**: Usuários podem atualizar apenas seus registros
- **DELETE**: Apenas admins podem deletar

---

## 🖼️ Upload de Imagens

```typescript
// Upload de foto
const uploadPhoto = async (file: File, itemId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${itemId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('items-photos')
    .upload(fileName, file);
  
  if (error) throw error;
  
  // URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('items-photos')
    .getPublicUrl(fileName);
  
  return publicUrl;
};
```

---

## 🔄 Migração de Dados

Se você já tem dados no Firebase:

```bash
# Execute o script de migração
python backend/app/scripts/migrate_firebase_to_supabase.py
```

---

## 📝 Próximos Passos

1. ✅ Criar projeto no Supabase
2. ✅ Executar schema SQL
3. ✅ Configurar storage bucket
4. ✅ Atualizar variáveis de ambiente
5. ✅ Testar conexão
6. ✅ Migrar dados (se necessário)
