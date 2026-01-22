const mongoose = require('mongoose');

const stockSupplySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  itemType: {
    type: String,
    enum: ['medicine', 'equipment', 'consumable', 'other'],
    default: 'medicine'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      default: 'Maharashtra'
    }
  },
  expiryDate: {
    type: Date
  },
  minimumThreshold: {
    type: Number,
    default: 10
  },
  currentStock: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['sufficient', 'low', 'critical', 'out_of_stock'],
    default: 'sufficient'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StockSupply', stockSupplySchema);
