# Configuration Supabase

## 📋 Étapes de configuration

### 1. Créer un compte Supabase

1. Allez sur https://supabase.com
2. Créez un compte (gratuit)
3. Créez un nouveau projet
4. Choisissez la région : **Europe (Frankfurt)** pour une latence optimale en Italie
5. Attendez que le projet soit créé (2-3 minutes)

### 2. Obtenir les clés API

1. Dans votre projet Supabase, allez dans **Settings** > **API**
2. Copiez :
   - **Project URL** (ex: `https://abcdefghijklmnop.supabase.co`)
   - **anon public key** (commence par `eyJhbGci...`)

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-ici
```

**Important** : Remplacez les valeurs par celles de votre projet Supabase.

### 4. Installer les dépendances

```bash
npm install
```

Cela installera automatiquement `@supabase/supabase-js`.

### 5. Vérifier la connexion

Le client Supabase est maintenant configuré dans `src/lib/supabase.js`.

Vous pouvez l'utiliser dans vos composants :

```javascript
import { supabase } from '@/lib/supabase'

// Exemple : Charger des produits
const { data, error } = await supabase
  .from('products')
  .select('*')
```

## 🔒 Sécurité

- Le fichier `.env.local` est déjà dans `.gitignore` (ne sera pas commité)
- Utilisez toujours `NEXT_PUBLIC_` pour les variables accessibles côté client
- Ne partagez jamais vos clés API publiquement

## 📚 Prochaines étapes

1. Créer les tables dans Supabase (SQL Editor)
2. Configurer Storage pour les images
3. Intégrer Realtime pour le chat
4. Configurer l'authentification

