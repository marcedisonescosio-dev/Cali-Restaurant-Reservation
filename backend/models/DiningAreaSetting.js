const mongoose = require('mongoose');

const diningAreaSettingSchema = new mongoose.Schema(
  {
    tableClass: {
      type: String,
      enum: ['window_terrace', 'main_hall', 'vip_salons'],
      required: true,
      unique: true
    },
    reservationFee: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Reservation fee cannot be negative'],
      max: [1000000, 'Reservation fee is too large']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiningAreaSetting', diningAreaSettingSchema);
