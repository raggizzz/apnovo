from __future__ import annotations

from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from ..dependencies.auth import AuthenticatedUser, get_current_user
from ..firebase import get_storage_bucket

router = APIRouter()


ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE_MB = 5


@router.post("/url")
async def generate_upload_url(
    filename: str = Query(..., description="Nome do arquivo"),
    content_type: str = Query(..., description="MIME type"),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Gera URL assinada para upload direto ao Storage.
    Valida extensão e retorna URL com expiração curta.
    """
    # Valida extensão
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Valida content-type
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only images are allowed")
    
    # Gera caminho único
    import uuid
    unique_filename = f"uploads/{user.uid}/{uuid.uuid4().hex}_{filename}"
    
    bucket = get_storage_bucket()
    blob = bucket.blob(unique_filename)
    
    # Gera URL assinada (expira em 15 minutos)
    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(minutes=15),
        method="PUT",
        content_type=content_type,
    )
    
    return {
        "uploadUrl": url,
        "filePath": unique_filename,
        "publicUrl": f"https://storage.googleapis.com/{bucket.name}/{unique_filename}",
        "expiresIn": 900  # segundos
    }
