import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { MenuItem, MenuAddon } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_WITH_ADDONS_KEY = '@smart_cafe_cart_addons';

export const useCartWithAddons = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const { cart, addToCart: baseAddToCart, ...rest } = useCart();

  const addToCartWithAddons = async (
    menuItem: MenuItem,
    quantity: number = 1,
    selectedAddons?: MenuAddon[],
    specialInstructions?: string
  ) => {
    // Store addons separately if needed
    if (selectedAddons && selectedAddons.length > 0) {
      try {
        const addonData = await AsyncStorage.getItem(CART_WITH_ADDONS_KEY);
        const addons = addonData ? JSON.parse(addonData) : {};
        addons[menuItem.id] = selectedAddons;
        await AsyncStorage.setItem(CART_WITH_ADDONS_KEY, JSON.stringify(addons));
      } catch (error) {
        console.error('Failed to save addons:', error);
      }
    }
    
    await baseAddToCart(menuItem, quantity, specialInstructions);
  };

  return {
    cart,
    addToCart: addToCartWithAddons,
    ...rest,
  };
};
