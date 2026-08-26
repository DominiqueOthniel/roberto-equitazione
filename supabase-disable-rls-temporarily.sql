-- Script URGENT pour désactiver RLS temporairement et corriger l'erreur 406
-- ⚠️ ATTENTION: Ce script désactive la sécurité RLS pour user_carts
-- À utiliser uniquement pour tester et corriger le problème
-- À exécuter dans Supabase SQL Editor

-- ============================================
-- ÉTAPE 1: Désactiver RLS temporairement
-- ============================================

ALTER TABLE user_carts DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 2: Vérifier le type de user_id
-- ============================================

-- Supprimer toutes les contraintes
ALTER TABLE user_carts DROP CONSTRAINT IF EXISTS user_carts_user_id_fkey;

-- Vérifier et modifier le type si nécessaire
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'user_carts' 
        AND column_name = 'user_id' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE user_carts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
        RAISE NOTICE 'Type modifié de UUID à TEXT';
    END IF;
END $$;

-- ============================================
-- ÉTAPE 3: Vérification
-- ============================================

-- Vérifier que RLS est désactivé
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'user_carts';

-- Vérifier le type de user_id
SELECT 
    column_name, 
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_carts' 
AND column_name = 'user_id';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ RLS désactivé pour user_carts';
    RAISE NOTICE '✅ L''erreur 406 devrait être résolue maintenant';
    RAISE NOTICE '⚠️ RLS est désactivé - réactivez-le plus tard avec des politiques appropriées';
END $$;




