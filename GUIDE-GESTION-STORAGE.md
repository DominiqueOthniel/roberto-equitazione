# Guide de Gestion du Stockage Supabase

## 📊 Vue d'ensemble

Quand votre bucket Supabase Storage sera plein, vous avez plusieurs options pour gérer l'espace disponible.

## 🎯 Options disponibles

### 1. **Nettoyer les images orphelines** (Recommandé en premier)

Les images orphelines sont des images qui ne sont plus utilisées par aucun produit.

**Comment faire :**
1. Allez dans `/admin/storage`
2. Cliquez sur l'onglet "Images Orphelines"
3. Sélectionnez les images à supprimer
4. Cliquez sur "Supprimer X image(s)"

**Avantages :**
- Libère immédiatement de l'espace
- Gratuit
- Pas de risque pour les produits actifs

### 2. **Optimiser les images avant l'upload**

Avant d'uploader des images, optimisez-les pour réduire leur taille :

**Outils recommandés :**
- [TinyPNG](https://tinypng.com/) - Compression PNG/JPG
- [Squoosh](https://squoosh.app/) - Compression avancée
- [ImageOptim](https://imageoptim.com/) - Pour Mac

**Bonnes pratiques :**
- Redimensionnez les images à la taille d'affichage maximale nécessaire
- Utilisez le format WebP si possible (meilleure compression)
- Compressez les images avant l'upload

### 3. **Upgrader votre plan Supabase**

Si vous avez besoin de plus d'espace :

**Plans disponibles :**
- **Free** : 1 GB de storage
- **Pro** : 100 GB de storage ($25/mois)
- **Team** : 200 GB de storage ($599/mois)

**Comment upgrader :**
1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Cliquez sur "Upgrade" dans les paramètres du projet
3. Choisissez votre plan

### 4. **Archiver les anciennes images**

Si vous ne voulez pas supprimer les images mais libérer de l'espace :

**Options :**
- Téléchargez les anciennes images localement
- Utilisez un service de stockage externe (AWS S3, Cloudinary, etc.)
- Archivez les images dans un autre bucket Supabase

### 5. **Supprimer manuellement les images inutilisées**

**Via l'interface d'administration :**
1. Allez dans `/admin/storage`
2. Cliquez sur "Tous les Fichiers"
3. Identifiez les images à supprimer
4. Cliquez sur "Supprimer" pour chaque image

## 🔧 Fonctionnalités de la page de gestion

### Vue d'ensemble
- Affiche le nombre total de fichiers
- Affiche la taille totale utilisée
- Affiche le nombre d'images orphelines

### Images Orphelines
- Liste toutes les images non utilisées
- Permet de sélectionner plusieurs images
- Suppression en masse
- Aperçu des images avant suppression

### Tous les Fichiers
- Liste complète de tous les fichiers
- Informations sur la taille et la date de création
- Suppression individuelle

## ⚠️ Précautions importantes

1. **Sauvegarde** : Avant de supprimer des images, assurez-vous d'avoir une sauvegarde
2. **Vérification** : Vérifiez que les images orphelines ne sont vraiment pas utilisées ailleurs
3. **Test** : Testez d'abord avec quelques images avant de supprimer en masse

## 📈 Surveillance de l'utilisation

Pour surveiller votre utilisation du storage :

1. **Via Supabase Dashboard :**
   - Allez sur votre projet Supabase
   - Section "Storage" → Voir l'utilisation

2. **Via l'interface d'administration :**
   - Allez dans `/admin/storage`
   - La vue d'ensemble affiche les statistiques

## 🚨 Que faire si le bucket est plein ?

Si vous recevez une erreur "Storage quota exceeded" :

1. **Immédiatement :**
   - Allez dans `/admin/storage`
   - Supprimez les images orphelines
   - Cela devrait libérer de l'espace rapidement

2. **Court terme :**
   - Optimisez les nouvelles images avant upload
   - Supprimez les anciennes versions d'images

3. **Long terme :**
   - Considérez upgrader votre plan Supabase
   - Implémentez une stratégie d'archivage automatique

## 💡 Conseils pour éviter que le bucket soit plein

1. **Optimisez toujours les images** avant l'upload
2. **Nettoyez régulièrement** les images orphelines (mensuellement)
3. **Surveillez l'utilisation** via le dashboard Supabase
4. **Utilisez des formats modernes** (WebP au lieu de PNG/JPG quand possible)
5. **Redimensionnez les images** à la taille d'affichage réelle

## 🔗 Ressources utiles

- [Documentation Supabase Storage](https://supabase.com/docs/guides/storage)
- [Pricing Supabase](https://supabase.com/pricing)
- [Guide d'optimisation d'images](https://web.dev/fast/#optimize-your-images)



