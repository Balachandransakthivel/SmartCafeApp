import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useInventory } from '@/hooks/useInventory';
import { useAlert } from '@/template';
import { InventoryItem } from '@/types';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';

export default function InventoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { inventory, updateStock, getLowStockItems, getPredictedUsage, getDaysUntilStockout } = useInventory();
  const { showAlert } = useAlert();

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newStock, setNewStock] = useState('');

  const lowStockItems = getLowStockItems();

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewStock(item.currentStock.toString());
    setShowModal(true);
  };

  const handleSaveStock = async () => {
    if (!selectedItem) return;
    
    const stock = parseFloat(newStock);
    if (isNaN(stock) || stock < 0) {
      showAlert('Error', 'Please enter a valid stock amount');
      return;
    }

    await updateStock(selectedItem.id, stock);
    showAlert('Updated', 'Stock level updated successfully');
    setShowModal(false);
    setSelectedItem(null);
  };

  const getStockStatusColor = (item: InventoryItem) => {
    if (item.currentStock < item.minStockLevel) return Colors.error;
    if (item.currentStock < item.minStockLevel * 1.5) return Colors.warning;
    return Colors.success;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.darkText} />
        </Pressable>
        <Text style={styles.title}>Inventory</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <View style={styles.alertBanner}>
          <MaterialIcons name="warning" size={24} color={Colors.error} />
          <Text style={styles.alertText}>
            {lowStockItems.length} item(s) running low on stock
          </Text>
        </View>
      )}

      {/* Inventory List */}
      <FlatList
        data={inventory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, Spacing.xl) },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const statusColor = getStockStatusColor(item);
          const daysLeft = getDaysUntilStockout(item);
          const predictedUsage = getPredictedUsage(item, 7);
          const isLowStock = item.currentStock < item.minStockLevel;

          return (
            <View style={[styles.inventoryCard, isLowStock && styles.lowStockCard]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </View>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusColor },
                  ]}
                />
              </View>

              <View style={styles.stockInfo}>
                <View style={styles.stockRow}>
                  <Text style={styles.stockLabel}>Current Stock</Text>
                  <Text style={[styles.stockValue, { color: statusColor }]}>
                    {item.currentStock} {item.unit}
                  </Text>
                </View>
                <View style={styles.stockRow}>
                  <Text style={styles.stockLabel}>Min Level</Text>
                  <Text style={styles.stockValue}>
                    {item.minStockLevel} {item.unit}
                  </Text>
                </View>
                <View style={styles.stockRow}>
                  <Text style={styles.stockLabel}>Usage Rate</Text>
                  <Text style={styles.stockValue}>
                    {item.usageRate} {item.unit}/day
                  </Text>
                </View>
              </View>

              {/* AI Prediction */}
              <View style={styles.predictionBox}>
                <View style={styles.predictionRow}>
                  <MaterialIcons name="psychology" size={16} color={Colors.primary} />
                  <Text style={styles.predictionLabel}>AI Prediction:</Text>
                </View>
                <Text style={styles.predictionText}>
                  {daysLeft === Infinity
                    ? 'No usage detected'
                    : daysLeft < 3
                    ? `⚠️ Stock will run out in ${daysLeft} days`
                    : `Stock will last ~${daysLeft} days`}
                </Text>
                <Text style={styles.predictionText}>
                  Expected usage (7 days): {predictedUsage.toFixed(1)} {item.unit}
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.updateButton,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => handleUpdateStock(item)}
              >
                <MaterialIcons name="edit" size={18} color={Colors.background} />
                <Text style={styles.updateButtonText}>Update Stock</Text>
              </Pressable>
            </View>
          );
        }}
      />

      {/* Update Stock Modal */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Stock</Text>
            {selectedItem && (
              <>
                <Text style={styles.modalItemName}>{selectedItem.name}</Text>
                <Text style={styles.modalLabel}>Current Stock: {selectedItem.currentStock} {selectedItem.unit}</Text>
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter new stock amount"
                  placeholderTextColor={Colors.mediumGray}
                  value={newStock}
                  onChangeText={setNewStock}
                  keyboardType="numeric"
                />

                <View style={styles.modalActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.modalButton,
                      styles.cancelButton,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.modalButton,
                      CommonStyles.primaryButton,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={handleSaveStock}
                  >
                    <Text style={CommonStyles.buttonText}>Save</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#FFE5E5',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  alertText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.error,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  inventoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lowStockCard: {
    borderWidth: 2,
    borderColor: Colors.error,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  itemName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  itemCategory: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
  },
  stockInfo: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.mediumGray,
  },
  stockValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
  },
  predictionBox: {
    backgroundColor: Colors.surfaceAlt,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  predictionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
  },
  predictionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.darkText,
    marginTop: 2,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  updateButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Spacing.md,
  },
  modalItemName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  modalLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.mediumGray,
    marginBottom: Spacing.md,
  },
  modalInput: {
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.darkText,
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.lightGray,
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
  },
});
