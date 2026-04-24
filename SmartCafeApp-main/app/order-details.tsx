import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { OrderStatusTracker } from '@/components';
import { Colors, Spacing, BorderRadius, Typography, GlowShadows } from '@/constants/theme';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { getOrderById } = useOrders();
  const { isAdmin } = useAuth();

  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const order = getOrderById(params.id as string);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorWrap}>
          <View style={[styles.errorIcon, { backgroundColor: Colors.error + '22' }]}>
            <MaterialIcons name="error" size={48} color={Colors.error} />
          </View>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusHero = () => {
    switch (order.status) {
      case 'delivered':
        return { icon: 'check-circle' as const, color: Colors.coffeeBrown, title: 'Order Delivered!', sub: 'Enjoy your meal ☕' };
      case 'ready':
        return { icon: 'notifications-active' as const, color: Colors.success, title: 'Your Order is Ready!', sub: 'Being delivered to you now 🚀' };
      case 'preparing':
        return { icon: 'restaurant' as const, color: Colors.primary, title: 'Being Prepared', sub: 'Our chef is cooking your order 👨‍🍳' };
      case 'pending':
        return { icon: 'check-circle' as const, color: Colors.success, title: 'Order Placed!', sub: `Est. time: ${order.estimatedTime || 25} mins` };
      default:
        return null;
    }
  };

  const hero = getStatusHero();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Hero */}
        {hero && (
          <View style={[styles.statusHero, { borderColor: hero.color + '33' }]}>
            <View style={styles.heroGlow} />
            <View style={[styles.heroIconWrap, { backgroundColor: hero.color + '22', shadowColor: hero.color }]}>
              <MaterialIcons name={hero.icon} size={52} color={hero.color} />
            </View>
            <Text style={[styles.heroTitle, { color: hero.color }]}>{hero.title}</Text>
            <Text style={styles.heroSub}>{hero.sub}</Text>
          </View>
        )}

        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          {[
            { label: 'Order ID', value: `#${order.id.slice(-6).toUpperCase()}` },
            { label: 'Date', value: new Date(order.createdAt).toLocaleString() },
            ...(order.tableNumber ? [{ label: 'Table', value: order.tableNumber }] : []),
            { label: 'Payment', value: order.paymentMethod },
          ].map(row => (
            <View key={row.label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Status Tracker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <OrderStatusTracker status={order.status} />
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <Text style={styles.orderItemName}>{item.quantity}× {item.menuItem.name}</Text>
                {item.specialInstructions ? (
                  <Text style={styles.itemNote}>📝 {item.specialInstructions}</Text>
                ) : null}
                {isAdmin && (
                  <View style={[styles.kitchenBadge, { backgroundColor: getKitchenColor(item.kitchenStatus) + '22', borderColor: getKitchenColor(item.kitchenStatus) + '55' }]}>
                    <Text style={[styles.kitchenText, { color: getKitchenColor(item.kitchenStatus) }]}>
                      {item.kitchenStatus.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.orderItemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Price */}
        <View style={styles.section}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{order.totalAmount}</Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount</Text>
              <Text style={[styles.priceValue, { color: Colors.success }]}>-₹{order.discount}</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmt}>₹{order.finalAmount}</Text>
          </View>
        </View>

        {/* Feedback CTA */}
        {!isAdmin && order.status === 'delivered' && (
          <Pressable
            style={({ pressed }) => [
              styles.feedbackBtn,
              GlowShadows.orangeSm,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={() => router.push(`/feedback?orderId=${order.id}` as any)}
          >
            <MaterialIcons name="rate-review" size={20} color="#fff" />
            <Text style={styles.feedbackText}>Give Feedback</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getKitchenColor = (status: string) => {
  switch (status) {
    case 'queued': return Colors.queued;
    case 'cooking': return Colors.cooking;
    case 'ready': return Colors.readyToServe;
    default: return Colors.textDim;
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgBase },
  scroll: { paddingHorizontal: Spacing.lg },

  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  errorText: { fontSize: Typography.fontSize.lg, color: Colors.error },

  // Status Hero
  statusHero: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  heroGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.primary,
    opacity: 0.06,
    top: -40,
  },
  heroIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textDim,
  },

  section: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 7,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: { fontSize: Typography.fontSize.sm, color: Colors.textDim },
  infoValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
  },

  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  orderItemLeft: { flex: 1 },
  orderItemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  itemNote: { fontSize: Typography.fontSize.xs, color: Colors.textDim, fontStyle: 'italic' },
  kitchenBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginTop: 4,
    borderWidth: 1,
  },
  kitchenText: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.bold },
  orderItemPrice: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
    marginLeft: Spacing.md,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  priceLabel: { fontSize: Typography.fontSize.base, color: Colors.textDim },
  priceValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.md },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
  },
  totalAmt: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },

  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    marginBottom: Spacing.xl,
  },
  feedbackText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
  },
});
