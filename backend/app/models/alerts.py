from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class Alert(BaseModel):
    id: Optional[str] = None
    uid: str
    queryText: str
    tags: List[str] = Field(default_factory=list)
    campusId: Optional[str] = None
    radiusKm: Optional[float] = None
    active: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class AlertCreate(BaseModel):
    queryText: str
    tags: List[str] = Field(default_factory=list)
    campusId: Optional[str] = None
    radiusKm: Optional[float] = None


class AlertUpdate(BaseModel):
    queryText: Optional[str] = None
    tags: Optional[List[str]] = None
    campusId: Optional[str] = None
    radiusKm: Optional[float] = None
    active: Optional[bool] = None
