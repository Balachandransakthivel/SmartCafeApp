import { useState, useEffect } from 'react';
import { MenuItem } from '@/types';
import { loadFromStorage, saveToStorage } from '@/services/storage';
import { MENU_ITEMS } from '@/services/mockData';
import apiClient from '@/services/apiClient';

const STORAGE_KEY = 'smart_cafe_menu';

export const useMenuManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    setLoading(true);
    try {
      // 1. Try to fetch from backend
      const response = await apiClient.get('/menu');
      const backendItems = response.data.map((item: any) => ({
        ...item,
        id: item._id, // Map MongoDB _id to frontend id
      }));
      setMenuItems(backendItems);
      // Cache success locally 
      await saveToStorage(STORAGE_KEY, backendItems);
    } catch (error) {
      console.warn('Network issue or offline. Falling back to local cache.');
      // 2. Fallback to AsyncStorage if backend fails
      const cachedData = await loadFromStorage<MenuItem[]>(STORAGE_KEY);
      setMenuItems(cachedData || MENU_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id' | 'rating' | 'reviews'>): Promise<MenuItem> => {
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
      rating: 0,
      reviews: 0,
    };
    
    const updated = [...menuItems, newItem];
    setMenuItems(updated);
    await saveToStorage(STORAGE_KEY, updated);
    return newItem;
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    const updated = menuItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setMenuItems(updated);
    await saveToStorage(STORAGE_KEY, updated);
  };

  const deleteMenuItem = async (id: string) => {
    const updated = menuItems.filter(item => item.id !== id);
    setMenuItems(updated);
    await saveToStorage(STORAGE_KEY, updated);
  };

  const toggleAvailability = async (id: string) => {
    const item = menuItems.find(m => m.id === id);
    if (item) {
      await updateMenuItem(id, { available: !item.available });
    }
  };

  return {
    menuItems,
    loading,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
  };
};
