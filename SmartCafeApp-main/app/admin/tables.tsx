import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTables } from '@/hooks/useTables';
import { useOrders } from '@/hooks/useOrders';
import { useAlert } from '@/template';
import { Table } from '@/types';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function TableManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tables, addTable, assignOrderToTable, clearTable, getTurnoverTime } = useTables();
  const { orders } = useOrders();
  const { showAlert } = useAlert();

  const [showAddModal, setShowAddModal] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('');

  const occupiedTables = tables.filter((t) => t.status === 'occupied');
  const availableTables = tables.filter((t) => t.status === 'available');

  const handleAddTable = async () => {
    if (!tableNumber || !capacity) {
      showAlert('Error', 'Please enter table number and capacity');
      return;
    }

    await addTable(tableNumber, parseInt(capacity));
    setShowAddModal(false);
    setTableNumber('');
    setCapacity('');
    showAlert('Success', 'Table added successfully');
  };

  const handlePrintQR = async (table: Table) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
          }
          .container {
            text-align: center;
            border: 3px solid #FF7A00;
            padding: 40px;
            border-radius: 16px;
          }
          h1 {
            color: #6F4E37;
            font-size: 48px;
            margin-bottom: 20px;
          }
          .table-number {
            color: #FF7A00;
            font-size: 72px;
            font-weight: bold;
            margin: 20px 0;
          }
          img {
            margin: 20px 0;
          }
          .instructions {
            color: #666;
            font-size: 20px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>☕ Smart Café</h1>
          <div class="table-number">Table ${table.number}</div>
          <img src="${table.qrCode}" width="300" height="300" />
          <div class="instructions">
            Scan to view menu & order
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      showAlert('Error', 'Failed to generate QR code');
    }
  };

  const handleClearTable = (table: Table) => {
    showAlert('Clear Table', `Mark Table ${table.number} as available?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        onPress: async () => {
          await clearTable(table.id);
          showAlert('Success', 'Table cleared');
        },
      },
    ]);
  };

  const getTableColor = (table: Table) => {
    switch (table.status) {
      case 'available':
        return Colors.success;
      case 'occupied':
        return Colors.error;
      case 'reserved':
        return Colors.warning;
      default:
        return Colors.mediumGray;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.darkText} />
        </Pressable>
        <Text style={styles.title}>Table Management</Text>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.8 }]}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialIcons name="add" size={24} color={Colors.background} />
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: Colors.success }]}>
          <Text style={styles.statValue}>{availableTables.length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.error }]}>
          <Text style={styles.statValue}>{occupiedTables.length}</Text>
          <Text style={styles.statLabel}>Occupied</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.primary }]}>
          <Text style={styles.statValue}>{tables.length}</Text>
          <Text style={styles.statLabel}>Total Tables</Text>
        </View>
      </View>

      {/* Tables Grid */}
      <FlatList
        data={tables}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, Spacing.xl) },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: table }) => {
          const currentOrder = table.currentOrderId
            ? orders.find((o) => o.id === table.currentOrderId)
            : null;
          const turnover = getTurnoverTime(table);

          return (
            <View style={styles.tableCard}>
              <View
                style={[
                  styles.tableStatusDot,
                  { backgroundColor: getTableColor(table) },
                ]}
              />
              <Text style={styles.tableNumber}>{table.number}</Text>
              <MaterialIcons
                name="event-seat"
                size={24}
                color={Colors.mediumGray}
                style={{ marginVertical: Spacing.sm }}
              />
              <Text style={styles.tableCapacity}>{table.capacity} seats</Text>

              {table.status === 'occupied' && (
                <View style={styles.occupiedInfo}>
                  <Text style={styles.turnoverText}>{turnover} min</Text>
                  {currentOrder && (
                    <Text style={styles.orderValue}>₹{currentOrder.finalAmount}</Text>
                  )}
                </View>
              )}

              <View style={styles.tableActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => handlePrintQR(table)}
                >
                  <MaterialIcons name="qr-code" size={20} color={Colors.primary} />
                </Pressable>

                {table.status === 'occupied' && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.iconButton,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => handleClearTable(table)}
                  >
                    <MaterialIcons name="check-circle" size={20} color={Colors.success} />
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Add Table Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Table</Text>

            <Text style={styles.label}>Table Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., T16"
              placeholderTextColor={Colors.mediumGray}
              value={tableNumber}
              onChangeText={setTableNumber}
            />

            <Text style={styles.label}>Capacity</Text>
            <TextInput
              style={styles.input}
              placeholder="Number of seats"
              placeholderTextColor={Colors.mediumGray}
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.cancelButton,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  CommonStyles.primaryButton,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={handleAddTable}
              >
                <Text style={CommonStyles.buttonText}>Add Table</Text>
              </Pressable>
            </View>
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
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  statValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.background,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  tableCard: {
    flex: 1,
    margin: 4,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 160,
  },
  tableStatusDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
  },
  tableNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  tableCapacity: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
  },
  occupiedInfo: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  turnoverText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.warning,
    fontWeight: Typography.fontWeight.semiBold,
  },
  orderValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginTop: 2,
  },
  tableActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.sm,
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
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.darkText,
    marginBottom: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
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
