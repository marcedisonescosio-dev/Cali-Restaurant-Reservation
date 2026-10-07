const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public read routes
router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

// Admin-only management routes
router.post('/', protect, adminOnly, createMenuItem);
router.put('/:id', protect, adminOnly, updateMenuItem);
router.delete('/:id', protect, adminOnly, deleteMenuItem);

module.exports = router;
