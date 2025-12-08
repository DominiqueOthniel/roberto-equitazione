# Fix : Ajout de produit ne fonctionne pas

## Diagnostic

### 1. Vérifier les variables d'environnement dans Render

1. Allez dans Render Dashboard → Votre service → Environment
2. Vérifiez que ces variables sont définies :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
   PORT=1000
   NODE_ENV=production
   ```

### 2. Vérifier la console du navigateur

1. Ouvrez votre site sur Render
2. Ouvrez la console (F12)
3. Ajoutez un produit au panier
4. Regardez les messages dans la console :
   - ✅ Si vous voyez `✅ Panier sauvegardé dans localStorage` → Le problème est Supabase
   - ❌ Si vous voyez des erreurs → Copiez-les

### 3. Vérifier Supabase

1. Allez dans Supabase Dashboard → SQL Editor
2. Exécutez le script `supabase-complete-schema.sql` si ce n'est pas déjà fait
3. Vérifiez dans Table Editor → `user_carts` que les données apparaissent

### 4. Vérifier localStorage

1. Ouvrez la console (F12) → Application → Local Storage
2. Cherchez la clé `cart`
3. Vérifiez si votre produit est là

## Solutions

### Solution 1 : Variables d'environnement manquantes

Si les variables Supabase ne sont pas définies dans Render :
1. Allez dans Render Dashboard → Environment
2. Ajoutez `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redéployez

### Solution 2 : Script SQL non exécuté

Si Supabase retourne des erreurs :
1. Exécutez `supabase-complete-schema.sql` dans Supabase SQL Editor
2. Vérifiez qu'il n'y a pas d'erreurs

### Solution 3 : Désactiver Supabase temporairement

Si Supabase ne fonctionne toujours pas, le panier fonctionnera avec localStorage uniquement (pas de synchronisation entre appareils).

## Test

1. Ouvrez la console (F12)
2. Ajoutez un produit
3. Vous devriez voir :
   ```
   🛒 [ProductCard] Ajout du produit au panier: ...
   💾 [saveCartToLocalStorage] Début sauvegarde, items: 1
   ✅ [saveCartToLocalStorage] Panier sauvegardé dans localStorage
   ```
4. Vérifiez dans Application → Local Storage → `cart`



