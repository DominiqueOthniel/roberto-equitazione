# Migration des Notifications vers Supabase

Ce guide explique comment migrer le système de notifications de `localStorage` vers Supabase.

## 📋 Prérequis

1. Avoir exécuté le fichier SQL `supabase-notifications-schema.sql` dans Supabase SQL Editor
2. Avoir les variables d'environnement Supabase configurées dans `.env.local`

## 🔄 Étapes de Migration

### 1. Exécuter le schéma SQL

Ouvrez le SQL Editor dans Supabase et exécutez le contenu de `supabase-notifications-schema.sql`.

### 2. Mettre à jour les imports

Remplacez les imports de `notifications.js` par `notifications-supabase.js` dans les fichiers suivants :

- `src/components/admin/NotificationBell.jsx`
- `src/components/common/ChatWidget.jsx`
- `src/app/checkout/page.jsx`

**Avant :**
```javascript
import { createNotification } from '@/utils/notifications';
```

**Après :**
```javascript
import { createNotification } from '@/utils/notifications-supabase';
```

### 3. Mettre à jour NotificationBell.jsx

Dans `src/components/admin/NotificationBell.jsx`, remplacez :

```javascript
import { getNotifications, markNotificationAsRead, deleteNotification, getUnreadCount } from '@/utils/notifications';
```

Par :

```javascript
import { getNotifications, markNotificationAsRead, deleteNotification, getUnreadCount, subscribeToNotifications } from '@/utils/notifications-supabase';
```

Et ajoutez l'abonnement en temps réel :

```javascript
useEffect(() => {
  loadNotifications();
  
  // S'abonner aux notifications en temps réel
  const channel = subscribeToNotifications((payload) => {
    console.log('🔔 Notification reçue:', payload);
    loadNotifications();
  });
  
  return () => {
    if (channel) {
      channel.unsubscribe();
    }
  };
}, []);
```

### 4. Migrer les notifications existantes

Ajoutez un appel à la fonction de migration dans `src/app/admin/layout.jsx` ou dans `NotificationBell.jsx` :

```javascript
import { migrateNotificationsFromLocalStorage } from '@/utils/notifications-supabase';

useEffect(() => {
  // Migrer les notifications de localStorage vers Supabase (une seule fois)
  migrateNotificationsFromLocalStorage();
}, []);
```

### 5. Tester la migration

1. Vérifiez que les notifications s'affichent correctement
2. Testez la création d'une nouvelle notification
3. Testez le marquage comme lu
4. Testez la suppression
5. Vérifiez que les notifications en temps réel fonctionnent

## ✅ Avantages de Supabase

- **Persistance** : Les notifications sont stockées dans la base de données, pas seulement dans le navigateur
- **Synchronisation** : Les notifications sont synchronisées entre tous les appareils
- **Temps réel** : Les notifications arrivent en temps réel grâce aux subscriptions Supabase
- **Historique** : Les notifications sont conservées même après fermeture du navigateur
- **Multi-utilisateurs** : Plusieurs admins peuvent voir les mêmes notifications

## 🔄 Fallback automatique

Le système inclut un fallback automatique vers `localStorage` si :
- Supabase n'est pas configuré
- Une erreur se produit lors d'une opération Supabase
- L'utilisateur est hors ligne

## 📝 Notes

- Les notifications sont limitées à 100 dans Supabase (nettoyage automatique)
- Les anciennes notifications dans `localStorage` seront supprimées après migration
- Les notifications sont accessibles uniquement aux admins (RLS activé)

