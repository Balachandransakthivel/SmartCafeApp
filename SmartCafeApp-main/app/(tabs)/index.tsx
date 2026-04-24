import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { MENU_ITEMS } from '@/services/mockData';
import { generateAnalytics, predictDemand } from '@/services/ai';
import { Colors, Spacing, BorderRadius, Typography, GlowShadows } from '@/constants/theme';

const { width: SW } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();
  const { orders } = useOrders();

  if (isAdmin) {
    const analytics = generateAnalytics(orders, MENU_ITEMS);
    const predictions = predictDemand(orders, MENU_ITEMS);

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.adminHeader}>
            <View>
              <Text style={styles.greetingSmall}>Welcome back 👋</Text>
              <Text style={styles.adminName}>{user?.name}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
              onPress={() => router.push('/kitchen-display')}
            >
              <MaterialIcons name="kitchen" size={22} color={Colors.primary} />
            </Pressable>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderColor: Colors.primary + '55' }]}>
              <View style={[styles.statIconBg, { backgroundColor: Colors.primary + '22' }]}>
                <MaterialIcons name="payments" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.statVal}>₹{analytics.totalRevenue.toLocaleString()}</Text>
              <Text style={styles.statLbl}>Revenue</Text>
            </View>
            <View style={[styles.statCard, { borderColor: Colors.success + '55' }]}>
              <View style={[styles.statIconBg, { backgroundColor: Colors.success + '22' }]}>
                <MaterialIcons name="shopping-bag" size={24} color={Colors.success} />
              </View>
              <Text style={[styles.statVal, { color: Colors.success }]}>{analytics.totalOrders}</Text>
              <Text style={styles.statLbl}>Orders</Text>
            </View>
            <View style={[styles.statCard, { borderColor: Colors.warning + '55' }]}>
              <View style={[styles.statIconBg, { backgroundColor: Colors.warning + '22' }]}>
                <MaterialIcons name="people" size={24} color={Colors.warning} />
              </View>
              <Text style={[styles.statVal, { color: Colors.warning }]}>24</Text>
              <Text style={styles.statLbl}>Customers</Text>
            </View>
          </View>

          {/* Admin Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.adminGrid}>
            {[
              { label: 'Menu', icon: 'restaurant-menu', route: '/admin/menu-management', color: Colors.primary },
              { label: 'Analytics', icon: 'analytics', route: '/admin/analytics', color: Colors.info },
              { label: 'Inventory', icon: 'inventory', route: '/admin/inventory', color: Colors.success },
              { label: 'Feedback', icon: 'feedback', route: '/admin/feedback-analysis', color: Colors.warning },
              { label: 'Tables', icon: 'table-restaurant', route: '/admin/tables', color: Colors.coffeeBrown },
              { label: 'Reports', icon: 'summarize', route: '/admin/reports', color: Colors.error },
            ].map(({ label, icon, route, color }) => (
              <Pressable
                key={label}
                style={({ pressed }) => [styles.adminActionCard, pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] }]}
                onPress={() => router.push(route as any)}
              >
                <View style={[styles.adminActionIcon, { backgroundColor: color + '22', borderColor: color + '44' }]}>
                  <MaterialIcons name={icon as any} size={28} color={color} />
                </View>
                <Text style={styles.adminActionText}>{label}</Text>
              </Pressable>
            ))}
          </View>

          {/* AI Demand */}
          <Text style={styles.sectionTitle}>AI Demand Prediction</Text>
          {predictions.slice(0, 3).map(pred => (
            <View key={pred.itemId} style={styles.predCard}>
              <View style={styles.predLeft}>
                <Text style={styles.predName}>{pred.itemName}</Text>
                <Text style={styles.predSlot}>{pred.timeSlot}</Text>
                <Text style={styles.predRec}>{pred.recommendation}</Text>
              </View>
              <View style={styles.predRight}>
                <Text style={styles.predDemand}>{pred.predictedDemand}</Text>
                <Text style={styles.predUnit}>units</Text>
                <Text style={styles.predConf}>{Math.round(pred.confidence * 100)}%</Text>
              </View>
            </View>
          ))}

          {/* Popular items */}
          <Text style={styles.sectionTitle}>Popular Items</Text>
          {analytics.popularItems.slice(0, 5).map((item, idx) => (
            <View key={item.item.id} style={styles.popularRow}>
              <View style={[styles.rankBadge, idx === 0 && { backgroundColor: Colors.warning }]}>
                <Text style={styles.rankText}>#{idx + 1}</Text>
              </View>
              <Image source={{ uri: item.item.image }} style={styles.popularImg} contentFit="cover" transition={200} />
              <View style={{ flex: 1 }}>
                <Text style={styles.popularName}>{item.item.name}</Text>
                <Text style={styles.popularCount}>{item.count} orders</Text>
              </View>
              <Text style={styles.popularPrice}>₹{item.item.price}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ===== CUSTOMER HOME =====
  const bestsellers = MENU_ITEMS.filter(i => i.bestseller).slice(0, 6);
  const categories = [
    { name: 'Coffee', icon: 'coffee', color: Colors.primary },
    { name: 'Burger', icon: 'lunch-dining', color: '#E06C3A' },
    { name: 'Pizza', icon: 'local-pizza', color: '#C0392B' },
    { name: 'Drinks', icon: 'local-drink', color: '#2980B9' },
    { name: 'Snacks', icon: 'fastfood', color: Colors.warning },
    { name: 'Dessert', icon: 'cake', color: '#8E44AD' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greetingSmall}>Good day! ☕</Text>
            <Text style={styles.adminName}>{user?.name}</Text>
          </View>
          <Pressable
            style={[styles.pointsBadge, GlowShadows.orangeSm]}
            onPress={() => router.push('/loyalty-dashboard')}
          >
            <MaterialIcons name="stars" size={16} color={Colors.primary} />
            <Text style={styles.pointsText}>{user?.loyaltyPoints} pts</Text>
          </Pressable>
        </View>

        {/* 3D Hero Banner */}
        <View style={styles.heroWrap}>
          <Image
            source={require('@/assets/images/home-hero-3d.png')}
            style={styles.heroImg}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.heroOverlay} />
          {/* Overlay content */}
          <View style={styles.heroContent}>
            <View style={styles.heroPill}>
              <MaterialIcons name="local-fire-department" size={14} color={Colors.primary} />
              <Text style={styles.heroPillText}>AI-Powered Ordering</Text>
            </View>
            <Text style={styles.heroTitle}>Smart Café</Text>
            <Text style={styles.heroSub}>Order. Enjoy. Repeat.</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.qaRow}>
          <Pressable
            style={({ pressed }) => [styles.qaCard, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            onPress={() => router.push('/(tabs)/menu')}
          >
            <View style={[styles.qaIcon, { backgroundColor: Colors.primary + '22' }]}>
              <MaterialIcons name="restaurant-menu" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.qaText}>Browse Menu</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.qaCard, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            onPress={() => router.push('/qr-order?table=T1')}
          >
            <View style={[styles.qaIcon, { backgroundColor: Colors.info + '22' }]}>
              <MaterialIcons name="qr-code-scanner" size={28} color={Colors.info} />
            </View>
            <Text style={styles.qaText}>Scan QR</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.qaCard, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            onPress={() => router.push('/leaderboard')}
          >
            <View style={[styles.qaIcon, { backgroundColor: Colors.warning + '22' }]}>
              <MaterialIcons name="emoji-events" size={28} color={Colors.warning} />
            </View>
            <Text style={styles.qaText}>Leaderboard</Text>
          </Pressable>
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryGrid}>
          {categories.map(cat => (
            <Pressable
              key={cat.name}
              style={({ pressed }) => [
                styles.catCard,
                { borderColor: cat.color + '44' },
                pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
              ]}
              onPress={() => router.push(`/(tabs)/menu?category=${cat.name}` as any)}
            >
              <View style={[styles.catIconBg, { backgroundColor: cat.color + '20' }]}>
                <MaterialIcons name={cat.icon as any} size={28} color={cat.color} />
              </View>
              <Text style={styles.catName}>{cat.name}</Text>
            </Pressable>
          ))}
        </View>

        {/* Bestsellers */}
        <Text style={styles.sectionTitle}>Bestsellers 🔥</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bsScroll}
        >
          {bestsellers.map(item => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.bsCard, pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] }]}
              onPress={() => router.push(`/item-details?id=${item.id}` as any)}
            >
              <Image source={{ uri: item.image }} style={styles.bsImg} contentFit="cover" transition={200} />
              {/* Glow overlay at bottom */}
              <View style={styles.bsGradient} />
              <View style={styles.bsInfo}>
                <Text style={styles.bsName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.bsFooter}>
                  <Text style={styles.bsPrice}>₹{item.price}</Text>
                  <View style={styles.bsRating}>
                    <MaterialIcons name="star" size={12} color={Colors.warning} />
                    <Text style={styles.bsRatingText}>{item.rating}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgBase },
  scroll: { paddingBottom: Spacing.xl },

  // === Header ===
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  greetingSmall: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textDim,
    marginBottom: 2,
  },
  adminName: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
  },
  pointsText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },

  // === Hero ===
  heroWrap: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    height: 210,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
    borderWidth: 1,
    borderColor: Colors.borderGlass,
  },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,5,0,0.52)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,122,0,0.22)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  heroPillText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semiBold,
  },
  heroTitle: {
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.black,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  heroSub: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  // === Quick Actions ===
  qaRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  qaCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  qaIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  qaText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // === Section title ===
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },

  // === Categories ===
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  catCard: {
    width: '30%',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  catIconBg: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  catName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textSecondary,
  },

  // === Bestsellers ===
  bsScroll: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  bsCard: {
    width: 150,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  bsImg: { width: '100%', height: 110 },
  bsGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(15,10,6,0.7)',
  },
  bsInfo: {
    padding: Spacing.sm,
  },
  bsName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bsPrice: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  bsRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  bsRatingText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },

  // === Admin Stats ===
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statVal: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  statLbl: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textDim,
    marginTop: 2,
  },

  // === Admin Grid ===
  adminGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  adminActionCard: {
    width: '30%',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  adminActionIcon: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  adminActionText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // === AI Prediction ===
  predCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  predLeft: { flex: 1 },
  predName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
  },
  predSlot: { fontSize: Typography.fontSize.xs, color: Colors.textDim, marginTop: 2 },
  predRec: { fontSize: Typography.fontSize.sm, color: Colors.primary, marginTop: 4 },
  predRight: { alignItems: 'flex-end' },
  predDemand: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  predUnit: { fontSize: Typography.fontSize.xs, color: Colors.textDim },
  predConf: { fontSize: Typography.fontSize.xs, color: Colors.success, marginTop: 4 },

  // === Popular ===
  popularRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  rankText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
  },
  popularImg: { width: 48, height: 48, borderRadius: BorderRadius.sm, marginRight: Spacing.sm },
  popularName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  popularCount: { fontSize: Typography.fontSize.sm, color: Colors.textDim },
  popularPrice: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
});
