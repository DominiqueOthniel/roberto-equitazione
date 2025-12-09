'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import Image from 'next/image';
import { getAllChatMessages, subscribeToAllChatMessages, sendAdminReply, deleteChatMessages } from '@/utils/chat-supabase';
import { createNotification } from '@/utils/notifications';

// Fonction pour charger les conversations depuis Supabase
const loadConversationsFromSupabase = async () => {
  if (typeof window === 'undefined') return [];
  
  try {
    console.log('📥 [Admin] Chargement conversations depuis Supabase...');
    const allMessages = await getAllChatMessages();
    
    if (!Array.isArray(allMessages) || allMessages.length === 0) {
      console.log('ℹ️ [Admin] Aucun message trouvé');
      return [];
    }
    
    // Grouper les messages par user_email (chaque email = une conversation)
    const conversationsMap = new Map();
    
    // Récupérer les informations des clients depuis Supabase
    const { getCustomers } = await import('@/utils/customers-supabase');
    let customers = [];
    try {
      customers = await getCustomers();
    } catch (error) {
      console.warn('⚠️ [Admin] Erreur lors du chargement des clients:', error);
    }
    
    // Créer un map des clients par email
    const customersMap = new Map();
    customers.forEach(customer => {
      if (customer.email) {
        customersMap.set(customer.email.toLowerCase(), customer);
      }
    });
    
    // Grouper les messages par user_email
    allMessages.forEach((msg) => {
      const userEmail = msg.user_email || 'guest';
      const normalizedEmail = userEmail.toLowerCase();
      
      // Récupérer les infos du client
      const customer = customersMap.get(normalizedEmail) || {
        id: normalizedEmail,
        name: normalizedEmail.includes('@') ? normalizedEmail.split('@')[0] : 'Client',
        email: normalizedEmail,
        avatar: null
      };
      
      // Créer la conversation si elle n'existe pas
      if (!conversationsMap.has(normalizedEmail)) {
        conversationsMap.set(normalizedEmail, {
          id: normalizedEmail,
          customer: {
            id: customer.id || normalizedEmail,
            name: customer.name || customer.email || 'Client',
            email: customer.email || normalizedEmail,
            avatar: null
          },
          subject: 'Conversation Chat',
          status: 'open',
          priority: 'normal',
          unreadCount: 0,
          lastMessage: null,
          firstMessage: null,
          messages: []
        });
      }
      
      const conversation = conversationsMap.get(normalizedEmail);
      
      // Normaliser le sender : 'user' devient 'customer' pour l'affichage admin
      const normalizedSender = (msg.sender === 'user' || msg.sender === 'customer') ? 'customer' : msg.sender;
      
      conversation.messages.push({
        id: msg.id,
        sender: normalizedSender,
        text: msg.text || '',
        image: msg.image || null,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      });
    });
    
    // Traiter chaque conversation
    conversationsMap.forEach((conversation) => {
      // Trier les messages par date
      conversation.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Trouver le premier et dernier message
      if (conversation.messages.length > 0) {
        conversation.firstMessage = conversation.messages[0].timestamp;
        const lastMsg = conversation.messages[conversation.messages.length - 1];
        conversation.lastMessage = {
          text: lastMsg.text || (lastMsg.image ? 'Image partagée' : 'Message'),
          timestamp: lastMsg.timestamp,
          sender: lastMsg.sender
        };
      }
      
      // Compter les messages non lus
      conversation.unreadCount = 0;
      let lastAgentMessageIndex = -1;
      conversation.messages.forEach((msg, index) => {
        if (msg.sender === 'agent') {
          lastAgentMessageIndex = index;
        }
      });
      
      if (lastAgentMessageIndex >= 0) {
        conversation.unreadCount = conversation.messages
          .slice(lastAgentMessageIndex + 1)
          .filter(msg => msg.sender === 'customer').length;
      } else {
        conversation.unreadCount = conversation.messages.filter(msg => msg.sender === 'customer').length;
      }
    });
    
    const conversations = Array.from(conversationsMap.values());
    console.log('✅ [Admin] Conversations chargées:', conversations.length);
    return conversations;
  } catch (error) {
    console.error('❌ [Admin] Erreur lors du chargement des conversations:', error);
    return [];
  }
};

// Données de conversations d'exemple (fallback)
const exampleConversationsData = [
  {
    id: 1,
    customer: {
      id: 1,
      name: 'Marco Rossi',
      email: 'marco.rossi@email.it',
      avatar: null
    },
    subject: 'Consulenza Misura Sella',
    status: 'open',
    priority: 'high',
    unreadCount: 3,
    lastMessage: {
      text: 'Grazie per le informazioni. Posso inviarti una foto del mio cavallo per una valutazione più precisa?',
      timestamp: new Date('2024-11-26T14:30:00'),
      sender: 'customer'
    },
    firstMessage: new Date('2024-11-20T10:15:00'),
    messages: [
      {
        id: 1,
        sender: 'customer',
        text: 'Buongiorno, ho bisogno di aiuto per scegliere la taglia giusta per la mia sella.',
        timestamp: new Date('2024-11-20T10:15:00'),
        attachments: []
      },
      {
        id: 2,
        sender: 'agent',
        text: 'Ciao Marco! Sono felice di aiutarti. Quali sono le dimensioni del tuo cavallo?',
        timestamp: new Date('2024-11-20T10:20:00'),
        attachments: []
      },
      {
        id: 3,
        sender: 'customer',
        text: 'Il mio cavallo è alto circa 165 cm al garrese.',
        timestamp: new Date('2024-11-20T10:25:00'),
        attachments: []
      },
      {
        id: 4,
        sender: 'agent',
        text: 'Perfetto! Per un cavallo di quella taglia, ti consiglio una sella da 17" o 17.5". Hai già una sella attuale?',
        timestamp: new Date('2024-11-20T10:30:00'),
        attachments: []
      },
      {
        id: 5,
        sender: 'customer',
        text: 'Grazie per le informazioni. Posso inviarti una foto del mio cavallo per una valutazione più precisa?',
        timestamp: new Date('2024-11-26T14:30:00'),
        attachments: []
      }
    ]
  },
  {
    id: 2,
    customer: {
      id: 2,
      name: 'Laura Bianchi',
      email: 'laura.bianchi@email.it',
      avatar: null
    },
    subject: 'Domanda su Spedizione',
    status: 'resolved',
    priority: 'normal',
    unreadCount: 0,
    lastMessage: {
      text: 'Perfetto, grazie per il chiarimento sui tempi di consegna.',
      timestamp: new Date('2024-11-15T16:45:00'),
      sender: 'customer'
    },
    firstMessage: new Date('2024-11-15T14:00:00'),
    messages: [
      {
        id: 1,
        sender: 'customer',
        text: 'Quanto tempo ci vuole per la spedizione?',
        timestamp: new Date('2024-11-15T14:00:00'),
        attachments: []
      },
      {
        id: 2,
        sender: 'agent',
        text: 'Ciao Laura! La spedizione standard richiede 5-7 giorni lavorativi. Offriamo anche spedizione express in 2-3 giorni.',
        timestamp: new Date('2024-11-15T14:05:00'),
        attachments: []
      },
      {
        id: 3,
        sender: 'customer',
        text: 'Perfetto, grazie per il chiarimento sui tempi di consegna.',
        timestamp: new Date('2024-11-15T16:45:00'),
        attachments: []
      }
    ]
  },
  {
    id: 3,
    customer: {
      id: 3,
      name: 'Giuseppe Verdi',
      email: 'giuseppe.verdi@email.it',
      avatar: null
    },
    subject: 'Problema con Ordine',
    status: 'open',
    priority: 'high',
    unreadCount: 1,
    lastMessage: {
      text: 'Ho ricevuto la sella ma il colore non corrisponde a quello che ho ordinato.',
      timestamp: new Date('2024-11-25T09:20:00'),
      sender: 'customer'
    },
    firstMessage: new Date('2024-11-25T09:15:00'),
    messages: [
      {
        id: 1,
        sender: 'customer',
        text: 'Ho ricevuto la sella ma il colore non corrisponde a quello che ho ordinato.',
        timestamp: new Date('2024-11-25T09:20:00'),
        attachments: []
      }
    ]
  },
  {
    id: 4,
    customer: {
      id: 4,
      name: 'Sofia Ferrari',
      email: 'sofia.ferrari@email.it',
      avatar: null
    },
    subject: 'Richiesta Informazioni Prodotto',
    status: 'open',
    priority: 'normal',
    unreadCount: 0,
    lastMessage: {
      text: 'La sella è disponibile in altre taglie?',
      timestamp: new Date('2024-11-24T11:30:00'),
      sender: 'customer'
    },
    firstMessage: new Date('2024-11-24T11:00:00'),
    messages: [
      {
        id: 1,
        sender: 'customer',
        text: 'Ciao, sono interessata alla Sella Dressage Elite Pro. È disponibile in taglia 18"?',
        timestamp: new Date('2024-11-24T11:00:00'),
        attachments: []
      },
      {
        id: 2,
        sender: 'agent',
        text: 'Ciao Sofia! Sì, la Sella Dressage Elite Pro è disponibile in taglia 18". Vuoi che controlli la disponibilità immediata?',
        timestamp: new Date('2024-11-24T11:15:00'),
        attachments: []
      },
      {
        id: 3,
        sender: 'customer',
        text: 'La sella è disponibile in altre taglie?',
        timestamp: new Date('2024-11-24T11:30:00'),
        attachments: []
      }
    ]
  },
  {
    id: 5,
    customer: {
      id: 5,
      name: 'Alessandro Romano',
      email: 'alessandro.romano@email.it',
      avatar: null
    },
    subject: 'Assistenza Tecnica',
    status: 'open',
    priority: 'normal',
    unreadCount: 2,
    lastMessage: {
      text: 'Come posso regolare l\'arcione della sella?',
      timestamp: new Date('2024-11-23T15:20:00'),
      sender: 'customer'
    },
    firstMessage: new Date('2024-11-23T15:00:00'),
    messages: [
      {
        id: 1,
        sender: 'customer',
        text: 'Ho appena ricevuto la sella e vorrei sapere come regolare l\'arcione.',
        timestamp: new Date('2024-11-23T15:00:00'),
        attachments: []
      },
      {
        id: 2,
        sender: 'agent',
        text: 'Ciao Alessandro! Ti invio un video tutorial su come regolare l\'arcione.',
        timestamp: new Date('2024-11-23T15:10:00'),
        attachments: []
      },
      {
        id: 3,
        sender: 'customer',
        text: 'Come posso regolare l\'arcione della sella?',
        timestamp: new Date('2024-11-23T15:20:00'),
        attachments: []
      }
    ]
  },
  {
    id: 6,
    customer: {
      id: 6,
      name: 'Elena Conti',
      email: 'elena.conti@email.it',
      avatar: null
    },
    subject: 'Richiesta Personalizzazione',
    status: 'open',
    priority: 'high',
    unreadCount: 0,
    lastMessage: {
      text: 'Vorrei personalizzare la sella con il colore del mio scuderia.',
      timestamp: new Date('2024-11-22T13:45:00'),
      sender: 'customer'
    },
    firstMessage: new Date('2024-11-22T13:30:00'),
    messages: [
      {
        id: 1,
        sender: 'customer',
        text: 'Vorrei personalizzare la sella con il colore del mio scuderia.',
        timestamp: new Date('2024-11-22T13:45:00'),
        attachments: []
      }
    ]
  }
];

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadConversations();
    
    // S'abonner aux nouveaux messages en temps réel
    let subscription = null;
    subscribeToAllChatMessages((newMessage) => {
      console.log('⚡️ [Admin] Nouveau message reçu:', newMessage);
      
      // Créer une notification immédiatement si c'est un message client
      if (newMessage.sender === 'user' || newMessage.sender === 'customer') {
        console.log('🔔 [Admin] Création notification pour nouveau message:', newMessage);
        const notification = createNotification(
          'message',
          'Nouveau message',
          newMessage.text || 'Image partagée',
          { 
            messageId: newMessage.id,
            userEmail: newMessage.user_email || 'client'
          }
        );
        console.log('✅ [Admin] Notification créée:', notification);
        
        // Déclencher aussi un événement storage pour forcer la mise à jour
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'adminNotifications',
            newValue: localStorage.getItem('adminNotifications')
          }));
        }
      }
      
      // Recharger les conversations quand un nouveau message arrive
      // Utiliser setSelectedConversation pour préserver la sélection
      loadConversations();
    }).then((channel) => {
      subscription = channel;
    });
    
    // Vérifier périodiquement les nouveaux messages (fallback)
    const interval = setInterval(() => {
      loadConversations();
    }, 5000);
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      clearInterval(interval);
    };
  }, []);

  const loadConversations = async () => {
    const loaded = await loadConversationsFromSupabase();
    
    if (loaded.length > 0) {
      setConversations(loaded);
      
      // Utiliser une fonction de callback pour préserver la sélection actuelle
      setSelectedConversation(prevSelected => {
        // Si une conversation est sélectionnée, la mettre à jour
        if (prevSelected) {
          const updated = loaded.find(c => c.id === prevSelected.id);
          if (updated) {
            // Mettre à jour la conversation sélectionnée sans changer de conversation
            return updated;
          }
          // Si la conversation n'existe plus, garder la sélection actuelle
          // L'admin peut choisir manuellement une autre conversation
          return prevSelected;
        } else {
          // Seulement si aucune conversation n'est sélectionnée, sélectionner la première
          return loaded[0];
        }
      });
    } else {
      // Aucune conversation trouvée
      setConversations([]);
      setSelectedConversation(null);
    }
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const matchesSearch = 
        !searchTerm ||
        conv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.subject.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || conv.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [conversations, searchTerm, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    const total = conversations.length;
    const open = conversations.filter(c => c.status === 'open').length;
    const resolved = conversations.filter(c => c.status === 'resolved').length;
    const unread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
    const highPriority = conversations.filter(c => c.priority === 'high' && c.status === 'open').length;

    return { total, open, resolved, unread, highPriority };
  }, [conversations]);

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Ieri';
    } else {
      return messageDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation) return;

    setIsTyping(true);
    
    try {
      // Envoyer le message via Supabase
      const userEmail = selectedConversation.customer.email;
      const savedMessage = await sendAdminReply(userEmail, replyText);
      
      console.log('✅ [Admin] Réponse envoyée:', savedMessage);
      
      // Recharger les conversations pour avoir les données à jour
      await loadConversations();
      
      setReplyText('');
    } catch (error) {
      console.error('❌ [Admin] Erreur lors de l\'envoi de la réponse:', error);
      alert('Errore durante l\'invio della risposta. Riprova.');
    } finally {
      setIsTyping(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-warning/10 text-warning';
      case 'resolved':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted text-text-secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-error/10 text-error';
      case 'normal':
        return 'bg-primary/10 text-primary';
      case 'low':
        return 'bg-muted text-text-secondary';
      default:
        return 'bg-muted text-text-secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-text-primary mb-2">
                Messaggi Clienti
              </h1>
              <p className="text-sm sm:text-base text-text-secondary">
                Gestisci tutte le conversazioni con i tuoi clienti
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Total</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-text-primary">{stats.total}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Aperte</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-warning">{stats.open}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Risolte</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-success">{stats.resolved}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Non letti</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-primary">{stats.unread}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Priorità Alta</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-error">{stats.highPriority}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-4 mb-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cerca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="all">Tutti gli stati</option>
                <option value="open">Aperte</option>
                <option value="resolved">Risolte</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="all">Tutte le priorità</option>
                <option value="high">Alta</option>
                <option value="normal">Normale</option>
                <option value="low">Bassa</option>
              </select>
            </div>

            {/* Conversations */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-text-secondary text-sm">Nessuna conversazione trovata</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      // Forcer la sélection de cette conversation
                      setSelectedConversation(conversation);
                    }}
                    className={`w-full p-4 border-b border-border hover:bg-muted transition-fast text-left ${
                      selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-heading font-bold text-sm">
                          {conversation.customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-body font-semibold text-text-primary text-sm truncate">
                            {conversation.customer.name}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs font-semibold rounded-full px-2 py-0.5 ml-2">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mb-2 line-clamp-1">
                          {conversation.subject}
                        </p>
                        {conversation.lastMessage && (
                          <p className="text-xs text-text-secondary line-clamp-1 mb-2">
                            {conversation.lastMessage.text}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-semibold ${getStatusColor(conversation.status)}`}>
                            {conversation.status === 'open' ? 'Aperta' : 'Risolta'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-semibold ${getPriorityColor(conversation.priority)}`}>
                            {conversation.priority === 'high' ? 'Alta' : conversation.priority === 'normal' ? 'Normale' : 'Bassa'}
                          </span>
                          {conversation.lastMessage && (
                            <span className="text-xs text-text-secondary">
                              {formatTime(conversation.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Conversation View */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="bg-card border border-border rounded-lg flex flex-col h-[calc(100vh-250px)]">
                {/* Header */}
                <div className="border-b border-border p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-heading font-bold">
                          {selectedConversation.customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-body font-bold text-text-primary text-base sm:text-lg">
                          {selectedConversation.customer.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary">{selectedConversation.customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-semibold ${getStatusColor(selectedConversation.status)}`}>
                        {selectedConversation.status === 'open' ? 'Aperta' : 'Risolta'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-semibold ${getPriorityColor(selectedConversation.priority)}`}>
                        {selectedConversation.priority === 'high' ? 'Alta' : selectedConversation.priority === 'normal' ? 'Normale' : 'Bassa'}
                      </span>
                      <button
                        onClick={async () => {
                          if (!confirm('Sei sicuro di voler eliminare questa conversazione? Questa azione è irreversibile.')) {
                            return;
                          }
                          setIsDeleting(true);
                          try {
                            await deleteChatMessages(selectedConversation.customer.email);
                            // Recharger les conversations
                            await loadConversations();
                            setSelectedConversation(null);
                            alert('Conversazione eliminata con successo.');
                          } catch (error) {
                            console.error('Erreur lors de la suppression:', error);
                            alert('Errore durante l\'eliminazione. Riprova.');
                          } finally {
                            setIsDeleting(false);
                          }
                        }}
                        disabled={isDeleting}
                        className="p-2 text-error hover:bg-error/10 rounded-md transition-fast disabled:opacity-50"
                        title="Elimina conversazione"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-text-primary text-sm sm:text-base mb-1">
                      {selectedConversation.subject}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Iniziata il {formatDate(selectedConversation.firstMessage)}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === 'agent' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'agent' ? 'bg-primary text-primary-foreground' : 'bg-muted text-text-primary'
                      }`}>
                        {message.sender === 'agent' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        ) : (
                          <span className="text-xs font-heading font-bold">
                            {selectedConversation.customer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div className={`flex-1 max-w-[80%] ${
                        message.sender === 'agent' ? 'items-end' : 'items-start'
                      } flex flex-col`}>
                        <div className={`rounded-lg p-3 ${
                          message.sender === 'agent' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-text-primary'
                        }`}>
                          {message.image && (
                            <div className="mb-2">
                              <img
                                src={message.image}
                                alt="Image partagée"
                                className="rounded max-w-[200px] h-auto"
                              />
                            </div>
                          )}
                          {message.text ? (
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          ) : message.image ? (
                            <p className="text-xs opacity-75">Image partagée</p>
                          ) : null}
                        </div>
                        <p className="text-xs text-text-secondary mt-1 px-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="bg-primary text-primary-foreground rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reply Input */}
                <div className="border-t border-border p-4 sm:p-6">
                  <div className="flex gap-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      placeholder="Scrivi la tua risposta..."
                      rows={3}
                      className="flex-1 px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm sm:text-base"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className="bg-primary text-primary-foreground px-4 sm:px-6 py-2 rounded-md font-body font-semibold hover:opacity-90 transition-fast disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Invia
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4">
                      <button className="p-2 hover:bg-muted rounded-md transition-fast">
                        <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </button>
                      <button className="p-2 hover:bg-muted rounded-md transition-fast">
                        <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedConversation(prev => ({
                          ...prev,
                          status: prev.status === 'open' ? 'resolved' : 'open'
                        }));
                      }}
                      className={`px-4 py-2 rounded-md font-body font-semibold transition-fast text-sm sm:text-base ${
                        selectedConversation.status === 'open'
                          ? 'bg-success text-success-foreground hover:opacity-90'
                          : 'bg-warning text-warning-foreground hover:opacity-90'
                      }`}
                    >
                      {selectedConversation.status === 'open' ? 'Segna come risolto' : 'Riapri'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-text-secondary">Seleziona una conversazione per iniziare</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
