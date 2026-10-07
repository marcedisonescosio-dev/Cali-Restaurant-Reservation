const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changePassword
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All user routes are protected with JWT
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
