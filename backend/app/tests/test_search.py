"""
Testes para o sistema de busca e scoring
"""
import pytest
from datetime import datetime, timedelta
from app.utils.search import calculate_search_score
from app.utils.geohash import haversine_distance
from app.models.items import Item, ItemType, ItemStatus, GeoLocation


class TestSearchScore:
    """Testes para cálculo de score de busca"""
    
    def create_mock_item(
        self,
        title: str = "iPhone 13 Pro",
        tags: list = None,
        lat: float = -15.7801,
        lng: float = -47.9292,
        created_days_ago: int = 0
    ) -> Item:
        """Cria item mock para testes"""
        from app.utils.normalization import normalize_text, generate_ngrams
        
        if tags is None:
            tags = ["celular", "apple", "azul"]
        
        title_n = normalize_text(title)
        tags_n = [normalize_text(tag) for tag in tags]
        
        # Gera n-grams do título e tags
        ngrams = generate_ngrams(title)
        for tag in tags:
            ngrams.extend(generate_ngrams(tag))
        
        created_at = datetime.now() - timedelta(days=created_days_ago)
        
        return Item(
            id="test-123",
            ownerUid="user-123",
            type=ItemType.FOUND,
            title=title,
            description="Descrição teste",
            category="Eletrônicos",
            tags=tags,
            campusId="campus-1",
            campusName="Campus Principal",
            buildingId="building-1",
            buildingName="Bloco A",
            geo=GeoLocation(lat=lat, lng=lng, geohash="6vjyh5k"),
            photos=[],
            status=ItemStatus.OPEN,
            title_n=title_n,
            desc_n=normalize_text("Descrição teste"),
            tags_n=tags_n,
            ngrams=list(set(ngrams)),
            createdAt=created_at,
            updatedAt=created_at,
            moderation={"flagged": False, "flagCount": 0},
            viewCount=0,
            contactCount=0
        )
    
    def test_exact_match_high_score(self):
        """Match exato deve ter score alto"""
        item = self.create_mock_item(title="iPhone 13 Pro")
        score = calculate_search_score(
            item=item,
            query="iphone 13 pro",
            user_location=None
        )
        assert score > 2.0  # Text score alto
    
    def test_partial_match_medium_score(self):
        """Match parcial deve ter score médio"""
        item = self.create_mock_item(title="iPhone 13 Pro")
        score = calculate_search_score(
            item=item,
            query="iphone",
            user_location=None
        )
        assert 1.0 < score < 2.5
    
    def test_no_match_low_score(self):
        """Sem match deve ter score baixo"""
        item = self.create_mock_item(title="iPhone 13 Pro")
        score = calculate_search_score(
            item=item,
            query="notebook dell",
            user_location=None
        )
        assert score < 1.0
    
    def test_geo_proximity_boost(self):
        """Proximidade geográfica deve aumentar score"""
        item = self.create_mock_item(
            lat=-15.7801,
            lng=-47.9292
        )
        
        # Mesma localização
        score_near = calculate_search_score(
            item=item,
            query="iphone",
            user_location=(-15.7801, -47.9292)
        )
        
        # Localização distante
        score_far = calculate_search_score(
            item=item,
            query="iphone",
            user_location=(-15.8000, -47.9500)  # ~2km de distância
        )
        
        assert score_near > score_far
    
    def test_recency_boost(self):
        """Itens recentes devem ter score maior"""
        item_recent = self.create_mock_item(created_days_ago=1)
        item_old = self.create_mock_item(created_days_ago=60)
        
        score_recent = calculate_search_score(
            item=item_recent,
            query="iphone",
            user_location=None
        )
        
        score_old = calculate_search_score(
            item=item_old,
            query="iphone",
            user_location=None
        )
        
        assert score_recent > score_old
    
    def test_tag_matching(self):
        """Tags devem contribuir para o score"""
        item = self.create_mock_item(
            title="Celular",
            tags=["iphone", "apple", "smartphone"]
        )
        
        score = calculate_search_score(
            item=item,
            query="iphone",
            user_location=None
        )
        
        assert score > 1.5  # Deve ter match via tags
    
    def test_typo_tolerance(self):
        """Deve tolerar erros de digitação"""
        item = self.create_mock_item(title="iPhone 13 Pro")
        
        # Query com typo
        score = calculate_search_score(
            item=item,
            query="ifone 13",
            user_location=None
        )
        
        assert score > 1.0  # Deve ter algum match via n-grams
    
    def test_campus_boost(self):
        """Mesmo campus deve dar boost no score"""
        item = self.create_mock_item()
        item.campusId = "campus-1"
        
        # Simula user do mesmo campus
        score = calculate_search_score(
            item=item,
            query="iphone",
            user_location=None,
            user_campus="campus-1"
        )
        
        # Score sem boost
        score_no_boost = calculate_search_score(
            item=item,
            query="iphone",
            user_location=None,
            user_campus="campus-2"
        )
        
        assert score > score_no_boost
    
    def test_combined_factors(self):
        """Múltiplos fatores devem se combinar"""
        item = self.create_mock_item(
            title="iPhone 13 Pro Azul",
            tags=["apple", "smartphone"],
            lat=-15.7801,
            lng=-47.9292,
            created_days_ago=1
        )
        
        score = calculate_search_score(
            item=item,
            query="iphone azul",
            user_location=(-15.7801, -47.9292),  # Mesma localização
            user_campus="campus-1"
        )
        
        # Score deve ser alto com todos os fatores positivos
        assert score > 5.0


class TestHaversineDistance:
    """Testes para cálculo de distância Haversine"""
    
    def test_same_location(self):
        """Mesma localização deve ter distância 0"""
        distance = haversine_distance(
            -15.7801, -47.9292,
            -15.7801, -47.9292
        )
        assert distance < 0.001  # Praticamente 0
    
    def test_known_distance(self):
        """Deve calcular distância conhecida corretamente"""
        # Brasília (-15.7801, -47.9292) para
        # Taguatinga (-15.8389, -48.0439)
        distance = haversine_distance(
            -15.7801, -47.9292,
            -15.8389, -48.0439
        )
        # Distância real ~12km
        assert 11 < distance < 13
    
    def test_long_distance(self):
        """Deve calcular distâncias longas"""
        # Brasília para São Paulo
        distance = haversine_distance(
            -15.7801, -47.9292,  # Brasília
            -23.5505, -46.6333   # São Paulo
        )
        # Distância real ~870km
        assert 850 < distance < 900
    
    def test_hemisphere_crossing(self):
        """Deve funcionar atravessando hemisférios"""
        distance = haversine_distance(
            -15.7801, -47.9292,   # Brasília (Sul, Oeste)
            40.7128, -74.0060     # Nova York (Norte, Oeste)
        )
        assert distance > 7000  # Mais de 7000km


class TestSearchRanking:
    """Testes para ordenação de resultados"""
    
    def test_ranking_order(self):
        """Resultados devem ser ordenados por score"""
        items = [
            self.create_mock_item(
                title="iPhone 13",
                created_days_ago=30
            ),
            self.create_mock_item(
                title="iPhone 13 Pro Max",
                created_days_ago=1
            ),
            self.create_mock_item(
                title="iPhone 12",
                created_days_ago=60
            )
        ]
        
        # Calcula scores
        scored = [
            (calculate_search_score(item, "iphone 13", None), item)
            for item in items
        ]
        
        # Ordena por score
        scored.sort(reverse=True, key=lambda x: x[0])
        
        # Primeiro resultado deve ser o mais relevante
        assert "13 Pro Max" in scored[0][1].title
    
    def create_mock_item(self, title, created_days_ago):
        """Helper para criar item mock"""
        from app.utils.normalization import normalize_text, generate_ngrams
        
        title_n = normalize_text(title)
        ngrams = generate_ngrams(title)
        created_at = datetime.now() - timedelta(days=created_days_ago)
        
        return Item(
            id=f"test-{title}",
            ownerUid="user-123",
            type=ItemType.FOUND,
            title=title,
            description="Teste",
            category="Eletrônicos",
            tags=["teste"],
            campusId="campus-1",
            campusName="Campus",
            buildingId="building-1",
            buildingName="Bloco",
            geo=GeoLocation(lat=-15.7801, lng=-47.9292, geohash="6vjyh5k"),
            photos=[],
            status=ItemStatus.OPEN,
            title_n=title_n,
            desc_n="teste",
            tags_n=["teste"],
            ngrams=ngrams,
            createdAt=created_at,
            updatedAt=created_at,
            moderation={"flagged": False, "flagCount": 0},
            viewCount=0,
            contactCount=0
        )


class TestPerformance:
    """Testes de performance"""
    
    def test_score_calculation_speed(self):
        """Cálculo de score deve ser rápido"""
        import time
        
        item = TestSearchScore().create_mock_item()
        
        start = time.time()
        for _ in range(1000):
            calculate_search_score(item, "iphone", None)
        duration = time.time() - start
        
        # Deve processar 1000 items em menos de 1 segundo
        assert duration < 1.0
    
    def test_ngram_generation_speed(self):
        """Geração de n-grams deve ser rápida"""
        import time
        from app.utils.normalization import generate_ngrams
        
        text = "iPhone 13 Pro Max Azul Pacific Apple Smartphone"
        
        start = time.time()
        for _ in range(10000):
            generate_ngrams(text)
        duration = time.time() - start
        
        # Deve processar 10000 textos em menos de 1 segundo
        assert duration < 1.0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
