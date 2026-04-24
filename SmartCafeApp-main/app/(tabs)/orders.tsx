import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { EmptyState } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Order } from '@/types';

type TabType = 'active' | 'completed';

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();
  const { orders, getUserOrders } = useOrders();
  const [activeTab, setActiveTab] = useState<TabType>('active');

  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 4000);
    return () => clearInterval(interval);
  }, []);

  const allOrders = isAdmin ? orders : getUserOrders(user?.id || '');
  const activeOrders = allOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const completedOrders = allOrders.filter(o => o.status === 'delivered' || o.status === 'cancelled');
  const displayOrders = activeTab === 'active' ? activeOrders : completedOrders;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':   return { color: Colors.warning,     icon: 'schedule' as const,            label: 'PENDING' };
      case 'preparing': return { color: Colors.primary,     icon: 'restaurant' as const,           label: 'PREPARING' };
      case 'ready':     return { color: Colors.success,     icon: 'notifications-active' as const, label: 'READY' };
      case 'delivered': return { color: Colors.coffeeBrown, icon: 'check-circle' as const,         label: 'DELIVERED' };
      case 'cancelled': return { color: Colors.error,       icon: 'cancel' as const,               label: 'CANCELLED' };
      default:          return { color: Colors.textDim,     icon: 'info' as const,                 label: status.toUpperCase() };
    }
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const cfg = getStatusConfig(item.status);
    const isCompleted = item.status === 'delivered' || item.status === 'cancelled';

    return (
      <Pressable
        style={({ pressed }) => [
          styles.orderCard,
          { borderColor: cfg.color + '33' },
          isCompleted && styles.orderCardCompleted,
          pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
        ]}
        onPress={() => router.push(`/order-details?id=${item.id}`)}
      >
        {/* Top accent bar */}
        <View style={[styles.accentBar, { backgroundColor: cfg.color, opacity: isCompleted ? 0.4 : 0.75 }]} />

        <View style={styles.orderHead}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.orderId, isCompleted && { color: Colors.textSecondary }]}>
              #{item.id.slice(-6).toUpperCase()}
            </Text>
            <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleString()}</Text>
            {item.tableNumber ? (
              <Text style={styles.tableTag}>🪑 Table {item.tableNumber}</Text>
            ) : null}
          </View>
          <View style={[styles.statusPill, { backgroundColor: cfg.color + '22', borderColor: cfg.color + '55' }]}>
            <MaterialIcons name={cfg.icon} size={14} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={styles.itemsSection}>
          {item.items.slice(0, 2).map((oi, idx) => (
            <Text key={idx} style={[styles.orderItemText, isCompleted && { color: Colors.textDim }]}>
              • {oi.quantity}× {oi.menuItem.name}
            </Text>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreText}>+{item.items.length - 2} more items</Text>
          )}
        </View>

        <View style={styles.orderFoot}>
          <View style={styles.payRow}>
            <MaterialIcons name="payment" size={14} color={Colors.textDim} />
            <Text style={styles.payText}>{item.paymentMethod}</Text>
          </View>
          {item.status === 'delivered' && (
            <View style={styles.doneBadge}>
              <MaterialIcons name="check-circle" size={13} color={Colors.success} />
              <Text style={styles.doneText}>DONE</Text>
            </View>
          )}
          <Text style={[styles.orderTotal, isCompleted && { color: Colors.textSecondary }]}>
            ₹{item.finalAmount}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        {isAdmin && (
          <Pressable
            style={({ pressed }) => [styles.kitchenBtn, pressed && { opacity: 0.8 }]}
            onPress={() => router.push('/kitchen-display')}
          >
            <MaterialIcons name="kitchen" size={18} color={Colors.primary} />
            <Text style={styles.kitchenBtnText}>Kitchen</Text>
          </Pressable>
        )}
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <View style={[styles.tabDot, { backgroundColor: Colors.primary }]} />
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active
          </Text>
          {activeOrders.length > 0 && (
            <View style={[styles.tabCount, activeTab === 'active' && styles.tabCountActive]}>
              <Text style={[styles.tabCountText, activeTab === 'active' && { color: Colors.primary }]}>
                {activeOrders.length}
              </Text>
            </View>
          )}
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <View style={[styles.tabDot, { backgroundColor: Colors.coffeeBrown }]} />
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed
          </Text>
          {completedOrders.length > 0 && (
            <View style={[styles.tabCount, activeTab === 'completed' && styles.tabCountCompleted]}>
              <Text style={[styles.tabCountText, activeTab === 'completed' && { color: Colors.coffeeBrown }]}>
                {completedOrders.length}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Orders List */}
      {displayOrders.length === 0 ? (
        <EmptyState
          icon={activeTab === 'active' ? 'receipt' : 'check-circle'}
          title={activeTab === 'active' ? 'No active orders' : 'No completed orders'}
          description={
            activeTab === 'active'
              ? (isAdmin ? 'New orders will appear here' : 'Place your first order!')
              : 'Completed orders will appear here'
          }
        />
      ) : (
        <FlatList
          data={displayOrders}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}
          showsVerticalScrollIndicator={false}
          renderItem={renderOrderCard}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgBase },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  kitchenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  kitchenBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  tabActive: {
    backgroundColor: Colors.bgBase,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textDim,
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  tabCount: {
    backgroundColor: Colors.bgBase,
    borderRadius: BorderRadius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabCountActive: {
    backgroundColor: Colors.primary + '22',
    borderColor: Colors.primary + '55',
  },
  tabCountCompleted: {
    backgroundColor: Colors.coffeeBrown + '22',
    borderColor: Colors.coffeeBrown + '55',
  },
  tabCountText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textDim,
  },

  list: { paddingHorizontal: Spacing.lg },

  orderCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 9,
  },
  orderCardCompleted: {
    opacity: 0.70,
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  orderHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  orderId: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  orderDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textDim,
    marginTop: 2,
  },
  tableTag: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexShrink: 0,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  itemsSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  orderItemText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  moreText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textDim,
    fontStyle: 'italic',
  },
  orderFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  payText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textDim,
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '18',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  doneText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.success,
  },
  orderTotal: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
});
