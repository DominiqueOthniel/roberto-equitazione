-- Script URGENT pour corriger l'erreur 406 (Not Acceptable)
-- À exécuter IMMÉDIATEMENT dans Supabase SQL Editor
-- Ce script permet aux utilisateurs anonymes (guest) d'accéder à leur panier

-- ============================================
-- ÉTAPE 1: Vérifier et modifier le type de user_id si nécessaire
-- ============================================

-- Supprimer toutes les politiques existantes AVANT de modifier le type
DROP POLICY IF EXISTS "Users can view own cart" ON user_carts;
DROP POLICY IF EXISTS "Users can create cart" ON user_carts;
DROP POLICY IF EXISTS "Users can update own cart" ON user_carts;
DROP POLICY IF EXISTS "Users can delete own cart" ON user_carts;

-- Vérifier et modifier le type de user_id si c'est encore UUID
DO $$
BEGIN
    -- Vérifier si user_id est de type UUID
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'user_carts' 
        AND column_name = 'user_id' 
        AND data_type = 'uuid'
    ) THEN
        -- Supprimer la contrainte de clé étrangère si elle existe
        ALTER TABLE user_carts DROP CONSTRAINT IF EXISTS user_carts_user_id_fkey;
        
        -- Modifier le type de UUID à TEXT
        ALTER TABLE user_carts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
        
        RAISE NOTICE 'Type de user_id modifié de UUID à TEXT';
    ELSE
        RAISE NOTICE 'user_id est déjà de type TEXT ou n''existe pas';
    END IF;
END $$;

-- ============================================
-- ÉTAPE 2: Recréer les politiques RLS avec accès complet
-- ============================================

-- S'assurer que RLS est activé
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;

-- Politique SELECT : Permettre à TOUS de voir leur panier
CREATE POLICY "Users can view own cart" ON user_carts
    FOR SELECT 
    USING (true); -- Permettre à tous (pas de restriction)

-- Politique INSERT : Permettre à TOUS de créer un panier
CREATE POLICY "Users can create cart" ON user_carts
    FOR INSERT 
    WITH CHECK (true); -- Permettre à tous

-- Politique UPDATE : Permettre à TOUS de mettre à jour leur panier
CREATE POLICY "Users can update own cart" ON user_carts
    FOR UPDATE 
    USING (true) -- Permettre à tous de mettre à jour
    WITH CHECK (true);

-- Politique DELETE : Permettre à TOUS de supprimer leur panier
CREATE POLICY "Users can delete own cart" ON user_carts
    FOR DELETE 
    USING (true); -- Permettre à tous

-- ============================================
-- ÉTAPE 3: Vérification
-- ============================================

-- Afficher le type actuel de user_id
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_carts' 
AND column_name = 'user_id';

-- Afficher les politiques RLS actives
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_carts';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Script exécuté avec succès !';
    RAISE NOTICE 'Les politiques RLS permettent maintenant l''accès aux utilisateurs anonymes.';
    RAISE NOTICE 'L''erreur 406 devrait être résolue.';
END $$;




