-- Fix admin product save on madisonequestrian.com
-- Run this in Supabase SQL Editor (one time)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Products are insertable by everyone" ON products;
CREATE POLICY "Products are insertable by everyone" ON products
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Products are updatable by everyone" ON products;
CREATE POLICY "Products are updatable by everyone" ON products
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Products are deletable by everyone" ON products;
CREATE POLICY "Products are deletable by everyone" ON products
  FOR DELETE USING (true);

SELECT COUNT(*) AS product_count FROM products;
