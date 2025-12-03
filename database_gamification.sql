-- Add points to users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;

-- Create Badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  criteria text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create User Badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Insert default badges
INSERT INTO badges (name, description, icon, criteria) VALUES
('Detector de Chaves', 'Devolveu 3 itens', '🔑', 'returns_3'),
('Mãos de Ouro', 'Devolveu um item valioso', '✨', 'value_high'),
('Anjo da Madrugada', 'Devolução registrada após 22h', '🌙', 'time_night'),
('Primeiro Passo', 'Fez a primeira devolução', '🦶', 'returns_1')
ON CONFLICT DO NOTHING;
