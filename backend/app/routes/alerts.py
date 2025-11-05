from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from ..dependencies.auth import AuthenticatedUser, get_current_user
from ..firebase import get_firestore_client
from ..models.alerts import Alert, AlertCreate, AlertUpdate

router = APIRouter()


@router.post("", response_model=Alert, status_code=status.HTTP_201_CREATED)
async def create_alert(
    alert_data: AlertCreate,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Cria um alerta de notificação para novos itens."""
    db = get_firestore_client()
    
    alert = Alert(
        uid=user.uid,
        queryText=alert_data.queryText,
        tags=alert_data.tags,
        campusId=alert_data.campusId,
        radiusKm=alert_data.radiusKm
    )
    
    doc_ref = db.collection("alerts").document()
    alert.id = doc_ref.id
    doc_ref.set(alert.dict(exclude_none=True))
    
    return alert


@router.get("", response_model=List[Alert])
async def list_alerts(
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Lista alertas do usuário."""
    db = get_firestore_client()
    
    query = db.collection("alerts").where("uid", "==", user.uid)
    docs = query.stream()
    
    alerts = []
    for doc in docs:
        alert_dict = doc.to_dict()
        alert_dict["id"] = doc.id
        alerts.append(Alert(**alert_dict))
    
    return alerts


@router.patch("/{alert_id}", response_model=Alert)
async def update_alert(
    alert_id: str,
    update_data: AlertUpdate,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Atualiza um alerta existente."""
    db = get_firestore_client()
    doc_ref = db.collection("alerts").document(alert_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert_data = doc.to_dict()
    if alert_data["uid"] != user.uid:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_dict = update_data.dict(exclude_none=True)
    doc_ref.update(update_dict)
    
    updated_doc = doc_ref.get()
    updated_dict = updated_doc.to_dict()
    updated_dict["id"] = updated_doc.id
    
    return Alert(**updated_dict)


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(
    alert_id: str,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Deleta um alerta."""
    db = get_firestore_client()
    doc_ref = db.collection("alerts").document(alert_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert_data = doc.to_dict()
    if alert_data["uid"] != user.uid:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    doc_ref.delete()
    return None
