import apiClient from './apiClient';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'delivery' | 'update' | 'system';
  read: boolean;
  createdAt: Date;
  deliveryId?: string;
  userId: string;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Delivery Request',
    message: 'You have a new delivery request from TechCorp Solutions.',
    type: 'delivery',
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    deliveryId: 'd1',
    userId: 'user1',
  },
  {
    id: '2',
    title: 'Route Optimization',
    message: 'Your delivery route has been optimized for better efficiency.',
    type: 'update',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    userId: 'user1',
  },
  {
    id: '3',
    title: 'Application Updates',
    message: 'The Sonic App will be having updates for the system so all Sonic Africa application features will not be available.',
    type: 'system',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    userId: 'user1',
  },
];

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const response = await apiClient.get(`/notifications/${userId}`);
    return response.data.map((notif: any) => ({
      ...notif,
      createdAt: new Date(notif.createdAt),
    }));
  } catch (error) {
    console.warn('API unavailable, using mock data for notifications:', error);
    return mockNotifications.filter(n => n.userId === userId);
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.warn('API unavailable, mock marking notification as read:', error);
    // In mock mode, we just log the action
  }
};

export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
  try {
    const response = await apiClient.post('/notifications', notification);
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
    };
  } catch (error) {
    console.warn('API unavailable, using mock data for create notification:', error);
    return {
      id: `mock-${Date.now()}`,
      createdAt: new Date(),
      ...notification,
    };
  }
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await apiClient.delete(`/notifications/${notificationId}`);
  } catch (error) {
    console.warn('API unavailable, mock deleting notification:', error);
    // In mock mode, we just log the action
  }
};