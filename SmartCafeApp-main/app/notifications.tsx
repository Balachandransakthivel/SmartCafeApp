import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead, getUserNotifications, clearAllNotifications } =
    useNotifications();

  if (!user) return null;

  const userNotifications = getUserNotifications(user.id);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order_update':
        return 'receipt';
      case 'promotion':
        return 'local-offer';
      case 'loyalty':
        return 'stars';
      case 'admin_alert':
        return 'notifications-active';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'order_update':
        return Colors.primary;
      case 'promotion':
        return Colors.success;
      case 'loyalty':
        return Colors.warning;
      case 'admin_alert':
        return Colors.error;
      default:
        return Colors.mediumGray;
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    if (notification.orderId) {
      router.push(`/order-details?id=${notification.orderId}`);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead(user.id);
  };

  const handleClearAll = async () => {
    await clearAllNotifications(user.id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.darkText} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <Pressable onPress={handleMarkAllRead} style={styles.markAllButton}>
          <MaterialIcons name="done-all" size={24} color={Colors.primary} />
        </Pressable>
      </View>

      {/* Clear All */}
      {userNotifications.length > 0 && (
        <View style={styles.actionBar}>
          <Pressable
            style={({ pressed }) => [styles.clearButton, pressed && { opacity: 0.7 }]}
            onPress={handleClearAll}
          >
            <MaterialIcons name="delete-outline" size={18} color={Colors.error} />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </Pressable>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={userNotifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, Spacing.xl) },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialIcons name="notifications-none" size={64} color={Colors.mediumGray} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.notificationCard,
              !item.read && styles.unreadCard,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => handleNotificationPress(item)}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getNotificationColor(item.type) },
              ]}
            >
              <MaterialIcons
                name={getNotificationIcon(item.type) as keyof typeof MaterialIcons.glyphMap}
                size={24}
                color={Colors.background}
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>
                {item.title}
              </Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationTime}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  markAllButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBar: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  clearButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.error,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: Colors.surfaceAlt,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.darkText,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: Typography.fontWeight.bold,
  },
  notificationMessage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: Typography.fontSize.xs,
    color: Colors.mediumGray,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.mediumGray,
    marginTop: Spacing.md,
  },
});
