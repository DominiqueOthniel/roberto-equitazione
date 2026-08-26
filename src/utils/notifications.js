/**
 * Utility functions for managing admin notifications
 */

/**
 * Create a new notification
 */
export function createNotification(type, title, message, metadata = {}) {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem('adminNotifications');
    const notifications = stored ? JSON.parse(stored) : [];

    const newNotification = {
      id: Date.now() + Math.random(),
      type, // 'order' or 'message'
      title,
      message,
      date: new Date().toISOString(),
      read: false,
      ...metadata,
    };

    notifications.unshift(newNotification);
    
    // Garder seulement les 50 dernières notifications
    const limited = notifications.slice(0, 50);
    
    localStorage.setItem('adminNotifications', JSON.stringify(limited));
    
    // Déclencher un événement pour mettre à jour les composants
    window.dispatchEvent(new CustomEvent('newNotification', { detail: newNotification }));
    
    // Déclencher aussi un événement spécifique selon le type
    if (type === 'order') {
      window.dispatchEvent(new CustomEvent('newOrder'));
    } else if (type === 'message') {
      window.dispatchEvent(new CustomEvent('newMessage'));
    }
    
    return newNotification;
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    return null;
  }
}

/**
 * Get all notifications
 */
export function getNotifications() {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('adminNotifications');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(id) {
  if (typeof window === 'undefined') return;
  
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
    console.error('Erreur lors de la mise à jour de la notification:', error);
    return [];
  }
}

/**
 * Delete notification
 */
export function deleteNotification(id) {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem('adminNotifications');
    const notifications = stored ? JSON.parse(stored) : [];
    
    const updated = notifications.filter(n => n.id !== id);
    localStorage.setItem('adminNotifications', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('notificationUpdated'));
    
    return updated;
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    return [];
  }
}

/**
 * Get unread count
 */
export function getUnreadCount() {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
}














