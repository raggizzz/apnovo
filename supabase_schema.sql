-- ============================================
-- UNDF ACHADOS E PERDIDOS - SUPABASE SCHEMA
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geolocation

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'staff', 'admin')),
  campus_home TEXT,
  department TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CAMPUSES TABLE
-- ============================================
CREATE TABLE campuses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(POINT, 4326),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  phone TEXT,
  email TEXT,
  lost_found_location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- BUILDINGS TABLE
-- ============================================
CREATE TABLE buildings (
  id TEXT PRIMARY KEY,
  campus_id TEXT NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(POINT, 4326),
  floors INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ITEMS TABLE
-- ============================================
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('FOUND', 'LOST')),
  
  -- Item details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  color TEXT,
  brand TEXT,
  
  -- Location
  campus_id TEXT NOT NULL REFERENCES campuses(id),
  campus_name TEXT NOT NULL,
  building_id TEXT NOT NULL REFERENCES buildings(id),
  building_name TEXT NOT NULL,
  spot TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(POINT, 4326),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED', 'EXPIRED')),
  resolved_reason TEXT,
  resolved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Search fields (normalized)
  title_normalized TEXT NOT NULL,
  description_normalized TEXT NOT NULL,
  tags_normalized TEXT[] NOT NULL DEFAULT '{}',
  search_vector TSVECTOR,
  
  -- Moderation
  flagged BOOLEAN NOT NULL DEFAULT FALSE,
  flag_count INTEGER NOT NULL DEFAULT 0,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Metrics
  view_count INTEGER NOT NULL DEFAULT 0,
  contact_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ITEM_PHOTOS TABLE
-- ============================================
CREATE TABLE item_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- THREADS TABLE
-- ============================================
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  participants UUID[] NOT NULL,
  
  -- Denormalized item data
  item_title TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_photo_url TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  archived_by UUID REFERENCES users(id),
  
  -- Last message (denormalized)
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_by UUID REFERENCES users(id),
  
  -- Counters
  message_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'system')),
  
  read_by UUID[] NOT NULL DEFAULT '{}',
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ALERTS TABLE
-- ============================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Search criteria
  query_text TEXT NOT NULL,
  query_normalized TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  tags_normalized TEXT[] NOT NULL DEFAULT '{}',
  category TEXT,
  
  -- Geo filters
  campus_id TEXT REFERENCES campuses(id),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION,
  
  -- Status
  active BOOLEAN NOT NULL DEFAULT TRUE,
  match_count INTEGER NOT NULL DEFAULT 0,
  last_match_at TIMESTAMPTZ,
  
  -- Notification settings
  notify_email BOOLEAN NOT NULL DEFAULT TRUE,
  notify_push BOOLEAN NOT NULL DEFAULT TRUE,
  
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AUDITS TABLE
-- ============================================
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id),
  actor_role TEXT,
  actor_ip TEXT,
  
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  
  changes JSONB,
  
  user_agent TEXT,
  request_id TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Campuses
CREATE INDEX idx_campuses_active ON campuses(active);
CREATE INDEX idx_campuses_geom ON campuses USING GIST(geom);

-- Buildings
CREATE INDEX idx_buildings_campus ON buildings(campus_id);
CREATE INDEX idx_buildings_active ON buildings(active);
CREATE INDEX idx_buildings_geom ON buildings USING GIST(geom);

-- Items
CREATE INDEX idx_items_owner ON items(owner_id);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_campus ON items(campus_id);
CREATE INDEX idx_items_building ON items(building_id);
CREATE INDEX idx_items_created ON items(created_at DESC);
CREATE INDEX idx_items_geom ON items USING GIST(geom);
CREATE INDEX idx_items_search ON items USING GIN(search_vector);
CREATE INDEX idx_items_tags ON items USING GIN(tags);
CREATE INDEX idx_items_composite ON items(status, campus_id, created_at DESC);

-- Item Photos
CREATE INDEX idx_photos_item ON item_photos(item_id);
CREATE INDEX idx_photos_position ON item_photos(item_id, position);

-- Threads
CREATE INDEX idx_threads_item ON threads(item_id);
CREATE INDEX idx_threads_participants ON threads USING GIN(participants);
CREATE INDEX idx_threads_status ON threads(status);
CREATE INDEX idx_threads_updated ON threads(updated_at DESC);

-- Messages
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_author ON messages(author_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Alerts
CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_active ON alerts(active);
CREATE INDEX idx_alerts_campus ON alerts(campus_id);
CREATE INDEX idx_alerts_tags ON alerts USING GIN(tags_normalized);

-- Audits
CREATE INDEX idx_audits_actor ON audits(actor_id);
CREATE INDEX idx_audits_action ON audits(action);
CREATE INDEX idx_audits_created ON audits(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to normalize text
CREATE OR REPLACE FUNCTION normalize_text(text_input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      UNACCENT(text_input),
      '[^a-z0-9\s]',
      '',
      'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_item_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.title_normalized, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.description_normalized, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(array_to_string(NEW.tags_normalized, ' '), '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update geometry from lat/lng
CREATE OR REPLACE FUNCTION update_geom_from_coords()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_campuses_updated_at BEFORE UPDATE ON campuses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Search vector triggers
CREATE TRIGGER update_items_search_vector BEFORE INSERT OR UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_item_search_vector();

-- Geometry triggers
CREATE TRIGGER update_campuses_geom BEFORE INSERT OR UPDATE ON campuses
  FOR EACH ROW EXECUTE FUNCTION update_geom_from_coords();

CREATE TRIGGER update_buildings_geom BEFORE INSERT OR UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION update_geom_from_coords();

CREATE TRIGGER update_items_geom BEFORE INSERT OR UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_geom_from_coords();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = auth_id);

-- Campuses policies (public read)
CREATE POLICY "Anyone can view campuses" ON campuses FOR SELECT USING (TRUE);

-- Buildings policies (public read)
CREATE POLICY "Anyone can view buildings" ON buildings FOR SELECT USING (TRUE);

-- Items policies
CREATE POLICY "Anyone can view open items" ON items FOR SELECT USING (status = 'OPEN');
CREATE POLICY "Users can create items" ON items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own items" ON items FOR UPDATE USING (owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Admins can update any item" ON items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin')
);

-- Item photos policies
CREATE POLICY "Anyone can view photos" ON item_photos FOR SELECT USING (TRUE);
CREATE POLICY "Users can add photos to own items" ON item_photos FOR INSERT WITH CHECK (
  item_id IN (SELECT id FROM items WHERE owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
);

-- Threads policies
CREATE POLICY "Users can view own threads" ON threads FOR SELECT USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE id = ANY(participants))
);
CREATE POLICY "Users can create threads" ON threads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own threads" ON threads FOR UPDATE USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE id = ANY(participants))
);

-- Messages policies
CREATE POLICY "Users can view messages in own threads" ON messages FOR SELECT USING (
  thread_id IN (
    SELECT id FROM threads WHERE auth.uid() IN (SELECT auth_id FROM users WHERE id = ANY(participants))
  )
);
CREATE POLICY "Users can create messages in own threads" ON messages FOR INSERT WITH CHECK (
  thread_id IN (
    SELECT id FROM threads WHERE auth.uid() IN (SELECT auth_id FROM users WHERE id = ANY(participants))
  )
);

-- Alerts policies
CREATE POLICY "Users can view own alerts" ON alerts FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can create own alerts" ON alerts FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can update own alerts" ON alerts FOR UPDATE USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can delete own alerts" ON alerts FOR DELETE USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- Audits policies (admin only)
CREATE POLICY "Admins can view audits" ON audits FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin')
);

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert campuses (UNDF - Universidade do Distrito Federal)
INSERT INTO campuses (id, name, address, lat, lng, phone, email, lost_found_location) VALUES
('campus-asa-norte', 'Campus Asa Norte', 'Asa Norte, Brasília - DF', -15.7633, -47.8706, '(61) 3107-0000', 'asanorte@undf.edu.br', 'Secretaria - Bloco Principal'),
('campus-samambaia', 'Campus Samambaia', 'Samambaia, Brasília - DF', -15.8789, -48.0856, '(61) 3107-8000', 'samambaia@undf.edu.br', 'Secretaria - Bloco A'),
('campus-riacho-fundo', 'Campus Riacho Fundo', 'Riacho Fundo, Brasília - DF', -15.8789, -48.0156, '(61) 3107-8400', 'riachofundo@undf.edu.br', 'Secretaria - Bloco B'),
('campus-lago-norte', 'Campus Lago Norte', 'Lago Norte, Brasília - DF', -15.7289, -47.8356, '(61) 3107-8900', 'lagonorte@undf.edu.br', 'Secretaria - Bloco C');

-- Insert buildings (UNDF)
INSERT INTO buildings (id, campus_id, name, code, lat, lng, floors) VALUES
('an-bloco-a', 'campus-asa-norte', 'Bloco A', 'BL-A', -15.7640, -47.8700, 3),
('an-biblioteca', 'campus-asa-norte', 'Biblioteca Central', 'BIB', -15.7650, -47.8690, 2),
('an-ru', 'campus-asa-norte', 'Restaurante Universitário', 'RU', -15.7660, -47.8710, 1),
('sm-bloco-a', 'campus-samambaia', 'Bloco A', 'BL-A', -15.8800, -48.0860, 2),
('sm-bloco-b', 'campus-samambaia', 'Bloco B', 'BL-B', -15.8790, -48.0850, 2),
('rf-bloco-a', 'campus-riacho-fundo', 'Bloco A', 'BL-A', -15.8800, -48.0160, 2),
('rf-lab', 'campus-riacho-fundo', 'Laboratório de Informática', 'LAB', -15.8790, -48.0150, 1),
('ln-bloco-a', 'campus-lago-norte', 'Bloco A', 'BL-A', -15.7300, -47.8360, 2),
('ln-quadra', 'campus-lago-norte', 'Quadra de Esportes', 'QE', -15.7290, -47.8350, 1);

-- ============================================
-- VIEWS (for easier queries)
-- ============================================

CREATE VIEW items_with_photos AS
SELECT 
  i.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', p.id,
        'url', p.url,
        'thumbnail_url', p.thumbnail_url,
        'position', p.position
      ) ORDER BY p.position
    ) FILTER (WHERE p.id IS NOT NULL),
    '[]'
  ) AS photos
FROM items i
LEFT JOIN item_photos p ON i.id = p.item_id
GROUP BY i.id;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Schema criado com sucesso!';
  RAISE NOTICE '📊 Tabelas: users, campuses, buildings, items, item_photos, threads, messages, alerts, audits';
  RAISE NOTICE '🔐 RLS habilitado em todas as tabelas';
  RAISE NOTICE '📍 4 campus e 6 prédios inseridos';
  RAISE NOTICE '🚀 Pronto para uso!';
END $$;
