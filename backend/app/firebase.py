from __future__ import annotations

import json
from typing import Optional

import firebase_admin
from firebase_admin import credentials, firestore, storage

from .settings import get_settings


_app: Optional[firebase_admin.App] = None


def initialize_firebase() -> firebase_admin.App:
    global _app
    if _app:
        return _app

    settings = get_settings()

    cred_dict = {
        "project_id": settings.firebase_project_id,
        "client_email": settings.firebase_client_email,
        "private_key": settings.firebase_private_key.replace("\\n", "\n"),
    }

    credential = credentials.Certificate(cred_dict)
    options = {"projectId": settings.firebase_project_id}

    _app = firebase_admin.initialize_app(credential, options=options)

    if settings.firestore_emulator_host:
        # Firestore emulator support
        firestore.client()._client_options.api_endpoint = settings.firestore_emulator_host  # type: ignore[attr-defined]

    if settings.storage_bucket:
        storage.bucket(settings.storage_bucket)

    return _app


def get_firestore_client() -> firestore.Client:
    initialize_firebase()
    return firestore.client()


def get_storage_bucket() -> storage.bucket.Bucket:
    initialize_firebase()
    settings = get_settings()
    if not settings.storage_bucket:
        raise RuntimeError("Storage bucket must be configured")
    return storage.bucket(settings.storage_bucket)
