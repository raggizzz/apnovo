from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, Header, status


class AuthenticatedUser:
    def __init__(self, uid: str, email: Optional[str], role: str = "user"):
        self.uid = uid
        self.email = email
        self.role = role


async def get_current_user(authorization: str = Header(None)) -> AuthenticatedUser:
    """
    Simplified auth - returns a mock user for development.
    In production, this should validate Supabase JWT tokens.
    """
    # For now, return a mock user to allow the API to work
    # TODO: Implement Supabase JWT validation
    return AuthenticatedUser(uid="dev-user", email="dev@undf.edu.br", role="user")


async def get_staff_user(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    """Requer que o usuário tenha role staff ou admin"""
    if user.role not in ["staff", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff access required"
        )
    return user
