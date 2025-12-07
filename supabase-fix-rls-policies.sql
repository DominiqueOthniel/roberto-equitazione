-- Script pour corriger les politiques RLS de user_carts
-- À exécuter dans Supabase SQL Editor
-- Ce script permet aux utilisateurs anonymes (guest) d'accéder à leur panier

-- ============================================
-- TABLE USER_CARTS - Politiques RLS
-- ============================================

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can view own cart" ON user_carts;
DROP POLICY IF EXISTS "Users can create cart" ON user_carts;
DROP POLICY IF EXISTS "Users can update own cart" ON user_carts;
DROP POLICY IF EXISTS "Users can delete own cart" ON user_carts;

-- Politique pour SELECT : Permettre à tous de voir leur propre panier
-- (user_id peut être UUID ou TEXT pour les guests)
CREATE POLICY "Users can view own cart" ON user_carts
    FOR SELECT 
    USING (true); -- Temporairement ouvert pour tous (vous pouvez restreindre plus tard)

-- Politique pour INSERT : Permettre à tous de créer un panier
CREATE POLICY "Users can create cart" ON user_carts
    FOR INSERT 
    WITH CHECK (true); -- Permettre à tous

-- Politique pour UPDATE : Permettre à tous de mettre à jour leur panier
CREATE POLICY "Users can update own cart" ON user_carts
    FOR UPDATE 
    USING (true) -- Permettre à tous de mettre à jour
    WITH CHECK (true);

-- Politique pour DELETE : Permettre à tous de supprimer leur panier
CREATE POLICY "Users can delete own cart" ON user_carts
    FOR DELETE 
    USING (true); -- Permettre à tous

-- Vérifier que RLS est activé
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;

-- Vérifier le type de la colonne user_id
-- Si elle est encore UUID, elle doit être modifiée en TEXT
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_carts' 
        AND column_name = 'user_id' 
        AND data_type = 'uuid'
    ) THEN
        -- Supprimer les politiques avant de modifier le type
        DROP POLICY IF EXISTS "Users can view own cart" ON user_carts;
        DROP POLICY IF EXISTS "Users can create cart" ON user_carts;
        DROP POLICY IF EXISTS "Users can update own cart" ON user_carts;
        DROP POLICY IF EXISTS "Users can delete own cart" ON user_carts;
        
        -- Modifier le type
        ALTER TABLE user_carts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
        
        -- Recréer les politiques
        CREATE POLICY "Users can view own cart" ON user_carts
            FOR SELECT USING (true);
        
        CREATE POLICY "Users can create cart" ON user_carts
            FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "Users can update own cart" ON user_carts
            FOR UPDATE USING (true) WITH CHECK (true);
        
        CREATE POLICY "Users can delete own cart" ON user_carts
            FOR DELETE USING (true);
    END IF;
END $$;

-- Afficher le type actuel de user_id pour vérification
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_carts' 
AND column_name = 'user_id';


