import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { useInventory } from '@/hooks/useInventory';
import { useNotifications } from '@/hooks/useNotifications';
import { useLoyalty } from '@/hooks/useLoyalty';
import { useAlert } from '@/template';
import { Order } from '@/types';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cart, total, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { user, updateUserPoints } = useAuth();
  const { deductStock } = useInventory();
  const { addNotification } = useNotifications();
  const { addTransaction } = useLoyalty();
  const { showAlert } = useAlert();

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash'>('UPI');
  const [tableNumber, setTableNumber] = useState('');

  const deliveryFee = 0;
  const discount = 0;
  const finalAmount = total + deliveryFee - discount;

  const handlePlaceOrder = async () => {
    if (!user) return;

    const newOrder: Order = {
      id: `ORD${Date.now()}`,
      userId: user.id,
      userName: user.name,
      items: cart.map((item) => ({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: item.menuItem.price,
        specialInstructions: item.specialInstructions,
        kitchenStatus: 'queued',
      })),
      totalAmount: total,
      discount,
      finalAmount,
      status: 'pending',
      paymentMethod,
      paymentStatus: 'completed',
      tableNumber: tableNumber || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedTime: 25,
    };

    const finalizedId = await addOrder(newOrder, async (realId) => {
      // Send order placed notification
      await addNotification(
        user.id,
        'order_update',
        'Order Placed Successfully!',
        `Your order #${realId.slice(-6)} has been placed and is being prepared.`,
        realId
      );
    });
    await deductStock(newOrder); // Auto-deduct inventory
    await clearCart();

    // Award loyalty points
    const pointsEarned = Math.floor(finalAmount / 10);
    await updateUserPoints(pointsEarned);
    await addTransaction(
      user.id,
      'earned',
      pointsEarned,
      `Order #${finalizedId?.slice(-6) || newOrder.id.slice(-6)}`,
      finalizedId || newOrder.id
    );

    showAlert('Order Placed!', `Your order has been placed successfully. You earned ${pointsEarned} points!`);
    router.replace(`/order-details?id=${finalizedId || newOrder.id}`);
  };

  const paymentMethods = [
    { value: 'UPI' as const, icon: 'payment', label: 'UPI Payment' },
    { value: 'Card' as const, icon: 'credit-card', label: 'Credit/Debit Card' },
    { value: 'Cash' as const, icon: 'money', label: 'Cash on Delivery' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 100, Spacing.xl) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Table Number (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Table Number (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., T1, T2..."
            placeholderTextColor={Colors.mediumGray}
            value={tableNumber}
            onChangeText={setTableNumber}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cart.map((item) => (
            <View key={item.menuItem.id} style={styles.orderItem}>
              <Text style={styles.orderItemName}>
                {item.quantity}x {item.menuItem.name}
              </Text>
              <Text style={styles.orderItemPrice}>
                ₹{item.menuItem.price * item.quantity}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <Pressable
              key={method.value}
              style={({ pressed }) => [
                styles.paymentOption,
                paymentMethod === method.value && styles.paymentOptionSelected,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => setPaymentMethod(method.value)}
            >
              <View style={styles.paymentLeft}>
                <MaterialIcons
                  name={method.icon as keyof typeof MaterialIcons.glyphMap}
                  size={24}
                  color={paymentMethod === method.value ? Colors.primary : Colors.mediumGray}
                />
                <Text
                  style={[
                    styles.paymentLabel,
                    paymentMethod === method.value && styles.paymentLabelSelected,
                  ]}
                >
                  {method.label}
                </Text>
              </View>
              {paymentMethod === method.value && (
                <MaterialIcons name="check-circle" size={24} color={Colors.primary} />
              )}
            </Pressable>
          ))}
          <View style={styles.demoBadge}>
            <MaterialIcons name="info" size={16} color={Colors.primary} />
            <Text style={styles.demoBadgeText}>
              Demo Mode - Payment will be simulated
            </Text>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{total}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={[styles.priceValue, { color: Colors.success }]}>FREE</Text>
          </View>
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount</Text>
              <Text style={[styles.priceValue, { color: Colors.success }]}>-₹{discount}</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹{finalAmount}</Text>
          </View>
        </View>

        {/* Loyalty Points Info */}
        <View style={styles.loyaltyInfo}>
          <MaterialIcons name="stars" size={20} color={Colors.primary} />
          <Text style={styles.loyaltyText}>
            You will earn {Math.floor(finalAmount / 10)} loyalty points on this order
          </Text>
        </View>
      </ScrollView>

      {/* Place Order Footer */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            CommonStyles.primaryButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handlePlaceOrder}
        >
          <Text style={CommonStyles.buttonText}>Place Order · ₹{finalAmount}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.darkText,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  orderItemName: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.darkText,
  },
  orderItemPrice: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.lightGray,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentOptionSelected: {
    backgroundColor: Colors.surfaceAlt,
    borderColor: Colors.primary,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  paymentLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.mediumGray,
  },
  paymentLabelSelected: {
    color: Colors.darkText,
    fontWeight: Typography.fontWeight.medium,
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  demoBadgeText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  priceLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.mediumGray,
  },
  priceValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.darkText,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
  },
  totalAmount: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  loyaltyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  loyaltyText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.darkText,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});
