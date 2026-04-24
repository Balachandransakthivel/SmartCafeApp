import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCart } from '@/hooks/useCart';
import { EmptyState } from '@/components';
import { Colors, Spacing, BorderRadius, Typography, GlowShadows } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cart, updateQuantity, removeFromCart, total, itemCount } = useCart();

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Cart</Text>
        </View>
        <EmptyState
          icon="shopping-cart"
          title="Your cart is empty"
          description="Add delicious items from the menu"
        />
        <View style={styles.emptyActions}>
          <Pressable
            style={({ pressed }) => [CommonStyles.primaryButton, pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/(tabs)/menu')}
          >
            <Text style={CommonStyles.buttonText}>Browse Menu</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Cart</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{itemCount} items</Text>
        </View>
      </View>

      {/* Items */}
      <FlatList
        data={cart}
        keyExtractor={item => item.menuItem.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Math.max(insets.bottom + 130, 130) },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image
              source={{ uri: item.menuItem.image }}
              style={styles.itemImg}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={1}>{item.menuItem.name}</Text>
              <Text style={styles.itemPrice}>₹{item.menuItem.price}</Text>
              {item.specialInstructions ? (
                <Text style={styles.itemNote} numberOfLines={1}>
                  📝 {item.specialInstructions}
                </Text>
              ) : null}
            </View>
            <View style={styles.itemRight}>
              {/* Quantity */}
              <View style={styles.qtyRow}>
                <Pressable
                  style={({ pressed }) => [styles.qtyBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                >
                  <MaterialIcons name="remove" size={16} color={Colors.textSecondary} />
                </Pressable>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <Pressable
                  style={({ pressed }) => [styles.qtyBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                >
                  <MaterialIcons name="add" size={16} color={Colors.textSecondary} />
                </Pressable>
              </View>
              {/* Delete */}
              <Pressable
                style={({ pressed }) => [styles.delBtn, pressed && { opacity: 0.7 }]}
                onPress={() => removeFromCart(item.menuItem.id)}
              >
                <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 8, Spacing.lg) }]}>
        {/* Glow line */}
        <View style={styles.footerGlow} />
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalSub}>{itemCount} items</Text>
          </View>
          <Text style={styles.totalAmt}>₹{total}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.checkoutBtn,
            pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
          ]}
          onPress={() => router.push('/checkout')}
        >
          <MaterialIcons name="shopping-bag" size={20} color="#fff" />
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <MaterialIcons name="arrow-forward-ios" size={16} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgBase },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: Colors.primary + '22',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  countText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
  },

  list: { paddingHorizontal: Spacing.lg },

  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 7,
  },
  itemImg: {
    width: 78,
    height: 78,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  itemDetails: { flex: 1, justifyContent: 'center' },
  itemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  itemNote: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textDim,
    marginTop: 4,
    fontStyle: 'italic',
  },
  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: Spacing.sm,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgBase,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  qtyText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginHorizontal: Spacing.sm,
    minWidth: 22,
    textAlign: 'center',
  },
  delBtn: { padding: Spacing.sm },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  footerGlow: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.6,
    borderRadius: BorderRadius.full,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
  },
  totalSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textDim,
    marginTop: 2,
  },
  totalAmt: {
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    ...GlowShadows.orange,
  },
  checkoutText: {
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
  },
  emptyActions: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
});
