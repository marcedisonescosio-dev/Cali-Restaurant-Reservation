const express = require('express');
const router = express.Router();
const {
  getTables,
  getTableById,
  getDiningAreaPricing,
  updateDiningAreaPricing,
  createTable,
  updateTable,
  updateTablePricing,
  deleteTable
} = require('../controllers/tableController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public / Authenticated read routes
router.get('/', getTables);
router.get('/area-settings', getDiningAreaPricing);
router.get('/:id', getTableById);

// Admin-only management routes
router.put('/area-settings', protect, adminOnly, updateDiningAreaPricing);
router.post('/', protect, adminOnly, createTable);
router.put('/:id/pricing', protect, adminOnly, updateTablePricing);
router.put('/:id', protect, adminOnly, updateTable);
router.delete('/:id', protect, adminOnly, deleteTable);

module.exports = router;
