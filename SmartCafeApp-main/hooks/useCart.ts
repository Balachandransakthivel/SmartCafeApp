import { useState, useEffect } from 'react';
import { CartItem, MenuItem } from '@/types';
import { getCart, saveCart, clearCart } from '@/services/storage';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const savedCart = await getCart();
      setCart(savedCart);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (menuItem: MenuItem, quantity: number = 1, specialInstructions?: string) => {
    const existingItemIndex = cart.findIndex(item => item.menuItem.id === menuItem.id);
    
    let newCart: CartItem[];
    if (existingItemIndex !== -1) {
      newCart = [...cart];
      newCart[existingItemIndex].quantity += quantity;
      if (specialInstructions) {
        newCart[existingItemIndex].specialInstructions = specialInstructions;
      }
    } else {
      newCart = [...cart, { menuItem, quantity, specialInstructions }];
    }
    
    setCart(newCart);
    await saveCart(newCart);
  };

  const updateQuantity = async (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(menuItemId);
      return;
    }
    
    const newCart = cart.map(item =>
      item.menuItem.id === menuItemId ? { ...item, quantity } : item
    );
    
    setCart(newCart);
    await saveCart(newCart);
  };

  const removeFromCart = async (menuItemId: string) => {
    const newCart = cart.filter(item => item.menuItem.id !== menuItemId);
    setCart(newCart);
    await saveCart(newCart);
  };

  const clearCartData = async () => {
    setCart([]);
    await clearCart();
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart: clearCartData,
    total: getTotal(),
    itemCount: getItemCount(),
  };
};
