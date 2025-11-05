"""
Utilitários para cálculo de score de busca.
"""
from datetime import datetime, timedelta
from typing import Optional

from .geohash import haversine_distance


def calculate_search_score(
    item: dict,
    query_ngrams: set,
    user_campus: Optional[str] = None,
    user_building: Optional[str] = None,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
) -> float:
    """
    Calcula score de relevância para um item baseado em:
    - Interseção de n-grams (título=3, tags=2, descrição=1)
    - Boost por campus/prédio igual
    - Decay temporal (itens antigos perdem pontos)
    - Distância geográfica (se disponível)
    """
    score = 0.0
    
    # 1. Score por n-grams
    item_ngrams = set(item.get("ngrams", []))
    intersection = query_ngrams & item_ngrams
    
    if intersection:
        # Peso base pela interseção
        score += len(intersection) * 2.0
        
        # Boost por campo (simplificado: assume que ngrams vêm do título principalmente)
        title_n = item.get("title_n", "")
        if any(ng in title_n for ng in intersection):
            score += 3.0
        
        tags_n = item.get("tags_n", [])
        if any(any(ng in tag for ng in intersection) for tag in tags_n):
            score += 2.0
    
    # 2. Boost por localização
    if user_campus and item.get("campusId") == user_campus:
        score += 5.0
        
        if user_building and item.get("buildingId") == user_building:
            score += 3.0
    
    # 3. Decay temporal (itens com mais de 30 dias perdem pontos)
    created_at = item.get("createdAt")
    if created_at:
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        
        age_days = (datetime.utcnow() - created_at).days
        if age_days > 30:
            score *= 0.7
        elif age_days > 7:
            score *= 0.9
    
    # 4. Boost por distância geográfica
    if user_lat and user_lng and item.get("geo"):
        item_geo = item["geo"]
        item_lat = item_geo.get("lat")
        item_lng = item_geo.get("lng")
        
        if item_lat and item_lng:
            distance_km = haversine_distance(user_lat, user_lng, item_lat, item_lng)
            
            # Boost inversamente proporcional à distância
            if distance_km < 0.5:
                score += 4.0
            elif distance_km < 1.0:
                score += 2.0
            elif distance_km < 2.0:
                score += 1.0
    
    return score
