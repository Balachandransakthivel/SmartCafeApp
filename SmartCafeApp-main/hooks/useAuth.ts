import { useState, useEffect } from 'react';
import { User } from '@/types';
import { DEMO_USER, DEMO_ADMIN } from '@/services/mockData';
import { getUser, saveUser, clearUser } from '@/services/storage';
import apiClient from '@/services/apiClient';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await getUser();
      setUser(savedUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // Connects to Node.js Backend 
      const response = await apiClient.post('/users/login', { email, password });
      
      const userData = response.data;
      
      // Save full user data (with JWT Token attached) into AsyncStorage Cache
      await saveUser({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role,
        loyaltyPoints: 0,
        loyaltyTier: 'Bronze',
        createdAt: new Date(),
        token: userData.token 
      });
      
      setUser({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role,
        loyaltyPoints: 0,
        loyaltyTier: 'Bronze',
        createdAt: new Date(),
        token: userData.token
      } as any);

      return { success: true };
    } catch (error: any) {
      console.error('Login Error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Invalid email or password' 
      };
    }
  };

  const logout = async () => {
    await clearUser();
    setUser(null);
  };

  const updateUserPoints = async (points: number) => {
    if (!user) return;
    
    const updatedUser = { ...user, loyaltyPoints: user.loyaltyPoints + points };
    
    // Update tier based on points
    if (updatedUser.loyaltyPoints >= 1000) {
      updatedUser.loyaltyTier = 'Gold';
    } else if (updatedUser.loyaltyPoints >= 500) {
      updatedUser.loyaltyTier = 'Silver';
    } else {
      updatedUser.loyaltyTier = 'Bronze';
    }
    
    await saveUser(updatedUser);
    setUser(updatedUser);
  };

  return {
    user,
    loading,
    login,
    logout,
    updateUserPoints,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };
};
