from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class ItemType(str, Enum):
    FOUND = "FOUND"
    LOST = "LOST"


class ItemStatus(str, Enum):
    OPEN = "OPEN"
    RESOLVED = "RESOLVED"


class GeoPoint(BaseModel):
    lat: float
    lng: float
    geohash: Optional[str] = None


class Photo(BaseModel):
    fullUrl: str
    thumbUrl: Optional[str] = None
    w: Optional[int] = None
    h: Optional[int] = None


class Item(BaseModel):
    id: Optional[str] = None
    ownerUid: str
    type: ItemType
    title: str
    description: str
    category: str
    tags: List[str] = Field(default_factory=list)
    
    # Localização
    campusId: str
    campusName: Optional[str] = None
    buildingId: Optional[str] = None
    buildingName: Optional[str] = None
    spot: Optional[str] = None
    
    # Geo
    geo: Optional[GeoPoint] = None
    
    # Fotos
    photos: List[Photo] = Field(default_factory=list)
    
    # Status
    status: ItemStatus = ItemStatus.OPEN
    resolvedReason: Optional[str] = None
    resolvedAt: Optional[datetime] = None
    
    # Campos normalizados para busca
    title_n: Optional[str] = None
    desc_n: Optional[str] = None
    tags_n: List[str] = Field(default_factory=list)
    ngrams: List[str] = Field(default_factory=list)
    
    # Metadados
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    moderation: Optional[dict] = None

    class Config:
        use_enum_values = True


class ItemCreate(BaseModel):
    type: ItemType
    title: str
    description: str
    category: str
    tags: List[str] = Field(default_factory=list)
    campusId: str
    buildingId: Optional[str] = None
    spot: Optional[str] = None
    geo: Optional[GeoPoint] = None
    photos: List[Photo] = Field(default_factory=list)


class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    buildingId: Optional[str] = None
    spot: Optional[str] = None
    geo: Optional[GeoPoint] = None
    photos: Optional[List[Photo]] = None
    status: Optional[ItemStatus] = None
    resolvedReason: Optional[str] = None
