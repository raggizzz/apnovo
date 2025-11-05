from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, Header, status
from firebase_admin import auth

from ..firebase import initialize_firebase


class AuthenticatedUser:
    def __init__(self, uid: str, email: Optional[str], role: str = "user"):
        self.uid = uid
        self.email = email
        self.role = role


async def get_current_user(authorization: str = Header(...)) -> AuthenticatedUser:
    """
    Valida o ID token do Firebase e retorna o usuário autenticado.
    Espera header: Authorization: Bearer <id_token>
    """
    initialize_firebase()

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )

    id_token = authorization.split("Bearer ")[1]

    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token["uid"]
        email = decoded_token.get("email")

        # Aqui você pode buscar role do Firestore se necessário
        # Por enquanto, retorna role padrão
        return AuthenticatedUser(uid=uid, email=email, role="user")

    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


async def get_staff_user(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    """Requer que o usuário tenha role staff ou admin"""
    if user.role not in ["staff", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff access required"
        )
    return user
