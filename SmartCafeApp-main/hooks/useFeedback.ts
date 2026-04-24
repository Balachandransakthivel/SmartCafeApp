import { useState, useEffect } from 'react';
import { Feedback } from '@/types';
import { loadFromStorage, saveToStorage } from '@/services/storage';
import { analyzeSentiment } from '@/services/ai';

const STORAGE_KEY = 'smart_cafe_feedback';

export const useFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setLoading(true);
    const data = await loadFromStorage<Feedback[]>(STORAGE_KEY);
    setFeedbacks(data || []);
    setLoading(false);
  };

  const addFeedback = async (
    orderId: string,
    userId: string,
    userName: string,
    rating: number,
    comment: string
  ): Promise<Feedback> => {
    const { sentiment, categories } = analyzeSentiment(comment);
    
    const newFeedback: Feedback = {
      id: `feedback-${Date.now()}`,
      orderId,
      userId,
      userName,
      rating,
      comment,
      sentiment,
      categories,
      createdAt: new Date(),
    };

    const updated = [newFeedback, ...feedbacks];
    setFeedbacks(updated);
    await saveToStorage(STORAGE_KEY, updated);
    return newFeedback;
  };

  const getFeedbackByOrder = (orderId: string): Feedback | undefined => {
    return feedbacks.find(f => f.orderId === orderId);
  };

  const getFeedbackStats = () => {
    const total = feedbacks.length;
    const positive = feedbacks.filter(f => f.sentiment === 'positive').length;
    const neutral = feedbacks.filter(f => f.sentiment === 'neutral').length;
    const negative = feedbacks.filter(f => f.sentiment === 'negative').length;
    
    const avgRating = total > 0 
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / total 
      : 0;

    return {
      total,
      positive,
      neutral,
      negative,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  };

  return {
    feedbacks,
    loading,
    addFeedback,
    getFeedbackByOrder,
    getFeedbackStats,
  };
};
