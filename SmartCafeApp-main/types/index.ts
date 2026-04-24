// Type definitions for Smart Café App

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'kitchen';
  loyaltyPoints: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold';
  createdAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Coffee' | 'Burger' | 'Pizza' | 'Drinks' | 'Snacks' | 'Dessert';
  image: string;
  rating: number;
  reviews: number;
  available: boolean;
  bestseller: boolean;
  veg: boolean;
  preparationTime: number; // in minutes
  addons?: MenuAddon[];
}

export interface MenuAddon {
  id: string;
  name: string;
  price: number;
  category: 'topping' | 'extra' | 'size' | 'customization';
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  selectedAddons?: MenuAddon[];
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  price: number;
  specialInstructions?: string;
  selectedAddons?: MenuAddon[];
  kitchenStatus: 'queued' | 'cooking' | 'ready';
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentMethod: 'UPI' | 'Card' | 'Cash' | 'Split';
  paymentStatus: 'pending' | 'completed' | 'failed';
  tableNumber?: string;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedTime?: number;
  splitPayment?: SplitPayment;
}

export interface SplitPayment {
  total: number;
  splits: { userId: string; userName: string; amount: number; paid: boolean }[];
}

export interface Feedback {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  categories: string[]; // AI-detected categories like 'taste', 'service', 'speed'
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minStockLevel: number;
  lastRestocked: Date;
  usageRate: number; // items per day
}

export interface WaiterRequest {
  id: string;
  tableNumber: string;
  type: 'waiter' | 'water' | 'bill' | 'split-bill';
  status: 'pending' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  icon: string;
}

export interface RedeemedReward {
  id: string;
  userId: string;
  rewardId: string;
  reward: LoyaltyReward;
  couponCode: string;
  redeemedAt: Date;
  usedAt?: Date;
  status: 'active' | 'used' | 'expired';
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'redeemed';
  points: number;
  description: string;
  orderId?: string;
  createdAt: Date;
}

export interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  popularItems: { item: MenuItem; count: number }[];
  peakHours: { hour: number; orders: number }[];
  revenueByDay: { date: string; revenue: number }[];
  categoryDistribution: { category: string; percentage: number }[];
}

export interface DemandPrediction {
  itemId: string;
  itemName: string;
  predictedDemand: number;
  confidence: number;
  timeSlot: string;
  recommendation: string;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
  occupiedAt?: Date;
  qrCode: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'order_update' | 'promotion' | 'loyalty' | 'admin_alert';
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: Date;
}

export interface OfferCoupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  validFrom: Date;
  validUntil: Date;
  active: boolean;
  usageLimit: number;
  usedCount: number;
}
