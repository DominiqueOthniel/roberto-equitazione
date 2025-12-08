-- Script SQL pour insérer des données de test/exemple
-- À exécuter dans Supabase SQL Editor APRÈS avoir créé les tables

-- 1. Insérer des produits de test
INSERT INTO products (name, brand, price, original_price, description, type, size, material, images, rating, reviews_count, is_new, disciplina, paese_origine, technical_specs, features, sizes)
VALUES 
(
  'Sella Salto Leggera',
  'KIEFFER',
  2100.00,
  2500.00,
  'Sella da salto ostacoli di altissima qualità, progettata per cavalieri professionisti e competizioni di alto livello.',
  'Salto Ostacoli',
  '16.5',
  'Pelle',
  ARRAY['https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=400&fit=crop'],
  3.5,
  29,
  true,
  'Salto Ostacoli',
  'Francia',
  '{"misuraSedile": "16.5\"", "larghezzaArcione": "Media", "lunghezzaQuartieri": "Standard"}'::jsonb,
  ARRAY['Pelle francese', 'Confortevole', 'Stabile'],
  ARRAY['16', '16.5', '17', '17.5']
),
(
  'Sella Uso Generale Premium',
  'PRESTIGE',
  3000.00,
  3500.00,
  'Sella versatile per uso generale, ideale per passeggiate e lavoro quotidiano.',
  'Uso Generale',
  '17.5',
  'Pelle',
  ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'],
  5.0,
  45,
  false,
  'Uso Generale',
  'Italia',
  '{"misuraSedile": "17.5\"", "larghezzaArcione": "Larga", "lunghezzaQuartieri": "Lunga"}'::jsonb,
  ARRAY['Comfort', 'Versatile', 'Durevole'],
  ARRAY['17', '17.5', '18']
),
(
  'Sella Dressage Comfort Plus',
  'PESSOA',
  2900.00,
  3400.00,
  'Sella da dressage professionale con design ergonomico per massimo comfort.',
  'Dressage',
  '17',
  'Pelle',
  ARRAY['https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop'],
  5.0,
  38,
  true,
  'Dressage',
  'Portogallo',
  '{"misuraSedile": "17\"", "larghezzaArcione": "Media", "lunghezzaQuartieri": "Lunga"}'::jsonb,
  ARRAY['Ergonomica', 'Comfort', 'Professionale'],
  ARRAY['16.5', '17', '17.5']
),
(
  'Sella Dressage Elite Pro',
  'Prestige',
  3200.00,
  3800.00,
  'Sella da dressage di livello professionale con materiali premium.',
  'Dressage',
  '17.5',
  'Pelle',
  ARRAY['https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop'],
  5.0,
  47,
  false,
  'Dressage',
  'Francia',
  '{"misuraSedile": "17.5\"", "larghezzaArcione": "Larga", "lunghezzaQuartieri": "Lunga"}'::jsonb,
  ARRAY['Premium', 'Elite', 'Professionale'],
  ARRAY['17', '17.5', '18']
),
(
  'Sella Salto Ostacoli Competition',
  'Pessoa',
  2800.00,
  3200.00,
  'Sella da salto ostacoli per competizioni, design moderno e performante.',
  'Salto Ostacoli',
  '17',
  'Pelle',
  ARRAY['https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=400&fit=crop'],
  4.5,
  32,
  false,
  'Salto Ostacoli',
  'Portogallo',
  '{"misuraSedile": "17\"", "larghezzaArcione": "Media", "lunghezzaQuartieri": "Standard"}'::jsonb,
  ARRAY['Competizione', 'Performante', 'Moderno'],
  ARRAY['16.5', '17', '17.5']
)
ON CONFLICT DO NOTHING;

-- 2. Insérer des clients de test
INSERT INTO customers (email, name, phone, address, total_orders, total_spent, status, last_order)
VALUES 
(
  'marco.rossi@email.it',
  'Marco Rossi',
  '+39 333 1234567',
  '{"street": "Via Roma 123", "city": "Milano", "province": "MI", "cap": "20100", "country": "Italia"}'::jsonb,
  5,
  12500.00,
  'Actif',
  NOW() - INTERVAL '10 days'
),
(
  'laura.bianchi@email.it',
  'Laura Bianchi',
  '+39 334 2345678',
  '{"street": "Via Garibaldi 45", "city": "Torino", "province": "TO", "cap": "10100", "country": "Italia"}'::jsonb,
  3,
  8900.00,
  'Actif',
  NOW() - INTERVAL '5 days'
),
(
  'giuseppe.verdi@email.it',
  'Giuseppe Verdi',
  '+39 335 3456789',
  '{"street": "Via Dante 78", "city": "Roma", "province": "RM", "cap": "00100", "country": "Italia"}'::jsonb,
  8,
  15200.00,
  'VIP',
  NOW() - INTERVAL '2 days'
),
(
  'sofia.neri@email.it',
  'Sofia Neri',
  '+39 336 4567890',
  '{"street": "Via Manzoni 34", "city": "Firenze", "province": "FI", "cap": "50100", "country": "Italia"}'::jsonb,
  2,
  4200.00,
  'Actif',
  NOW() - INTERVAL '15 days'
),
(
  'alessandro.romano@email.it',
  'Alessandro Romano',
  '+39 337 5678901',
  '{"street": "Via Mazzini 56", "city": "Napoli", "province": "NA", "cap": "80100", "country": "Italia"}'::jsonb,
  1,
  1450.00,
  'Inactif',
  NOW() - INTERVAL '60 days'
)
ON CONFLICT (email) DO NOTHING;

-- 3. Insérer des commandes de test
INSERT INTO orders (email, nome, cognome, telefono, total, subtotal, status, shipping_address, items)
VALUES 
(
  'marco.rossi@email.it',
  'Marco',
  'Rossi',
  '+39 333 1234567',
  2100.00,
  2100.00,
  'delivered',
  '{"via": "Via Roma 123", "numeroCivico": "", "citta": "Milano", "provincia": "MI", "cap": "20100", "paese": "Italia"}'::jsonb,
  '[{"id": 1, "name": "Sella Salto Leggera", "brand": "KIEFFER", "price": 2100, "quantity": 1, "specs": {"size": "16.5", "type": "Salto Ostacoli"}}]'::jsonb
),
(
  'laura.bianchi@email.it',
  'Laura',
  'Bianchi',
  '+39 334 2345678',
  3000.00,
  3000.00,
  'shipped',
  '{"via": "Via Garibaldi 45", "numeroCivico": "", "citta": "Torino", "provincia": "TO", "cap": "10100", "paese": "Italia"}'::jsonb,
  '[{"id": 2, "name": "Sella Uso Generale Premium", "brand": "PRESTIGE", "price": 3000, "quantity": 1, "specs": {"size": "17.5", "type": "Uso Generale"}}]'::jsonb
),
(
  'giuseppe.verdi@email.it',
  'Giuseppe',
  'Verdi',
  '+39 335 3456789',
  2900.00,
  2900.00,
  'processing',
  '{"via": "Via Dante 78", "numeroCivico": "", "citta": "Roma", "provincia": "RM", "cap": "00100", "paese": "Italia"}'::jsonb,
  '[{"id": 3, "name": "Sella Dressage Comfort Plus", "brand": "PESSOA", "price": 2900, "quantity": 1, "specs": {"size": "17", "type": "Dressage"}}]'::jsonb
),
(
  'marco.rossi@email.it',
  'Marco',
  'Rossi',
  '+39 333 1234567',
  5800.00,
  5800.00,
  'pending',
  '{"via": "Via Roma 123", "numeroCivico": "", "citta": "Milano", "provincia": "MI", "cap": "20100", "paese": "Italia"}'::jsonb,
  '[{"id": 3, "name": "Sella Dressage Comfort Plus", "brand": "PESSOA", "price": 2900, "quantity": 1, "specs": {"size": "17", "type": "Dressage"}}, {"id": 4, "name": "Sella Dressage Elite Pro", "brand": "Prestige", "price": 3200, "quantity": 1, "specs": {"size": "17.5", "type": "Dressage"}}]'::jsonb
)
ON CONFLICT DO NOTHING;

-- 4. Insérer des avis produits de test
INSERT INTO product_reviews (product_id, user_name, user_email, rating, comment, status)
SELECT 
  p.id,
  'Marco Rossi',
  'marco.rossi@email.it',
  5,
  'Ottima sella, molto comoda e di qualità superiore. Consigliata!',
  'approved'
FROM products p
WHERE p.name = 'Sella Salto Leggera'
LIMIT 1;

INSERT INTO product_reviews (product_id, user_name, user_email, rating, comment, status)
SELECT 
  p.id,
  'Laura Bianchi',
  'laura.bianchi@email.it',
  4,
  'Buona sella, prezzo un po'' alto ma qualità eccellente.',
  'approved'
FROM products p
WHERE p.name = 'Sella Uso Generale Premium'
LIMIT 1;

INSERT INTO product_reviews (product_id, user_name, user_email, rating, comment, status)
SELECT 
  p.id,
  'Giuseppe Verdi',
  'giuseppe.verdi@email.it',
  5,
  'Perfetta per il dressage, molto stabile e confortevole.',
  'approved'
FROM products p
WHERE p.name = 'Sella Dressage Comfort Plus'
LIMIT 1;

-- 5. Insérer des notifications admin de test
INSERT INTO admin_notifications (type, title, message, metadata, read)
VALUES 
(
  'order',
  'Nuovo ordine',
  'Ordine ORD-12345 di Marco Rossi - €2,100.00',
  '{"orderId": "ORD-12345", "customer": "Marco Rossi"}'::jsonb,
  false
),
(
  'order',
  'Nuovo ordine',
  'Ordine ORD-12346 di Laura Bianchi - €3,000.00',
  '{"orderId": "ORD-12346", "customer": "Laura Bianchi"}'::jsonb,
  false
),
(
  'message',
  'Nuovo messaggio',
  'Nuovo messaggio da Giuseppe Verdi',
  '{"userId": "user123", "message": "Vorrei informazioni su..."}'::jsonb,
  false
);

-- 6. Mettre à jour les statistiques des produits avec les avis
UPDATE products 
SET 
  reviews_count = (
    SELECT COUNT(*) 
    FROM product_reviews 
    WHERE product_reviews.product_id = products.id AND status = 'approved'
  ),
  rating = (
    SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
    FROM product_reviews 
    WHERE product_reviews.product_id = products.id AND status = 'approved'
  )
WHERE id IN (SELECT id FROM products);

-- Vérification : Afficher le nombre d'enregistrements par table
SELECT 
  'products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'product_reviews', COUNT(*) FROM product_reviews
UNION ALL
SELECT 'admin_notifications', COUNT(*) FROM admin_notifications
UNION ALL
SELECT 'user_carts', COUNT(*) FROM user_carts
UNION ALL
SELECT 'chat_messages', COUNT(*) FROM chat_messages;



