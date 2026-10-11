const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
      unique: true,
      min: [1, 'Table number must be at least 1']
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    tableClass: {
      type: String,
      enum: ['window_terrace', 'main_hall', 'vip_salons'],
      required: [true, 'Dining area is required'],
      default() {
        const number = Number(this.tableNumber);
        if (number <= 2) return 'window_terrace';
        if (number >= 7 && number <= 8) return 'vip_salons';
        return 'main_hall';
      }
    },
    reservationFeeOverride: {
      type: Number,
      default: null,
      min: [0, 'Reservation fee cannot be negative'],
      max: [1000000, 'Reservation fee is too large']
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
      default: 'available'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Table', tableSchema);
