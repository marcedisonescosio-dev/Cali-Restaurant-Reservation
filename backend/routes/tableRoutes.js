const express = require('express');
const router = express.Router();
const {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable
} = require('../controllers/tableController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public / Authenticated read routes
router.get('/', getTables);
router.get('/:id', getTableById);

// Admin-only management routes
router.post('/', protect, adminOnly, createTable);
router.put('/:id', protect, adminOnly, updateTable);
router.delete('/:id', protect, adminOnly, deleteTable);

module.exports = router;
