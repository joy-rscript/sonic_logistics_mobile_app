import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchNotifications, markNotificationAsRead, createNotification, deleteNotification, Notification } from '@/utils/notificationApi';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  removeNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Initialize notifications
  useEffect(() => {
    refreshNotifications();
  }, []);

  const refreshNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, you'd get the user ID from authentication context
      const userId = 'user1'; // This should come from auth context
      const fetchedNotifications = await fetchNotifications(userId);
      setNotifications(fetchedNotifications);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      setError('Failed to mark notification as read');
      console.error('Error marking notification as read:', err);
    }
  };

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const newNotification = await createNotification(notificationData);
      setNotifications(prev => [newNotification, ...prev]);
    } catch (err) {
      setError('Failed to create notification');
      console.error('Error creating notification:', err);
    }
  };

  const removeNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (err) {
      setError('Failed to delete notification');
      console.error('Error deleting notification:', err);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      error,
      markAsRead,
      addNotification,
      removeNotification,
      refreshNotifications,
      clearError,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}