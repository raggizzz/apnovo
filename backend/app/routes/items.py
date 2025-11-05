from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..dependencies.auth import AuthenticatedUser, get_current_user
from ..firebase import get_firestore_client
from ..models.items import Item, ItemCreate, ItemUpdate, ItemStatus
from ..utils import normalize_text, generate_ngrams, encode_geohash, calculate_search_score

router = APIRouter()


@router.post("", response_model=Item, status_code=status.HTTP_201_CREATED)
async def create_item(
    item_data: ItemCreate,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Cria um novo item (FOUND ou LOST).
    Gera automaticamente campos normalizados, n-grams e geohash.
    """
    db = get_firestore_client()
    
    # Normalização
    title_n = normalize_text(item_data.title)
    desc_n = normalize_text(item_data.description)
    tags_n = [normalize_text(tag) for tag in item_data.tags]
    
    # N-grams (trigramas do título + tags)
    ngrams = generate_ngrams(item_data.title)
    for tag in item_data.tags:
        ngrams.extend(generate_ngrams(tag))
    ngrams = list(set(ngrams))  # Remove duplicatas
    
    # Geohash (se houver geo)
    if item_data.geo:
        item_data.geo.geohash = encode_geohash(item_data.geo.lat, item_data.geo.lng)
    
    # Monta o item
    item = Item(
        ownerUid=user.uid,
        type=item_data.type,
        title=item_data.title,
        description=item_data.description,
        category=item_data.category,
        tags=item_data.tags,
        campusId=item_data.campusId,
        buildingId=item_data.buildingId,
        spot=item_data.spot,
        geo=item_data.geo,
        photos=item_data.photos,
        title_n=title_n,
        desc_n=desc_n,
        tags_n=tags_n,
        ngrams=ngrams,
    )
    
    # Salva no Firestore
    doc_ref = db.collection("items").document()
    item.id = doc_ref.id
    doc_ref.set(item.dict(exclude_none=True))
    
    return item


@router.get("", response_model=List[Item])
async def list_items(
    status_filter: Optional[ItemStatus] = Query(None, alias="status"),
    campus_id: Optional[str] = Query(None, alias="campusId"),
    building_id: Optional[str] = Query(None, alias="buildingId"),
    q: Optional[str] = Query(None, description="Query de busca"),
    limit: int = Query(20, ge=1, le=100),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Lista itens com filtros opcionais e busca por texto.
    """
    db = get_firestore_client()
    query = db.collection("items")
    
    # Filtros básicos
    if status_filter:
        query = query.where("status", "==", status_filter.value)
    if campus_id:
        query = query.where("campusId", "==", campus_id)
    if building_id:
        query = query.where("buildingId", "==", building_id)
    
    # Ordenação
    query = query.order_by("createdAt", direction="DESCENDING").limit(limit)
    
    docs = query.stream()
    items = []
    
    for doc in docs:
        item_dict = doc.to_dict()
        item_dict["id"] = doc.id
        items.append(item_dict)
    
    # Se houver busca textual, aplica ranking
    if q:
        query_ngrams = set(generate_ngrams(q))
        scored_items = []
        
        for item in items:
            score = calculate_search_score(item, query_ngrams)
            if score > 0:
                scored_items.append((score, item))
        
        # Ordena por score decrescente
        scored_items.sort(key=lambda x: x[0], reverse=True)
        items = [item for _, item in scored_items]
    
    return [Item(**item) for item in items]


@router.get("/{item_id}", response_model=Item)
async def get_item(
    item_id: str,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Retorna detalhes de um item específico."""
    db = get_firestore_client()
    doc = db.collection("items").document(item_id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item_dict = doc.to_dict()
    item_dict["id"] = doc.id
    
    return Item(**item_dict)


@router.patch("/{item_id}", response_model=Item)
async def update_item(
    item_id: str,
    update_data: ItemUpdate,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Atualiza um item existente.
    Apenas o dono pode editar (exceto staff).
    """
    db = get_firestore_client()
    doc_ref = db.collection("items").document(item_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item_dict = doc.to_dict()
    
    # Verifica permissão
    if item_dict["ownerUid"] != user.uid and user.role not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this item")
    
    # Prepara update
    update_dict = update_data.dict(exclude_none=True)
    
    # Se mudar status para RESOLVED, exige reauth (simplificado aqui)
    if update_data.status == ItemStatus.RESOLVED:
        update_dict["resolvedAt"] = datetime.utcnow()
    
    # Atualiza campos normalizados se necessário
    if update_data.title:
        update_dict["title_n"] = normalize_text(update_data.title)
    if update_data.description:
        update_dict["desc_n"] = normalize_text(update_data.description)
    if update_data.tags:
        update_dict["tags_n"] = [normalize_text(t) for t in update_data.tags]
    
    update_dict["updatedAt"] = datetime.utcnow()
    
    doc_ref.update(update_dict)
    
    # Retorna item atualizado
    updated_doc = doc_ref.get()
    updated_dict = updated_doc.to_dict()
    updated_dict["id"] = updated_doc.id
    
    return Item(**updated_dict)
