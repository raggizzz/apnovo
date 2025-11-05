"""
Script para inicializar o banco de dados com dados de exemplo
"""
import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from datetime import datetime, timedelta
from app.firebase import get_firestore_client
from app.utils.normalization import normalize_text, generate_ngrams
from app.utils.geohash import encode_geohash


def init_campuses():
    """Inicializa dados dos campus"""
    db = get_firestore_client()
    
    campuses = [
        {
            "id": "campus-planaltina",
            "name": "Campus Planaltina",
            "address": "Área Universitária 1, Vila Nossa Senhora de Fátima, Planaltina - DF",
            "geo": {
                "lat": -15.6014,
                "lng": -47.6581,
                "geohash": encode_geohash(-15.6014, -47.6581)
            },
            "active": True,
            "timezone": "America/Sao_Paulo",
            "phone": "(61) 3107-8000",
            "email": "planaltina@unb.br",
            "lostAndFoundLocation": "Secretaria - Bloco Principal",
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        },
        {
            "id": "campus-darcy-ribeiro",
            "name": "Campus Darcy Ribeiro",
            "address": "Campus Universitário Darcy Ribeiro, Asa Norte, Brasília - DF",
            "geo": {
                "lat": -15.7633,
                "lng": -47.8706,
                "geohash": encode_geohash(-15.7633, -47.8706)
            },
            "active": True,
            "timezone": "America/Sao_Paulo",
            "phone": "(61) 3107-0000",
            "email": "darcy@unb.br",
            "lostAndFoundLocation": "Prefeitura do Campus - PRC",
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        },
        {
            "id": "campus-ceilandia",
            "name": "Campus Ceilândia",
            "address": "Centro Metropolitano, Ceilândia Sul, Brasília - DF",
            "geo": {
                "lat": -15.8398,
                "lng": -48.1067,
                "geohash": encode_geohash(-15.8398, -48.1067)
            },
            "active": True,
            "timezone": "America/Sao_Paulo",
            "phone": "(61) 3107-8400",
            "email": "ceilandia@unb.br",
            "lostAndFoundLocation": "Secretaria - Bloco A",
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        },
        {
            "id": "campus-gama",
            "name": "Campus Gama",
            "address": "Área Especial de Indústria Projeção A, Setor Leste, Gama - DF",
            "geo": {
                "lat": -16.0330,
                "lng": -48.0450,
                "geohash": encode_geohash(-16.0330, -48.0450)
            },
            "active": True,
            "timezone": "America/Sao_Paulo",
            "phone": "(61) 3107-8900",
            "email": "gama@unb.br",
            "lostAndFoundLocation": "Secretaria - UED",
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
    ]
    
    print("📍 Criando campus...")
    for campus in campuses:
        campus_ref = db.collection("campuses").document(campus["id"])
        campus_ref.set(campus)
        print(f"  ✓ {campus['name']}")
    
    print()


def init_buildings():
    """Inicializa dados dos prédios"""
    db = get_firestore_client()
    
    buildings_data = {
        "campus-darcy-ribeiro": [
            {
                "id": "bsa",
                "name": "Bloco de Salas de Aula Sul",
                "code": "BSA",
                "geo": {"lat": -15.7650, "lng": -47.8710, "geohash": encode_geohash(-15.7650, -47.8710)},
                "floors": 4
            },
            {
                "id": "bsn",
                "name": "Bloco de Salas de Aula Norte",
                "code": "BSN",
                "geo": {"lat": -15.7620, "lng": -47.8700, "geohash": encode_geohash(-15.7620, -47.8700)},
                "floors": 4
            },
            {
                "id": "bce",
                "name": "Biblioteca Central",
                "code": "BCE",
                "geo": {"lat": -15.7640, "lng": -47.8690, "geohash": encode_geohash(-15.7640, -47.8690)},
                "floors": 3
            },
            {
                "id": "ru",
                "name": "Restaurante Universitário",
                "code": "RU",
                "geo": {"lat": -15.7655, "lng": -47.8705, "geohash": encode_geohash(-15.7655, -47.8705)},
                "floors": 2
            }
        ],
        "campus-planaltina": [
            {
                "id": "uep-a",
                "name": "Bloco A",
                "code": "BL-A",
                "geo": {"lat": -15.6020, "lng": -47.6585, "geohash": encode_geohash(-15.6020, -47.6585)},
                "floors": 2
            },
            {
                "id": "uep-b",
                "name": "Bloco B",
                "code": "BL-B",
                "geo": {"lat": -15.6015, "lng": -47.6580, "geohash": encode_geohash(-15.6015, -47.6580)},
                "floors": 2
            }
        ],
        "campus-ceilandia": [
            {
                "id": "fcl-a",
                "name": "Bloco A - Administração",
                "code": "BL-A",
                "geo": {"lat": -15.8400, "lng": -48.1070, "geohash": encode_geohash(-15.8400, -48.1070)},
                "floors": 3
            },
            {
                "id": "fcl-b",
                "name": "Bloco B - Salas de Aula",
                "code": "BL-B",
                "geo": {"lat": -15.8395, "lng": -48.1065, "geohash": encode_geohash(-15.8395, -48.1065)},
                "floors": 2
            }
        ],
        "campus-gama": [
            {
                "id": "fga-ued",
                "name": "UED - Unidade de Ensino e Docência",
                "code": "UED",
                "geo": {"lat": -16.0335, "lng": -48.0455, "geohash": encode_geohash(-16.0335, -48.0455)},
                "floors": 3
            },
            {
                "id": "fga-uab",
                "name": "UAB - Unidade Acadêmica",
                "code": "UAB",
                "geo": {"lat": -16.0325, "lng": -48.0445, "geohash": encode_geohash(-16.0325, -48.0445)},
                "floors": 2
            }
        ]
    }
    
    print("🏢 Criando prédios...")
    for campus_id, buildings in buildings_data.items():
        for building in buildings:
            building["campusId"] = campus_id
            building["active"] = True
            building["createdAt"] = datetime.now()
            building["updatedAt"] = datetime.now()
            
            building_ref = db.collection("campuses").document(campus_id)\
                .collection("buildings").document(building["id"])
            building_ref.set(building)
            print(f"  ✓ {campus_id} - {building['name']}")
    
    print()


def init_sample_items():
    """Cria itens de exemplo"""
    db = get_firestore_client()
    
    sample_items = [
        {
            "type": "FOUND",
            "title": "iPhone 13 Pro Azul",
            "description": "iPhone 13 Pro na cor azul pacific, encontrado na biblioteca. Tem uma capinha transparente.",
            "category": "Eletrônicos",
            "subcategory": "Celular",
            "tags": ["iphone", "apple", "celular", "smartphone", "azul"],
            "color": "Azul",
            "brand": "Apple",
            "campusId": "campus-darcy-ribeiro",
            "campusName": "Campus Darcy Ribeiro",
            "buildingId": "bce",
            "buildingName": "Biblioteca Central",
            "spot": "Sala de Estudos - 2º Andar",
            "geo": {"lat": -15.7640, "lng": -47.8690, "geohash": encode_geohash(-15.7640, -47.8690)},
            "created_days_ago": 1
        },
        {
            "type": "LOST",
            "title": "Carteira de Couro Marrom",
            "description": "Carteira de couro marrom com documentos (RG, CNH) e cartões. Perdi no RU durante o almoço.",
            "category": "Documentos",
            "subcategory": "Carteira",
            "tags": ["carteira", "documentos", "rg", "cnh", "couro", "marrom"],
            "color": "Marrom",
            "campusId": "campus-darcy-ribeiro",
            "campusName": "Campus Darcy Ribeiro",
            "buildingId": "ru",
            "buildingName": "Restaurante Universitário",
            "spot": "Área das Mesas",
            "geo": {"lat": -15.7655, "lng": -47.8705, "geohash": encode_geohash(-15.7655, -47.8705)},
            "created_days_ago": 2
        },
        {
            "type": "FOUND",
            "title": "Chaves com Chaveiro UnB",
            "description": "Molho de chaves com chaveiro da UnB (vermelho). Tem 3 chaves e um controle de portão.",
            "category": "Chaves",
            "tags": ["chaves", "chaveiro", "unb", "vermelho"],
            "color": "Vermelho",
            "campusId": "campus-darcy-ribeiro",
            "campusName": "Campus Darcy Ribeiro",
            "buildingId": "bsa",
            "buildingName": "Bloco de Salas de Aula Sul",
            "spot": "Corredor - 3º Andar",
            "geo": {"lat": -15.7650, "lng": -47.8710, "geohash": encode_geohash(-15.7650, -47.8710)},
            "created_days_ago": 0
        },
        {
            "type": "FOUND",
            "title": "Notebook Dell Inspiron",
            "description": "Notebook Dell Inspiron 15, cor prata. Encontrado na sala de aula 203. Tem adesivos de programação.",
            "category": "Eletrônicos",
            "subcategory": "Notebook",
            "tags": ["notebook", "dell", "computador", "laptop", "prata"],
            "color": "Prata",
            "brand": "Dell",
            "campusId": "campus-gama",
            "campusName": "Campus Gama",
            "buildingId": "fga-ued",
            "buildingName": "UED - Unidade de Ensino e Docência",
            "spot": "Sala 203",
            "geo": {"lat": -16.0335, "lng": -48.0455, "geohash": encode_geohash(-16.0335, -48.0455)},
            "created_days_ago": 3
        },
        {
            "type": "LOST",
            "title": "Mochila Preta Nike",
            "description": "Mochila preta da Nike com material escolar dentro (cadernos, livros de Cálculo e Física).",
            "category": "Roupas e Acessórios",
            "subcategory": "Mochila",
            "tags": ["mochila", "nike", "preta", "material escolar"],
            "color": "Preto",
            "brand": "Nike",
            "campusId": "campus-ceilandia",
            "campusName": "Campus Ceilândia",
            "buildingId": "fcl-b",
            "buildingName": "Bloco B - Salas de Aula",
            "spot": "Sala 105",
            "geo": {"lat": -15.8395, "lng": -48.1065, "geohash": encode_geohash(-15.8395, -48.1065)},
            "created_days_ago": 5
        },
        {
            "type": "FOUND",
            "title": "Óculos de Grau Ray-Ban",
            "description": "Óculos de grau Ray-Ban, armação preta. Encontrado no banheiro feminino.",
            "category": "Roupas e Acessórios",
            "subcategory": "Óculos",
            "tags": ["oculos", "rayban", "grau", "preto"],
            "color": "Preto",
            "brand": "Ray-Ban",
            "campusId": "campus-planaltina",
            "campusName": "Campus Planaltina",
            "buildingId": "uep-a",
            "buildingName": "Bloco A",
            "spot": "Banheiro Feminino - 1º Andar",
            "geo": {"lat": -15.6020, "lng": -47.6585, "geohash": encode_geohash(-15.6020, -47.6585)},
            "created_days_ago": 1
        },
        {
            "type": "FOUND",
            "title": "Garrafa Térmica Stanley Verde",
            "description": "Garrafa térmica Stanley na cor verde. Tem alguns adesivos colados.",
            "category": "Outros",
            "tags": ["garrafa", "stanley", "termica", "verde"],
            "color": "Verde",
            "brand": "Stanley",
            "campusId": "campus-darcy-ribeiro",
            "campusName": "Campus Darcy Ribeiro",
            "buildingId": "ru",
            "buildingName": "Restaurante Universitário",
            "spot": "Mesa próxima à saída",
            "geo": {"lat": -15.7655, "lng": -47.8705, "geohash": encode_geohash(-15.7655, -47.8705)},
            "created_days_ago": 0
        },
        {
            "type": "LOST",
            "title": "Fone de Ouvido AirPods Pro",
            "description": "AirPods Pro da Apple com case de carregamento. Perdi na quadra de esportes.",
            "category": "Eletrônicos",
            "subcategory": "Fone de Ouvido",
            "tags": ["airpods", "fone", "apple", "bluetooth"],
            "color": "Branco",
            "brand": "Apple",
            "campusId": "campus-gama",
            "campusName": "Campus Gama",
            "buildingId": "fga-uab",
            "buildingName": "UAB - Unidade Acadêmica",
            "spot": "Quadra de Esportes",
            "geo": {"lat": -16.0325, "lng": -48.0445, "geohash": encode_geohash(-16.0325, -48.0445)},
            "created_days_ago": 4
        }
    ]
    
    print("📦 Criando itens de exemplo...")
    for item_data in sample_items:
        # Gera ID único
        item_id = f"item-{datetime.now().timestamp()}"
        
        # Normaliza textos
        title_n = normalize_text(item_data["title"])
        desc_n = normalize_text(item_data["description"])
        tags_n = [normalize_text(tag) for tag in item_data["tags"]]
        
        # Gera n-grams
        ngrams = generate_ngrams(item_data["title"])
        for tag in item_data["tags"]:
            ngrams.extend(generate_ngrams(tag))
        ngrams = list(set(ngrams))  # Remove duplicatas
        
        # Calcula timestamps
        created_at = datetime.now() - timedelta(days=item_data.pop("created_days_ago"))
        
        # Monta documento
        item_doc = {
            "id": item_id,
            "ownerUid": "demo-user-123",
            **item_data,
            "photos": [],
            "status": "OPEN",
            "title_n": title_n,
            "desc_n": desc_n,
            "tags_n": tags_n,
            "ngrams": ngrams,
            "createdAt": created_at,
            "updatedAt": created_at,
            "expiresAt": created_at + timedelta(days=90),
            "moderation": {
                "flagged": False,
                "flagCount": 0
            },
            "viewCount": 0,
            "contactCount": 0
        }
        
        # Salva no Firestore
        db.collection("items").document(item_id).set(item_doc)
        print(f"  ✓ {item_data['type']}: {item_data['title']}")
    
    print()


def init_demo_user():
    """Cria usuário de demonstração"""
    db = get_firestore_client()
    
    user_data = {
        "uid": "demo-user-123",
        "name": "Usuário Demo",
        "email": "demo@undf.edu.br",
        "role": "user",
        "campusHome": "campus-darcy-ribeiro",
        "notifTokens": [],
        "status": "active",
        "phone": "(61) 99999-9999",
        "department": "Engenharia de Software",
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }
    
    print("👤 Criando usuário demo...")
    db.collection("users").document(user_data["uid"]).set(user_data)
    print(f"  ✓ {user_data['name']} ({user_data['email']})")
    print()


def main():
    """Executa inicialização completa"""
    print("=" * 60)
    print("🚀 INICIALIZANDO BANCO DE DADOS - UNDF ACHADOS E PERDIDOS")
    print("=" * 60)
    print()
    
    try:
        init_campuses()
        init_buildings()
        init_demo_user()
        init_sample_items()
        
        print("=" * 60)
        print("✅ BANCO DE DADOS INICIALIZADO COM SUCESSO!")
        print("=" * 60)
        print()
        print("📊 Resumo:")
        print("  • 4 Campus criados")
        print("  • 10+ Prédios criados")
        print("  • 1 Usuário demo criado")
        print("  • 8 Itens de exemplo criados")
        print()
        print("🔐 Credenciais de teste:")
        print("  Email: demo@undf.edu.br")
        print("  UID: demo-user-123")
        print()
        
    except Exception as e:
        print(f"❌ Erro ao inicializar banco de dados: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
