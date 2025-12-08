-- Script SQL pour ajouter la gestion des admins
-- À exécuter dans Supabase SQL Editor après le schéma principal

-- Option 1: Table des admins (recommandé pour plus de contrôle)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'admin', -- 'admin', 'super_admin', 'moderator'
  permissions JSONB DEFAULT '{}'::jsonb, -- Permissions personnalisées
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour admins
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
CREATE POLICY "Admins can view all admins" ON admins
    FOR SELECT USING (true); -- Temporairement ouvert, vous pouvez restreindre

DROP POLICY IF EXISTS "Admins can insert" ON admins;
CREATE POLICY "Admins can insert" ON admins
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update" ON admins;
CREATE POLICY "Admins can update" ON admins
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can delete" ON admins;
CREATE POLICY "Admins can delete" ON admins
    FOR DELETE USING (true);

-- Fonction helper pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE email = user_email AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction helper pour obtenir le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_role(user_email TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role FROM admins 
        WHERE email = user_email AND is_active = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Option 2: Ajouter un champ role à auth.users via user_metadata
-- (Cette approche utilise les métadonnées Supabase Auth)
-- Vous pouvez créer un admin via l'interface Supabase ou via SQL :

-- Exemple pour créer un admin via SQL (remplacer l'email) :
-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_build_object('role', 'admin')
-- WHERE email = 'admin@example.com';

-- Note: Pour utiliser cette approche, vous devrez créer l'utilisateur d'abord via Supabase Auth
-- puis mettre à jour ses métadonnées.

-- Table pour les sessions admin (optionnel, pour tracking)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_is_active ON admin_sessions(is_active);

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view sessions" ON admin_sessions;
CREATE POLICY "Admins can view sessions" ON admin_sessions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert sessions" ON admin_sessions;
CREATE POLICY "Admins can insert sessions" ON admin_sessions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update sessions" ON admin_sessions;
CREATE POLICY "Admins can update sessions" ON admin_sessions
    FOR UPDATE USING (true);

-- Exemple d'insertion d'un admin (à adapter avec vos données)
-- IMPORTANT: Créez d'abord l'utilisateur via Supabase Auth, puis insérez dans admins
-- 
-- INSERT INTO admins (user_id, email, username, name, role)
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'admin@example.com'),
--   'admin@example.com',
--   'admin',
--   'Administrator',
--   'super_admin'
-- );



