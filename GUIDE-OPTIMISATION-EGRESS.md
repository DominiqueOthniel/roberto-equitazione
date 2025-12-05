# Guide d'Optimisation Egress Supabase

## 🎯 Objectif
Réduire l'egress (bande passante sortante) de Supabase à **0GB/mois** pour rester dans les limites du plan gratuit (2GB/mois).

---

## ✅ Checklist d'Optimisation

### 1. ✅ Rendre les Buckets Privés

**Dans Supabase Dashboard :**

1. Allez dans **Storage**
2. Sélectionnez votre bucket (ex: `product-images`)
3. Cliquez sur **Settings** (⚙️)
4. Désactivez **"Public bucket"**
5. Le bucket devient **privé**

**Résultat :** Les images ne sont plus accessibles publiquement → 0 egress direct

---

### 2. ✅ Utiliser des Signed URLs

**Avantages :**
- URLs temporaires (expirent après 1h par défaut)
- Cache local pour éviter de régénérer les URLs
- Contrôle total sur l'accès

**Utilisation :**
```javascript
import { getSignedUrl } from '@/lib/supabase-storage';

const url = await getSignedUrl('product-images', 'products/sella-1.jpg');
```

**Fichier créé :** `src/lib/supabase-storage.js`

---

### 3. ✅ Réduire la Taille des Images

**Stratégies :**

#### A. Compression avant upload
- Utiliser des outils comme `sharp` ou `imagemin`
- Format WebP au lieu de JPEG
- Qualité 75-85% au lieu de 100%

#### B. Thumbnails au lieu d'images complètes
- Images catalogue : 300x300px
- Images détail : 800x800px
- Images full : seulement si nécessaire

**Fichier créé :** `src/components/ui/OptimizedImage.jsx`

---

### 4. ✅ Désactiver les Téléchargements Répétés

**Cache local :**
- localStorage pour les URLs
- IndexedDB pour les images (optionnel)
- Durée de cache : 1 heure

**Fichier créé :** `src/lib/supabase-storage.js` (fonctions `getCachedImage`, `cacheImage`)

---

### 5. ✅ Corriger les Appels API Infinis

**Problèmes courants :**
- `useEffect` sans dépendances correctes
- Requêtes dans des boucles
- Pas de debounce/throttle

**Solutions :**
- Vérifier les dépendances de `useEffect`
- Utiliser `useMemo` et `useCallback`
- Ajouter des guards pour éviter les appels multiples

**Exemple :**
```javascript
// ❌ MAUVAIS
useEffect(() => {
  fetchProducts(); // Appelé à chaque render
});

// ✅ BON
useEffect(() => {
  let mounted = true;
  async function fetchProducts() {
    const data = await supabase.from('products').select('*');
    if (mounted) setProducts(data);
  }
  fetchProducts();
  return () => { mounted = false; };
}, []); // Seulement au montage
```

---

### 6. ✅ Ajouter des Thumbnails

**Structure recommandée :**
```
product-images/
  ├── products/
  │   ├── sella-1.jpg (image originale)
  │   └── thumbnails/
  │       ├── sella-1_300x300.jpg (catalogue)
  │       └── sella-1_800x800.jpg (détail)
```

**Utilisation :**
```jsx
<OptimizedImage
  src="/products/sella-1.jpg"
  bucket="product-images"
  useThumbnail={true}
  thumbnailWidth={300}
  thumbnailHeight={300}
/>
```

---

### 7. ✅ Ajouter du Cache

**Niveaux de cache :**

1. **Browser Cache** (automatique)
   - Headers `Cache-Control` dans Supabase Storage
   - Durée : 1 heure

2. **LocalStorage Cache** (URLs)
   - Signed URLs mises en cache
   - Durée : 1 heure

3. **Image Cache** (optionnel)
   - IndexedDB pour les images
   - Durée : 1 heure

**Nettoyage automatique :**
- Cache expiré nettoyé au chargement
- Limite de 100 URLs et 50 images en cache

---

## 📊 Résultats Attendus

### Avant Optimisation
- Egress : ~500MB-2GB/mois
- Images téléchargées : À chaque visite
- URLs régénérées : À chaque requête

### Après Optimisation
- Egress : ~0-100MB/mois
- Images téléchargées : Une fois par heure max
- URLs régénérées : Une fois par heure max

---

## 🔧 Configuration Supabase

### 1. Créer le Bucket Privé

```sql
-- Dans Supabase SQL Editor
-- Le bucket sera créé via l'interface, mais vous pouvez vérifier :
SELECT * FROM storage.buckets WHERE name = 'product-images';
```

### 2. Configurer les Politiques RLS

```sql
-- Permettre la lecture avec signed URLs (automatique)
-- Les signed URLs contournent RLS
```

### 3. Upload avec Thumbnails

**Note :** Pour créer automatiquement des thumbnails, vous aurez besoin d'une fonction Edge Function Supabase ou d'un script côté serveur.

**Alternative simple :**
- Upload manuel des thumbnails
- Nommage : `thumbnails/{filename}_{width}x{height}.{ext}`

---

## 🚀 Migration

### Étape 1 : Mettre à jour les Composants

**Avant :**
```jsx
<Image src={product.image} alt={product.name} />
```

**Après :**
```jsx
<OptimizedImage
  src={product.image}
  alt={product.name}
  bucket="product-images"
  useThumbnail={true}
/>
```

### Étape 2 : Mettre à jour ProductCard

**Fichier :** `src/components/product/ProductCard.jsx`

### Étape 3 : Mettre à jour ProductDetailPage

**Fichier :** `src/app/product/[id]/page.jsx`

---

## 📝 Notes Importantes

1. **Signed URLs expirent après 1h** → Le cache local évite de régénérer trop souvent
2. **Thumbnails doivent être créés manuellement** (pour l'instant)
3. **Le cache se nettoie automatiquement** → Pas de risque de surcharge
4. **Les images externes (Unsplash) ne sont pas affectées** → Toujours utilisées directement

---

## 🐛 Dépannage

### Problème : Images ne se chargent pas
- Vérifier que le bucket est bien configuré
- Vérifier que les signed URLs sont générées correctement
- Vérifier la console pour les erreurs

### Problème : Cache trop volumineux
- Le cache se nettoie automatiquement
- Limite : 100 URLs + 50 images
- Nettoyage manuel possible : `cleanExpiredCache()`

### Problème : Egress toujours élevé
- Vérifier qu'il n'y a pas d'appels API infinis
- Vérifier que les thumbnails sont utilisés
- Vérifier que le cache fonctionne

---

## ✅ Checklist Finale

- [ ] Buckets rendus privés dans Supabase
- [ ] Composant `OptimizedImage` utilisé partout
- [ ] Thumbnails créés et uploadés
- [ ] Cache activé et fonctionnel
- [ ] Appels API infinis corrigés
- [ ] Test de réduction d'egress effectué

---

**Résultat attendu : Egress proche de 0GB/mois** 🎉


