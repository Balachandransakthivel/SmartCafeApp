import { useState, useEffect } from 'react';
import { InventoryItem, Order, MenuItem } from '@/types';
import { loadFromStorage, saveToStorage } from '@/services/storage';
import { INVENTORY_ITEMS } from '@/services/mockData';

const STORAGE_KEY = 'smart_cafe_inventory';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    const data = await loadFromStorage<InventoryItem[]>(STORAGE_KEY);
    setInventory(data || INVENTORY_ITEMS);
    setLoading(false);
  };

  const updateStock = async (itemId: string, newStock: number) => {
    const updated = inventory.map(item =>
      item.id === itemId
        ? { ...item, currentStock: newStock, lastRestocked: new Date() }
        : item
    );
    setInventory(updated);
    await saveToStorage(STORAGE_KEY, updated);
  };

  const deductStock = async (order: Order) => {
    // Simple mock deduction - in real app, would map menu items to inventory items
    const updated = inventory.map(item => {
      let deduction = 0;
      
      order.items.forEach(orderItem => {
        const menuItem = orderItem.menuItem;
        
        // Simple mapping logic
        if (menuItem.category === 'Coffee' && item.name === 'Coffee Beans') {
          deduction += orderItem.quantity * 0.02; // 20g per coffee
        } else if (menuItem.category === 'Coffee' && item.name === 'Milk') {
          deduction += orderItem.quantity * 0.15; // 150ml per coffee
        } else if (menuItem.category === 'Burger' && item.name === 'Burger Buns') {
          deduction += orderItem.quantity;
        } else if ((menuItem.category === 'Burger' || menuItem.category === 'Pizza') && item.name === 'Cheese') {
          deduction += orderItem.quantity * 0.05; // 50g per item
        } else if ((menuItem.category === 'Burger' || menuItem.category === 'Pizza') && item.name === 'Tomatoes') {
          deduction += orderItem.quantity * 0.03; // 30g per item
        } else if (menuItem.category === 'Burger' && item.name === 'Lettuce') {
          deduction += orderItem.quantity * 0.02; // 20g per burger
        }
      });
      
      if (deduction > 0) {
        return {
          ...item,
          currentStock: Math.max(0, item.currentStock - deduction),
        };
      }
      return item;
    });
    
    setInventory(updated);
    await saveToStorage(STORAGE_KEY, updated);
  };

  const getLowStockItems = (): InventoryItem[] => {
    return inventory.filter(item => item.currentStock < item.minStockLevel);
  };

  const getPredictedUsage = (item: InventoryItem, days: number = 7): number => {
    return item.usageRate * days;
  };

  const getDaysUntilStockout = (item: InventoryItem): number => {
    if (item.usageRate === 0) return Infinity;
    return Math.floor(item.currentStock / item.usageRate);
  };

  return {
    inventory,
    loading,
    updateStock,
    deductStock,
    getLowStockItems,
    getPredictedUsage,
    getDaysUntilStockout,
  };
};
