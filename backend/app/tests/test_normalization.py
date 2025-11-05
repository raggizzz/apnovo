"""
Testes para o sistema de normalização e n-grams
"""
import pytest
from app.utils.normalization import normalize_text, generate_ngrams


class TestNormalization:
    """Testes para normalização de texto"""
    
    def test_remove_accents(self):
        """Deve remover acentos corretamente"""
        assert normalize_text("café") == "cafe"
        assert normalize_text("açúcar") == "acucar"
        assert normalize_text("José") == "jose"
        assert normalize_text("São Paulo") == "sao paulo"
    
    def test_lowercase(self):
        """Deve converter para minúsculas"""
        assert normalize_text("iPhone") == "iphone"
        assert normalize_text("NOTEBOOK") == "notebook"
        assert normalize_text("CeLuLaR") == "celular"
    
    def test_remove_punctuation(self):
        """Deve remover pontuação"""
        assert normalize_text("olá, mundo!") == "ola mundo"
        assert normalize_text("teste@123") == "teste123"
        assert normalize_text("R$ 100,00") == "r 10000"
    
    def test_remove_extra_spaces(self):
        """Deve remover espaços extras"""
        assert normalize_text("teste   espaços") == "teste espacos"
        assert normalize_text("  início fim  ") == "inicio fim"
    
    def test_complex_text(self):
        """Deve normalizar texto complexo"""
        text = "iPhone 13 Pro - Azul (128GB) - R$ 5.000,00"
        expected = "iphone 13 pro azul 128gb r 500000"
        assert normalize_text(text) == expected
    
    def test_empty_string(self):
        """Deve lidar com string vazia"""
        assert normalize_text("") == ""
        assert normalize_text("   ") == ""


class TestNGrams:
    """Testes para geração de n-grams"""
    
    def test_trigrams_basic(self):
        """Deve gerar trigramas básicos"""
        ngrams = generate_ngrams("iphone", n=3)
        expected = {"iph", "pho", "hon", "one"}
        assert set(ngrams) == expected
    
    def test_trigrams_multiple_words(self):
        """Deve gerar trigramas de múltiplas palavras"""
        ngrams = generate_ngrams("iphone azul", n=3)
        expected = {"iph", "pho", "hon", "one", "azu", "zul"}
        assert set(ngrams) == expected
    
    def test_short_words_ignored(self):
        """Palavras menores que n devem ser ignoradas"""
        ngrams = generate_ngrams("a b cd efg", n=3)
        expected = {"efg"}
        assert set(ngrams) == expected
    
    def test_with_normalization(self):
        """Deve funcionar com texto normalizado"""
        text = "Café Preto"
        ngrams = generate_ngrams(text, n=3)
        # "cafe preto" -> cafe, preto
        expected = {"caf", "afe", "pre", "ret", "eto"}
        assert set(ngrams) == expected
    
    def test_deduplication(self):
        """Deve remover duplicatas"""
        ngrams = generate_ngrams("banana", n=3)
        # "banana" -> ban, ana, nan, ana (ana duplicado)
        assert ngrams.count("ana") == 1
    
    def test_empty_string(self):
        """Deve retornar lista vazia para string vazia"""
        assert generate_ngrams("") == []
        assert generate_ngrams("   ") == []
    
    def test_different_n_values(self):
        """Deve funcionar com diferentes valores de n"""
        # Bigramas (n=2)
        bigrams = generate_ngrams("test", n=2)
        assert set(bigrams) == {"te", "es", "st"}
        
        # Quadrigramas (n=4)
        quadgrams = generate_ngrams("testing", n=4)
        assert set(quadgrams) == {"test", "esti", "stin", "ting"}


class TestSearchScenarios:
    """Testes de cenários reais de busca"""
    
    def test_typo_tolerance(self):
        """Deve tolerar erros de digitação"""
        # Item: "iphone"
        item_ngrams = set(generate_ngrams("iphone"))
        
        # Query com typo: "ifone"
        query_ngrams = set(generate_ngrams("ifone"))
        
        # Deve ter interseção
        intersection = item_ngrams & query_ngrams
        assert len(intersection) > 0
        
        # Jaccard similarity
        union = item_ngrams | query_ngrams
        similarity = len(intersection) / len(union)
        assert similarity > 0.3  # Pelo menos 30% de match
    
    def test_partial_match(self):
        """Deve encontrar matches parciais"""
        # Item: "notebook dell"
        item_ngrams = set(generate_ngrams("notebook dell"))
        
        # Query: "notebook"
        query_ngrams = set(generate_ngrams("notebook"))
        
        intersection = item_ngrams & query_ngrams
        assert len(intersection) > 0
    
    def test_synonym_handling(self):
        """Deve lidar com sinônimos através de tags"""
        # Item: "celular" com tags ["smartphone", "telefone"]
        item_text = "celular smartphone telefone"
        item_ngrams = set(generate_ngrams(item_text))
        
        # Query: "smartphone"
        query_ngrams = set(generate_ngrams("smartphone"))
        
        intersection = item_ngrams & query_ngrams
        assert len(intersection) > 0
    
    def test_color_and_brand(self):
        """Deve encontrar por cor e marca"""
        # Item: "iphone azul apple"
        item_ngrams = set(generate_ngrams("iphone azul apple"))
        
        # Query: "iphone azul"
        query_ngrams = set(generate_ngrams("iphone azul"))
        
        intersection = item_ngrams & query_ngrams
        union = item_ngrams | query_ngrams
        similarity = len(intersection) / len(union)
        
        assert similarity > 0.5  # Alta similaridade


class TestEdgeCases:
    """Testes de casos extremos"""
    
    def test_unicode_characters(self):
        """Deve lidar com caracteres unicode"""
        text = "emoji 😀 test"
        normalized = normalize_text(text)
        assert "emoji" in normalized
        assert "test" in normalized
    
    def test_numbers(self):
        """Deve preservar números"""
        assert "123" in normalize_text("iPhone 123")
        assert "2024" in normalize_text("Ano 2024")
    
    def test_very_long_text(self):
        """Deve lidar com textos longos"""
        long_text = "palavra " * 1000
        ngrams = generate_ngrams(long_text)
        assert len(ngrams) > 0
        assert len(ngrams) < 100  # Deve deduplic ar
    
    def test_special_characters(self):
        """Deve remover caracteres especiais"""
        text = "test@#$%^&*()test"
        normalized = normalize_text(text)
        assert normalized == "testtest"
    
    def test_mixed_languages(self):
        """Deve lidar com múltiplos idiomas"""
        text = "hello olá hola"
        normalized = normalize_text(text)
        assert "hello" in normalized
        assert "ola" in normalized
        assert "hola" in normalized


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
