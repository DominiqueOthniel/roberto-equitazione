-- Configuration Supabase Storage pour l'upload d'images produits
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Créer le bucket "products" (si pas déjà créé)
-- Note: Vous devez créer le bucket manuellement dans l'interface Supabase Storage
-- Nom: products
-- Public: OUI

-- 2. Configurer les RLS Policies pour permettre l'upload et la lecture

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

