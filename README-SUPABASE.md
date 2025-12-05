# Guide de Configuration Supabase

## 📋 Étapes de Configuration

### 1. Installer les dépendances

```bash
npm install
```

### 2. Créer le fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```

### 3. Créer un compte Supabase

1. Aller sur https://supabase.com
2. Cliquer sur "Start your project"
3. Se connecter avec GitHub/Google
4. Créer un nouveau projet :
   - **Name** : `roberto-equitazione`
   - **Database Password** : (choisir un mot de passe fort)
   - **Region** : `West Europe (Frankfurt)` ⚠️ Important pour l'Italie

### 4. Obtenir les clés API

1. Dans le dashboard Supabase : **Settings** > **API**
2. Copier :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Coller dans `.env.local`

### 5. Créer le schéma de base de données

1. Dans Supabase : **SQL Editor**
2. Copier le contenu de `supabase-schema.sql`
3. Coller et exécuter (bouton "Run")

### 6. Configurer le Storage (Images)

1. Dans Supabase : **Storage**
2. Créer un nouveau bucket : `product-images`
3. Rendre le bucket public :
   - Cliquer sur le bucket
   - **Settings** > **Public bucket** : ✅ Activé

### 7. Activer Realtime (Chat)

1. Dans Supabase : **Database** > **Replication**
2. Activer la réplication pour :
   - ✅ `chat_messages`
   - ✅ `admin_notifications`

### 8. Tester la connexion

Créer un fichier de test `src/app/test-supabase/page.jsx` :

```javascript
'use client';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function TestSupabase() {
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('count');
        
        if (error) throw error;
        setStatus('✅ Connexion Supabase réussie !');
      } catch (error) {
        setStatus(`❌ Erreur : ${error.message}`);
      }
    }
    testConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Supabase</h1>
      <p>{status}</p>
    </div>
  );
}
```

Visiter : http://localhost:4028/test-supabase

---

## 🗂️ Structure de la Base de Données

### Tables créées :

1. **products** - Catalogue des selles
2. **orders** - Commandes clients
3. **customers** - Informations clients
4. **product_reviews** - Avis produits
5. **chat_messages** - Messages du chat
6. **admin_notifications** - Notifications admin

---

## 📝 Prochaines Étapes

1. ✅ Configuration Supabase terminée
2. ⏭️ Migrer les données depuis localStorage vers Supabase
3. ⏭️ Intégrer le chat temps réel avec Realtime
4. ⏭️ Configurer l'upload d'images
5. ⏭️ Tester toutes les fonctionnalités

---

## 🔗 Liens Utiles

- Dashboard Supabase : https://app.supabase.com
- Documentation : https://supabase.com/docs
- API Reference : https://supabase.com/docs/reference/javascript



