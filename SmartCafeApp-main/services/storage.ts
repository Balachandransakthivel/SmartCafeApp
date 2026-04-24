import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Order, CartItem, Feedback, RedeemedReward } from '@/types';

const KEYS = {
  USER: '@smart_cafe_user',
  CART: '@smart_cafe_cart',
  ORDERS: '@smart_cafe_orders',
  FEEDBACKS: '@smart_cafe_feedbacks',
  REDEEMED_REWARDS: '@smart_cafe_redeemed_rewards',
};

// User Storage
export const saveUser = async (user: User): Promise<void> => {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const getUser = async (): Promise<User | null> => {
  const data = await AsyncStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const clearUser = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.USER);
};

// Cart Storage
export const saveCart = async (cart: CartItem[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.CART, JSON.stringify(cart));
};

export const getCart = async (): Promise<CartItem[]> => {
  const data = await AsyncStorage.getItem(KEYS.CART);
  return data ? JSON.parse(data) : [];
};

export const clearCart = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.CART);
};

// Orders Storage
export const saveOrders = async (orders: Order[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
};

export const getOrders = async (): Promise<Order[]> => {
  const data = await AsyncStorage.getItem(KEYS.ORDERS);
  if (!data) return [];
  
  const orders = JSON.parse(data);
  // Convert date strings back to Date objects
  return orders.map((order: any) => ({
    ...order,
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt),
  }));
};

export const addOrder = async (order: Order): Promise<void> => {
  const orders = await getOrders();
  orders.unshift(order);
  await saveOrders(orders);
};

export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<void> => {
  const orders = await getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates, updatedAt: new Date() };
    await saveOrders(orders);
  }
};

// Feedbacks Storage
export const saveFeedbacks = async (feedbacks: Feedback[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.FEEDBACKS, JSON.stringify(feedbacks));
};

export const getFeedbacks = async (): Promise<Feedback[]> => {
  const data = await AsyncStorage.getItem(KEYS.FEEDBACKS);
  if (!data) return [];
  
  const feedbacks = JSON.parse(data);
  return feedbacks.map((fb: any) => ({
    ...fb,
    createdAt: new Date(fb.createdAt),
  }));
};

export const addFeedback = async (feedback: Feedback): Promise<void> => {
  const feedbacks = await getFeedbacks();
  feedbacks.unshift(feedback);
  await saveFeedbacks(feedbacks);
};

// Redeemed Rewards Storage
export const saveRedeemedRewards = async (rewards: RedeemedReward[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.REDEEMED_REWARDS, JSON.stringify(rewards));
};

export const getRedeemedRewards = async (): Promise<RedeemedReward[]> => {
  const data = await AsyncStorage.getItem(KEYS.REDEEMED_REWARDS);
  if (!data) return [];
  
  const rewards = JSON.parse(data);
  return rewards.map((reward: any) => ({
    ...reward,
    redeemedAt: new Date(reward.redeemedAt),
    usedAt: reward.usedAt ? new Date(reward.usedAt) : undefined,
  }));
};

export const addRedeemedReward = async (reward: RedeemedReward): Promise<void> => {
  const rewards = await getRedeemedRewards();
  rewards.unshift(reward);
  await saveRedeemedRewards(rewards);
};

export const saveToStorage = async <T>(key: string, data: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to storage: ${key}`, error);
  }
};

export const loadFromStorage = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error loading from storage: ${key}`, error);
    return null;
  }
};
