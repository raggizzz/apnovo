"""
Utilitários para geolocalização usando geohash.
Implementação simplificada de geohash para bounding boxes.
"""
import math
from typing import List, Tuple


BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz"


def encode_geohash(lat: float, lng: float, precision: int = 7) -> str:
    """
    Codifica latitude e longitude em geohash.
    Precision padrão: 7 (~150m de precisão)
    """
    lat_range = [-90.0, 90.0]
    lng_range = [-180.0, 180.0]
    
    geohash = []
    bits = 0
    bit = 0
    ch = 0
    
    even = True
    while len(geohash) < precision:
        if even:
            mid = (lng_range[0] + lng_range[1]) / 2
            if lng > mid:
                ch |= (1 << (4 - bit))
                lng_range[0] = mid
            else:
                lng_range[1] = mid
        else:
            mid = (lat_range[0] + lat_range[1]) / 2
            if lat > mid:
                ch |= (1 << (4 - bit))
                lat_range[0] = mid
            else:
                lat_range[1] = mid
        
        even = not even
        
        if bit < 4:
            bit += 1
        else:
            geohash.append(BASE32[ch])
            bit = 0
            ch = 0
    
    return "".join(geohash)


def get_geohash_neighbors(geohash: str) -> List[str]:
    """
    Retorna os 8 vizinhos de um geohash (simplificado).
    Para busca por raio, você pode usar o próprio geohash e seus vizinhos.
    """
    # Implementação simplificada: retorna apenas o próprio hash
    # Em produção, use biblioteca pygeohash ou similar
    return [geohash]


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calcula distância em km entre dois pontos usando fórmula de Haversine.
    """
    R = 6371.0  # Raio da Terra em km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) *
         math.sin(delta_lng / 2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance
