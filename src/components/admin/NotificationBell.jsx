'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { getNotifications, markNotificationAsRead, deleteNotification, getUnreadCount } from '@/utils/notifications';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const loadNotifications = () => {
    const allNotifications = getNotifications();
    
    // Trier par date (plus récentes en premier)
    const sorted = allNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));
    setNotifications(sorted);
    
    // Compter les non lues
    const unread = getUnreadCount();
    setUnreadCount(unread);
  };

  useEffect(() => {
    loadNotifications();
    
    // Détecter si on est sur mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Écouter les nouvelles notifications
    const handleStorageChange = (e) => {
      // L'événement storage ne se déclenche que dans d'autres onglets
      // Mais on l'écoute quand même pour la synchronisation multi-onglets
      if (e.key === 'adminNotifications' || e.key === null) {
        loadNotifications();
      }
    };
    
    const handleNewOrder = () => {
      // Recharger immédiatement quand un nouvel ordre est créé
      // Sur mobile, utiliser requestAnimationFrame pour une meilleure performance
      if (isMobile) {
        requestAnimationFrame(() => {
          setTimeout(() => loadNotifications(), 50);
        });
      } else {
        setTimeout(() => loadNotifications(), 100);
      }
    };
    
    const handleNewMessage = () => {
      // Recharger immédiatement quand un nouveau message arrive
      if (isMobile) {
        requestAnimationFrame(() => {
          setTimeout(() => loadNotifications(), 50);
        });
      } else {
        setTimeout(() => loadNotifications(), 100);
      }
    };
    
    const handleNewNotification = (e) => {
      // Recharger immédiatement quand une nouvelle notification est créée
      // L'événement peut contenir les détails de la notification dans e.detail
      if (isMobile) {
        requestAnimationFrame(() => {
          setTimeout(() => loadNotifications(), 50);
        });
      } else {
        setTimeout(() => loadNotifications(), 100);
      }
    };
    
    const handleNotificationUpdated = () => {
      // Recharger quand une notification est mise à jour
      loadNotifications();
    };
    
    // Détecter quand la page redevient visible (important sur mobile)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Recharger les notifications quand l'utilisateur revient sur l'onglet
        loadNotifications();
      }
    };
    
    // Détecter quand la fenêtre reprend le focus (mobile)
    const handleFocus = () => {
      loadNotifications();
    };
    
    // Écouter l'événement storage pour la synchronisation multi-onglets
    window.addEventListener('storage', handleStorageChange);
    
    // Écouter les événements personnalisés (ceux-ci fonctionnent dans le même onglet)
    window.addEventListener('newOrder', handleNewOrder);
    window.addEventListener('newMessage', handleNewMessage);
    window.addEventListener('newNotification', handleNewNotification);
    window.addEventListener('notificationUpdated', handleNotificationUpdated);
    
    // Écouter les changements de visibilité (important sur mobile)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Vérifier périodiquement les nouvelles notifications (backup)
    // Sur mobile, vérifier plus souvent car les événements peuvent être moins fiables
    const interval = setInterval(loadNotifications, isMobile ? 1000 : 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('newOrder', handleNewOrder);
      window.removeEventListener('newMessage', handleNewMessage);
      window.removeEventListener('newNotification', handleNewNotification);
      window.removeEventListener('notificationUpdated', handleNotificationUpdated);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAsRead = (id) => {
    markNotificationAsRead(id);
    loadNotifications();
  };

  const markAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.read) {
        markNotificationAsRead(n.id);
      }
    });
    loadNotifications();
  };

  const deleteNotif = (id) => {
    deleteNotification(id);
    loadNotifications();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return 'ClipboardDocumentListIcon';
      case 'message':
        return 'ChatBubbleLeftRightIcon';
      case 'customer':
        return 'UserPlusIcon';
      default:
        return 'BellIcon';
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.type === 'order') {
      return `/admin/orders${notification.orderId ? `#${notification.orderId}` : ''}`;
    }
    if (notification.type === 'message') {
      // Si c'est une notification de nouveau client, rediriger vers customers
      if (notification.customerId && notification.type === 'customer_registration') {
        return `/admin/customers${notification.customerId ? `#${notification.customerId}` : ''}`;
      }
      return `/admin/messages${notification.messageId ? `#${notification.messageId}` : ''}`;
    }
    return '/admin';
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return notifDate.toLocaleDateString('fr-FR');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md hover:bg-muted transition-fast text-text-primary"
        aria-label="Notifications"
        type="button"
      >
        <Icon name="BellIcon" size={20} variant="outline" className="text-text-primary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-semibold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-lg shadow-lg z-50 max-h-[500px] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-heading font-bold text-text-primary">Notifiche</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary hover:underline"
              >
                Segna tutte come lette
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                <Icon name="BellIcon" size={32} variant="outline" className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nessuna notifica</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={getNotificationLink(notification)}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      setIsOpen(false);
                    }}
                    className={`block p-4 hover:bg-muted transition-fast ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.type === 'order' 
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        <Icon 
                          name={getNotificationIcon(notification.type)} 
                          size={20} 
                          variant="outline" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-text-primary mb-1">
                          {notification.title}
                        </p>
                        <p className="text-sm text-text-secondary line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {formatTime(notification.date)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteNotif(notification.id);
                        }}
                        className="flex-shrink-0 p-1 rounded hover:bg-muted text-text-secondary"
                      >
                        <Icon name="XMarkIcon" size={14} variant="outline" />
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

