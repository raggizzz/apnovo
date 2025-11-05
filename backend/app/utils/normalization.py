"""
Utilitários para normalização de texto e geração de n-grams para busca.
"""
import re
import unicodedata
from typing import List


def normalize_text(text: str) -> str:
    """
    Normaliza texto removendo acentos, convertendo para minúsculas
    e removendo pontuação.
    """
    if not text:
        return ""
    
    # Remove acentos
    nfkd = unicodedata.normalize("NFKD", text)
    text_without_accents = "".join([c for c in nfkd if not unicodedata.combining(c)])
    
    # Minúsculas
    text_lower = text_without_accents.lower()
    
    # Remove pontuação e caracteres especiais, mantém espaços
    text_clean = re.sub(r"[^\w\s]", "", text_lower)
    
    # Remove espaços múltiplos
    text_final = re.sub(r"\s+", " ", text_clean).strip()
    
    return text_final


def generate_ngrams(text: str, n: int = 3) -> List[str]:
    """
    Gera n-gramas de um texto normalizado.
    Por padrão, usa trigramas (n=3).
    """
    normalized = normalize_text(text)
    if len(normalized) < n:
        return [normalized] if normalized else []
    
    # Remove espaços para gerar n-grams contínuos
    text_no_spaces = normalized.replace(" ", "")
    
    ngrams = []
    for i in range(len(text_no_spaces) - n + 1):
        ngrams.append(text_no_spaces[i:i+n])
    
    # Remove duplicatas mantendo ordem
    seen = set()
    unique_ngrams = []
    for ng in ngrams:
        if ng not in seen:
            seen.add(ng)
            unique_ngrams.append(ng)
    
    return unique_ngrams
