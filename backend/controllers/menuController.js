const asyncHandler = require('express-async-handler');
const MenuItem = require('../models/MenuItem');

// @desc    Fetch all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({});
  res.json(items);
});

// @desc    Create a menu item
// @route   POST /api/menu
// @access  Private/Admin
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, category, imageUrl } = req.body;

  const item = new MenuItem({
    name,
    description,
    price,
    category,
    imageUrl,
  });

  const createdItem = await item.save();
  res.status(201).json(createdItem);
});

module.exports = { getMenuItems, createMenuItem };
