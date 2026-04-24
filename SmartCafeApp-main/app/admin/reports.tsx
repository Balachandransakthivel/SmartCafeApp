import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useOrders } from '@/hooks/useOrders';
import { useMenuManagement } from '@/hooks/useMenuManagement';
import { generateAnalytics } from '@/services/ai';
import { generateSalesReport, sharePDFReport, generateCSVReport } from '@/services/pdfGenerator';
import { useAlert } from '@/template';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';

export default function ReportExportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders } = useOrders();
  const { menuItems } = useMenuManagement();
  const { showAlert } = useAlert();

  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('week');

  const getFilteredOrders = () => {
    const now = new Date();
    let startDate = new Date(0);

    if (dateRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return orders.filter((o) => new Date(o.createdAt) >= startDate);
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const filteredOrders = getFilteredOrders();
      const analytics = generateAnalytics(filteredOrders, menuItems);

      const reportData = {
        startDate: getStartDate(),
        endDate: new Date(),
        orders: filteredOrders,
        menuItems,
        analytics,
      };

      const filePath = await generateSalesReport(reportData);
      await sharePDFReport(filePath);
    } catch (error) {
      showAlert('Error', 'Failed to generate PDF report');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateCSV = async () => {
    setGenerating(true);
    try {
      const filteredOrders = getFilteredOrders();
      const analytics = generateAnalytics(filteredOrders, menuItems);

      const reportData = {
        startDate: getStartDate(),
        endDate: new Date(),
        orders: filteredOrders,
        menuItems,
        analytics,
      };

      const filePath = await generateCSVReport(reportData);
      await sharePDFReport(filePath);
    } catch (error) {
      showAlert('Error', 'Failed to generate CSV export');
    } finally {
      setGenerating(false);
    }
  };

  const getStartDate = () => {
    const now = new Date();
    if (dateRange === 'week') {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'month') {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return new Date(0);
  };

  const filteredOrders = getFilteredOrders();
  const analytics = generateAnalytics(filteredOrders, menuItems);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.darkText} />
        </Pressable>
        <Text style={styles.title}>Export Reports</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, Spacing.xl) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Range Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date Range</Text>
          <View style={styles.dateRangeButtons}>
            {(['week', 'month', 'all'] as const).map((range) => (
              <Pressable
                key={range}
                style={({ pressed }) => [
                  styles.rangeButton,
                  dateRange === range && styles.rangeButtonActive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setDateRange(range)}
              >
                <Text
                  style={[
                    styles.rangeButtonText,
                    dateRange === range && styles.rangeButtonTextActive,
                  ]}
                >
                  {range === 'week'
                    ? 'Last 7 Days'
                    : range === 'month'
                    ? 'This Month'
                    : 'All Time'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Preview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Preview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Orders</Text>
              <Text style={styles.statValue}>{analytics.totalOrders}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Revenue</Text>
              <Text style={styles.statValue}>₹{analytics.totalRevenue.toLocaleString()}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Avg Order</Text>
              <Text style={styles.statValue}>₹{Math.round(analytics.averageOrderValue)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Top Item</Text>
              <Text style={styles.statValue} numberOfLines={1}>
                {analytics.popularItems[0]?.item.name || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Format</Text>

          <Pressable
            style={({ pressed }) => [
              styles.exportCard,
              pressed && { opacity: 0.8 },
              generating && { opacity: 0.5 },
            ]}
            onPress={handleGeneratePDF}
            disabled={generating}
          >
            <View style={styles.exportIcon}>
              <MaterialIcons name="picture-as-pdf" size={40} color={Colors.error} />
            </View>
            <View style={styles.exportInfo}>
              <Text style={styles.exportTitle}>PDF Report</Text>
              <Text style={styles.exportDescription}>
                Professional formatted report with charts and analytics
              </Text>
            </View>
            {generating ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <MaterialIcons name="arrow-forward-ios" size={20} color={Colors.mediumGray} />
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.exportCard,
              pressed && { opacity: 0.8 },
              generating && { opacity: 0.5 },
            ]}
            onPress={handleGenerateCSV}
            disabled={generating}
          >
            <View style={styles.exportIcon}>
              <MaterialIcons name="table-chart" size={40} color={Colors.success} />
            </View>
            <View style={styles.exportInfo}>
              <Text style={styles.exportTitle}>CSV Export</Text>
              <Text style={styles.exportDescription}>
                Raw data export for Excel or Google Sheets
              </Text>
            </View>
            {generating ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <MaterialIcons name="arrow-forward-ios" size={20} color={Colors.mediumGray} />
            )}
          </Pressable>
        </View>

        {/* What's Included */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Includes</Text>
          <View style={styles.featureList}>
            {[
              'Revenue breakdown by category',
              'Payment method distribution',
              'Top 10 bestselling items',
              'Peak hours analysis',
              'Customer order statistics',
              'Daily revenue trends',
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color={Colors.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Spacing.md,
  },
  dateRangeButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: Colors.primary,
  },
  rangeButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.darkText,
  },
  rangeButtonTextActive: {
    color: Colors.background,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surfaceAlt,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  exportIcon: {
    marginRight: Spacing.md,
  },
  exportInfo: {
    flex: 1,
  },
  exportTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 4,
  },
  exportDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
  },
  featureList: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.darkText,
  },
});
