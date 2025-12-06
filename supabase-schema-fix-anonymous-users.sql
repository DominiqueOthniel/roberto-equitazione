-- Script pour permettre les utilisateurs anonymes dans Supabase
-- À exécuter dans Supabase SQL Editor

-- 1. Modifier la table orders pour permettre user_id TEXT (au lieu de UUID uniquement)
-- Cela permet d'utiliser des emails ou IDs temporaires pour les utilisateurs non authentifiés

ALTER TABLE orders 
  DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

ALTER TABLE orders 
  ALTER COLUMN user_id TYPE TEXT;

-- 2. Modifier la table user_carts pour permettre user_id TEXT
-- (déjà TEXT dans le schéma, mais on s'assure qu'il n'y a pas de contrainte)

ALTER TABLE user_carts 
  ALTER COLUMN user_id TYPE TEXT;

-- 3. Mettre à jour les politiques RLS pour permettre les écritures anonymes
-- (Les politiques existantes avec USING (true) devraient déjà fonctionner)

-- Vérifier que les politiques permettent les INSERT/UPDATE pour tous
-- (Elles sont déjà configurées avec USING (true) dans le schéma principal)

-- 4. Créer un index pour améliorer les performances sur user_id TEXT
CREATE INDEX IF NOT EXISTS idx_orders_user_id_text ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_carts_user_id_text ON user_carts(user_id);

