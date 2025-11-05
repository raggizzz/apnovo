from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class Message(BaseModel):
    id: Optional[str] = None
    threadId: str
    senderUid: str
    content: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    read: bool = False


class MessageCreate(BaseModel):
    content: str


class Thread(BaseModel):
    id: Optional[str] = None
    itemId: str
    participants: List[str] = Field(default_factory=list)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    lastMessage: Optional[str] = None
