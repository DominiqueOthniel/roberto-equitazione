-- Schéma de base de données pour Roberto Equitazione
-- À exécuter dans Supabase SQL Editor

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table des produits
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  description TEXT,
  type TEXT, -- 'Salto Ostacoli', 'Dressage', 'Uso Generale'
  size TEXT,
  material TEXT, -- 'Pelle', 'Misto', 'Sintetico'
  images TEXT[], -- Array d'URLs d'images
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  disciplina TEXT, -- Discipline équestre
  paese_origine TEXT, -- Pays d'origine
  technical_specs JSONB, -- Spécifications techniques (misuraSedile, larghezzaArcione, etc.)
  features TEXT[], -- Array des caractéristiques
  sizes TEXT[], -- Tailles disponibles
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des commandes
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  nome TEXT, -- Prénom
  cognome TEXT, -- Nom
  telefono TEXT, -- Téléphone
  total DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2),
  status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  shipping_address JSONB, -- Adresse de livraison complète
  items JSONB NOT NULL, -- Array des produits commandés avec quantités et specs
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des clients
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  address JSONB,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'Attivo',
  last_order TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des avis produits
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table des paniers utilisateurs (synchronisation entre appareils)
CREATE TABLE IF NOT EXISTS user_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Peut être UUID ou email
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 6. Table des messages chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender TEXT NOT NULL CHECK (sender IN ('user', 'agent')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  message TEXT NOT NULL,
  image_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table des notifications admin
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('order', 'message')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON product_reviews(status);
CREATE INDEX IF NOT EXISTS idx_user_carts_user_id ON user_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at (DROP IF EXISTS pour éviter les erreurs si déjà créés)
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_carts_updated_at ON user_carts;
CREATE TRIGGER update_user_carts_updated_at BEFORE UPDATE ON user_carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS (Row Level Security) - À configurer selon vos besoins
-- Pour l'instant, on active RLS mais on permet tout (vous pourrez restreindre plus tard)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (Row Level Security)
-- Pour simplifier, on permet tout pour l'instant (vous pourrez restreindre plus tard)

-- Products : lecture publique, écriture pour tous (vous pouvez restreindre)
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

-- Orders : lecture pour l'utilisateur propriétaire ou admin
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (
        auth.uid() = user_id 
        OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR true -- Temporairement ouvert pour faciliter les tests
    );

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (true);

-- Customers : lecture/écriture pour tous (vous pouvez restreindre)
DROP POLICY IF EXISTS "Customers are viewable by everyone" ON customers;
CREATE POLICY "Customers are viewable by everyone" ON customers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Customers are insertable by everyone" ON customers;
CREATE POLICY "Customers are insertable by everyone" ON customers
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Customers are updatable by everyone" ON customers;
CREATE POLICY "Customers are updatable by everyone" ON customers
    FOR UPDATE USING (true);

-- Chat messages : lecture pour l'utilisateur et les admins
DROP POLICY IF EXISTS "Users can view messages" ON chat_messages;
CREATE POLICY "Users can view messages" ON chat_messages
    FOR SELECT USING (true); -- Temporairement ouvert

DROP POLICY IF EXISTS "Users can create messages" ON chat_messages;
CREATE POLICY "Users can create messages" ON chat_messages
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update messages" ON chat_messages;
CREATE POLICY "Users can update messages" ON chat_messages
    FOR UPDATE USING (true);

-- Product reviews : lecture publique pour approuvés, écriture pour tous
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON product_reviews;
CREATE POLICY "Reviews are viewable by everyone" ON product_reviews
    FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR true);

DROP POLICY IF EXISTS "Users can create reviews" ON product_reviews;
CREATE POLICY "Users can create reviews" ON product_reviews
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update reviews" ON product_reviews;
CREATE POLICY "Users can update reviews" ON product_reviews
    FOR UPDATE USING (true);

-- User carts : lecture/écriture pour l'utilisateur propriétaire
DROP POLICY IF EXISTS "Users can view own cart" ON user_carts;
CREATE POLICY "Users can view own cart" ON user_carts
    FOR SELECT USING (true); -- Temporairement ouvert pour faciliter

DROP POLICY IF EXISTS "Users can create cart" ON user_carts;
CREATE POLICY "Users can create cart" ON user_carts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own cart" ON user_carts;
CREATE POLICY "Users can update own cart" ON user_carts
    FOR UPDATE USING (true);

-- Admin notifications : lecture pour tous (vous pouvez restreindre aux admins)
DROP POLICY IF EXISTS "Notifications are viewable by everyone" ON admin_notifications;
CREATE POLICY "Notifications are viewable by everyone" ON admin_notifications
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Notifications are insertable by everyone" ON admin_notifications;
CREATE POLICY "Notifications are insertable by everyone" ON admin_notifications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Notifications are updatable by everyone" ON admin_notifications;
CREATE POLICY "Notifications are updatable by everyone" ON admin_notifications
    FOR UPDATE USING (true);


