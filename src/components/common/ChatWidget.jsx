'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { createNotification } from '@/utils/notifications';
import { getChatMessages, sendChatMessage, subscribeToChatMessages } from '@/utils/chat-supabase';

export default function ChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Vérifier l'authentification
  const checkAuth = () => {
    if (typeof window === 'undefined') return false;
    const user = localStorage.getItem('user');
    return !!user;
  };

  // Set mounted flag et vérifier l'authentification
  useEffect(() => {
    setMounted(true);
    setIsAuthenticated(checkAuth());
  }, []);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen && messages?.length > 1) {
      const lastMessage = messages?.[messages?.length - 1];
      if (lastMessage?.sender === 'agent') {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Charger et écouter les messages
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    // Vérifier l'authentification avant de charger les messages
    if (!checkAuth()) {
      setIsAuthenticated(false);
      // Fermer le chat s'il est ouvert
      if (isOpen) {
        setIsOpen(false);
        router.push('/login');
      }
      return;
    }
    
    setIsAuthenticated(true);

    // Charger les messages depuis Supabase
    const loadMessages = async () => {
      try {
        const messages = await getChatMessages();
        setMessages(messages);
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
        // Message de bienvenue par défaut en cas d'erreur
        setMessages([{
          id: Date.now(),
          sender: 'agent',
          text: 'Ciao! Come posso aiutarti oggi con la selezione della tua sella?',
          timestamp: new Date(),
        }]);
      }
    };

    const handleAdminMessage = (event) => {
      const adminMessage = event.detail;
      if (adminMessage && adminMessage.sender === 'agent') {
        const formattedMessage = {
          ...adminMessage,
          timestamp: adminMessage.timestamp ? new Date(adminMessage.timestamp) : new Date()
        };
        
        // Ajouter au state seulement si ce n'est pas déjà présent
        setMessages(prev => {
          // Vérifier si le message existe déjà
          const exists = prev.some(m => m.id === adminMessage.id);
          if (exists) return prev;
          
          return [...prev, formattedMessage];
        });
      }
    };

    const handleOpenChat = () => {
      // Vérifier l'authentification avant d'ouvrir le chat
      if (!checkAuth()) {
        setIsAuthenticated(false);
        router.replace('/login');
        return;
      }
      setIsAuthenticated(true);
      setIsOpen(true);
      setIsMinimized(false);
    };

    // Charger les messages au montage
    loadMessages();

    // S'abonner aux messages en temps réel seulement si authentifié
    let subscription = null;
    if (checkAuth()) {
      subscribeToChatMessages((newMessage) => {
        // Ne pas réagir si une navigation est en cours
        if (window.__isNavigating) return;
        // Vérifier l'authentification avant d'ajouter le message
        if (!checkAuth()) {
          return;
        }
        setMessages(prev => {
          // Vérifier si le message existe déjà
          const exists = prev.some(m => m.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      }).then((channel) => {
        subscription = channel;
      }).catch((error) => {
        console.error('Erreur lors de l\'abonnement aux messages:', error);
      });
    }

    // Écouter les événements personnalisés
    window.addEventListener('newAdminMessage', handleAdminMessage);
    window.addEventListener('openChat', handleOpenChat);
    
    // Écouter les changements d'authentification
    const handleAuthChange = () => {
      // Ne pas réagir si une navigation est en cours
      if (window.__isNavigating) return;
      // Utiliser setTimeout pour éviter les mises à jour d'état pendant le démontage
      setTimeout(() => {
        if (window.__isNavigating || !mounted) return;
        const authStatus = checkAuth();
        setIsAuthenticated(authStatus);
        if (!authStatus) {
          if (isOpen) {
            setIsOpen(false);
          }
          // Vider les messages si l'utilisateur se déconnecte
          setMessages([]);
          router.replace('/login');
        }
      }, 0);
    };
    
    window.addEventListener('userLoggedIn', handleAuthChange);
    window.addEventListener('userLoggedOut', handleAuthChange);

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      window.removeEventListener('newAdminMessage', handleAdminMessage);
      window.removeEventListener('openChat', handleOpenChat);
      window.removeEventListener('userLoggedIn', handleAuthChange);
      window.removeEventListener('userLoggedOut', handleAuthChange);
    };
  }, [mounted, isOpen, router]);

  const toggleChat = () => {
    // Vérifier l'authentification avant d'ouvrir le chat
    if (!checkAuth()) {
      setIsAuthenticated(false);
      router.replace('/login');
      return;
    }
    setIsAuthenticated(true);
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendMessage = async () => {
    // Vérifier l'authentification avant d'envoyer un message
    if (!checkAuth() || !isAuthenticated) {
      setIsOpen(false);
      router.replace('/login');
      return;
    }
    
    if (inputValue?.trim() || selectedImage) {
      const now = new Date();
      const newMessage = {
        id: Date.now(), // ID temporaire, sera remplacé par Supabase
        sender: 'user',
        text: inputValue?.trim(),
        image: imagePreview,
        timestamp: now,
      };

      // Ajouter immédiatement au state pour un feedback instantané
      setMessages(prev => [...prev, newMessage]);
      
      // Envoyer à Supabase seulement si toujours authentifié
      if (!checkAuth()) {
        setIsOpen(false);
        router.replace('/login');
        // Retirer le message du state
        setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
        return;
      }
      
      try {
        // Récupérer l'email de l'utilisateur AVANT l'envoi pour la notification
        let userEmail = 'client';
        try {
          const user = localStorage.getItem('user');
          if (user) {
            const userData = JSON.parse(user);
            userEmail = userData.email || 'client';
          }
        } catch (e) {
          console.warn('Impossible de récupérer l\'email utilisateur:', e);
        }
        
        const savedMessage = await sendChatMessage(newMessage);
        
        // Vérifier à nouveau l'authentification après l'envoi
        if (!checkAuth()) {
          setIsOpen(false);
          router.replace('/login');
          return;
        }
        
        // Remplacer le message temporaire par celui de Supabase
        if (savedMessage && savedMessage.id !== newMessage.id) {
          setMessages(prev => prev.map(msg => 
            msg.id === newMessage.id ? savedMessage : msg
          ));
        }
        
        // Créer une notification pour l'admin IMMÉDIATEMENT (synchrone)
        createNotification(
          'message',
          'Nouveau message',
          newMessage.text || 'Image partagée',
          { 
            messageId: savedMessage?.id || newMessage.id,
            userEmail: userEmail
          }
        );
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        // Si l'erreur est due à un manque d'authentification, rediriger
        if (error.message?.includes('auth') || error.message?.includes('unauthorized')) {
          setIsOpen(false);
          router.replace('/login');
        }
      }
      
      setInputValue('');
      setSelectedImage(null);
      setImagePreview(null);

      // Ne plus envoyer de réponse automatique - l'admin répondra
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageSelect = (e) => {
    // Vérifier l'authentification avant de sélectionner une image
    if (!checkAuth() || !isAuthenticated) {
      setIsOpen(false);
      router.replace('/login');
      return;
    }
    
    const file = e?.target?.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader?.result);
      };
      reader?.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    
    // Convertir en Date si c'est une string
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Vérifier que la date est valide
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Ne rien afficher si l'utilisateur n'est pas authentifié
  if (!isAuthenticated && mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-400">
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="relative flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg transition-base hover:bg-accent hover:scale-110"
          aria-label="Apri chat"
        >
          <Icon name="ChatBubbleLeftRightIcon" size={28} variant="outline" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-error text-error-foreground text-xs font-mono font-medium rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}
      {isOpen && (
        <div
          className={`flex flex-col bg-popover border border-border rounded-lg shadow-modal overflow-hidden transition-slow ${
            isMinimized ? 'h-14' : 'h-[500px]'
          } w-80 md:w-96`}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-foreground rounded-full flex items-center justify-center">
                <Icon
                  name="UserIcon"
                  size={20}
                  variant="solid"
                  className="text-primary"
                />
              </div>
              <div>
                <p className="text-sm font-body font-semibold">
                  Assistenza Roberto
                </p>
                <p className="text-xs font-caption opacity-90">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMinimize}
                className="p-1 rounded transition-fast hover:bg-primary-foreground/20"
                aria-label={isMinimized ? 'Espandi' : 'Minimizza'}
              >
                <Icon
                  name={isMinimized ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                  size={20}
                  variant="outline"
                />
              </button>
              <button
                onClick={toggleChat}
                className="p-1 rounded transition-fast hover:bg-primary-foreground/20"
                aria-label="Chiudi chat"
              >
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-background">
                {messages?.map((message) => (
                  <div
                    key={message?.id}
                    className={`flex ${
                      message?.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] ${
                        message?.sender === 'user' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground'
                      } rounded-lg px-3 py-2 shadow-sm`}
                    >
                      {message?.image && (
                        <div className="mb-2">
                          <AppImage
                            src={message?.image}
                            alt="Immagine allegata"
                            className="rounded max-w-full h-auto"
                          />
                        </div>
                      )}
                      {message?.text && (
                        <p className="text-sm font-body">{message?.text}</p>
                      )}
                      {message?.timestamp && (
                        <p className="text-xs font-caption opacity-70 mt-1">
                          {formatTime(message?.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-border bg-surface p-3">
                {imagePreview && (
                  <div className="relative mb-2 inline-block">
                    <AppImage
                      src={imagePreview}
                      alt="Anteprima immagine"
                      className="rounded max-h-20 w-auto"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 p-1 bg-error text-error-foreground rounded-full shadow-sm transition-fast hover:scale-110"
                      aria-label="Rimuovi immagine"
                    >
                      <Icon name="XMarkIcon" size={14} variant="outline" />
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef?.current?.click()}
                    className="p-2 text-text-secondary rounded-md transition-fast hover:bg-muted hover:text-primary"
                    aria-label="Allega immagine"
                  >
                    <Icon name="PhotoIcon" size={20} variant="outline" />
                  </button>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e?.target?.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Scrivi un messaggio..."
                    rows="1"
                    className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm font-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue?.trim() && !selectedImage}
                    className="p-2 bg-primary text-primary-foreground rounded-md transition-fast hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Invia messaggio"
                  >
                    <Icon name="PaperAirplaneIcon" size={20} variant="outline" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}