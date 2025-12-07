# Guide : Upload d'images pour les produits

## Fonctionnalité ajoutée

Vous pouvez maintenant uploader des images directement depuis votre ordinateur lors de la création ou modification d'un produit, au lieu de seulement utiliser des URLs.

## Configuration Supabase Storage

### 1. Créer le bucket "products"

1. Allez dans votre projet Supabase Dashboard
2. Naviguez vers **Storage** dans le menu de gauche
3. Cliquez sur **New bucket**
4. Nom du bucket : `products`
5. **Public bucket** : ✅ **OUI** (pour que les images soient accessibles publiquement)
6. Cliquez sur **Create bucket**

### 2. Configurer les RLS Policies

Pour permettre l'upload d'images, vous devez configurer les Row Level Security (RLS) policies :

```sql
-- Permettre à tous d'uploader des images (ou seulement les admins)
-- Option 1: Permettre à tous (pour tester)
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'products');

-- Option 2: Permettre seulement aux admins (recommandé)
-- Vous devrez utiliser Supabase Auth pour identifier les admins
CREATE POLICY "Allow admin uploads" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND
  auth.role() = 'authenticated'
);

-- Permettre la lecture publique des images
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT
USING (bucket_id = 'products');
```

### 3. Vérifier les permissions

Assurez-vous que :
- Le bucket `products` est **public** (ou que les RLS policies permettent la lecture)
- Les policies d'upload sont configurées correctement

## Utilisation

### Lors de la création d'un produit

1. Allez dans **Admin → Produits → Nouveau Produit**
2. Dans la section **Immagini** :
   - **Image Principale** : Cliquez sur "Choisir un fichier" pour uploader une image, OU entrez une URL
   - **Images Aggiuntive** : Cliquez sur "Choisir un fichier" pour uploader des images supplémentaires, OU cliquez sur "+ URL" pour ajouter une URL

### Lors de la modification d'un produit

1. Allez dans **Admin → Produits → Modifier un produit**
2. Même processus que pour la création

## Limitations

- **Taille maximale** : 5MB par image
- **Formats acceptés** : Tous les formats d'image (jpg, png, gif, webp, etc.)
- **Stockage** : Les images sont stockées dans Supabase Storage dans le bucket `products`

## Structure des fichiers

Les images sont stockées avec cette structure :
```
products/
  ├── nom-produit-1234567890.jpg
  ├── autre-produit-1234567891.png
  └── ...
```

Le nom du fichier est généré automatiquement à partir du nom du produit + timestamp pour éviter les conflits.

## Résolution de problèmes

### Erreur "Bucket not found"
- Vérifiez que le bucket `products` existe dans Supabase Storage
- Vérifiez que le nom du bucket est exactement `products` (minuscules)

### Erreur "Permission denied"
- Vérifiez les RLS policies du bucket
- Assurez-vous que les policies permettent l'upload

### Erreur "File too large"
- Réduisez la taille de l'image (max 5MB)
- Utilisez un outil de compression d'images si nécessaire

### L'image ne s'affiche pas après l'upload
- Vérifiez que le bucket est public OU que les RLS policies permettent la lecture
- Vérifiez l'URL retournée dans la console du navigateur


