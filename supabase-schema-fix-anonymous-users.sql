-- Script pour permettre les utilisateurs anonymes dans Supabase
-- À exécuter dans Supabase SQL Editor

-- IMPORTANT: Il faut d'abord supprimer les politiques RLS qui utilisent user_id
-- avant de modifier le type de la colonne

-- ============================================
-- 1. TABLE ORDERS
-- ============================================

-- Supprimer les politiques RLS qui utilisent user_id
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users can delete own orders" ON orders;

-- Supprimer la contrainte de clé étrangère
ALTER TABLE orders 
  DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Modifier le type de la colonne user_id de UUID à TEXT
ALTER TABLE orders 
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Recréer les politiques RLS avec le nouveau type TEXT
-- (Permettre l'accès à tous pour simplifier, vous pourrez restreindre plus tard)
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own orders" ON orders
    FOR DELETE USING (true);

-- ============================================
-- 2. TABLE USER_CARTS
-- ============================================

-- Supprimer les politiques RLS qui utilisent user_id
DROP POLICY IF EXISTS "Users can view own cart" ON user_carts;
DROP POLICY IF EXISTS "Users can create cart" ON user_carts;
DROP POLICY IF EXISTS "Users can update own cart" ON user_carts;
DROP POLICY IF EXISTS "Users can delete own cart" ON user_carts;

-- user_carts.user_id est déjà TEXT dans le schéma, mais on s'assure qu'il n'y a pas de contrainte
-- (Pas besoin de modifier le type, mais on vérifie)

-- Recréer les politiques RLS
CREATE POLICY "Users can view own cart" ON user_carts
    FOR SELECT USING (true);

CREATE POLICY "Users can create cart" ON user_carts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own cart" ON user_carts
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own cart" ON user_carts
    FOR DELETE USING (true);

-- ============================================
-- 3. TABLE PRODUCT_REVIEWS (si nécessaire)
-- ============================================

-- Supprimer les politiques RLS qui utilisent user_id
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON product_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON product_reviews;
DROP POLICY IF EXISTS "Users can update reviews" ON product_reviews;

-- Supprimer la contrainte de clé étrangère
ALTER TABLE product_reviews 
  DROP CONSTRAINT IF EXISTS product_reviews_user_id_fkey;

-- Modifier le type de la colonne user_id de UUID à TEXT
ALTER TABLE product_reviews 
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Recréer les politiques RLS
CREATE POLICY "Reviews are viewable by everyone" ON product_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON product_reviews
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update reviews" ON product_reviews
    FOR UPDATE USING (true);

-- ============================================
-- 4. TABLE CHAT_MESSAGES (si nécessaire)
-- ============================================

-- Supprimer les politiques RLS qui utilisent user_id
DROP POLICY IF EXISTS "Users can view messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can create messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update messages" ON chat_messages;

-- Supprimer la contrainte de clé étrangère
ALTER TABLE chat_messages 
  DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;

-- Modifier le type de la colonne user_id de UUID à TEXT
ALTER TABLE chat_messages 
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Recréer les politiques RLS
CREATE POLICY "Users can view messages" ON chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Users can create messages" ON chat_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update messages" ON chat_messages
    FOR UPDATE USING (true);

-- ============================================
-- 5. CRÉER LES INDEX POUR AMÉLIORER LES PERFORMANCES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id_text ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_carts_user_id_text ON user_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id_text ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id_text ON chat_messages(user_id);

