import { useState, useEffect } from 'react';
import { Notification } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@smart_cafe_notifications';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const saved = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotifications(
          parsed.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotifications = async (notifs: Notification[]) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };

  const addNotification = async (
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    orderId?: string
  ) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId,
      type,
      title,
      message,
      orderId,
      read: false,
      createdAt: new Date(),
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    await saveNotifications(updated);
  };

  const markAsRead = async (notificationId: string) => {
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    await saveNotifications(updated);
  };

  const markAllAsRead = async (userId: string) => {
    const updated = notifications.map((n) =>
      n.userId === userId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    await saveNotifications(updated);
  };

  const getUserNotifications = (userId: string) => {
    return notifications
      .filter((n) => n.userId === userId || n.type === 'promotion')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const getUnreadCount = (userId: string) => {
    return notifications.filter((n) => !n.read && (n.userId === userId || n.type === 'promotion')).length;
  };

  const clearAllNotifications = async (userId: string) => {
    const updated = notifications.filter((n) => n.userId !== userId && n.type !== 'promotion');
    setNotifications(updated);
    await saveNotifications(updated);
  };

  return {
    notifications,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    getUserNotifications,
    getUnreadCount,
    clearAllNotifications,
    refreshNotifications: loadNotifications,
  };
};
