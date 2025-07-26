import apiClient from './apiClient';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'location';
  imageUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Chat {
  id: string;
  participants: string[];
  participantNames: string[];
  participantAvatars: string[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  deliveryId?: string;
  online: boolean;
}

// Mock chat data
const mockChats: Chat[] = [
  {
    id: 'chat1',
    participants: ['courier1', 'sme1'],
    participantNames: ['Martin Lawrence', 'TechCorp Solutions'],
    participantAvatars: ['https://i.ibb.co/M8JnWhy/avatar.png', 'https://i.ibb.co/YP0NDzM/avatar-2.png'],
    lastMessage: 'Hello, I wanted to confirm if my package will arrive today.',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadCount: 2,
    deliveryId: 'd1',
    online: true,
  },
  {
    id: 'chat2',
    participants: ['courier1', 'sme2'],
    participantNames: ['Martin Lawrence', 'FreshFarms'],
    participantAvatars: ['https://i.ibb.co/M8JnWhy/avatar.png', 'https://i.ibb.co/VVxS579/avatar-3.png'],
    lastMessage: 'Thank you for the quick delivery!',
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    unreadCount: 0,
    deliveryId: 'd2',
    online: false,
  },
];

const mockMessages: ChatMessage[] = [
  {
    id: 'msg1',
    chatId: 'chat1',
    senderId: 'sme1',
    senderName: 'TechCorp Solutions',
    message: 'Hello, I wanted to confirm if my package will arrive today.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    type: 'text',
  },
  {
    id: 'msg2',
    chatId: 'chat1',
    senderId: 'courier1',
    senderName: 'Martin Lawrence',
    message: 'Yes, I am currently on my way to the pickup location. ETA is 30 minutes.',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    read: true,
    type: 'text',
  },
];

export const fetchUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const response = await apiClient.get(`/chats/user/${userId}`);
    return response.data.map((chat: any) => ({
      ...chat,
      lastMessageTime: new Date(chat.lastMessageTime),
    }));
  } catch (error) {
    console.warn('API unavailable, using mock data for chats:', error);
    return mockChats.filter(chat => chat.participants.includes(userId));
  }
};

export const fetchChatMessages = async (chatId: string, page: number = 1, limit: number = 50): Promise<ChatMessage[]> => {
  try {
    const response = await apiClient.get(`/chats/${chatId}/messages?page=${page}&limit=${limit}`);
    return response.data.map((message: any) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }));
  } catch (error) {
    console.warn('API unavailable, using mock data for chat messages:', error);
    return mockMessages.filter(msg => msg.chatId === chatId);
  }
};

export const sendMessage = async (chatId: string, senderId: string, message: string, type: 'text' | 'image' | 'location' = 'text', additionalData?: any): Promise<ChatMessage> => {
  try {
    const response = await apiClient.post(`/chats/${chatId}/messages`, {
      senderId,
      message,
      type,
      ...additionalData,
    });
    return {
      ...response.data,
      timestamp: new Date(response.data.timestamp),
    };
  } catch (error) {
    console.warn('API unavailable, using mock data for send message:', error);
    return {
      id: `mock-${Date.now()}`,
      chatId,
      senderId,
      senderName: 'Mock User',
      message,
      timestamp: new Date(),
      read: false,
      type,
      ...additionalData,
    };
  }
};

export const markMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  try {
    await apiClient.patch(`/chats/${chatId}/read`, { userId });
  } catch (error) {
    console.warn('API unavailable, mock marking messages as read:', error);
    // In mock mode, we just log the action
  }
};

export const createOrGetChat = async (participants: string[], deliveryId?: string): Promise<Chat> => {
  try {
    const response = await apiClient.post('/chats', {
      participants,
      deliveryId,
    });
    return {
      ...response.data,
      lastMessageTime: new Date(response.data.lastMessageTime),
    };
  } catch (error) {
    console.warn('API unavailable, using mock data for create chat:', error);
    return {
      id: `mock-chat-${Date.now()}`,
      participants,
      participantNames: participants.map(p => `User ${p}`),
      participantAvatars: participants.map(() => 'https://i.ibb.co/M8JnWhy/avatar.png'),
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0,
      deliveryId,
      online: false,
    };
  }
};

export const uploadChatImage = async (chatId: string, imageUri: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `chat_${chatId}_${Date.now()}.jpg`,
    } as any);

    const response = await apiClient.post(`/chats/${chatId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageUrl;
  } catch (error) {
    console.warn('API unavailable, using mock data for chat image upload:', error);
    return 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2';
  }
};