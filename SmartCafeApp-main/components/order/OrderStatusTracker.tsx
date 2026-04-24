import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Order } from '@/types';

interface OrderStatusTrackerProps {
  status: Order['status'];
}

const STATUS_CONFIG = {
  pending: { icon: 'schedule' as const, label: 'Order Placed', color: Colors.warning },
  preparing: { icon: 'restaurant' as const, label: 'Preparing', color: Colors.primary },
  ready: { icon: 'check-circle' as const, label: 'Ready', color: Colors.success },
  delivered: { icon: 'local-shipping' as const, label: 'Delivered', color: Colors.coffeeBrown },
  cancelled: { icon: 'cancel' as const, label: 'Cancelled', color: Colors.error },
};

const STATUS_ORDER = ['pending', 'preparing', 'ready', 'delivered'];

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ status }) => {
  if (status === 'cancelled') {
    return (
      <View style={styles.container}>
        <View style={[styles.cancelWrap, { borderColor: Colors.error + '44' }]}>
          <View style={[styles.cancelIcon, { backgroundColor: Colors.error + '22' }]}>
            <MaterialIcons name="cancel" size={40} color={Colors.error} />
          </View>
          <Text style={styles.cancelText}>Order Cancelled</Text>
        </View>
      </View>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <View style={styles.container}>
      {STATUS_ORDER.map((step, idx) => {
        const isCompleted = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        const cfg = STATUS_CONFIG[step as keyof typeof STATUS_CONFIG];

        return (
          <View key={step} style={styles.stepWrap}>
            <View style={styles.stepRow}>
              <View
                style={[
                  styles.iconCircle,
                  isCompleted
                    ? { backgroundColor: cfg.color, shadowColor: cfg.color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 6 }
                    : styles.iconCircleInactive,
                ]}
              >
                <MaterialIcons
                  name={cfg.icon}
                  size={22}
                  color={isCompleted ? '#fff' : Colors.textDim}
                />
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepLabel, isCompleted && styles.stepLabelActive, isCurrent && { color: cfg.color }]}>
                  {cfg.label}
                </Text>
                {isCurrent && (
                  <Text style={[styles.stepSub, { color: cfg.color }]}>● In Progress</Text>
                )}
                {isCompleted && !isCurrent && (
                  <Text style={styles.stepSub}>Completed</Text>
                )}
              </View>
              {isCompleted && (
                <MaterialIcons name="check" size={18} color={cfg.color} />
              )}
            </View>
            {idx < STATUS_ORDER.length - 1 && (
              <View style={styles.connectorWrap}>
                <View style={[styles.connector, isCompleted && { backgroundColor: cfg.color, opacity: 0.6 }]} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
  },
  cancelIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  cancelText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.error,
  },
  stepWrap: {},
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconCircleInactive: {
    backgroundColor: Colors.bgBase,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepContent: { flex: 1 },
  stepLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textDim,
  },
  stepLabelActive: {
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.semiBold,
  },
  stepSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textDim,
    marginTop: 2,
  },
  connectorWrap: {
    paddingLeft: 22,
    paddingVertical: 2,
  },
  connector: {
    width: 2,
    height: 24,
    backgroundColor: Colors.border,
    borderRadius: 1,
  },
});
