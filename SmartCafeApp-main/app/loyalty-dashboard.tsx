import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useLoyalty } from '@/hooks/useLoyalty';
import { LOYALTY_REWARDS } from '@/services/mockData';
import { useAlert } from '@/template';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';

export default function LoyaltyDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUserPoints } = useAuth();
  const {
    transactions,
    redeemedRewards,
    redeemReward,
    getUserTransactions,
    getUserRedeemedRewards,
    getTierProgress,
    getMonthlyStats,
  } = useLoyalty();
  const { showAlert } = useAlert();

  if (!user) return null;

  const userTransactions = getUserTransactions(user.id);
  const userRedeemed = getUserRedeemedRewards(user.id);
  const tierProgress = getTierProgress(user.loyaltyPoints);
  const monthlyStats = getMonthlyStats(user.id);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze':
        return '#CD7F32';
      case 'Silver':
        return '#C0C0C0';
      case 'Gold':
        return '#FFD700';
      default:
        return Colors.mediumGray;
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    const reward = LOYALTY_REWARDS.find((r) => r.id === rewardId);
    if (!reward) return;

    if (user.loyaltyPoints < reward.pointsCost) {
      showAlert('Insufficient Points', `You need ${reward.pointsCost} points to redeem this reward`);
      return;
    }

    showAlert('Redeem Reward', `Redeem ${reward.title} for ${reward.pointsCost} points?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Redeem',
        onPress: async () => {
          const redeemed = await redeemReward(user.id, rewardId);
          if (redeemed) {
            await updateUserPoints(-reward.pointsCost);
            showAlert(
              'Reward Redeemed!',
              `Your coupon code: ${redeemed.couponCode}\n\nUse this code at checkout to avail your discount.`
            );
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.darkText} />
        </Pressable>
        <Text style={styles.title}>Loyalty Rewards</Text>
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
        {/* Points Card */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <MaterialIcons name="stars" size={48} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.pointsLabel}>Available Points</Text>
              <Text style={styles.pointsValue}>{user.loyaltyPoints}</Text>
            </View>
          </View>
        </View>

        {/* Tier Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Tier Progress</Text>
          <View
            style={[styles.tierCard, { borderColor: getTierColor(tierProgress.currentTier) }]}
          >
            <View style={styles.tierHeader}>
              <View
                style={[
                  styles.tierBadge,
                  { backgroundColor: getTierColor(tierProgress.currentTier) },
                ]}
              >
                <MaterialIcons name="workspace-premium" size={32} color={Colors.background} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tierName}>{tierProgress.currentTier} Member</Text>
                {tierProgress.nextTier && (
                  <Text style={styles.tierSubtext}>
                    {tierProgress.pointsToNext} points to {tierProgress.nextTier}
                  </Text>
                )}
              </View>
            </View>
            {tierProgress.nextTier && (
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${tierProgress.progress}%`,
                        backgroundColor: getTierColor(tierProgress.nextTier),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(tierProgress.progress)}%</Text>
              </View>
            )}
          </View>
        </View>

        {/* Monthly Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: Colors.success }]}>
              <MaterialIcons name="add-circle" size={24} color={Colors.background} />
              <Text style={styles.statValue}>{monthlyStats.earned}</Text>
              <Text style={styles.statLabel}>Earned</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.warning }]}>
              <MaterialIcons name="remove-circle" size={24} color={Colors.background} />
              <Text style={styles.statValue}>{monthlyStats.redeemed}</Text>
              <Text style={styles.statLabel}>Redeemed</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.primary }]}>
              <MaterialIcons name="local-activity" size={24} color={Colors.background} />
              <Text style={styles.statValue}>{monthlyStats.transactionCount}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
          </View>
        </View>

        {/* Available Rewards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Rewards</Text>
          <FlatList
            data={LOYALTY_REWARDS}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item: reward }) => {
              const canRedeem = user.loyaltyPoints >= reward.pointsCost;
              return (
                <View style={styles.rewardCard}>
                  <View style={styles.rewardIcon}>
                    <MaterialIcons
                      name={reward.icon as keyof typeof MaterialIcons.glyphMap}
                      size={32}
                      color={canRedeem ? Colors.primary : Colors.mediumGray}
                    />
                  </View>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardDescription}>{reward.description}</Text>
                    <View style={styles.rewardFooter}>
                      <View style={styles.pointsCost}>
                        <MaterialIcons name="stars" size={16} color={Colors.primary} />
                        <Text style={styles.pointsCostText}>{reward.pointsCost} points</Text>
                      </View>
                      <Pressable
                        style={({ pressed }) => [
                          styles.redeemButton,
                          !canRedeem && styles.redeemButtonDisabled,
                          pressed && { opacity: 0.8 },
                        ]}
                        onPress={() => handleRedeemReward(reward.id)}
                        disabled={!canRedeem}
                      >
                        <Text
                          style={[
                            styles.redeemButtonText,
                            !canRedeem && styles.redeemButtonTextDisabled,
                          ]}
                        >
                          Redeem
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        </View>

        {/* Active Coupons */}
        {userRedeemed.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Coupons</Text>
            {userRedeemed.map((item) => (
              <View key={item.id} style={styles.couponCard}>
                <View style={styles.couponLeft}>
                  <MaterialIcons name="confirmation-number" size={24} color={Colors.primary} />
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <Text style={styles.couponTitle}>{item.reward.title}</Text>
                    <Text style={styles.couponCode}>{item.couponCode}</Text>
                  </View>
                </View>
                <View style={styles.couponBadge}>
                  <Text style={styles.couponBadgeText}>ACTIVE</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {userTransactions.slice(0, 10).map((txn) => (
            <View key={txn.id} style={styles.transactionItem}>
              <View
                style={[
                  styles.transactionIcon,
                  {
                    backgroundColor:
                      txn.type === 'earned' ? Colors.success : Colors.warning,
                  },
                ]}
              >
                <MaterialIcons
                  name={txn.type === 'earned' ? 'add' : 'remove'}
                  size={20}
                  color={Colors.background}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{txn.description}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(txn.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionPoints,
                  { color: txn.type === 'earned' ? Colors.success : Colors.warning },
                ]}
              >
                {txn.type === 'earned' ? '+' : '-'}
                {txn.points}
              </Text>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  pointsCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  pointsLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.background,
    opacity: 0.9,
  },
  pointsValue: {
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
    marginTop: 4,
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
  tierCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  tierBadge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  tierSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
    minWidth: 45,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.background,
    marginTop: 2,
  },
  rewardCard: {
    flexDirection: 'row',
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
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 2,
  },
  rewardDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
    marginBottom: Spacing.sm,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsCostText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
  },
  redeemButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  redeemButtonDisabled: {
    backgroundColor: Colors.lightGray,
  },
  redeemButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.background,
  },
  redeemButtonTextDisabled: {
    color: Colors.mediumGray,
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  couponLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
  },
  couponCode: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginTop: 2,
    letterSpacing: 1,
  },
  couponBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  couponBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.darkText,
  },
  transactionDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  transactionPoints: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
});
