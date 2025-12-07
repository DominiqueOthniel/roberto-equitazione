# FIX IMMÉDIAT - Panier ne fonctionne pas

## Problème
- Ajout de produit ne fait rien
- Données restent locales
- Rien dans Supabase

## Solution IMMÉDIATE

### Étape 1 : Exécuter le script SQL dans Supabase

1. Ouvrez Supabase Dashboard
2. Allez dans SQL Editor
3. Copiez-collez ce script :

```sql
-- DÉSACTIVER RLS POUR USER_CARTS
ALTER TABLE user_carts DISABLE ROW LEVEL SECURITY;

-- Vérifier le type de user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_carts' 
        AND column_name = 'user_id' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE user_carts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;
END $$;
```

4. Cliquez sur "Run"
5. Vérifiez qu'il n'y a pas d'erreur

### Étape 2 : Vider le cache du navigateur

1. Ouvrez la console (F12)
2. Tapez : `localStorage.clear()`
3. Rechargez la page (Ctrl+Shift+R)

### Étape 3 : Tester

1. Ajoutez un produit au panier
2. Ouvrez la console (F12)
3. Vérifiez les messages
4. Vérifiez dans Application → Local Storage → `cart`

## Si ça ne fonctionne toujours pas

1. Ouvrez la console (F12)
2. Copiez TOUS les messages d'erreur
3. Vérifiez dans Application → Local Storage si `cart` existe


