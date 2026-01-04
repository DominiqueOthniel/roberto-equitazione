# Fix : Sauvegarde dans Supabase

## Problème identifié

Les actions sur le site ne sauvegardaient pas dans Supabase à cause de plusieurs problèmes :

1. **Mapping incorrect des colonnes** : `checkout/page.jsx` envoyait `order_id`, `customer_name`, `customer_email` mais le schéma SQL attend `email`, `nome`, `cognome`, `telefono`
2. **Type de données incompatible** : `user_id` dans `orders` était de type `UUID REFERENCES auth.users(id)`, ce qui empêchait les utilisateurs non authentifiés de sauvegarder
3. **Logging insuffisant** : Les erreurs n'étaient pas visibles dans la console

## Solutions appliquées

### 1. Correction du mapping des données (`orders-supabase.js`)
- ✅ Mapping correct : `customer_email` → `email`, `customer_name` → `nome` + `cognome`
- ✅ Logging détaillé des erreurs avec `error.message`, `error.details`, `error.hint`

### 2. Amélioration du logging
- ✅ `cart-supabase.js` : Logs détaillés pour chaque opération
- ✅ `orders-supabase.js` : Logs détaillés pour chaque opération
- ✅ `customers-supabase.js` : Logs détaillés pour chaque opération
- ✅ `products-supabase.js` : Logs détaillés pour chaque opération

### 3. Gestion des utilisateurs non authentifiés
- ✅ `getUserId()` utilise maintenant :
  - UUID de Supabase Auth si l'utilisateur est authentifié
  - Email de localStorage si l'utilisateur n'est pas authentifié mais a un compte
  - ID temporaire (`guest_xxx`) si aucun utilisateur

### 4. Script SQL pour permettre les utilisateurs anonymes
- ✅ Créé `supabase-schema-fix-anonymous-users.sql`
- ⚠️ **À EXÉCUTER DANS SUPABASE SQL EDITOR** pour permettre `user_id` TEXT au lieu de UUID uniquement

## Actions requises

### 1. Exécuter le script SQL dans Supabase

1. Ouvrez Supabase Dashboard → SQL Editor
2. Exécutez le contenu de `supabase-schema-fix-anonymous-users.sql`
3. Cela permettra aux utilisateurs non authentifiés de sauvegarder leurs données

### 2. Tester la sauvegarde

1. Ouvrez la console du navigateur (F12)
2. Ajoutez un produit au panier
3. Vérifiez les logs dans la console :
   - `"Sauvegarde panier dans Supabase pour user: ..."`
   - `"Panier sauvegardé avec succès dans Supabase: ..."`
4. Vérifiez dans Supabase Table Editor que les données apparaissent

### 3. Vérifier les erreurs

Si vous voyez des erreurs dans la console :
- Copiez le message d'erreur complet
- Vérifiez les détails (`error.details`, `error.hint`)
- Les erreurs courantes :
  - **"new row violates row-level security policy"** → Vérifiez les politiques RLS
  - **"column does not exist"** → Vérifiez le mapping des colonnes
  - **"invalid input syntax for type uuid"** → Exécutez le script SQL de fix

## Vérification

Après avoir exécuté le script SQL, testez :

1. ✅ Ajouter un produit au panier → Vérifier dans `user_carts`
2. ✅ Passer une commande → Vérifier dans `orders`
3. ✅ S'inscrire comme client → Vérifier dans `customers`
4. ✅ Créer/modifier un produit (admin) → Vérifier dans `products`

Toutes les opérations devraient maintenant être visibles dans Supabase avec des logs détaillés dans la console.




