import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useOrders } from '@/hooks/useOrders';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

export default function KitchenDisplayScreen() {
  const { orders, updateOrderItemStatus, updateOrderStatus } = useOrders();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const activeOrders = orders.filter(
    (order) => order.status === 'pending' || order.status === 'preparing'
  );

  const getUrgencyColor = (createdAt: Date) => {
    const minutesAgo = (Date.now() - new Date(createdAt).getTime()) / 1000 / 60;
    if (minutesAgo < 5) return Colors.queued;
    if (minutesAgo < 10) return Colors.cooking;
    if (minutesAgo < 20) return Colors.warning;
    return Colors.urgent;
  };

  const getStatusIcon = (status: 'queued' | 'cooking' | 'ready'): keyof typeof MaterialIcons.glyphMap => {
    switch (status) {
      case 'queued':
        return 'schedule';
      case 'cooking':
        return 'restaurant';
      case 'ready':
        return 'check-circle';
    }
  };

  const handleItemStatusChange = async (orderId: string, itemIndex: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const currentStatus = order.items[itemIndex].kitchenStatus;
    const nextStatus = currentStatus === 'queued' ? 'cooking' : 'ready';

    await updateOrderItemStatus(orderId, itemIndex, nextStatus);
  };

  const handleMarkAllReady = async (orderId: string) => {
    await updateOrderStatus(orderId, 'ready');
  };

  const numColumns = Math.max(2, Math.floor(dimensions.width / 300));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="kitchen" size={32} color={Colors.background} />
          <Text style={styles.headerTitle}>Kitchen Display</Text>
        </View>
        <Text style={styles.orderCount}>{activeOrders.length} Active Orders</Text>
      </View>

      {/* Orders Grid */}
      {activeOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="restaurant" size={80} color={Colors.mediumGray} />
          <Text style={styles.emptyText}>No active orders</Text>
        </View>
      ) : (
        <FlatList
          data={activeOrders}
          key={numColumns}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: order }) => {
            const minutesAgo = Math.floor(
              (Date.now() - new Date(order.createdAt).getTime()) / 1000 / 60
            );
            const urgencyColor = getUrgencyColor(order.createdAt);

            return (
              <View
                style={[
                  styles.orderCard,
                  { width: Math.max(1, dimensions.width / numColumns - Spacing.lg * 1.5) },
                  { borderLeftColor: urgencyColor, borderLeftWidth: 4 },
                ]}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderId}>
                      #{order.id.slice(-6).toUpperCase()}
                    </Text>
                    {order.tableNumber && (
                      <Text style={styles.tableNumber}>Table: {order.tableNumber}</Text>
                    )}
                  </View>
                  <View style={[styles.timeBadge, { backgroundColor: urgencyColor }]}>
                    <MaterialIcons name="access-time" size={16} color={Colors.background} />
                    <Text style={styles.timeText}>{minutesAgo}m</Text>
                  </View>
                </View>

                {/* Items */}
                <View style={styles.itemsList}>
                  {order.items.map((item, index) => (
                    <Pressable
                      key={index}
                      style={({ pressed }) => [
                        styles.kitchenItem,
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={() => handleItemStatusChange(order.id, index)}
                    >
                      <View style={styles.itemLeft}>
                        <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemName}>{item.menuItem.name}</Text>
                          {item.specialInstructions && (
                            <Text style={styles.itemInstructions}>
                              ⚠️ {item.specialInstructions}
                            </Text>
                          )}
                        </View>
                      </View>
                      <MaterialIcons
                        name={getStatusIcon(item.kitchenStatus)}
                        size={24}
                        color={
                          item.kitchenStatus === 'queued'
                            ? Colors.mediumGray
                            : item.kitchenStatus === 'cooking'
                            ? Colors.warning
                            : Colors.success
                        }
                      />
                    </Pressable>
                  ))}
                </View>

                {/* Action Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.allReadyButton,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => handleMarkAllReady(order.id)}
                >
                  <MaterialIcons name="check-circle" size={20} color={Colors.background} />
                  <Text style={styles.allReadyText}>All Ready</Text>
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.coffeeBrown,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
  },
  orderCount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.background,
  },
  gridContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  orderCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginRight: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  orderId: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
  },
  tableNumber: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    marginTop: 2,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  timeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
  },
  itemsList: {
    marginBottom: Spacing.md,
  },
  kitchenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: '#3a3a3a',
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemQuantity: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    minWidth: 32,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.background,
  },
  itemInstructions: {
    fontSize: Typography.fontSize.sm,
    color: Colors.warning,
    marginTop: 2,
  },
  allReadyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
  },
  allReadyText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.background,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.xl,
    color: Colors.mediumGray,
    marginTop: Spacing.md,
  },
});
