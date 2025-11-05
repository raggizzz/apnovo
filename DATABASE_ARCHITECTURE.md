# 🗄️ Arquitetura do Banco de Dados - UNDF Achados e Perdidos

## 📊 Visão Geral

O sistema utiliza **Firebase Firestore** como banco de dados NoSQL, com uma arquitetura híbrida que combina:
- **Normalização** para integridade referencial
- **Denormalização estratégica** para performance de leitura
- **Indexação inteligente** com n-grams para busca full-text
- **Geolocalização** com geohash para queries espaciais eficientes

---

## 🏗️ Estrutura de Coleções

### 1. `users` Collection

Armazena informações dos usuários autenticados.

```typescript
users/{uid}
{
  uid: string;                    // Firebase Auth UID (PK)
  name: string;                   // Nome completo
  email: string;                  // Email institucional
  role: "user" | "staff" | "admin"; // Papel no sistema
  campusHome: string;             // Campus principal do usuário
  notifTokens: string[];          // FCM tokens para notificações push
  status: "active" | "suspended"; // Status da conta
  createdAt: Timestamp;           // Data de criação
  updatedAt: Timestamp;           // Última atualização
  
  // Metadados opcionais
  phone?: string;                 // Telefone de contato
  photoURL?: string;              // URL da foto de perfil
  department?: string;            // Departamento/Curso
}
```

**Índices:**
- `email` (único)
- `role`
- `status`
- Composto: `campusHome + status`

**Regras de Negócio:**
- UID é gerado pelo Firebase Auth
- Email deve ser validado e único
- Role padrão é "user"
- NotifTokens são atualizados quando o usuário faz login em novo dispositivo

---

### 2. `items` Collection

Coleção principal de objetos perdidos e encontrados.

```typescript
items/{itemId}
{
  // Identificação
  id: string;                     // UUID v4 (PK)
  ownerUid: string;               // FK para users/{uid}
  type: "FOUND" | "LOST";         // Tipo do registro
  
  // Informações do Objeto
  title: string;                  // Título descritivo (ex: "iPhone 13 Pro")
  description: string;            // Descrição detalhada
  category: string;               // Categoria principal
  subcategory?: string;           // Subcategoria opcional
  tags: string[];                 // Tags para classificação
  color?: string;                 // Cor predominante
  brand?: string;                 // Marca do objeto
  
  // Localização
  campusId: string;               // ID do campus
  campusName: string;             // Nome do campus (denormalizado)
  buildingId: string;             // ID do prédio
  buildingName: string;           // Nome do prédio (denormalizado)
  spot?: string;                  // Local específico (ex: "Sala 203")
  
  // Geolocalização
  geo: {
    lat: number;                  // Latitude
    lng: number;                  // Longitude
    geohash: string;              // Geohash de 7 caracteres
  };
  
  // Fotos
  photos: Array<{
    fullUrl: string;              // URL completa da imagem
    thumbUrl: string;             // URL da thumbnail
    w: number;                    // Largura original
    h: number;                    // Altura original
  }>;
  
  // Status
  status: "OPEN" | "RESOLVED" | "EXPIRED";
  resolvedReason?: string;        // Motivo da resolução
  resolvedAt?: Timestamp;         // Data de resolução
  expiresAt?: Timestamp;          // Data de expiração (90 dias)
  
  // Campos Normalizados para Busca
  title_n: string;                // Título normalizado
  desc_n: string;                 // Descrição normalizada
  tags_n: string[];               // Tags normalizadas
  ngrams: string[];               // N-grams (trigramas) para busca
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Moderação
  moderation: {
    flagged: boolean;             // Item reportado
    flagCount: number;            // Número de reports
    reviewedBy?: string;          // UID do moderador
    reviewedAt?: Timestamp;       // Data da revisão
  };
  
  // Métricas
  viewCount: number;              // Número de visualizações
  contactCount: number;           // Número de contatos iniciados
}
```

**Índices Compostos:**
1. `status + campusId + createdAt` (desc)
2. `type + status + campusId`
3. `ownerUid + status`
4. `geo.geohash + status`
5. `category + status + createdAt` (desc)
6. `tags_n (array) + status`

**Regras de Negócio:**
- Items OPEN expiram automaticamente após 90 dias
- Fotos são armazenadas no Firebase Storage
- Geohash é calculado no backend usando algoritmo Geohash
- N-grams são gerados a partir de title_n e tags_n

---

### 3. `threads` Collection

Threads de conversação entre usuários.

```typescript
threads/{threadId}
{
  id: string;                     // UUID v4 (PK)
  itemId: string;                 // FK para items/{itemId}
  participants: string[];         // Array de UIDs [owner, interested]
  
  // Denormalização para performance
  itemTitle: string;              // Título do item
  itemType: "FOUND" | "LOST";     // Tipo do item
  itemPhotoUrl?: string;          // Primeira foto do item
  
  // Status
  status: "active" | "archived";
  archivedBy?: string;            // UID de quem arquivou
  
  // Última mensagem (denormalizada)
  lastMessage: string;            // Texto da última mensagem
  lastMessageAt: Timestamp;       // Timestamp da última mensagem
  lastMessageBy: string;          // UID do autor
  
  // Contadores
  messageCount: number;           // Total de mensagens
  unreadCount: {                  // Mensagens não lidas por usuário
    [uid: string]: number;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Subcoleção: `threads/{threadId}/messages`**

```typescript
messages/{messageId}
{
  id: string;                     // UUID v4 (PK)
  threadId: string;               // FK para thread pai
  authorUid: string;              // FK para users/{uid}
  
  // Conteúdo
  text: string;                   // Texto da mensagem
  type: "text" | "system";        // Tipo de mensagem
  
  // Metadados
  readBy: string[];               // UIDs que leram a mensagem
  editedAt?: Timestamp;           // Data de edição
  deletedAt?: Timestamp;          // Soft delete
  
  // Timestamps
  createdAt: Timestamp;
}
```

**Índices:**
- Threads: `participants (array) + status + lastMessageAt` (desc)
- Messages: `threadId + createdAt` (asc)

**Regras de Negócio:**
- Máximo 2 participantes por thread
- Rate limit: 10 mensagens por minuto por usuário
- Mensagens são soft-deleted (mantém histórico)
- Thread é arquivada quando item é resolvido

---

### 4. `alerts` Collection

Alertas configurados pelos usuários para notificações automáticas.

```typescript
alerts/{alertId}
{
  id: string;                     // UUID v4 (PK)
  uid: string;                    // FK para users/{uid}
  
  // Critérios de Busca
  queryText: string;              // Texto de busca
  queryText_n: string;            // Texto normalizado
  tags: string[];                 // Tags para match
  tags_n: string[];               // Tags normalizadas
  category?: string;              // Categoria específica
  
  // Filtros Geográficos
  campusId?: string;              // Campus específico
  geo?: {
    lat: number;
    lng: number;
    radiusKm: number;             // Raio de busca em km
  };
  
  // Status
  active: boolean;                // Alerta ativo/inativo
  matchCount: number;             // Número de matches encontrados
  lastMatchAt?: Timestamp;        // Último match
  
  // Configurações
  notifyEmail: boolean;           // Enviar email
  notifyPush: boolean;            // Enviar push notification
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt?: Timestamp;          // Expiração opcional (30 dias)
}
```

**Índices:**
- `uid + active`
- `tags_n (array) + active`
- `campusId + active`

**Regras de Negócio:**
- Máximo 5 alertas ativos por usuário
- Alertas expiram após 30 dias se não configurado diferente
- Matching é executado no backend quando novo item é criado

---

### 5. `campuses` Collection

Dados dos campus da universidade.

```typescript
campuses/{campusId}
{
  id: string;                     // Código do campus (PK)
  name: string;                   // Nome do campus
  address: string;                // Endereço completo
  
  geo: {
    lat: number;
    lng: number;
    geohash: string;
  };
  
  // Configurações
  active: boolean;
  timezone: string;               // Timezone (ex: "America/Sao_Paulo")
  
  // Contatos
  phone: string;
  email: string;
  lostAndFoundLocation: string;   // Local físico do achados e perdidos
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Subcoleção: `campuses/{campusId}/buildings`**

```typescript
buildings/{buildingId}
{
  id: string;
  campusId: string;
  name: string;
  code: string;                   // Código do prédio (ex: "BL-A")
  
  geo: {
    lat: number;
    lng: number;
    geohash: string;
  };
  
  floors: number;
  active: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 6. `audits` Collection

Logs de auditoria para ações sensíveis.

```typescript
audits/{auditId}
{
  id: string;
  timestamp: Timestamp;
  
  // Ator
  actorUid: string;
  actorRole: string;
  actorIP: string;
  
  // Ação
  action: string;                 // Ex: "item.update", "user.suspend"
  resource: string;               // Ex: "items/abc123"
  
  // Detalhes
  changes?: {
    before: any;
    after: any;
  };
  
  // Contexto
  userAgent: string;
  requestId: string;
}
```

**Índices:**
- `actorUid + timestamp` (desc)
- `action + timestamp` (desc)
- `resource + timestamp` (desc)

---

### 7. `reports` Collection

Relatórios agregados para dashboard administrativo.

```typescript
reports/{reportId}
{
  id: string;                     // Ex: "daily-2024-01-15"
  type: "daily" | "weekly" | "monthly";
  period: {
    start: Timestamp;
    end: Timestamp;
  };
  
  // Métricas
  metrics: {
    itemsCreated: number;
    itemsResolved: number;
    itemsExpired: number;
    activeUsers: number;
    newUsers: number;
    threadsCreated: number;
    messagesExchanged: number;
    alertsTriggered: number;
  };
  
  // Breakdown por Campus
  byCampus: {
    [campusId: string]: {
      itemsCreated: number;
      itemsResolved: number;
      resolutionRate: number;
    };
  };
  
  // Breakdown por Categoria
  byCategory: {
    [category: string]: {
      found: number;
      lost: number;
    };
  };
  
  generatedAt: Timestamp;
}
```

---

## 🔍 Sistema de Busca e Normalização

### Normalização de Texto

O sistema implementa normalização agressiva para maximizar matches:

```python
def normalize_text(text: str) -> str:
    """
    1. Remove acentos (café → cafe)
    2. Converte para minúsculas
    3. Remove pontuação
    4. Remove espaços extras
    5. Remove stopwords (opcional)
    """
    # Implementação em backend/app/utils/normalization.py
    text = unidecode(text)  # Remove acentos
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = ' '.join(text.split())
    return text
```

### Geração de N-grams

N-grams (trigramas) permitem busca fuzzy e tolerância a erros de digitação:

```python
def generate_ngrams(text: str, n: int = 3) -> List[str]:
    """
    Gera trigramas de um texto normalizado.
    
    Exemplo:
    "iphone" → ["iph", "pho", "hon", "one"]
    
    Permite encontrar:
    - "iphone" com "ifone" (typo)
    - "notebook" com "notbook" (letra faltando)
    """
    text_n = normalize_text(text)
    words = text_n.split()
    ngrams = []
    
    for word in words:
        if len(word) >= n:
            for i in range(len(word) - n + 1):
                ngrams.append(word[i:i+n])
    
    return list(set(ngrams))  # Remove duplicatas
```

### Geohash para Queries Espaciais

Geohash codifica lat/lng em string para queries eficientes:

```python
def encode_geohash(lat: float, lng: float, precision: int = 7) -> str:
    """
    Codifica coordenadas em geohash.
    
    Precisão 7 = ~153m x 153m
    
    Exemplo:
    lat=-15.7801, lng=-47.9292 → "6vjyh5k"
    
    Permite queries por prefixo:
    - "6vjyh" encontra todos em ~2.4km x 2.4km
    - "6vjyh5" encontra todos em ~610m x 610m
    """
    # Implementação em backend/app/utils/geohash.py
    return pygeohash.encode(lat, lng, precision)
```

### Algoritmo de Scoring Híbrido

Combina relevância textual, proximidade geográfica e recência:

```python
def calculate_search_score(
    item: Item,
    query: str,
    user_location: Optional[Tuple[float, float]] = None
) -> float:
    """
    Score = (text_score * 3) + (geo_score * 2) + (time_score * 1)
    
    Componentes:
    1. Text Score: Jaccard similarity de n-grams
    2. Geo Score: Decay exponencial baseado em distância
    3. Time Score: Decay linear baseado em idade
    """
    # 1. Text Score (0-1)
    query_ngrams = set(generate_ngrams(query))
    item_ngrams = set(item.ngrams)
    intersection = len(query_ngrams & item_ngrams)
    union = len(query_ngrams | item_ngrams)
    text_score = intersection / union if union > 0 else 0
    
    # 2. Geo Score (0-1)
    geo_score = 0
    if user_location and item.geo:
        distance_km = haversine_distance(
            user_location[0], user_location[1],
            item.geo.lat, item.geo.lng
        )
        # Decay: 1.0 em 0km, 0.5 em 1km, 0.0 em 5km
        geo_score = max(0, 1 - (distance_km / 5))
    
    # 3. Time Score (0-1)
    age_days = (now() - item.createdAt).days
    # Decay: 1.0 em 0 dias, 0.7 em 30 dias, 0.0 em 90 dias
    time_score = max(0, 1 - (age_days / 90))
    
    # Score final ponderado
    final_score = (text_score * 3) + (geo_score * 2) + (time_score * 1)
    
    # Boosts adicionais
    if item.campusId == user.campusHome:
        final_score += 5
    if item.buildingId == user.lastKnownBuilding:
        final_score += 3
    
    return final_score
```

---

## 📈 Estratégias de Indexação

### Índices Compostos Otimizados

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "campusId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "geo.geohash", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tags_n", "arrayConfig": "CONTAINS" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Query Patterns Otimizados

**1. Busca por Texto + Localização:**
```python
# 1. Filtro inicial por geohash (bounding box)
geohash_prefix = user_geohash[:5]  # ~2.4km x 2.4km
items = db.collection('items')\
    .where('status', '==', 'OPEN')\
    .where('geo.geohash', '>=', geohash_prefix)\
    .where('geo.geohash', '<', geohash_prefix + '~')\
    .order_by('createdAt', 'DESCENDING')\
    .limit(100)\
    .get()

# 2. Filtro secundário por n-grams (in-memory)
query_ngrams = generate_ngrams(query)
filtered = [
    item for item in items
    if len(set(query_ngrams) & set(item.ngrams)) > 0
]

# 3. Scoring e ordenação (in-memory)
scored = [
    (calculate_search_score(item, query, user_location), item)
    for item in filtered
]
scored.sort(reverse=True, key=lambda x: x[0])

# 4. Paginação
results = scored[:20]
```

**2. Matching de Alertas:**
```python
# Executado quando novo item é criado
def match_alerts(new_item: Item):
    # 1. Busca alertas ativos no mesmo campus
    alerts = db.collection('alerts')\
        .where('active', '==', True)\
        .where('campusId', '==', new_item.campusId)\
        .get()
    
    # 2. Filtra por n-grams
    for alert in alerts:
        alert_ngrams = set(generate_ngrams(alert.queryText))
        item_ngrams = set(new_item.ngrams)
        
        similarity = len(alert_ngrams & item_ngrams) / len(alert_ngrams)
        
        if similarity >= 0.3:  # 30% de match
            send_notification(alert.uid, new_item)
            update_alert_metrics(alert.id)
```

---

## 🔐 Segurança e Regras

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Bloqueia todo acesso direto do client
    // Backend com Admin SDK tem acesso total
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Validações no Backend

```python
# Validação de criação de item
def validate_item_creation(item: ItemCreate, user: User):
    # 1. Validar campos obrigatórios
    if not item.title or len(item.title) < 3:
        raise ValueError("Título deve ter no mínimo 3 caracteres")
    
    # 2. Validar localização
    if not item.campusId or not item.buildingId:
        raise ValueError("Campus e prédio são obrigatórios")
    
    # 3. Validar fotos (máximo 5)
    if len(item.photos) > 5:
        raise ValueError("Máximo 5 fotos por item")
    
    # 4. Rate limiting (máximo 10 items por dia por usuário)
    today_count = count_user_items_today(user.uid)
    if today_count >= 10:
        raise RateLimitError("Limite diário de 10 items atingido")
    
    # 5. Validar geolocalização
    if not is_valid_coordinates(item.geo.lat, item.geo.lng):
        raise ValueError("Coordenadas inválidas")
```

---

## 📊 Métricas e Observabilidade

### Logs Estruturados

```python
import structlog

logger = structlog.get_logger()

# Log de criação de item
logger.info(
    "item.created",
    item_id=item.id,
    user_id=user.uid,
    campus_id=item.campusId,
    type=item.type,
    category=item.category,
    duration_ms=duration
)

# Log de busca
logger.info(
    "search.executed",
    user_id=user.uid,
    query=query,
    results_count=len(results),
    duration_ms=duration,
    filters={
        "campus": campus_id,
        "category": category
    }
)
```

### Métricas de Performance

```python
# Prometheus metrics
from prometheus_client import Counter, Histogram

# Contadores
items_created = Counter('items_created_total', 'Total items created', ['type', 'campus'])
searches_executed = Counter('searches_executed_total', 'Total searches')
alerts_matched = Counter('alerts_matched_total', 'Total alert matches')

# Histogramas (latência)
search_duration = Histogram('search_duration_seconds', 'Search duration')
item_creation_duration = Histogram('item_creation_duration_seconds', 'Item creation duration')

# Uso
with search_duration.time():
    results = execute_search(query)

items_created.labels(type='FOUND', campus='campus-1').inc()
```

---

## 🚀 Otimizações e Best Practices

### 1. Denormalização Estratégica

**Problema:** Joins são caros em NoSQL

**Solução:** Denormalizar dados frequentemente acessados juntos

```typescript
// ❌ Ruim: Requer 2 queries
thread = getThread(threadId)
item = getItem(thread.itemId)  // Segunda query

// ✅ Bom: Dados denormalizados
thread = {
  id: "thread-123",
  itemId: "item-456",
  itemTitle: "iPhone 13 Pro",      // Denormalizado
  itemType: "FOUND",                // Denormalizado
  itemPhotoUrl: "https://..."       // Denormalizado
}
```

### 2. Paginação com Cursors

**Problema:** Offset pagination é ineficiente

**Solução:** Usar cursors baseados em documento

```python
# ❌ Ruim: Offset
items = db.collection('items')\
    .order_by('createdAt', 'DESCENDING')\
    .offset(20)\  # Firestore precisa ler 20 docs e descartar
    .limit(10)\
    .get()

# ✅ Bom: Cursor
last_doc = get_last_document_from_previous_page()
items = db.collection('items')\
    .order_by('createdAt', 'DESCENDING')\
    .start_after(last_doc)\  # Começa direto no doc correto
    .limit(10)\
    .get()
```

### 3. Batch Writes

**Problema:** Múltiplas writes sequenciais são lentas

**Solução:** Usar batch writes

```python
# ✅ Batch write (atômico e rápido)
batch = db.batch()

# Criar item
item_ref = db.collection('items').document()
batch.set(item_ref, item_data)

# Atualizar contador do usuário
user_ref = db.collection('users').document(user_id)
batch.update(user_ref, {'itemsCreated': firestore.Increment(1)})

# Criar log de auditoria
audit_ref = db.collection('audits').document()
batch.set(audit_ref, audit_data)

# Commit tudo de uma vez
batch.commit()
```

### 4. Caching Inteligente

```python
from functools import lru_cache
import redis

# Cache em memória para dados estáticos
@lru_cache(maxsize=100)
def get_campus(campus_id: str):
    return db.collection('campuses').document(campus_id).get()

# Redis para cache distribuído
redis_client = redis.Redis()

def get_item_with_cache(item_id: str):
    # Tenta cache primeiro
    cached = redis_client.get(f"item:{item_id}")
    if cached:
        return json.loads(cached)
    
    # Busca no Firestore
    item = db.collection('items').document(item_id).get()
    
    # Salva no cache (TTL 5 minutos)
    redis_client.setex(
        f"item:{item_id}",
        300,
        json.dumps(item.to_dict())
    )
    
    return item
```

---

## 📝 Checklist de Implementação

- [x] Definir estrutura de coleções
- [x] Criar índices compostos
- [x] Implementar normalização de texto
- [x] Implementar geração de n-grams
- [x] Implementar geohash encoding
- [x] Criar algoritmo de scoring
- [x] Configurar regras de segurança
- [x] Implementar validações no backend
- [x] Adicionar logs estruturados
- [x] Configurar métricas Prometheus
- [ ] Criar testes de integração
- [ ] Documentar queries comuns
- [ ] Configurar backups automáticos
- [ ] Implementar data retention policies

---

## 🔗 Referências

- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Geohash Algorithm](https://en.wikipedia.org/wiki/Geohash)
- [N-gram Search](https://en.wikipedia.org/wiki/N-gram)
- [Jaccard Similarity](https://en.wikipedia.org/wiki/Jaccard_index)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
