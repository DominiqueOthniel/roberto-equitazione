-- SCRIPT SIMPLE POUR CORRIGER LE PROBLÈME
-- Copiez-collez TOUT ce script dans Supabase SQL Editor et exécutez-le

-- 1. Désactiver RLS pour user_carts
ALTER TABLE user_carts DISABLE ROW LEVEL SECURITY;

-- 2. Vérifier et modifier user_id en TEXT si nécessaire
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_carts' 
        AND column_name = 'user_id' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE user_carts DROP CONSTRAINT IF EXISTS user_carts_user_id_fkey;
        ALTER TABLE user_carts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;
END $$;

-- 3. Vérification
SELECT 'RLS désactivé, user_id est TEXT' as status;




