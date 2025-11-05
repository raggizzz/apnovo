# 🚀 Como Fazer Push para o GitHub

## Passo a Passo

### 1. Inicializar Git (se ainda não fez)
```bash
cd c:\Users\nuxay\Documents\ap
git init
```

### 2. Adicionar o remote
```bash
git remote add origin https://github.com/raggizzz/achadosEPerdidos.git
```

### 3. Adicionar todos os arquivos
```bash
git add .
```

### 4. Fazer o commit
```bash
git commit -m "feat: Sistema completo de achados e perdidos UnDF

- Frontend React + TypeScript
- Integração com Supabase
- Upload de fotos
- Busca e filtros avançados
- Design profissional UX nível campus PRO
- Responsivo mobile-first
"
```

### 5. Fazer o push
```bash
git branch -M main
git push -u origin main
```

## ⚠️ Antes de fazer push

### Verificar se .gitignore está correto
```bash
cat .gitignore
```

Deve conter:
- `.env`
- `node_modules/`
- `serviceAccountKey.json`

### Verificar arquivos que serão enviados
```bash
git status
```

### Se precisar remover arquivo sensível
```bash
git rm --cached arquivo-sensivel.env
git commit -m "remove: arquivo sensível"
```

## 🔐 Arquivos que NÃO devem ir pro GitHub

- ❌ `.env` (credenciais)
- ❌ `serviceAccountKey.json` (Firebase)
- ❌ `node_modules/` (dependências)
- ❌ `dist/` (build)

## ✅ Arquivos que DEVEM ir

- ✅ `.env.example` (template)
- ✅ `README.md`
- ✅ Código fonte (`src/`)
- ✅ `package.json`
- ✅ Documentação (`.md`)
- ✅ Schema SQL

## 📝 Comandos Úteis

### Ver status
```bash
git status
```

### Ver diferenças
```bash
git diff
```

### Ver histórico
```bash
git log --oneline
```

### Desfazer último commit (mantém alterações)
```bash
git reset --soft HEAD~1
```

### Forçar push (cuidado!)
```bash
git push -f origin main
```

## 🎯 Depois do Push

1. Acesse: https://github.com/raggizzz/achadosEPerdidos
2. Verifique se todos os arquivos estão lá
3. Edite o README.md se necessário
4. Configure GitHub Pages (opcional)

## 🔄 Para Atualizar Depois

```bash
git add .
git commit -m "feat: descrição da mudança"
git push
```

## 🆘 Problemas Comuns

### Erro: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/raggizzz/achadosEPerdidos.git
```

### Erro: "failed to push some refs"
```bash
git pull origin main --rebase
git push origin main
```

### Erro: "Permission denied"
Configure suas credenciais do GitHub:
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

## ✨ Pronto!

Seu código estará no GitHub em: https://github.com/raggizzz/achadosEPerdidos
