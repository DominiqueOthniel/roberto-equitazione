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

-- Policy pour permettre l'upload d'images (tous les utilisateurs authentifiés ou non)
-- ⚠️ Pour la sécurité, vous pouvez restreindre aux admins seulement
CREATE POLICY "Allow public uploads to products bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'products');

-- Policy pour permettre la lecture publique des images
CREATE POLICY "Allow public reads from products bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'products');

-- Policy pour permettre la mise à jour (optionnel, pour remplacer des images)
CREATE POLICY "Allow public updates to products bucket"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Policy pour permettre la suppression (optionnel, pour supprimer des images)
CREATE POLICY "Allow public deletes from products bucket"
ON storage.objects
FOR DELETE
USING (bucket_id = 'products');

-- Si vous voulez restreindre aux admins seulement, utilisez ceci à la place :
-- (Vous devrez avoir une table 'admins' et vérifier l'utilisateur)

/*
-- Version sécurisée (admins seulement)
CREATE POLICY "Allow admin uploads to products bucket"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Allow admin reads from products bucket"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'products' AND
  (
    -- Permettre la lecture publique (pour afficher les images)
    true
    -- OU restreindre aux admins :
    -- EXISTS (
    --   SELECT 1 FROM admins 
    --   WHERE admins.email = auth.jwt() ->> 'email'
    -- )
  )
);
*/

