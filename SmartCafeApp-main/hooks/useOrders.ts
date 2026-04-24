import { useState, useEffect, useRef } from 'react';
import { Order } from '@/types';
import { getOrders, addOrder as addOrderToStorage, updateOrder as updateOrderInStorage } from '@/services/storage';
import apiClient from '@/services/apiClient';

// Status progression: pending → preparing → ready → delivered
const STATUS_TIMINGS: Record<string, number> = {
  pending: 8000,     // 8s → preparing
  preparing: 15000,  // 15s → ready
  ready: 12000,      // 12s → delivered
};

const NEXT_STATUS: Record<string, Order['status']> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    loadOrders();
    return () => {
      // Cleanup all timers on unmount
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  const scheduleProgression = (order: Order) => {
    const delay = STATUS_TIMINGS[order.status];
    if (!delay || !NEXT_STATUS[order.status]) return;

    // Cancel any existing timer for this order
    if (timersRef.current[order.id]) {
      clearTimeout(timersRef.current[order.id]);
    }

    timersRef.current[order.id] = setTimeout(async () => {
      const next = NEXT_STATUS[order.status];
      if (!next) return;

      try {
        await updateOrderInStorage(order.id, { status: next });
        setOrders(prev => {
          const updated = prev.map(o =>
            o.id === order.id
              ? { ...o, status: next, updatedAt: new Date() }
              : o
          );

          // Schedule next transition
          const updatedOrder = updated.find(o => o.id === order.id);
          if (updatedOrder && NEXT_STATUS[next]) {
            scheduleProgression(updatedOrder);
          }
          return updated;
        });
      } catch (err) {
        console.error('Auto-progression failed', err);
      }
    }, delay);
  };

  const loadOrders = async () => {
    try {
      const savedOrders = await getOrders();
      setOrders(savedOrders);

      // Start auto-progression for active orders
      savedOrders.forEach(order => {
        if (order.status !== 'delivered' && order.status !== 'cancelled') {
          scheduleProgression(order);
        }
      });
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (order: Order, onSuccess?: (finalId: string) => void) => {
    let finalOrder = { ...order };
    try {
      // 1. Post to Backend
      const backendItems = order.items.map(item => ({
        menuItem: item.menuItem.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const response = await apiClient.post('/orders', {
        items: backendItems,
        totalAmount: order.finalAmount,
      });

      // 2. Synchronize frontend order ID with true MongoDB ID
      finalOrder.id = response.data._id;
    } catch (error) {
      console.warn('Backend unavailable! Processing order 100% offline via AsyncStorage.');
    }

    await addOrderToStorage(finalOrder);
    setOrders(prev => [finalOrder, ...prev]);

    // Start auto-progression from 'pending'
    scheduleProgression(finalOrder);

    if (onSuccess) {
      onSuccess(finalOrder.id);
    }
    return finalOrder.id;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    // Cancel auto-timer if admin manually changes status
    if (timersRef.current[orderId]) {
      clearTimeout(timersRef.current[orderId]);
      delete timersRef.current[orderId];
    }

    await updateOrderInStorage(orderId, { status });
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date() }
          : order
      )
    );

    // Resume progression from new status
    const updatedOrder = orders.find(o => o.id === orderId);
    if (updatedOrder && status !== 'delivered' && status !== 'cancelled') {
      scheduleProgression({ ...updatedOrder, status });
    }
  };

  const updateOrderItemStatus = async (
    orderId: string,
    itemIndex: number,
    kitchenStatus: 'queued' | 'cooking' | 'ready'
  ) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedItems = [...order.items];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], kitchenStatus };

    const allReady = updatedItems.every(item => item.kitchenStatus === 'ready');
    const newStatus = allReady ? 'ready' : 'preparing';

    await updateOrderInStorage(orderId, { items: updatedItems, status: newStatus });
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, items: updatedItems, status: newStatus, updatedAt: new Date() }
          : o
      )
    );
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  const getUserOrders = (userId: string) => {
    return orders.filter(order => order.userId === userId);
  };

  return {
    orders,
    loading,
    addOrder,
    updateOrderStatus,
    updateOrderItemStatus,
    getOrderById,
    getUserOrders,
    refreshOrders: loadOrders,
  };
};
