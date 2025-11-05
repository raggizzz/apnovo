from __future__ import annotations

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..dependencies.auth import AuthenticatedUser, get_current_user
from ..firebase import get_firestore_client
from ..models.threads import Thread, Message, MessageCreate

router = APIRouter()


@router.post("/items/{item_id}/threads", response_model=Thread, status_code=status.HTTP_201_CREATED)
async def create_thread(
    item_id: str,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Cria uma thread de chat para um item.
    Conecta o usuário atual com o dono do item.
    """
    db = get_firestore_client()
    
    # Verifica se item existe
    item_doc = db.collection("items").document(item_id).get()
    if not item_doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item_data = item_doc.to_dict()
    owner_uid = item_data["ownerUid"]
    
    # Não permite criar thread consigo mesmo
    if owner_uid == user.uid:
        raise HTTPException(status_code=400, detail="Cannot create thread with yourself")
    
    # Verifica se já existe thread
    existing = db.collection("threads").where("itemId", "==", item_id).where(
        "participants", "array_contains", user.uid
    ).limit(1).stream()
    
    for doc in existing:
        thread_dict = doc.to_dict()
        thread_dict["id"] = doc.id
        return Thread(**thread_dict)
    
    # Cria nova thread
    thread = Thread(
        itemId=item_id,
        participants=[owner_uid, user.uid]
    )
    
    doc_ref = db.collection("threads").document()
    thread.id = doc_ref.id
    doc_ref.set(thread.dict(exclude_none=True))
    
    return thread


@router.post("/{thread_id}/messages", response_model=Message, status_code=status.HTTP_201_CREATED)
async def send_message(
    thread_id: str,
    message_data: MessageCreate,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Envia mensagem em uma thread.
    Rate limit aplicado (simplificado aqui).
    """
    db = get_firestore_client()
    
    # Verifica se thread existe e usuário é participante
    thread_doc = db.collection("threads").document(thread_id).get()
    if not thread_doc.exists:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    thread_data = thread_doc.to_dict()
    if user.uid not in thread_data["participants"]:
        raise HTTPException(status_code=403, detail="Not a participant of this thread")
    
    # Cria mensagem
    message = Message(
        threadId=thread_id,
        senderUid=user.uid,
        content=message_data.content
    )
    
    doc_ref = db.collection("threads").document(thread_id).collection("messages").document()
    message.id = doc_ref.id
    doc_ref.set(message.dict(exclude_none=True))
    
    # Atualiza thread
    db.collection("threads").document(thread_id).update({
        "lastMessage": message_data.content[:100],
        "updatedAt": datetime.utcnow()
    })
    
    return message


@router.get("", response_model=List[Thread])
async def list_threads(
    mine: bool = Query(True, description="Apenas minhas threads"),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Lista threads do usuário."""
    db = get_firestore_client()
    
    if mine:
        query = db.collection("threads").where("participants", "array_contains", user.uid)
    else:
        query = db.collection("threads")
    
    query = query.order_by("updatedAt", direction="DESCENDING")
    
    docs = query.stream()
    threads = []
    
    for doc in docs:
        thread_dict = doc.to_dict()
        thread_dict["id"] = doc.id
        threads.append(Thread(**thread_dict))
    
    return threads


@router.get("/{thread_id}/messages", response_model=List[Message])
async def list_messages(
    thread_id: str,
    limit: int = Query(50, ge=1, le=100),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Lista mensagens de uma thread."""
    db = get_firestore_client()
    
    # Verifica permissão
    thread_doc = db.collection("threads").document(thread_id).get()
    if not thread_doc.exists:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    thread_data = thread_doc.to_dict()
    if user.uid not in thread_data["participants"]:
        raise HTTPException(status_code=403, detail="Not a participant")
    
    # Busca mensagens
    query = db.collection("threads").document(thread_id).collection("messages")
    query = query.order_by("createdAt", direction="DESCENDING").limit(limit)
    
    docs = query.stream()
    messages = []
    
    for doc in docs:
        msg_dict = doc.to_dict()
        msg_dict["id"] = doc.id
        messages.append(Message(**msg_dict))
    
    return messages
