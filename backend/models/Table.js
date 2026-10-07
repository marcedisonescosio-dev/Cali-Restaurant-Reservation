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
