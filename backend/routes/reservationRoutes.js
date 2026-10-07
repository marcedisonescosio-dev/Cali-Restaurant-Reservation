const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getAvailableTables,
  getReservationById,
  cancelReservation
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

// Check available tables (can be used before or during reservation flow)
router.get('/available-tables', getAvailableTables);

// Customer reservation endpoints (Protected)
router.post('/', protect, createReservation);
router.get('/my', protect, getMyReservations);
router.get('/:id', protect, getReservationById);
router.put('/:id/cancel', protect, cancelReservation);

module.exports = router;
