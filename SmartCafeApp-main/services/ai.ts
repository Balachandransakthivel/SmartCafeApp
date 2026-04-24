import { Feedback, Order, MenuItem, DemandPrediction, Analytics } from '@/types';

// AI Sentiment Analysis for Feedback
export const analyzeSentiment = (comment: string): {
  sentiment: 'positive' | 'neutral' | 'negative';
  categories: string[];
} => {
  const lowerComment = comment.toLowerCase();
  
  // Simple keyword-based sentiment analysis (mock AI)
  const positiveKeywords = ['good', 'great', 'excellent', 'delicious', 'amazing', 'love', 'best', 'fresh', 'tasty', 'perfect'];
  const negativeKeywords = ['bad', 'terrible', 'horrible', 'cold', 'slow', 'late', 'burnt', 'stale', 'worst', 'not good'];
  
  const positiveCount = positiveKeywords.filter(word => lowerComment.includes(word)).length;
  const negativeCount = negativeKeywords.filter(word => lowerComment.includes(word)).length;
  
  let sentiment: 'positive' | 'neutral' | 'negative';
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }
  
  // Detect categories mentioned
  const categories: string[] = [];
  if (lowerComment.includes('taste') || lowerComment.includes('flavor') || lowerComment.includes('delicious')) {
    categories.push('Taste');
  }
  if (lowerComment.includes('service') || lowerComment.includes('staff') || lowerComment.includes('waiter')) {
    categories.push('Service');
  }
  if (lowerComment.includes('fast') || lowerComment.includes('slow') || lowerComment.includes('quick') || lowerComment.includes('time')) {
    categories.push('Speed');
  }
  if (lowerComment.includes('price') || lowerComment.includes('value') || lowerComment.includes('expensive') || lowerComment.includes('cheap')) {
    categories.push('Value');
  }
  if (lowerComment.includes('clean') || lowerComment.includes('hygiene') || lowerComment.includes('ambiance')) {
    categories.push('Ambiance');
  }
  
  if (categories.length === 0) {
    categories.push('General');
  }
  
  return { sentiment, categories };
};

// AI Demand Prediction
export const predictDemand = (orders: Order[], menuItems: MenuItem[]): DemandPrediction[] => {
  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  
  // Analyze order patterns
  const itemCounts: { [itemId: string]: number } = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      itemCounts[item.menuItem.id] = (itemCounts[item.menuItem.id] || 0) + item.quantity;
    });
  });
  
  // Generate predictions
  const predictions: DemandPrediction[] = [];
  
  // Peak hours logic (mock AI)
  const isPeakHour = currentHour >= 12 && currentHour <= 14 || currentHour >= 18 && currentHour <= 21;
  const isWeekend = currentDay === 0 || currentDay === 6;
  
  menuItems.slice(0, 5).forEach(item => {
    let predictedDemand = itemCounts[item.id] || 10;
    let confidence = 0.7;
    let recommendation = '';
    
    // Adjust predictions based on time and category
    if (item.category === 'Coffee') {
      if (currentHour >= 7 && currentHour <= 11) {
        predictedDemand *= 1.8;
        confidence = 0.9;
        recommendation = 'High morning demand - ensure stock';
      } else if (currentHour >= 15 && currentHour <= 17) {
        predictedDemand *= 1.5;
        confidence = 0.85;
        recommendation = 'Afternoon coffee rush expected';
      }
    } else if (item.category === 'Burger' || item.category === 'Pizza') {
      if (isPeakHour) {
        predictedDemand *= 2;
        confidence = 0.95;
        recommendation = 'Lunch/dinner rush - prepare ingredients';
      }
      if (isWeekend) {
        predictedDemand *= 1.3;
        confidence = 0.88;
        recommendation = 'Weekend demand high - stock up';
      }
    } else if (item.category === 'Snacks') {
      if (currentHour >= 16 && currentHour <= 19) {
        predictedDemand *= 1.4;
        confidence = 0.8;
        recommendation = 'Evening snack time - moderate demand';
      }
    }
    
    predictions.push({
      itemId: item.id,
      itemName: item.name,
      predictedDemand: Math.round(predictedDemand),
      confidence,
      timeSlot: getTimeSlot(currentHour),
      recommendation: recommendation || 'Normal demand expected',
    });
  });
  
  return predictions.sort((a, b) => b.predictedDemand - a.predictedDemand);
};

const getTimeSlot = (hour: number): string => {
  if (hour >= 7 && hour < 12) return 'Morning (7 AM - 12 PM)';
  if (hour >= 12 && hour < 17) return 'Afternoon (12 PM - 5 PM)';
  if (hour >= 17 && hour < 22) return 'Evening (5 PM - 10 PM)';
  return 'Night (10 PM - 7 AM)';
};

// Generate Analytics
export const generateAnalytics = (orders: Order[], menuItems: MenuItem[]): Analytics => {
  const totalRevenue = orders.reduce((sum, order) => sum + order.finalAmount, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Popular items
  const itemCounts: { [itemId: string]: number } = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      itemCounts[item.menuItem.id] = (itemCounts[item.menuItem.id] || 0) + item.quantity;
    });
  });
  
  const popularItems = Object.entries(itemCounts)
    .map(([itemId, count]) => ({
      item: menuItems.find(m => m.id === itemId)!,
      count,
    }))
    .filter(item => item.item)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Peak hours
  const hourCounts: { [hour: number]: number } = {};
  orders.forEach(order => {
    const hour = new Date(order.createdAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  const peakHours = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), orders: count }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 6);
  
  // Revenue by day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  const revenueByDay = last7Days.map(date => {
    const dayRevenue = orders
      .filter(order => order.createdAt.toISOString().split('T')[0] === date)
      .reduce((sum, order) => sum + order.finalAmount, 0);
    return { date, revenue: dayRevenue };
  });
  
  // Category distribution
  const categoryRevenue: { [category: string]: number } = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const cat = item.menuItem.category;
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + item.price * item.quantity;
    });
  });
  
  const totalCategoryRevenue = Object.values(categoryRevenue).reduce((sum, val) => sum + val, 0);
  const categoryDistribution = Object.entries(categoryRevenue).map(([category, revenue]) => ({
    category,
    percentage: totalCategoryRevenue > 0 ? (revenue / totalCategoryRevenue) * 100 : 0,
  }));
  
  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    popularItems,
    peakHours,
    revenueByDay,
    categoryDistribution,
  };
};
