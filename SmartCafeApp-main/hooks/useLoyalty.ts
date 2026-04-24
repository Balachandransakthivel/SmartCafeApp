import { useState, useEffect } from 'react';
import { LoyaltyTransaction, RedeemedReward } from '@/types';
import { LOYALTY_REWARDS } from '@/services/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_KEY = '@smart_cafe_loyalty_transactions';
const REDEEMED_KEY = '@smart_cafe_redeemed_rewards';

export const useLoyalty = () => {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txnData, rewardData] = await Promise.all([
        AsyncStorage.getItem(TRANSACTIONS_KEY),
        AsyncStorage.getItem(REDEEMED_KEY),
      ]);

      if (txnData) {
        const parsed = JSON.parse(txnData);
        setTransactions(
          parsed.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
          }))
        );
      }

      if (rewardData) {
        const parsed = JSON.parse(rewardData);
        setRedeemedRewards(
          parsed.map((r: any) => ({
            ...r,
            redeemedAt: new Date(r.redeemedAt),
            usedAt: r.usedAt ? new Date(r.usedAt) : undefined,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTransactions = async (txns: LoyaltyTransaction[]) => {
    try {
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns));
    } catch (error) {
      console.error('Failed to save transactions:', error);
    }
  };

  const saveRedeemedRewards = async (rewards: RedeemedReward[]) => {
    try {
      await AsyncStorage.setItem(REDEEMED_KEY, JSON.stringify(rewards));
    } catch (error) {
      console.error('Failed to save redeemed rewards:', error);
    }
  };

  const addTransaction = async (
    userId: string,
    type: 'earned' | 'redeemed',
    points: number,
    description: string,
    orderId?: string
  ) => {
    const newTxn: LoyaltyTransaction = {
      id: `txn-${Date.now()}`,
      userId,
      type,
      points,
      description,
      orderId,
      createdAt: new Date(),
    };
    const updated = [newTxn, ...transactions];
    setTransactions(updated);
    await saveTransactions(updated);
  };

  const redeemReward = async (
    userId: string,
    rewardId: string
  ): Promise<RedeemedReward | null> => {
    const reward = LOYALTY_REWARDS.find((r) => r.id === rewardId);
    if (!reward) return null;

    const couponCode = `CAFE${Date.now().toString(36).toUpperCase()}`;
    const redeemed: RedeemedReward = {
      id: `redeemed-${Date.now()}`,
      userId,
      rewardId,
      reward,
      couponCode,
      redeemedAt: new Date(),
      status: 'active',
    };

    const updatedRewards = [redeemed, ...redeemedRewards];
    setRedeemedRewards(updatedRewards);
    await saveRedeemedRewards(updatedRewards);

    // Add transaction
    await addTransaction(userId, 'redeemed', reward.pointsCost, `Redeemed: ${reward.title}`);

    return redeemed;
  };

  const getUserTransactions = (userId: string) => {
    return transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const getUserRedeemedRewards = (userId: string) => {
    return redeemedRewards
      .filter((r) => r.userId === userId && r.status === 'active')
      .sort((a, b) => b.redeemedAt.getTime() - a.redeemedAt.getTime());
  };

  const getTierProgress = (currentPoints: number) => {
    const tiers = [
      { name: 'Bronze', min: 0, max: 499, color: '#CD7F32' },
      { name: 'Silver', min: 500, max: 999, color: '#C0C0C0' },
      { name: 'Gold', min: 1000, max: Infinity, color: '#FFD700' },
    ];

    const currentTier = tiers.find((t) => currentPoints >= t.min && currentPoints <= t.max)!;
    const nextTier = tiers.find((t) => t.min > currentPoints);

    if (!nextTier) {
      return {
        currentTier: currentTier.name,
        progress: 100,
        pointsToNext: 0,
        nextTier: null,
      };
    }

    const progress =
      ((currentPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100;

    return {
      currentTier: currentTier.name,
      progress,
      pointsToNext: nextTier.min - currentPoints,
      nextTier: nextTier.name,
    };
  };

  const getMonthlyStats = (userId: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyTransactions = transactions.filter(
      (t) => t.userId === userId && t.createdAt >= startOfMonth
    );

    const earned = monthlyTransactions
      .filter((t) => t.type === 'earned')
      .reduce((sum, t) => sum + t.points, 0);

    const redeemed = monthlyTransactions
      .filter((t) => t.type === 'redeemed')
      .reduce((sum, t) => sum + t.points, 0);

    return {
      earned,
      redeemed,
      net: earned - redeemed,
      transactionCount: monthlyTransactions.length,
    };
  };

  return {
    transactions,
    redeemedRewards,
    loading,
    addTransaction,
    redeemReward,
    getUserTransactions,
    getUserRedeemedRewards,
    getTierProgress,
    getMonthlyStats,
    refreshData: loadData,
  };
};
