import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { Colors, Spacing, BorderRadius, Typography, GlowShadows } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, isAdmin } = useAuth();
  const { orders } = useOrders();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Gold': return '#FFD700';
      case 'Silver': return '#C0C0C0';
      case 'Bronze': return '#CD7F32';
      default: return Colors.textDim;
    }
  };

  const menuItems = isAdmin
    ? [
        { label: 'Menu Management', icon: 'restaurant-menu', route: '/admin/menu-management', color: Colors.primary },
        { label: 'Analytics', icon: 'analytics', route: '/admin/analytics', color: Colors.info },
        { label: 'Inventory', icon: 'inventory', route: '/admin/inventory', color: Colors.success },
        { label: 'Feedback Analysis', icon: 'feedback', route: '/admin/feedback-analysis', color: Colors.warning },
        { label: 'Table Management', icon: 'table-restaurant', route: '/admin/tables', color: Colors.coffeeBrown },
        { label: 'Reports', icon: 'summarize', route: '/admin/reports', color: Colors.error },
      ]
    : [
        { label: 'My Orders', icon: 'receipt', route: '/(tabs)/orders', color: Colors.primary },
        { label: 'Loyalty Rewards', icon: 'stars', route: '/loyalty-dashboard', color: Colors.warning },
        { label: 'Leaderboard', icon: 'emoji-events', route: '/leaderboard', color: Colors.info },
        { label: 'Notifications', icon: 'notifications', route: '/notifications', color: Colors.success },
        { label: 'Edit Profile', icon: 'person', route: '/edit-profile', color: Colors.textSecondary },
        { label: 'Help & Support', icon: 'help', route: null, color: Colors.textDim },
      ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <MaterialIcons name="admin-panel-settings" size={14} color={Colors.primary} />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>

        {/* Profile Hero Card */}
        <View style={styles.profileCard}>
          {/* Background glow */}
          <View style={styles.profileCardGlow} />

          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, GlowShadows.orange]}>
              <Text style={styles.avatarText}>{user?.name.charAt(0).toUpperCase()}</Text>
            </View>
            {!isAdmin && user?.loyaltyTier ? (
              <View style={[styles.tierBadge, { backgroundColor: getTierColor(user.loyaltyTier) + 'DD' }]}>
                <MaterialIcons name="stars" size={12} color="#fff" />
                <Text style={styles.tierText}>{user.loyaltyTier}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          {!isAdmin && (
            <Pressable
              style={({ pressed }) => [styles.pointsRow, pressed && { opacity: 0.8 }]}
              onPress={() => router.push('/loyalty-dashboard')}
            >
              <MaterialIcons name="stars" size={18} color={Colors.warning} />
              <Text style={styles.pointsVal}>
                {(user?.loyaltyPoints || 0) + (orders.filter(o => o.userId === user?.id && o.status === 'delivered').reduce((sum, o) => sum + Math.floor(o.finalAmount / 10), 0))}
              </Text>
              <Text style={styles.pointsLabel}>Loyalty Points</Text>
              <MaterialIcons name="chevron-right" size={18} color={Colors.textDim} style={{ marginLeft: 'auto' }} />
            </Pressable>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, idx) => (
            <React.Fragment key={item.label}>
              <Pressable
                style={({ pressed }) => [
                  styles.menuRow,
                  pressed && { backgroundColor: Colors.bgBase },
                ]}
                onPress={() => {
                  if (item.route) router.push(item.route as any);
                }}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '1A' }]}>
                  <MaterialIcons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <MaterialIcons name="chevron-right" size={20} color={Colors.textDim} />
              </Pressable>
              {idx < menuItems.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.8 }]}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <Text style={styles.version}>Smart Café v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgBase },
  scroll: { paddingBottom: Spacing.xl },

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
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '22',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  adminBadgeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
  },

  // Profile Card
  profileCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 14,
  },
  profileCardGlow: {
    position: 'absolute',
    top: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.primary,
    opacity: 0.07,
  },
  avatarWrap: { position: 'relative', marginBottom: Spacing.lg },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 38,
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
  },
  tierBadge: {
    position: 'absolute',
    bottom: -4,
    right: -6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  tierText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
  },
  userName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textDim,
    marginBottom: Spacing.lg,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgBase,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.warning + '33',
  },
  pointsVal: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.warning,
  },
  pointsLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },

  // Menu Card
  menuCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    gap: Spacing.md,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.error + '44',
  },
  logoutText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.error,
  },

  version: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textDim,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});
