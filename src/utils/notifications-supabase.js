/**
 * Utility functions for managing admin notifications with Supabase
 * This replaces the localStorage-based notifications system
 */

import { supabase } from '@/lib/supabase';

/**
 * Create a new notification in Supabase
 */
export async function createNotification(type, title, message, metadata = {}) {
  if (!supabase || typeof window === 'undefined') {
    // Fallback vers localStorage si Supabase n'est pas configuré
    return createNotificationLocalStorage(type, title, message, metadata);
  }

  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        type,
        title,
        message,
        read: false,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la notification:', error);
      // Fallback vers localStorage en cas d'erreur
      return createNotificationLocalStorage(type, title, message, metadata);
    }

    // Déclencher les événements pour mettre à jour l'UI
    triggerNotificationEvents(data);

    return data;
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    // Fallback vers localStorage en cas d'erreur
    return createNotificationLocalStorage(type, title, message, metadata);
  }
}

/**
 * Get all notifications from Supabase
 */
export async function getNotifications() {
  if (!supabase || typeof window === 'undefined') {
    // Fallback vers localStorage
    return getNotificationsLocalStorage();
  }

  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      return getNotificationsLocalStorage();
    }

    // Transformer les données pour correspondre au format attendu
    return data.map(notif => ({
      id: notif.id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      read: notif.read,
      date: notif.created_at,
      ...notif.metadata
    }));
  } catch (error) {
    console.error('Erreur lors du chargement des notifications:', error);
    return getNotificationsLocalStorage();
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id) {
  if (!supabase || typeof window === 'undefined') {
    // Fallback vers localStorage
    return markNotificationAsReadLocalStorage(id);
  }

  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
      return markNotificationAsReadLocalStorage(id);
    }

    // Déclencher l'événement de mise à jour
    window.dispatchEvent(new CustomEvent('notificationUpdated', {
      bubbles: true,
      cancelable: true
    }));

    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    return markNotificationAsReadLocalStorage(id);
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(id) {
  if (!supabase || typeof window === 'undefined') {
    // Fallback vers localStorage
    return deleteNotificationLocalStorage(id);
  }

  try {
    const { error } = await supabase
      .from('admin_notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      return deleteNotificationLocalStorage(id);
    }

    // Déclencher l'événement de mise à jour
    window.dispatchEvent(new CustomEvent('notificationUpdated', {
      bubbles: true,
      cancelable: true
    }));

    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    return deleteNotificationLocalStorage(id);
  }
}

/**
 * Get unread count
 */
export async function getUnreadCount() {
  if (!supabase || typeof window === 'undefined') {
    // Fallback vers localStorage
    return getUnreadCountLocalStorage();
  }

  try {
    const { count, error } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    if (error) {
      console.error('Erreur lors du comptage des notifications:', error);
      return getUnreadCountLocalStorage();
    }

    return count || 0;
  } catch (error) {
    console.error('Erreur lors du comptage des notifications:', error);
    return getUnreadCountLocalStorage();
  }
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(callback) {
  if (!supabase) {
    console.warn('Supabase not configured, real-time subscriptions disabled');
    return null;
  }

  const channel = supabase
    .channel('admin_notifications')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'admin_notifications'
      },
      (payload) => {
        console.log('🔔 Nouvelle notification reçue:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Migrate notifications from localStorage to Supabase
 */
export async function migrateNotificationsFromLocalStorage() {
  if (typeof window === 'undefined' || !supabase) return;

  try {
    const stored = localStorage.getItem('adminNotifications');
    if (!stored) return;

    const notifications = JSON.parse(stored);
    if (!Array.isArray(notifications) || notifications.length === 0) return;

    console.log('🔄 Migration de', notifications.length, 'notifications vers Supabase...');

    // Insérer toutes les notifications dans Supabase
    const notificationsToInsert = notifications.map(notif => ({
      type: notif.type || 'system',
      title: notif.title || 'Notification',
      message: notif.message || '',
      read: notif.read || false,
      metadata: {
        orderId: notif.orderId,
        messageId: notif.messageId,
        customerId: notif.customerId,
        ...notif
      }
    }));

    const { error } = await supabase
      .from('admin_notifications')
      .insert(notificationsToInsert);

    if (error) {
      console.error('Erreur lors de la migration:', error);
      return;
    }

    // Supprimer les notifications de localStorage après migration réussie
    localStorage.removeItem('adminNotifications');
    console.log('✅ Migration terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  }
}

// ============================================
// Fonctions de fallback localStorage
// ============================================

function createNotificationLocalStorage(type, title, message, metadata = {}) {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('adminNotifications');
    const notifications = stored ? JSON.parse(stored) : [];

    const newNotification = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
      ...metadata,
    };

    notifications.unshift(newNotification);
    const limited = notifications.slice(0, 50);
    localStorage.setItem('adminNotifications', JSON.stringify(limited));

    triggerNotificationEvents(newNotification);
    return newNotification;
  } catch (error) {
    console.error('Erreur lors de la création de la notification (localStorage):', error);
    return null;
  }
}

function getNotificationsLocalStorage() {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('adminNotifications');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des notifications (localStorage):', error);
    return [];
  }
}

function markNotificationAsReadLocalStorage(id) {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('adminNotifications');
    const notifications = stored ? JSON.parse(stored) : [];
    
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    
    localStorage.setItem('adminNotifications', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('notificationUpdated'));
    
    return updated;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification (localStorage):', error);
    return [];
  }
}

function deleteNotificationLocalStorage(id) {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('adminNotifications');
    const notifications = stored ? JSON.parse(stored) : [];
    
    const updated = notifications.filter(n => n.id !== id);
    localStorage.setItem('adminNotifications', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('notificationUpdated'));
    
    return updated;
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification (localStorage):', error);
    return [];
  }
}

function getUnreadCountLocalStorage() {
  const notifications = getNotificationsLocalStorage();
  return notifications.filter(n => !n.read).length;
}

function triggerNotificationEvents(notification) {
  requestAnimationFrame(() => {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('newNotification', { 
        detail: notification,
        bubbles: true,
        cancelable: true
      }));
      
      if (notification.type === 'order') {
        window.dispatchEvent(new CustomEvent('newOrder', {
          detail: notification,
          bubbles: true,
          cancelable: true
        }));
      } else if (notification.type === 'message') {
        window.dispatchEvent(new CustomEvent('newMessage', {
          detail: notification,
          bubbles: true,
          cancelable: true
        }));
      }
      
      window.dispatchEvent(new CustomEvent('notificationUpdated', {
        bubbles: true,
        cancelable: true
      }));
    }, 0);
  });
}

