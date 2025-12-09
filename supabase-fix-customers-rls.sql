-- ============================================
-- FIX RLS POLICIES POUR LA TABLE CUSTOMERS
-- ============================================
-- Ce script corrige les problèmes de permissions RLS pour la table customers
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier que RLS est activé
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes policies (si elles existent)
DROP POLICY IF EXISTS "Customers are viewable by everyone" ON customers;
DROP POLICY IF EXISTS "Customers are insertable by everyone" ON customers;
DROP POLICY IF EXISTS "Customers are updatable by everyone" ON customers;
DROP POLICY IF EXISTS "Customers are deletable by everyone" ON customers;
DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;

-- 3. Créer les nouvelles policies avec accès complet
-- SELECT (lecture)
CREATE POLICY "Customers are viewable by everyone" ON customers
    FOR SELECT 
    USING (true);

-- INSERT (création)
CREATE POLICY "Customers are insertable by everyone" ON customers
    FOR INSERT 
    WITH CHECK (true);

-- UPDATE (mise à jour)
CREATE POLICY "Customers are updatable by everyone" ON customers
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- DELETE (suppression)
CREATE POLICY "Customers are deletable by everyone" ON customers
    FOR DELETE 
    USING (true);

-- 4. Vérifier que les policies sont bien créées
-- Vous pouvez exécuter cette requête pour vérifier :
-- SELECT * FROM pg_policies WHERE tablename = 'customers';

-- 5. Optionnel : Désactiver temporairement RLS si les policies ne fonctionnent toujours pas
-- (À utiliser uniquement en cas d'urgence, puis réactiver RLS avec les policies)
-- ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

