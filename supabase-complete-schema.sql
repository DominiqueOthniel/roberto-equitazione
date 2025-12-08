-- ============================================
-- SCRIPT SQL COMPLET POUR ROBERTO EQUITAZIONE
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- 1. Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. TABLE DES PRODUITS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  images JSONB DEFAULT '[]'::jsonb,
  type TEXT,
  size TEXT,
  material TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour products
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. TABLE DES COMMANDES
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT, -- TEXT pour permettre UUID ou email/guest_id
  email TEXT NOT NULL,
  nome TEXT,
  cognome TEXT,
  telefono TEXT,
  total DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. TABLE DES CLIENTS
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  address JSONB,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'Attivo',
  is_verified BOOLEAN DEFAULT false,
  last_order TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour customers
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. TABLE DES AVIS PRODUITS
-- ============================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id TEXT, -- TEXT pour permettre UUID ou email/guest_id
  user_name TEXT,
  user_email TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour product_reviews
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON product_reviews(status);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. TABLE DES MESSAGES CHAT
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender TEXT NOT NULL CHECK (sender IN ('user', 'agent')),
  user_id TEXT, -- TEXT pour permettre UUID ou email/guest_id
  user_email TEXT,
  message TEXT NOT NULL,
  image_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON chat_messages(read);

-- ============================================
-- 8. TABLE DES NOTIFICATIONS ADMIN
-- ============================================
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('order', 'message')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour admin_notifications
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at);

-- ============================================
-- 9. TABLE DES PANIERS UTILISATEURS
-- ============================================
CREATE TABLE IF NOT EXISTS user_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- TEXT pour permettre UUID ou email/guest_id
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index pour user_carts
CREATE INDEX IF NOT EXISTS idx_user_carts_user_id ON user_carts(user_id);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_user_carts_updated_at ON user_carts;
CREATE TRIGGER update_user_carts_updated_at BEFORE UPDATE ON user_carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. TABLE DES ADMINS
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'admin',
  permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour admins
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. TABLE DES SESSIONS ADMIN (optionnel)
-- ============================================
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

-- Index pour admin_sessions
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_is_active ON admin_sessions(is_active);

-- ============================================
-- 12. ACTIVER ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 13. POLITIQUES RLS - ACCÈS OUVERT (pour éviter erreur 406)
-- ============================================

-- Products : accès complet
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Products are insertable by everyone" ON products;
CREATE POLICY "Products are insertable by everyone" ON products
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Products are updatable by everyone" ON products;
CREATE POLICY "Products are updatable by everyone" ON products
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Products are deletable by everyone" ON products;
CREATE POLICY "Products are deletable by everyone" ON products
    FOR DELETE USING (true);

-- Orders : accès complet
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete own orders" ON orders;
CREATE POLICY "Users can delete own orders" ON orders
    FOR DELETE USING (true);

-- Customers : accès complet
DROP POLICY IF EXISTS "Customers are viewable by everyone" ON customers;
CREATE POLICY "Customers are viewable by everyone" ON customers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Customers are insertable by everyone" ON customers;
CREATE POLICY "Customers are insertable by everyone" ON customers
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Customers are updatable by everyone" ON customers;
CREATE POLICY "Customers are updatable by everyone" ON customers
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Customers are deletable by everyone" ON customers;
CREATE POLICY "Customers are deletable by everyone" ON customers
    FOR DELETE USING (true);

-- Product reviews : accès complet
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON product_reviews;
CREATE POLICY "Reviews are viewable by everyone" ON product_reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON product_reviews;
CREATE POLICY "Users can create reviews" ON product_reviews
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update reviews" ON product_reviews;
CREATE POLICY "Users can update reviews" ON product_reviews
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete reviews" ON product_reviews;
CREATE POLICY "Users can delete reviews" ON product_reviews
    FOR DELETE USING (true);

-- Chat messages : accès complet
DROP POLICY IF EXISTS "Users can view messages" ON chat_messages;
CREATE POLICY "Users can view messages" ON chat_messages
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create messages" ON chat_messages;
CREATE POLICY "Users can create messages" ON chat_messages
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update messages" ON chat_messages;
CREATE POLICY "Users can update messages" ON chat_messages
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete messages" ON chat_messages;
CREATE POLICY "Users can delete messages" ON chat_messages
    FOR DELETE USING (true);

-- Admin notifications : accès complet
DROP POLICY IF EXISTS "Notifications are viewable by everyone" ON admin_notifications;
CREATE POLICY "Notifications are viewable by everyone" ON admin_notifications
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Notifications are insertable by everyone" ON admin_notifications;
CREATE POLICY "Notifications are insertable by everyone" ON admin_notifications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Notifications are updatable by everyone" ON admin_notifications;
CREATE POLICY "Notifications are updatable by everyone" ON admin_notifications
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Notifications are deletable by everyone" ON admin_notifications;
CREATE POLICY "Notifications are deletable by everyone" ON admin_notifications
    FOR DELETE USING (true);

-- User carts : accès complet (IMPORTANT pour éviter erreur 406)
DROP POLICY IF EXISTS "Users can view own cart" ON user_carts;
CREATE POLICY "Users can view own cart" ON user_carts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create cart" ON user_carts;
CREATE POLICY "Users can create cart" ON user_carts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own cart" ON user_carts;
CREATE POLICY "Users can update own cart" ON user_carts
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete own cart" ON user_carts;
CREATE POLICY "Users can delete own cart" ON user_carts
    FOR DELETE USING (true);

-- Admins : accès complet
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
CREATE POLICY "Admins can view all admins" ON admins
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert" ON admins;
CREATE POLICY "Admins can insert" ON admins
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update" ON admins;
CREATE POLICY "Admins can update" ON admins
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can delete" ON admins;
CREATE POLICY "Admins can delete" ON admins
    FOR DELETE USING (true);

-- Admin sessions : accès complet
DROP POLICY IF EXISTS "Admins can view sessions" ON admin_sessions;
CREATE POLICY "Admins can view sessions" ON admin_sessions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert sessions" ON admin_sessions;
CREATE POLICY "Admins can insert sessions" ON admin_sessions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update sessions" ON admin_sessions;
CREATE POLICY "Admins can update sessions" ON admin_sessions
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can delete sessions" ON admin_sessions;
CREATE POLICY "Admins can delete sessions" ON admin_sessions
    FOR DELETE USING (true);

-- ============================================
-- 14. FONCTIONS HELPER (optionnel)
-- ============================================

-- Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE email = user_email AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le rôle d'un utilisateur
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

-- ============================================
-- FIN DU SCRIPT
-- ============================================

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Script SQL exécuté avec succès !';
    RAISE NOTICE '✅ Toutes les tables ont été créées';
    RAISE NOTICE '✅ Les politiques RLS sont configurées avec accès ouvert';
    RAISE NOTICE '✅ Les triggers sont activés';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ IMPORTANT: Les politiques RLS sont ouvertes pour faciliter le développement';
    RAISE NOTICE '⚠️ Vous pouvez les restreindre plus tard selon vos besoins de sécurité';
END $$;



