# Guide : Synchronisation entre appareils

## Problème identifié

Les données restent locales sur chaque appareil (PC vs téléphone) et ne se synchronisent pas dans Supabase.

## Causes possibles

### 1. **Script SQL non exécuté** ⚠️ CRITIQUE
Le script `supabase-schema-fix-anonymous-users.sql` doit être exécuté dans Supabase pour permettre les utilisateurs anonymes.

**Solution :**
1. Ouvrez Supabase Dashboard → SQL Editor
2. Copiez-collez le contenu de `supabase-schema-fix-anonymous-users.sql`
3. Exécutez le script
4. Vérifiez qu'il n'y a pas d'erreurs

### 2. **Variables d'environnement manquantes** ⚠️ CRITIQUE
Les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` doivent être définies.

**Solution :**
1. Vérifiez votre fichier `.env.local` :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
   ```
2. Vérifiez que ces variables sont aussi définies dans Vercel (Settings → Environment Variables)

### 3. **ID utilisateur différent sur chaque appareil** ⚠️ IMPORTANT
Si vous n'êtes pas connecté via Supabase Auth, chaque appareil génère un `guest_id` différent, donc les données ne se synchronisent pas.

**Solution :**
- **Option A (Recommandée)** : Créer un compte et se connecter via Supabase Auth
  - Les données seront automatiquement synchronisées entre tous vos appareils
- **Option B** : Utiliser le même email sur tous les appareils
  - Créez un compte utilisateur (sans Supabase Auth) avec le même email
  - Les données seront synchronisées via l'email comme identifiant

### 4. **Erreurs silencieuses**
Les erreurs peuvent être silencieuses et tomber en fallback localStorage.

**Solution :**
- Ouvrez la console du navigateur (F12)
- Regardez les messages de log (✅ = succès, ❌ = erreur, ⚠️ = avertissement)
- Les erreurs détaillées sont maintenant affichées avec des instructions

## Diagnostic

### Étape 1 : Tester la connexion Supabase

1. Allez sur `/test-supabase` dans votre application
2. Cliquez sur "Lancer le test de connexion"
3. Ouvrez la console (F12) et vérifiez les messages

### Étape 2 : Vérifier les logs dans la console

Quand vous ajoutez un produit au panier, vous devriez voir dans la console :

**✅ Si ça fonctionne :**
```
✅ Utilisateur authentifié via Supabase Auth: [UUID]
🔄 Sauvegarde panier dans Supabase...
✅ Panier sauvegardé avec succès dans Supabase !
```

**❌ Si ça ne fonctionne pas :**
```
⚠️ Utilisateur invité, ID temporaire: guest_xxx
⚠️ ATTENTION: Cet ID est différent sur chaque appareil !
❌ ERREUR lors de la sauvegarde du panier dans Supabase:
  Code: [code d'erreur]
  Message: [message d'erreur]
```

### Étape 3 : Vérifier les données dans Supabase

1. Allez sur Supabase Dashboard → Table Editor
2. Ouvrez la table `user_carts`
3. Vérifiez si vos données apparaissent

## Solutions par problème

### Problème : "new row violates row-level security policy"
**Cause :** Les politiques RLS bloquent les INSERT/UPDATE

**Solution :**
1. Exécutez le script `supabase-schema-fix-anonymous-users.sql`
2. Vérifiez dans Supabase Dashboard → Authentication → Policies que les politiques permettent les INSERT/UPDATE

### Problème : "column user_id does not exist" ou "invalid input syntax for type uuid"
**Cause :** Le type de la colonne `user_id` n'a pas été modifié

**Solution :**
1. Exécutez le script `supabase-schema-fix-anonymous-users.sql`
2. Vérifiez que la colonne `user_id` est de type `TEXT` (pas `UUID`)

### Problème : "Missing Supabase environment variables"
**Cause :** Les variables d'environnement ne sont pas définies

**Solution :**
1. Créez un fichier `.env.local` à la racine du projet
2. Ajoutez :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
   ```
3. Redémarrez le serveur de développement (`npm run dev`)
4. Ajoutez aussi ces variables dans Vercel (Settings → Environment Variables)

### Problème : Données différentes sur PC vs téléphone
**Cause :** Chaque appareil utilise un `guest_id` différent

**Solution :**
1. **Meilleure solution** : Créez un compte et connectez-vous via Supabase Auth
   - Les données seront automatiquement synchronisées
2. **Solution alternative** : Utilisez le même email sur tous les appareils
   - Créez un compte utilisateur avec le même email
   - Les données seront synchronisées via l'email

## Vérification finale

Après avoir appliqué les solutions :

1. ✅ Ouvrez la console (F12)
2. ✅ Ajoutez un produit au panier
3. ✅ Vérifiez que vous voyez `✅ Panier sauvegardé avec succès dans Supabase !`
4. ✅ Allez sur Supabase Dashboard → Table Editor → `user_carts`
5. ✅ Vérifiez que vos données apparaissent
6. ✅ Testez sur un autre appareil avec le même compte/email
7. ✅ Vérifiez que les données se synchronisent

## Support

Si le problème persiste :
1. Copiez tous les messages de la console (F12)
2. Vérifiez les erreurs dans Supabase Dashboard → Logs
3. Vérifiez que le script SQL a été exécuté sans erreur



