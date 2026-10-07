const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuCategory',
      required: [true, 'Category reference is required']
    },
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    image: {
      type: String,
      default: ''
    },
    availability: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
