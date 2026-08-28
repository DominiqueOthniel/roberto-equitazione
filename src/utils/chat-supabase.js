/**
 * Chat utility functions with Supabase synchronization
 * Synchronise les messages de chat entre tous les appareils de l'utilisateur
 */

import { supabase } from '@/lib/supabase';

/**
 * Get user ID for chat synchronization
 */
async function getUserId() {
  if (typeof window === 'undefined') return null;
  
  // Essayer d'abord Supabase Auth
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      console.log('✅ [Chat] Utilisateur authentifié via Supabase:', session.user.id);
      return session.user.id;
    }
  } catch (error) {
    console.warn('⚠️ [Chat] Erreur getSession:', error);
  }
  
  // Fallback: utiliser localStorage user (utilisateurs non authentifiés)
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      const email = userData.email;
      if (email && email.trim()) {
        console.log('📧 [Chat] Utilisation email utilisateur:', email);
        // Sauvegarder comme email de synchronisation pour la cohérence
        localStorage.setItem('sync_email', email.trim().toLowerCase());
        return email.trim().toLowerCase();
      }
    } catch (error) {
      console.warn('⚠️ [Chat] Erreur parsing user:', error);
    }
  }
  
  // Utiliser l'email de synchronisation si disponible (PRIORITÉ pour la synchronisation)
  const syncEmail = localStorage.getItem('sync_email');
  if (syncEmail && syncEmail.trim()) {
    console.log('📧 [Chat] Utilisation email de synchronisation:', syncEmail);
    console.log('✅ [Chat] Les messages seront synchronisés entre tous les appareils utilisant cet email');
    return syncEmail.trim().toLowerCase();
  }
  
  // Si aucun utilisateur, créer un ID temporaire (NON synchronisé entre appareils)
  let guestId = localStorage.getItem('guest_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guest_id', guestId);
  }
  
  // Afficher le warning seulement une fois par session
  if (!sessionStorage.getItem('chat_guest_warning_shown')) {
    console.warn('⚠️ [Chat] Utilisateur invité - Messages NON synchronisés entre appareils');
    console.warn('💡 [Chat] Astuce: Utilisez le même email dans "Mon Compte" sur tous vos appareils pour synchroniser');
    sessionStorage.setItem('chat_guest_warning_shown', 'true');
  }
  
  return guestId;
}

/**
 * Get all chat messages (for admin - no filter)
 */
export async function getAllChatMessages() {
  try {
    console.log('📥 [Admin] Récupération de TOUS les messages depuis Supabase');
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [Admin] Erreur lors de la récupération des messages:', error);
      return [];
    }

    // Transformer les données Supabase au format attendu
    const formattedMessages = (data || []).map(msg => ({
      id: msg.id,
      sender: msg.sender,
      text: msg.message,
      image: msg.image_url || null,
      timestamp: new Date(msg.created_at),
      user_email: msg.user_email,
      user_id: msg.user_id,
    }));

    console.log('✅ [Admin] Messages récupérés:', formattedMessages.length);
    return formattedMessages;
  } catch (error) {
    console.error('❌ [Admin] Erreur getAllChatMessages (exception):', error);
    return [];
  }
}

/**
 * Get chat messages from Supabase
 */
export async function getChatMessages() {
  const userId = await getUserId();
  if (!userId) {
    return getChatMessagesLocalStorage();
  }

  try {
    console.log('📥 Récupération messages depuis Supabase, user_id:', userId);
    
    // Construire la requête selon le type d'utilisateur
    let query = supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });
    
    // Si c'est un email, filtrer par user_email
    if (typeof userId === 'string' && userId.includes('@')) {
      query = query.eq('user_email', userId);
    } 
    // Si c'est un UUID (authentifié), filtrer par user_id
    else if (typeof userId === 'string' && userId.length > 20) {
      query = query.eq('user_id', userId);
    }
    // Sinon, c'est un guest_id, utiliser le guest_id pour filtrer
    else {
      // Pour les invités, utiliser le guest_id pour filtrer les messages
      // Cela permet aux invités de chatter même sans compte
      console.log('👤 Utilisateur invité, utilisation du guest_id pour le chat');
      // Stocker le guest_id dans user_email pour permettre la synchronisation
      query = query.eq('user_email', userId);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('❌ Erreur lors de la récupération des messages:', error);
      return getChatMessagesLocalStorage();
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ Aucun message trouvé, création du message de bienvenue...');
      // Si aucun message, créer le message de bienvenue
      const welcomeMessage = await createWelcomeMessage();
      if (welcomeMessage) {
        // Sauvegarder dans localStorage aussi
        saveChatMessageLocalStorage(welcomeMessage);
        return [welcomeMessage];
      }
      // Si la création échoue, retourner un message de bienvenue local
      const localWelcome = {
        id: Date.now(),
        sender: 'agent',
        text: 'Hi! How can I help you choose the right saddle today?',
        timestamp: new Date(),
      };
      saveChatMessageLocalStorage(localWelcome);
      return [localWelcome];
    }

    // Transformer les données Supabase au format attendu
    const formattedMessages = data.map(msg => ({
      id: msg.id,
      sender: msg.sender,
      text: msg.message,
      image: msg.image_url || null,
      timestamp: new Date(msg.created_at),
    }));

    // Sauvegarder dans localStorage comme cache
    saveChatMessagesLocalStorage(formattedMessages);

    console.log('✅ Messages récupérés depuis Supabase:', formattedMessages.length);
    return formattedMessages;
  } catch (error) {
    console.error('❌ Erreur getChatMessages (exception):', error);
    return getChatMessagesLocalStorage();
  }
}

/**
 * Send a chat message to Supabase
 */
export async function sendChatMessage(messageData) {
  const userId = await getUserId();
  
  if (!userId) {
    console.warn('⚠️ Pas d\'ID utilisateur, sauvegarde locale uniquement');
    return saveChatMessageLocalStorage(messageData);
  }
  
  try {
    console.log('📤 Envoi message dans Supabase, user_id:', userId);
    
    // Déterminer si c'est un UUID (authentifié), un email, ou un guest_id
    const isUUID = typeof userId === 'string' && userId.length > 20 && !userId.includes('@') && !userId.startsWith('guest_');
    const isEmail = typeof userId === 'string' && userId.includes('@');
    const isGuest = typeof userId === 'string' && userId.startsWith('guest_');
    
    const messageToInsert = {
      sender: messageData.sender || 'user',
      message: messageData.text || '',
      image_url: messageData.image || null,
      // Si c'est un UUID authentifié, utiliser user_id
      user_id: isUUID ? userId : null,
      // Si c'est un email ou un guest_id, utiliser user_email pour la synchronisation
      user_email: (isEmail || isGuest) ? userId : null,
      read: false,
    };
    
    console.log('📤 Message à insérer:', messageToInsert);

    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageToInsert)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
      // Fallback: sauvegarder dans localStorage
      return saveChatMessageLocalStorage(messageData);
    }

    console.log('✅ Message envoyé avec succès:', data);

    // Sauvegarder aussi dans localStorage comme cache
    const formattedMessage = {
      id: data.id,
      sender: data.sender,
      text: data.message,
      image: data.image_url || null,
      timestamp: new Date(data.created_at),
    };
    saveChatMessageLocalStorage(formattedMessage);

    return formattedMessage;
  } catch (error) {
    console.error('❌ Erreur sendChatMessage (exception):', error);
    return saveChatMessageLocalStorage(messageData);
  }
}

/**
 * Create welcome message in Supabase
 */
async function createWelcomeMessage() {
  const userId = await getUserId();
  
  try {
    const welcomeMessage = {
      sender: 'agent',
      message: 'Hi! How can I help you choose the right saddle today?',
      user_id: typeof userId === 'string' && !userId.includes('@') && userId.startsWith('guest_') ? null : userId,
      user_email: typeof userId === 'string' && userId.includes('@') ? userId : null,
      read: false,
    };

    const { data, error } = await supabase
      .from('chat_messages')
      .insert(welcomeMessage)
      .select()
      .single();

    if (error) {
      console.warn('⚠️ Erreur lors de la création du message de bienvenue:', error);
      return null;
    }

    return {
      id: data.id,
      sender: data.sender,
      text: data.message,
      image: null,
      timestamp: new Date(data.created_at),
    };
  } catch (error) {
    console.warn('⚠️ Erreur createWelcomeMessage:', error);
    return null;
  }
}

/**
 * Subscribe to all chat messages (for admin - no filter)
 */
export async function subscribeToAllChatMessages(callback) {
  console.log('👂 [Admin] Abonnement à TOUS les messages en temps réel');

  const channel = supabase
    .channel('chat-messages-admin')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
      },
      (payload) => {
        console.log('⚡️ [Admin] Nouveau message en temps réel:', payload);
        if (payload.new) {
          const formattedMessage = {
            id: payload.new.id,
            sender: payload.new.sender,
            text: payload.new.message,
            image: payload.new.image_url || null,
            timestamp: new Date(payload.new.created_at),
            user_email: payload.new.user_email,
            user_id: payload.new.user_id,
          };
          callback(formattedMessage);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Send a reply message as admin
 */
export async function sendAdminReply(userEmail, messageText) {
  try {
    console.log('📤 [Admin] Envoi réponse admin à:', userEmail);
    
    const messageToInsert = {
      sender: 'agent',
      message: messageText,
      image_url: null,
      user_id: null,
      user_email: userEmail, // Utiliser l'email du client pour que le message apparaisse dans sa conversation
      read: false,
    };

    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageToInsert)
      .select()
      .single();

    if (error) {
      console.error('❌ [Admin] Erreur lors de l\'envoi de la réponse:', error);
      throw error;
    }

    console.log('✅ [Admin] Réponse envoyée avec succès:', data);

    // Sauvegarder aussi dans localStorage comme cache
    const formattedMessage = {
      id: data.id,
      sender: data.sender,
      text: data.message,
      image: data.image_url || null,
      timestamp: new Date(data.created_at),
      user_email: data.user_email,
    };
    
    if (typeof window !== 'undefined') {
      const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
      messages.push(formattedMessage);
      const limited = messages.slice(-100);
      localStorage.setItem('chatMessages', JSON.stringify(limited));
      
      // Déclencher un événement pour mettre à jour le ChatWidget
      window.dispatchEvent(new CustomEvent('newAdminMessage', { detail: formattedMessage }));
    }

    return formattedMessage;
  } catch (error) {
    console.error('❌ [Admin] Erreur sendAdminReply:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time chat messages
 */
export async function subscribeToChatMessages(callback) {
  const userId = await getUserId();
  if (!userId) {
    console.warn('⚠️ Pas d\'utilisateur pour s\'abonner aux messages');
    return null;
  }

  console.log('👂 Abonnement aux messages pour user_id:', userId);

  // Déterminer le filtre selon le type d'utilisateur
  const isUUID = typeof userId === 'string' && userId.length > 20 && !userId.includes('@') && !userId.startsWith('guest_');
  const isEmail = typeof userId === 'string' && userId.includes('@');
  const isGuest = typeof userId === 'string' && userId.startsWith('guest_');
  
  let filter;
  if (isUUID) {
    // Utilisateur authentifié avec UUID
    filter = `user_id=eq.${userId}`;
  } else if (isEmail || isGuest) {
    // Utilisateur avec email ou invité - utiliser user_email
    filter = `user_email=eq.${userId}`;
  } else {
    // Fallback
    filter = `user_email=eq.${userId}`;
  }

  console.log('🔍 Filtre d\'abonnement:', filter);

  const channel = supabase
    .channel(`chat-messages-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: filter,
      },
      (payload) => {
        console.log('⚡️ Nouveau message en temps réel:', payload);
        if (payload.new) {
          const formattedMessage = {
            id: payload.new.id,
            sender: payload.new.sender,
            text: payload.new.message,
            image: payload.new.image_url || null,
            timestamp: new Date(payload.new.created_at),
          };
          callback(formattedMessage);
          // Mettre à jour localStorage aussi
          saveChatMessageLocalStorage(formattedMessage);
        }
      }
    )
    .subscribe();

  return channel;
}

// Fallback functions (localStorage)
function getChatMessagesLocalStorage() {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedMessages = localStorage.getItem('chatMessages');
    if (!storedMessages) {
      // Créer le message de bienvenue
      const welcomeMessage = {
        id: Date.now(),
        sender: 'agent',
        text: 'Hi! How can I help you choose the right saddle today?',
        timestamp: new Date(),
      };
      saveChatMessageLocalStorage(welcomeMessage);
      return [welcomeMessage];
    }
    
    const messages = JSON.parse(storedMessages);
    return messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
    }));
  } catch (error) {
    console.error('❌ Erreur lors de la lecture des messages:', error);
    return [];
  }
}

function saveChatMessageLocalStorage(message) {
  if (typeof window === 'undefined') return message;
  
  try {
    const messages = getChatMessagesLocalStorage();
    // Vérifier si le message existe déjà
    const exists = messages.some(m => m.id === message.id);
    if (!exists) {
      messages.push({
        ...message,
        timestamp: message.timestamp instanceof Date ? message.timestamp.toISOString() : message.timestamp,
      });
      // Garder seulement les 100 derniers messages
      const limited = messages.slice(-100);
      localStorage.setItem('chatMessages', JSON.stringify(limited));
    }
    return message;
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde du message:', error);
    return message;
  }
}

function saveChatMessagesLocalStorage(messages) {
  if (typeof window === 'undefined') return;
  
  try {
    const formatted = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
    }));
    localStorage.setItem('chatMessages', JSON.stringify(formatted));
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde des messages:', error);
  }
}

