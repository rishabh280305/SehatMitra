const mongoose = require('mongoose');

// Call session model for polling-based calling system
const callSchema = new mongoose.Schema({
  callId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  caller: {
    type: String,
    required: true,
    index: true
  },
  callerName: {
    type: String,
    required: true
  },
  receiver: {
    type: String,
    required: true,
    index: true
  },
  receiverName: {
    type: String,
    required: true
  },
  callType: {
    type: String,
    enum: ['voice', 'video'],
    required: true
  },
  status: {
    type: String,
    enum: ['ringing', 'active', 'ended', 'rejected', 'missed', 'answered'],
    default: 'ringing'
  },
  offer: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  iceCandidates: [{
    from: String,
    candidate: mongoose.Schema.Types.Mixed
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Auto-delete calls after 24 hours
callSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Call', callSchema);
