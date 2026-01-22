const mongoose = require('mongoose');

const stockRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterType: {
    type: String,
    enum: ['hospital', 'asha'],
    required: true
  },
  items: [{
    itemName: {
      type: String,
      required: true
    },
    itemType: {
      type: String,
      enum: ['medicine', 'equipment', 'consumable', 'other']
    },
    requestedQuantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit: String,
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    reason: String
  }],
  district: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'fulfilled', 'partially_fulfilled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  aiRecommendation: {
    recommended: Boolean,
    confidence: Number,
    reasoning: String,
    predictedNeed: Number
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('StockRequest', stockRequestSchema);
