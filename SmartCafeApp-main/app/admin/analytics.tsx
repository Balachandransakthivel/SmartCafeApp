import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useOrders } from '@/hooks/useOrders';
import { useMenuManagement } from '@/hooks/useMenuManagement';
import { generateAnalytics, predictDemand } from '@/services/ai';
import { useAlert } from '@/template';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

export default function AnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders } = useOrders();
  const { menuItems } = useMenuManagement();
  const { showAlert } = useAlert();

  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  // Realtime Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(true);

  // Still keeping local predictions as an offline augmentation
  const predictions = predictDemand(orders, menuItems);

  useEffect(() => {
    const fetchRealAnalytics = async () => {
      try {
        const { data } = await apiClient.get('/analytics');
        setAnalytics(data);
      } catch (error) {
        console.error('API failed. Reverting to static analysis.', error);
        setAnalytics(generateAnalytics(orders, menuItems));
      } finally {
        setLoadingAI(false);
      }
    };
    fetchRealAnalytics();
  }, [orders]);

  if (loadingAI || !analytics) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialIcons name="analytics" size={48} color={Colors.primary} />
        <Text style={{ marginTop: Spacing.md, color: Colors.darkText }}>Connecting to MongoDB Brain...</Text>
      </SafeAreaView>
    );
  }

  const handleExport = () => {
    const report = `Smart Café Analytics Report
Generated: ${new Date().toLocaleString()}

SUMMARY
Total Revenue: ₹${analytics.totalRevenue.toLocaleString()}
Total Orders: ${analytics.totalOrders}
Average Order Value: ₹${Math.round(analytics.averageOrderValue)}

TOP ITEMS
${analytics.popularItems.map((item, i) => 
  `${i + 1}. ${item.item.name} - ${item.count} orders`
).join('\n')}

CATEGORY DISTRIBUTION
${analytics.categoryDistribution.map(cat => 
  `${cat.category}: ${cat.percentage.toFixed(1)}%`
).join('\n')}`;

    showAlert('Export Report', 'Report generated successfully! (In a real app, this would download a CSV/PDF)', [
      { text: 'OK', onPress: () => console.log(report) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.darkText} />
        </Pressable>
        <Text style={styles.title}>Analytics</Text>
        <Pressable
          style={({ pressed }) => [styles.exportButton, pressed && { opacity: 0.8 }]}
          onPress={handleExport}
        >
          <MaterialIcons name="file-download" size={20} color={Colors.background} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, Spacing.xl) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: Colors.primary }]}>
            <MaterialIcons name="attach-money" size={32} color={Colors.background} />
            <Text style={styles.summaryValue}>₹{analytics.totalRevenue.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.success }]}>
            <MaterialIcons name="receipt" size={32} color={Colors.background} />
            <Text style={styles.summaryValue}>{analytics.totalOrders}</Text>
            <Text style={styles.summaryLabel}>Total Orders</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.coffeeBrown }]}>
            <MaterialIcons name="trending-up" size={32} color={Colors.background} />
            <Text style={styles.summaryValue}>₹{Math.round(analytics.averageOrderValue)}</Text>
            <Text style={styles.summaryLabel}>Avg Order Value</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.warning }]}>
            <MaterialIcons name="star" size={32} color={Colors.background} />
            <Text style={styles.summaryValue}>{analytics.popularItems[0]?.item.name || 'N/A'}</Text>
            <Text style={styles.summaryLabel}>Top Item</Text>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Revenue Trend</Text>
            <View style={styles.timeToggle}>
              <Pressable
                style={({ pressed }) => [
                  styles.toggleButton,
                  timeRange === 'week' && styles.toggleButtonActive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setTimeRange('week')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    timeRange === 'week' && styles.toggleTextActive,
                  ]}
                >
                  Week
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.toggleButton,
                  timeRange === 'month' && styles.toggleButtonActive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setTimeRange('month')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    timeRange === 'month' && styles.toggleTextActive,
                  ]}
                >
                  Month
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.chart}>
            {analytics.revenueByDay.map((day, index) => {
              const maxRevenue = Math.max(...analytics.revenueByDay.map(d => d.revenue), 1);
              const height = Math.max(1, (day.revenue / maxRevenue) * 150);
              
              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { height }]} />
                  </View>
                  <Text style={styles.barLabel}>
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={styles.barValue}>₹{day.revenue}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Peak Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peak Hours</Text>
          <View style={styles.peakHoursGrid}>
            {analytics.peakHours.map((peak, index) => (
              <View key={index} style={styles.peakCard}>
                <Text style={styles.peakHour}>
                  {peak.hour}:00 - {peak.hour + 1}:00
                </Text>
                <Text style={styles.peakOrders}>{peak.orders} orders</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Distribution</Text>
          <View style={styles.categoryList}>
            {analytics.categoryDistribution.map((cat, index) => (
              <View key={index} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{cat.category}</Text>
                  <Text style={styles.categoryPercent}>{cat.percentage.toFixed(1)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${cat.percentage}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Top Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bestsellers</Text>
          {analytics.popularItems.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.item.name}</Text>
                <Text style={styles.itemCategory}>{item.item.category}</Text>
              </View>
              <Text style={styles.itemCount}>{item.count} sold</Text>
            </View>
          ))}
        </View>

        {/* AI Demand Prediction */}
        <View style={styles.section}>
          <View style={styles.aiHeader}>
            <MaterialIcons name="psychology" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>AI Demand Prediction</Text>
          </View>
          {predictions.map((pred, index) => (
            <View key={index} style={styles.predictionCard}>
              <View style={styles.predictionHeader}>
                <Text style={styles.predictionItem}>{pred.itemName}</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {Math.round(pred.confidence * 100)}% confident
                  </Text>
                </View>
              </View>
              <Text style={styles.predictionDemand}>
                Predicted: {pred.predictedDemand} orders
              </Text>
              <Text style={styles.predictionTime}>{pred.timeSlot}</Text>
              <Text style={styles.predictionRec}>{pred.recommendation}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  exportButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
    marginTop: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.background,
    marginTop: 2,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  timeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.darkText,
  },
  toggleTextActive: {
    color: Colors.background,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  bar: {
    backgroundColor: Colors.primary,
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
    minHeight: 10,
  },
  barLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.mediumGray,
    marginTop: 4,
  },
  barValue: {
    fontSize: Typography.fontSize.xs,
    color: Colors.darkText,
    fontWeight: Typography.fontWeight.semiBold,
  },
  peakHoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  peakCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.surfaceAlt,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  peakHour: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
  },
  peakOrders: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginTop: 2,
  },
  categoryList: {
    gap: Spacing.md,
  },
  categoryRow: {
    gap: Spacing.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.darkText,
  },
  categoryPercent: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemRank: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
  },
  itemCategory: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
  },
  itemCount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  predictionCard: {
    backgroundColor: Colors.surfaceAlt,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  predictionItem: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  confidenceBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  confidenceText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.background,
  },
  predictionDemand: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: 2,
  },
  predictionTime: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
    marginBottom: Spacing.sm,
  },
  predictionRec: {
    fontSize: Typography.fontSize.sm,
    color: Colors.darkText,
    fontStyle: 'italic',
  },
});
