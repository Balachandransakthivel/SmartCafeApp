import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { MENU_ITEMS } from '@/services/mockData';
import { useCart } from '@/hooks/useCart';
import { useAlert } from '@/template';
import { MenuItemCard } from '@/components';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

export default function QROrderScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { addToCart, cart, total } = useCart();
  const { showAlert } = useAlert();

  const tableNumber = params.table as string || 'Unknown';
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);

  const filteredItems = MENU_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (item: typeof MENU_ITEMS[0]) => {
    addToCart(item, 1);
    showAlert('Added to Cart', `${item.name} has been added`);
  };

  const handleRequestWaiter = (type: string) => {
    showAlert('Request Sent', `Your request for ${type} has been sent to the waiter`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <MaterialIcons name="table-restaurant" size={32} color={Colors.primary} />
        <View style={styles.tableInfo}>
          <Text style={styles.tableLabel}>Table Number</Text>
          <Text style={styles.tableNumber}>{tableNumber}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.mediumGray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search menu..."
          placeholderTextColor={Colors.mediumGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]}
          onPress={() => handleRequestWaiter('Waiter')}
        >
          <MaterialIcons name="person" size={20} color={Colors.primary} />
          <Text style={styles.actionText}>Call Waiter</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]}
          onPress={() => handleRequestWaiter('Water')}
        >
          <MaterialIcons name="local-drink" size={20} color={Colors.primary} />
          <Text style={styles.actionText}>Water</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]}
          onPress={() => handleRequestWaiter('Bill')}
        >
          <MaterialIcons name="receipt" size={20} color={Colors.primary} />
          <Text style={styles.actionText}>Request Bill</Text>
        </Pressable>
      </View>

      {/* Menu List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom + (cart.length > 0 ? 100 : 20), Spacing.xl) },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            onPress={() => {}}
            onAddToCart={() => handleAddToCart(item)}
          />
        )}
      />

      {/* Cart Footer */}
      {cart.length > 0 && (
        <View
          style={[
            styles.cartFooter,
            { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
          ]}
        >
          <Pressable
            style={({ pressed }) => [styles.cartButton, pressed && { opacity: 0.8 }]}
            onPress={() => setShowCart(!showCart)}
          >
            <View style={styles.cartLeft}>
              <MaterialIcons name="shopping-cart" size={24} color={Colors.background} />
              <View>
                <Text style={styles.cartItemCount}>{cart.length} items</Text>
                <Text style={styles.cartTotal}>₹{total}</Text>
              </View>
            </View>
            <View style={styles.cartRight}>
              <Text style={styles.viewCartText}>View Cart</Text>
              <MaterialIcons name="arrow-forward" size={20} color={Colors.background} />
            </View>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tableInfo: {
    flex: 1,
  },
  tableLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
  },
  tableNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.darkText,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.darkText,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  cartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cartItemCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.background,
  },
  cartTotal: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
  },
  cartRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewCartText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.background,
  },
});
