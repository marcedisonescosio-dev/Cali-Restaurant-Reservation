const express = require('express');
const router = express.Router();
const { getAdminStats, seedInitialData } = require('../controllers/adminController');
const {
  getAllReservationsAdmin,
  updateReservationStatusAdmin
} = require('../controllers/reservationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Get admin dashboard metrics
router.get('/stats', protect, adminOnly, getAdminStats);

// Manage all reservations across system
router.get('/reservations', protect, adminOnly, getAllReservationsAdmin);
router.put('/reservations/:id/status', protect, adminOnly, updateReservationStatusAdmin);

// Helper endpoint to populate initial seed data
router.post('/seed', seedInitialData);

module.exports = router;

