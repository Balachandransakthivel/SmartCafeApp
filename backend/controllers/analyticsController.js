const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// @desc    Get aggregate analytics for dashboard
// @route   GET /api/analytics
// @access  Private/Admin
const getAnalytics = asyncHandler(async (req, res) => {
  // 1. Total Stats
  const totalStats = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const stats = totalStats[0] || { totalRevenue: 0, totalOrders: 0 };
  const averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;

  // 2. Popular Items (Aggregation Pipeline)
  const popularItemsAggregate = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.menuItem',
        count: { $sum: '$items.quantity' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'menuitems',
        localField: '_id',
        foreignField: '_id',
        as: 'itemData',
      },
    },
    { $unwind: '$itemData' },
  ]);

  const popularItems = popularItemsAggregate.map(p => ({
    count: p.count,
    item: {
      name: p.itemData.name,
      category: p.itemData.category,
      price: p.itemData.price,
    }
  }));

  // 3. Peak Hours (Group by hour of createdAt)
  const peakHoursAggregate = await Order.aggregate([
    {
      $project: {
        hour: { $hour: '$createdAt' }
      }
    },
    {
      $group: {
        _id: '$hour',
        orders: { $sum: 1 }
      }
    },
    { $sort: { orders: -1 } },
    { $limit: 6 }
  ]);

  const peakHours = peakHoursAggregate.map(p => ({
    hour: p._id,
    orders: p.orders
  }));

  // 4. Revenue by Day (Last 7 Days)
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const revenueByDayAggregate = await Order.aggregate([
    { $match: { createdAt: { $gte: last7Days } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  const revenueByDay = revenueByDayAggregate.map(r => ({
    date: r._id,
    revenue: r.revenue
  }));

  // 5. Category Distribution
  const categoryDistAggregate = await Order.aggregate([
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'menuitems',
        localField: 'items.menuItem',
        foreignField: '_id',
        as: 'menuItemData'
      }
    },
    { $unwind: '$menuItemData' },
    {
      $group: {
        _id: '$menuItemData.category',
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    }
  ]);

  const totalCatRevenue = categoryDistAggregate.reduce((sum, c) => sum + c.revenue, 0);
  const categoryDistribution = categoryDistAggregate.map(c => ({
    category: c._id,
    percentage: totalCatRevenue > 0 ? (c.revenue / totalCatRevenue) * 100 : 0
  }));

  res.json({
    totalRevenue: stats.totalRevenue,
    totalOrders: stats.totalOrders,
    averageOrderValue,
    popularItems,
    peakHours,
    revenueByDay,
    categoryDistribution
  });
});

module.exports = { getAnalytics };
