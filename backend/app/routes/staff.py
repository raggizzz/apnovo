from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..dependencies.auth import AuthenticatedUser, get_staff_user
from ..firebase import get_firestore_client
from ..models.items import ItemStatus

router = APIRouter()


@router.post("/items/{item_id}/receive", status_code=status.HTTP_200_OK)
async def receive_item_at_desk(
    item_id: str,
    notes: Optional[str] = None,
    user: AuthenticatedUser = Depends(get_staff_user)
):
    """
    Registra recebimento físico de um item no balcão.
    Apenas staff pode executar.
    """
    db = get_firestore_client()
    doc_ref = db.collection("items").document(item_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Atualiza item
    doc_ref.update({
        "moderation": {
            "receivedAt": datetime.utcnow(),
            "receivedBy": user.uid,
            "notes": notes or ""
        },
        "updatedAt": datetime.utcnow()
    })
    
    # Gera QR code URL (simplificado)
    qr_url = f"https://your-app.com/items/{item_id}"
    
    return {
        "itemId": item_id,
        "qrCodeUrl": qr_url,
        "receivedAt": datetime.utcnow().isoformat()
    }


@router.get("/reports/daily")
async def get_daily_report(
    campus_id: Optional[str] = Query(None, alias="campusId"),
    user: AuthenticatedUser = Depends(get_staff_user)
):
    """
    Relatório diário de itens para staff.
    Métricas: total, resolvidos, tempo médio de resolução.
    """
    db = get_firestore_client()
    
    # Busca itens das últimas 24h
    from datetime import timedelta
    yesterday = datetime.utcnow() - timedelta(days=1)
    
    query = db.collection("items").where("createdAt", ">=", yesterday)
    
    if campus_id:
        query = query.where("campusId", "==", campus_id)
    
    docs = query.stream()
    
    total = 0
    resolved = 0
    resolution_times = []
    
    for doc in docs:
        item = doc.to_dict()
        total += 1
        
        if item.get("status") == ItemStatus.RESOLVED.value:
            resolved += 1
            
            if item.get("resolvedAt") and item.get("createdAt"):
                delta = item["resolvedAt"] - item["createdAt"]
                resolution_times.append(delta.total_seconds() / 3600)  # horas
    
    avg_resolution_hours = sum(resolution_times) / len(resolution_times) if resolution_times else 0
    
    return {
        "period": "last_24h",
        "campusId": campus_id,
        "total": total,
        "resolved": resolved,
        "resolutionRate": (resolved / total * 100) if total > 0 else 0,
        "avgResolutionHours": round(avg_resolution_hours, 2)
    }
