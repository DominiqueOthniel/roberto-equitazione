'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { createNotification } from '@/utils/notifications';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([]);
  
  // Set mounted flag
  useEffect(() => {
    setMounted(true);
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
    if (!mounted) return;

    // Charger les messages depuis localStorage au montage
    const loadMessages = () => {
      try {
        const chatMessages = localStorage.getItem('chatMessages');
        if (chatMessages) {
          const allMessages = JSON.parse(chatMessages);
          // Convertir les timestamps en Date
          const formattedMessages = allMessages.map(msg => {
            let timestamp;
            if (msg.timestamp instanceof Date) {
              timestamp = msg.timestamp;
            } else if (msg.timestamp) {
              timestamp = new Date(msg.timestamp);
              // Si la conversion a échoué, utiliser la date actuelle
              if (isNaN(timestamp.getTime())) {
                timestamp = new Date();
              }
            } else {
              timestamp = new Date();
            }
            return {
              ...msg,
              timestamp
            };
          });
          // Trier par timestamp
          formattedMessages.sort((a, b) => {
            const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
            const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
            return timeA - timeB;
          });
          
          // Si aucun message, ajouter le message de bienvenue
          if (formattedMessages.length === 0) {
            const welcomeDate = new Date();
            const welcomeMessage = {
              id: Date.now(),
              sender: 'agent',
              text: 'Ciao! Come posso aiutarti oggi con la selezione della tua sella?',
              timestamp: welcomeDate,
            };
            formattedMessages.push(welcomeMessage);
            // Sauvegarder le message de bienvenue avec timestamp en ISO string
            localStorage.setItem('chatMessages', JSON.stringify([{
              ...welcomeMessage,
              timestamp: welcomeDate.toISOString()
            }]));
          }
          
          setMessages(formattedMessages);
        } else {
          // Premier message de bienvenue si aucun message sauvegardé
          const welcomeDate = new Date();
          const welcomeMessage = {
            id: Date.now(),
            sender: 'agent',
            text: 'Ciao! Come posso aiutarti oggi con la selezione della tua sella?',
            timestamp: welcomeDate,
          };
          setMessages([welcomeMessage]);
          localStorage.setItem('chatMessages', JSON.stringify([{
            ...welcomeMessage,
            timestamp: welcomeDate.toISOString()
          }]));
        }
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
          
          const updated = [...prev, formattedMessage];
          
          // Sauvegarder dans localStorage
          try {
            const chatMessages = localStorage.getItem('chatMessages');
            const allMessages = chatMessages ? JSON.parse(chatMessages) : [];
            
            // Vérifier si le message existe déjà dans localStorage
            const existsInStorage = allMessages.some(m => m.id === adminMessage.id);
            if (!existsInStorage) {
              allMessages.push({
                ...adminMessage,
                timestamp: adminMessage.timestamp || new Date().toISOString()
              });
              const limited = allMessages.slice(-100);
              localStorage.setItem('chatMessages', JSON.stringify(limited));
            }
          } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
          }
          
          return updated;
        });
      }
    };

    const handleOpenChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    loadMessages();
    window.addEventListener('newAdminMessage', handleAdminMessage);
    window.addEventListener('storage', loadMessages);
    window.addEventListener('openChat', handleOpenChat);

    return () => {
      window.removeEventListener('newAdminMessage', handleAdminMessage);
      window.removeEventListener('storage', loadMessages);
      window.removeEventListener('openChat', handleOpenChat);
    };
  }, [mounted]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendMessage = () => {
    if (inputValue?.trim() || selectedImage) {
      const now = new Date();
      const newMessage = {
        id: Date.now(),
        sender: 'user',
        text: inputValue?.trim(),
        image: imagePreview,
        timestamp: now,
      };

      const messageToSave = {
        ...newMessage,
        timestamp: now.toISOString(),
      };
      
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      
      // Sauvegarder les messages dans localStorage
      try {
        const chatMessages = localStorage.getItem('chatMessages');
        const allMessages = chatMessages ? JSON.parse(chatMessages) : [];
        allMessages.push(messageToSave);
        // Garder seulement les 100 derniers messages
        const limited = allMessages.slice(-100);
        localStorage.setItem('chatMessages', JSON.stringify(limited));
        
        // Créer une notification pour l'admin
        createNotification(
          'message',
          'Nouveau message',
          newMessage.text || 'Image partagée',
          { messageId: messageToSave.id }
        );
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du message:', error);
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