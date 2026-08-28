-- Fix product update errors on madisonequestrian.com
-- Run this in Supabase SQL Editor (safe to run multiple times)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  type TEXT,
  size TEXT,
  material TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE products ADD COLUMN IF NOT EXISTS disciplina TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS paese_origine TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS technical_specs JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT[];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'images'
  ) THEN
    ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;
END $$;

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

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
ORDER BY ordinal_position;
