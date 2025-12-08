# 🔄 Migration vers Synchronisation Supabase

## 🎯 Problème Actuel

Les données sont stockées dans `localStorage`, ce qui signifie :
- ❌ Chaque appareil a ses propres données
- ❌ Pas de synchronisation entre téléphone, ordinateur, etc.
- ❌ Perte de données si on change d'appareil

## ✅ Solution : Synchronisation Supabase

### Ce qui a été créé :

1. **Nouvelle table `user_carts`** dans Supabase
   - Stocke le panier de chaque utilisateur
   - Synchronisé entre tous les appareils

2. **Nouveau fichier `src/utils/cart-supabase.js`**
   - Fonctions pour synchroniser le panier avec Supabase
   - Fallback vers localStorage si pas d'utilisateur
   - Realtime pour synchronisation instantanée

---

## 🚀 Étapes de Migration

### 1. Mettre à jour le schéma Supabase

Exécutez ce SQL dans Supabase SQL Editor :

```sql
-- Table des paniers utilisateurs
CREATE TABLE IF NOT EXISTS user_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_carts_user_id ON user_carts(user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_user_carts_updated_at BEFORE UPDATE ON user_carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;

-- Politiques
CREATE POLICY "Users can view own cart" ON user_carts
    FOR SELECT USING (true);

CREATE POLICY "Users can create cart" ON user_carts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own cart" ON user_carts
    FOR UPDATE USING (true);
```

### 2. Activer Realtime pour user_carts

Dans Supabase Dashboard :
1. Allez dans **Database** → **Replication**
2. Activez la réplication pour la table `user_carts`

### 3. Mettre à jour les imports dans les composants

Remplacer :
```javascript
import { getCart, addToCart, saveCart } from '@/utils/cart';
```

Par :
```javascript
import { getCart, addToCart, saveCart } from '@/utils/cart-supabase';
```

**Fichiers à modifier :**
- `src/app/shopping-cart/page.jsx`
- `src/components/product/ProductCard.jsx`
- `src/app/product/[id]/page.jsx`
- `src/app/checkout/page.jsx`
- `src/components/common/CartIndicator.jsx`

### 4. Ajouter la synchronisation Realtime (optionnel mais recommandé)

Dans les composants qui affichent le panier, ajouter :

```javascript
useEffect(() => {
  const channel = subscribeToCartChanges((newCart) => {
    setCartItems(newCart);
  });

  return () => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}, []);
```

---

## 📊 Avantages

### Avant (localStorage)
- ❌ Données locales seulement
- ❌ Pas de synchronisation
- ❌ Perte de données entre appareils

### Après (Supabase)
- ✅ Synchronisation automatique
- ✅ Accessible sur tous les appareils
- ✅ Realtime (changements instantanés)
- ✅ Fallback localStorage (si pas connecté)

---

## 🔄 Migration Progressive

Vous pouvez migrer progressivement :

1. **Phase 1** : Panier (priorité)
2. **Phase 2** : Commandes
3. **Phase 3** : Messages chat
4. **Phase 4** : Wishlist

---

## ⚠️ Notes Importantes

1. **Fallback localStorage** : Si l'utilisateur n'est pas connecté, le panier reste dans localStorage
2. **Performance** : localStorage est utilisé comme cache pour la performance
3. **Realtime** : Les changements sont synchronisés en temps réel entre appareils

---

## 🧪 Test

1. Ajoutez un produit au panier sur votre téléphone
2. Ouvrez le site sur votre ordinateur
3. Le panier devrait être synchronisé automatiquement

---

## 📝 Prochaines Étapes

1. Exécuter le SQL dans Supabase
2. Activer Realtime pour `user_carts`
3. Mettre à jour les imports dans les composants
4. Tester la synchronisation

**Besoin d'aide pour migrer les autres données (commandes, messages, etc.) ?**




