const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: [true, 'Table reference is required']
    },
    reservationDate: {
      type: String,
      required: [true, 'Reservation date is required'] // Format: YYYY-MM-DD
    },
    reservationTime: {
      type: String,
      required: [true, 'Reservation time is required'] // Format: HH:mm (e.g. 18:00)
    },
    guestCount: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: [1, 'At least 1 guest is required']
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Checked In', 'Completed', 'Cancelled', 'Rejected'],
      default: 'Pending'
    },
    specialRequest: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Reservation', reservationSchema);
