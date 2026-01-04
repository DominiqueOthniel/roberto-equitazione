-- Script SQL pour ajouter la table user_carts (à exécuter si le schéma principal existe déjà)
-- Ce script peut être exécuté plusieurs fois sans erreur

-- Table des paniers utilisateurs (synchronisation entre appareils)
CREATE TABLE IF NOT EXISTS user_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_carts_user_id ON user_carts(user_id);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_user_carts_updated_at ON user_carts;
CREATE TRIGGER update_user_carts_updated_at BEFORE UPDATE ON user_carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
DROP POLICY IF EXISTS "Users can view own cart" ON user_carts;
CREATE POLICY "Users can view own cart" ON user_carts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create cart" ON user_carts;
CREATE POLICY "Users can create cart" ON user_carts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own cart" ON user_carts;
CREATE POLICY "Users can update own cart" ON user_carts
    FOR UPDATE USING (true);





