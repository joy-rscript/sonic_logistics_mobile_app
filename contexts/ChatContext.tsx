import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  fetchUserChats, 
  fetchChatMessages, 
  sendMessage, 
  markMessagesAsRead, 
  createOrGetChat,
  uploadChatImage,
  Chat, 
  ChatMessage 
} from '@/utils/chatApi';

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  setCurrentChat: (chat: Chat | null) => void;
  sendTextMessage: (message: string) => Promise<void>;
  sendImageMessage: (imageUri: string) => Promise<void>;
  sendLocationMessage: (latitude: number, longitude: number) => Promise<void>;
  markChatAsRead: (chatId: string) => Promise<void>;
  refreshChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  createChat: (participants: string[], deliveryId?: string) => Promise<Chat>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize chats
  useEffect(() => {
    refreshChats();
  }, []);

  // Load messages when current chat changes
  useEffect(() => {
    if (currentChat) {
      loadMessages(currentChat.id);
    } else {
      setMessages([]);
    }
  }, [currentChat]);

  const refreshChats = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, you'd get the user ID from authentication context
      const userId = 'courier1'; // This should come from auth context
      const fetchedChats = await fetchUserChats(userId);
      setChats(fetchedChats);
    } catch (err) {
      setError('Failed to load chats');
      console.error('Error loading chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedMessages = await fetchChatMessages(chatId);
      setMessages(fetchedMessages);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendTextMessage = async (message: string) => {
    if (!currentChat) return;
    
    try {
      const userId = 'courier1'; // This should come from auth context
      const newMessage = await sendMessage(currentChat.id, userId, message, 'text');
      setMessages(prev => [...prev, newMessage]);
      
      // Update the chat's last message
      setChats(prev => 
        prev.map(chat => 
          chat.id === currentChat.id 
            ? { ...chat, lastMessage: message, lastMessageTime: newMessage.timestamp }
            : chat
        )
      );
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const sendImageMessage = async (imageUri: string) => {
    if (!currentChat) return;
    
    try {
      const imageUrl = await uploadChatImage(currentChat.id, imageUri);
      const userId = 'courier1'; // This should come from auth context
      const newMessage = await sendMessage(currentChat.id, userId, 'Image', 'image', { imageUrl });
      setMessages(prev => [...prev, newMessage]);
      
      // Update the chat's last message
      setChats(prev => 
        prev.map(chat => 
          chat.id === currentChat.id 
            ? { ...chat, lastMessage: 'Image', lastMessageTime: newMessage.timestamp }
            : chat
        )
      );
    } catch (err) {
      setError('Failed to send image');
      console.error('Error sending image:', err);
    }
  };

  const sendLocationMessage = async (latitude: number, longitude: number) => {
    if (!currentChat) return;
    
    try {
      const userId = 'courier1'; // This should come from auth context
      const newMessage = await sendMessage(currentChat.id, userId, 'Location', 'location', { 
        location: { latitude, longitude } 
      });
      setMessages(prev => [...prev, newMessage]);
      
      // Update the chat's last message
      setChats(prev => 
        prev.map(chat => 
          chat.id === currentChat.id 
            ? { ...chat, lastMessage: 'Location', lastMessageTime: newMessage.timestamp }
            : chat
        )
      );
    } catch (err) {
      setError('Failed to send location');
      console.error('Error sending location:', err);
    }
  };

  const markChatAsRead = async (chatId: string) => {
    try {
      const userId = 'courier1'; // This should come from auth context
      await markMessagesAsRead(chatId, userId);
      
      // Update local state
      setChats(prev => 
        prev.map(chat => 
          chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
        )
      );
      
      setMessages(prev => 
        prev.map(msg => ({ ...msg, read: true }))
      );
    } catch (err) {
      setError('Failed to mark messages as read');
      console.error('Error marking messages as read:', err);
    }
  };

  const createChat = async (participants: string[], deliveryId?: string): Promise<Chat> => {
    try {
      const newChat = await createOrGetChat(participants, deliveryId);
      
      // Add to chats if it's new
      setChats(prev => {
        const exists = prev.find(chat => chat.id === newChat.id);
        return exists ? prev : [newChat, ...prev];
      });
      
      return newChat;
    } catch (err) {
      setError('Failed to create chat');
      console.error('Error creating chat:', err);
      throw err;
    }
  };

  return (
    <ChatContext.Provider value={{
      chats,
      currentChat,
      messages,
      loading,
      error,
      setCurrentChat,
      sendTextMessage,
      sendImageMessage,
      sendLocationMessage,
      markChatAsRead,
      refreshChats,
      loadMessages,
      createChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}