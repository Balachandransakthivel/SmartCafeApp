const express = require('express');
const router = express.Router();
const { getMenuItems, createMenuItem } = require('../controllers/menuController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getMenuItems)
  .post(protect, admin, createMenuItem);

module.exports = router;
