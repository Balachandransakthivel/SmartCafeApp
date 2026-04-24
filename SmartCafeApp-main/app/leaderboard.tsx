import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface LeaderboardEntry {
  userId: string;
  userName: string;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold';
  totalOrders: number;
  totalSpent: number;
  rank: number;
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { orders } = useOrders();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'alltime'>('month');
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [timeFilter, orders]);

  const loadLeaderboard = async () => {
    try {
      // Get all users from storage (mock data for demo)
      const mockUsers: LeaderboardEntry[] = [
        {
          userId: 'user-1',
          userName: 'Demo User',
          points: 450,
          tier: 'Silver',
          totalOrders: 23,
          totalSpent: 4500,
          rank: 1,
        },
        {
          userId: 'user-2',
          userName: 'Sarah Johnson',
          points: 1250,
          tier: 'Gold',
          totalOrders: 67,
          totalSpent: 12500,
          rank: 1,
        },
        {
          userId: 'user-3',
          userName: 'Rahul Kumar',
          points: 890,
          tier: 'Silver',
          totalOrders: 45,
          totalSpent: 8900,
          rank: 2,
        },
        {
          userId: 'user-4',
          userName: 'Priya Sharma',
          points: 620,
          tier: 'Silver',
          totalOrders: 31,
          totalSpent: 6200,
          rank: 3,
        },
        {
          userId: 'user-5',
          userName: 'John Doe',
          points: 380,
          tier: 'Bronze',
          totalOrders: 19,
          totalSpent: 3800,
          rank: 4,
        },
        {
          userId: 'user-6',
          userName: 'Emily Chen',
          points: 720,
          tier: 'Silver',
          totalOrders: 36,
          totalSpent: 7200,
          rank: 5,
        },
        {
          userId: 'user-7',
          userName: 'Michael Brown',
          points: 540,
          tier: 'Silver',
          totalOrders: 27,
          totalSpent: 5400,
          rank: 6,
        },
        {
          userId: 'user-8',
          userName: 'Ananya Patel',
          points: 290,
          tier: 'Bronze',
          totalOrders: 14,
          totalSpent: 2900,
          rank: 7,
        },
      ];

      // Sort by points
      const sorted = mockUsers.sort((a, b) => b.points - a.points);
      const withRanks = sorted.map((entry, index) => ({ ...entry, rank: index + 1 }));

      setLeaderboard(withRanks);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Gold':
        return '#FFD700';
      case 'Silver':
        return '#C0C0C0';
      case 'Bronze':
        return '#CD7F32';
      default:
        return Colors.mediumGray;
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const currentUserEntry = leaderboard.find((entry) => entry.userId === user?.id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.darkText} />
        </Pressable>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Time Filter */}
      <View style={styles.filterContainer}>
        {(['week', 'month', 'alltime'] as const).map((filter) => (
          <Pressable
            key={filter}
            style={({ pressed }) => [
              styles.filterButton,
              timeFilter === filter && styles.filterButtonActive,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => setTimeFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                timeFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter === 'week'
                ? 'This Week'
                : filter === 'month'
                ? 'This Month'
                : 'All Time'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <View style={styles.podiumContainer}>
          {/* 2nd Place */}
          <View style={[styles.podiumCard, styles.secondPlace]}>
            <Text style={styles.podiumRank}>🥈</Text>
            <View
              style={[
                styles.podiumAvatar,
                { backgroundColor: getTierColor(leaderboard[1].tier) },
              ]}
            >
              <Text style={styles.podiumAvatarText}>
                {leaderboard[1].userName.charAt(0)}
              </Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {leaderboard[1].userName}
            </Text>
            <View style={styles.podiumPoints}>
              <MaterialIcons name="stars" size={16} color={Colors.primary} />
              <Text style={styles.podiumPointsText}>{leaderboard[1].points}</Text>
            </View>
          </View>

          {/* 1st Place */}
          <View style={[styles.podiumCard, styles.firstPlace]}>
            <View style={styles.crownContainer}>
              <Text style={styles.crown}>👑</Text>
            </View>
            <Text style={styles.podiumRank}>🥇</Text>
            <View
              style={[
                styles.podiumAvatar,
                styles.firstPlaceAvatar,
                { backgroundColor: getTierColor(leaderboard[0].tier) },
              ]}
            >
              <Text style={styles.podiumAvatarText}>
                {leaderboard[0].userName.charAt(0)}
              </Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {leaderboard[0].userName}
            </Text>
            <View style={styles.podiumPoints}>
              <MaterialIcons name="stars" size={18} color={Colors.primary} />
              <Text style={[styles.podiumPointsText, { fontSize: Typography.fontSize.lg }]}>
                {leaderboard[0].points}
              </Text>
            </View>
          </View>

          {/* 3rd Place */}
          <View style={[styles.podiumCard, styles.thirdPlace]}>
            <Text style={styles.podiumRank}>🥉</Text>
            <View
              style={[
                styles.podiumAvatar,
                { backgroundColor: getTierColor(leaderboard[2].tier) },
              ]}
            >
              <Text style={styles.podiumAvatarText}>
                {leaderboard[2].userName.charAt(0)}
              </Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {leaderboard[2].userName}
            </Text>
            <View style={styles.podiumPoints}>
              <MaterialIcons name="stars" size={16} color={Colors.primary} />
              <Text style={styles.podiumPointsText}>{leaderboard[2].points}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Current User Position */}
      {currentUserEntry && currentUserEntry.rank > 3 && (
        <View style={styles.currentUserCard}>
          <Text style={styles.currentUserLabel}>Your Position</Text>
          <View style={styles.currentUserContent}>
            <Text style={styles.currentUserRank}>#{currentUserEntry.rank}</Text>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.currentUserName}>{currentUserEntry.userName}</Text>
              <View style={styles.currentUserStats}>
                <MaterialIcons name="stars" size={16} color={Colors.primary} />
                <Text style={styles.currentUserPoints}>{currentUserEntry.points} pts</Text>
                <Text style={styles.currentUserOrders}>
                  • {currentUserEntry.totalOrders} orders
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Leaderboard List */}
      <FlatList
        data={leaderboard.slice(3)}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, Spacing.xl) },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            style={[
              styles.leaderboardCard,
              item.userId === user?.id && styles.currentUserHighlight,
            ]}
          >
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{getMedalIcon(item.rank)}</Text>
            </View>
            <View
              style={[styles.avatar, { backgroundColor: getTierColor(item.tier) }]}
            >
              <Text style={styles.avatarText}>{item.userName.charAt(0)}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.userName}</Text>
              <View style={styles.userStats}>
                <MaterialIcons name="stars" size={14} color={Colors.primary} />
                <Text style={styles.userPoints}>{item.points} pts</Text>
                <Text style={styles.userOrders}>• {item.totalOrders} orders</Text>
              </View>
            </View>
            <View style={[styles.tierBadge, { backgroundColor: getTierColor(item.tier) }]}>
              <Text style={styles.tierBadgeText}>{item.tier}</Text>
            </View>
          </View>
        )}
      />
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.darkText,
  },
  filterTextActive: {
    color: Colors.background,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  podiumCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  firstPlace: {
    paddingTop: Spacing.xl,
    marginTop: -Spacing.lg,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  secondPlace: {
    marginBottom: Spacing.sm,
  },
  thirdPlace: {
    marginBottom: Spacing.md,
  },
  crownContainer: {
    position: 'absolute',
    top: -20,
  },
  crown: {
    fontSize: 32,
  },
  podiumRank: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  firstPlaceAvatar: {
    width: 72,
    height: 72,
  },
  podiumAvatarText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
  },
  podiumName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  podiumPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  podiumPointsText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  currentUserCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  currentUserLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  currentUserContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentUserRank: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  currentUserName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  currentUserStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  currentUserPoints: {
    fontSize: Typography.fontSize.sm,
    color: Colors.darkText,
  },
  currentUserOrders: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  currentUserHighlight: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceAlt,
  },
  rankBadge: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.mediumGray,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  userPoints: {
    fontSize: Typography.fontSize.sm,
    color: Colors.darkText,
  },
  userOrders: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
  },
  tierBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  tierBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
  },
});
