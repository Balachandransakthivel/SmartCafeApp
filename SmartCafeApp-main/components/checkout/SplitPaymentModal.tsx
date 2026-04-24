import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { SplitPayment } from '@/types';
import { useAlert } from '@/template';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';

interface SplitPaymentModalProps {
  visible: boolean;
  totalAmount: number;
  onClose: () => void;
  onConfirm: (splitPayment: SplitPayment) => void;
}

export default function SplitPaymentModal({
  visible,
  totalAmount,
  onClose,
  onConfirm,
}: SplitPaymentModalProps) {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const [numPeople, setNumPeople] = useState('2');
  const [splits, setSplits] = useState<{ userName: string; amount: string }[]>([
    { userName: '', amount: '' },
    { userName: '', amount: '' },
  ]);

  const handleNumPeopleChange = (value: string) => {
    const num = parseInt(value) || 2;
    setNumPeople(value);

    const newSplits = Array.from({ length: Math.min(num, 10) }, (_, i) => ({
      userName: splits[i]?.userName || '',
      amount: splits[i]?.amount || '',
    }));
    setSplits(newSplits);
  };

  const handleSplitEqually = () => {
    const perPerson = Math.floor(totalAmount / splits.length);
    const remainder = totalAmount - perPerson * splits.length;

    const newSplits = splits.map((split, index) => ({
      ...split,
      amount: (index === 0 ? perPerson + remainder : perPerson).toString(),
    }));

    setSplits(newSplits);
  };

  const handleConfirm = () => {
    const validSplits = splits.filter((s) => s.userName.trim() && s.amount.trim());
    
    if (validSplits.length < 2) {
      showAlert('Error', 'Please enter at least 2 people for split payment');
      return;
    }

    const totalSplit = validSplits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
    if (Math.abs(totalSplit - totalAmount) > 1) {
      showAlert('Error', `Split total (₹${totalSplit}) doesn not match order total (₹${totalAmount})`);
      return;
    }

    const splitPayment: SplitPayment = {
      total: totalAmount,
      splits: validSplits.map((s, i) => ({
        userId: `split-user-${i}`,
        userName: s.userName.trim(),
        amount: parseFloat(s.amount),
        paid: false,
      })),
    };

    onConfirm(splitPayment);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" size={24} color={Colors.darkText} />
            </Pressable>
            <Text style={styles.title}>Split Payment</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Total Amount */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{totalAmount}</Text>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom + 100, Spacing.xl) },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Number of People */}
            <View style={styles.section}>
              <Text style={styles.label}>Number of People</Text>
              <TextInput
                style={styles.input}
                value={numPeople}
                onChangeText={handleNumPeopleChange}
                keyboardType="numeric"
                maxLength={2}
              />
              <Pressable
                style={({ pressed }) => [styles.splitEquallyButton, pressed && { opacity: 0.8 }]}
                onPress={handleSplitEqually}
              >
                <MaterialIcons name="calculate" size={20} color={Colors.primary} />
                <Text style={styles.splitEquallyText}>Split Equally</Text>
              </Pressable>
            </View>

            {/* Split Details */}
            <Text style={styles.sectionTitle}>Split Details</Text>
            {splits.map((split, index) => (
              <View key={index} style={styles.splitCard}>
                <Text style={styles.splitNumber}>Person {index + 1}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor={Colors.mediumGray}
                  value={split.userName}
                  onChangeText={(value) => {
                    const newSplits = [...splits];
                    newSplits[index].userName = value;
                    setSplits(newSplits);
                  }}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Amount (₹)"
                  placeholderTextColor={Colors.mediumGray}
                  value={split.amount}
                  onChangeText={(value) => {
                    const newSplits = [...splits];
                    newSplits[index].amount = value;
                    setSplits(newSplits);
                  }}
                  keyboardType="numeric"
                />
              </View>
            ))}

            {/* Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Split Amount</Text>
                <Text style={styles.summaryValue}>
                  ₹{splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Original Total</Text>
                <Text style={styles.summaryValue}>₹{totalAmount}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
            ]}
          >
            <Pressable
              style={({ pressed }) => [CommonStyles.primaryButton, pressed && { opacity: 0.8 }]}
              onPress={handleConfirm}
            >
              <Text style={CommonStyles.buttonText}>Confirm Split Payment</Text>
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
  totalCard: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.background,
    opacity: 0.9,
  },
  totalValue: {
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
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
  splitEquallyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  splitEquallyText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Spacing.md,
  },
  splitCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  splitNumber: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  summaryCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.mediumGray,
  },
  summaryValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
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
  },
});
