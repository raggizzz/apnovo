"""
Firebase stub - not used anymore since we migrated to Supabase.
Kept for compatibility with existing imports.
"""
from __future__ import annotations


def initialize_firebase():
    """Stub function - Firebase not used anymore"""
    pass


def get_firestore_client():
    """Stub function - Use Supabase instead"""
    raise NotImplementedError("Use Supabase client instead of Firestore")


def get_storage_bucket():
    """Stub function - Use Supabase storage instead"""
    raise NotImplementedError("Use Supabase storage instead of Firebase storage")
