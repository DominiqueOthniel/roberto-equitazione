-- ============================================
-- CONFIGURATION BUCKET "products" SUPABASE
-- ============================================
-- 
-- ⚠️ IMPORTANT: Les buckets ne peuvent PAS être créés via SQL
-- Vous devez créer le bucket manuellement dans le Dashboard Supabase
--
-- ÉTAPE 1: Créer le bucket (via Dashboard)
-- 1. Allez dans votre projet Supabase Dashboard
-- 2. Cliquez sur "Storage" dans le menu de gauche
-- 3. Cliquez sur "New bucket"
-- 4. Nom: products
-- 5. Public bucket: ✅ OUI (cochez cette case)
-- 6. Cliquez sur "Create bucket"
--
-- ÉTAPE 2: Exécutez ce script SQL pour configurer les permissions
-- ============================================

-- Supprimer les policies existantes si elles existent (pour éviter les erreurs)
DROP POLICY IF EXISTS "Allow public uploads to products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from products bucket" ON storage.objects;

-- Policy pour permettre l'UPLOAD d'images (INSERT)
-- Permet à tous d'uploader des images dans le bucket "products"
CREATE POLICY "Allow public uploads to products bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'products');

-- Policy pour permettre la LECTURE publique des images (SELECT)
-- Permet à tous de lire/voir les images du bucket "products"
CREATE POLICY "Allow public reads from products bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'products');

-- Policy pour permettre la MISE À JOUR d'images (UPDATE)
-- Permet de remplacer des images existantes
CREATE POLICY "Allow public updates to products bucket"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Policy pour permettre la SUPPRESSION d'images (DELETE)
-- Permet de supprimer des images
CREATE POLICY "Allow public deletes from products bucket"
ON storage.objects
FOR DELETE
USING (bucket_id = 'products');

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Pour vérifier que les policies sont créées, exécutez :
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%products%';

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Le bucket DOIT être créé manuellement dans le Dashboard Supabase
-- 2. Le bucket DOIT être PUBLIC pour que les images soient accessibles
-- 3. Si vous voulez restreindre l'upload aux admins seulement, modifiez les policies
--    pour vérifier l'authentification (voir version sécurisée ci-dessous)
-- ============================================

-- ============================================
-- VERSION SÉCURISÉE (Optionnel - Admins seulement)
-- ============================================
-- Si vous voulez restreindre l'upload aux admins seulement, utilisez ceci :

/*
-- Supprimer les policies publiques
DROP POLICY IF EXISTS "Allow public uploads to products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin uploads to products bucket" ON storage.objects;

-- Policy pour permettre l'upload seulement aux admins
CREATE POLICY "Allow admin uploads to products bucket"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND
  (
    -- Permettre si l'utilisateur est authentifié (vous pouvez ajouter une vérification admin ici)
    auth.role() = 'authenticated'
    -- OU vérifier dans votre table admins :
    -- EXISTS (
    --   SELECT 1 FROM admins 
    --   WHERE admins.email = (auth.jwt() ->> 'email')
    -- )
  )
);

-- La lecture reste publique pour que les images soient visibles sur le site
-- (gardez la policy "Allow public reads from products bucket")
*/


