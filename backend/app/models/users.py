from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    USER = "user"
    STAFF = "staff"
    ADMIN = "admin"


class User(BaseModel):
    uid: str
    name: str
    email: EmailStr
    role: UserRole = UserRole.USER
    campusHome: Optional[str] = None
    notifTokens: List[str] = Field(default_factory=list)
    status: str = "active"
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True
