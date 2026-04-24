import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { MenuItem, MenuAddon } from '@/types';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';

interface AddonsModalProps {
  visible: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onConfirm: (addons: MenuAddon[]) => void;
}

const AVAILABLE_ADDONS: Record<string, MenuAddon[]> = {
  Coffee: [
    { id: 'addon-1', name: 'Extra Shot', price: 30, category: 'extra' },
    { id: 'addon-2', name: 'Whipped Cream', price: 20, category: 'topping' },
    { id: 'addon-3', name: 'Caramel Drizzle', price: 25, category: 'topping' },
    { id: 'addon-4', name: 'Large Size', price: 40, category: 'size' },
  ],
  Burger: [
    { id: 'addon-5', name: 'Extra Cheese', price: 30, category: 'extra' },
    { id: 'addon-6', name: 'Bacon', price: 50, category: 'topping' },
    { id: 'addon-7', name: 'Extra Patty', price: 70, category: 'extra' },
    { id: 'addon-8', name: 'Grilled Onions', price: 20, category: 'topping' },
  ],
  Pizza: [
    { id: 'addon-9', name: 'Extra Cheese', price: 40, category: 'extra' },
    { id: 'addon-10', name: 'Olives', price: 30, category: 'topping' },
    { id: 'addon-11', name: 'Mushrooms', price: 35, category: 'topping' },
    { id: 'addon-12', name: 'Stuffed Crust', price: 60, category: 'customization' },
  ],
  Drinks: [
    { id: 'addon-13', name: 'Large Size', price: 30, category: 'size' },
    { id: 'addon-14', name: 'Extra Ice', price: 0, category: 'customization' },
    { id: 'addon-15', name: 'Less Sugar', price: 0, category: 'customization' },
  ],
};

export default function AddonsModal({ visible, item, onClose, onConfirm }: AddonsModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedAddons, setSelectedAddons] = useState<MenuAddon[]>([]);

  const availableAddons = item ? AVAILABLE_ADDONS[item.category] || [] : [];

  const toggleAddon = (addon: MenuAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const getTotalAddonPrice = () => {
    return selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  };

  const handleConfirm = () => {
    onConfirm(selectedAddons);
    setSelectedAddons([]);
  };

  const handleClose = () => {
    setSelectedAddons([]);
    onClose();
  };

  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleClose}>
              <MaterialIcons name="close" size={24} color={Colors.darkText} />
            </Pressable>
            <Text style={styles.title}>Customize Your Order</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Item Info */}
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
          </View>

          {/* Addons List */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom + 100, Spacing.xl) },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {availableAddons.length > 0 ? (
              availableAddons.map((addon) => {
                const isSelected = selectedAddons.some((a) => a.id === addon.id);
                return (
                  <Pressable
                    key={addon.id}
                    style={({ pressed }) => [
                      styles.addonCard,
                      isSelected && styles.addonCardSelected,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => toggleAddon(addon)}
                  >
                    <View style={styles.addonLeft}>
                      <Text style={styles.addonName}>{addon.name}</Text>
                      <Text style={styles.addonPrice}>
                        {addon.price > 0 ? `+₹${addon.price}` : 'Free'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <MaterialIcons name="check" size={18} color={Colors.background} />
                      )}
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <View style={styles.noAddons}>
                <Text style={styles.noAddonsText}>No customizations available for this item</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
            ]}
          >
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Extra Cost:</Text>
              <Text style={styles.totalValue}>₹{getTotalAddonPrice()}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [CommonStyles.primaryButton, pressed && { opacity: 0.8 }]}
              onPress={handleConfirm}
            >
              <Text style={CommonStyles.buttonText}>
                Add to Cart · ₹{item.price + getTotalAddonPrice()}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    marginTop: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
  },
  itemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
  },
  itemPrice: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  addonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  addonCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceAlt,
  },
  addonLeft: {
    flex: 1,
  },
  addonName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.darkText,
  },
  addonPrice: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.mediumGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  noAddons: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
  },
  noAddonsText: {
    fontSize: Typography.fontSize.base,
    color: Colors.mediumGray,
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
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.mediumGray,
  },
  totalValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
});
