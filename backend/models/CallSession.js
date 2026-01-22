const mongoose = require('mongoose');

const callSessionSchema = new mongoose.Schema({
  callId: {
    type: String,
    required: true,
    unique: true
  },
  caller: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userType: {
      type: String,
      enum: ['doctor'],
      required: true
    },
    name: String
  },
  receiver: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userType: {
      type: String,
      enum: ['patient', 'asha_worker'],
      required: true
    },
    name: String
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation'
  },
  status: {
    type: String,
    enum: ['ringing', 'ongoing', 'completed', 'missed', 'rejected', 'failed'],
    default: 'ringing'
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  transcript: {
    type: String,
    default: ''
  },
  transcriptSegments: [{
    speaker: {
      type: String,
      enum: ['caller', 'receiver']
    },
    text: String,
    timestamp: Date
  }],
  recording: {
    available: {
      type: Boolean,
      default: false
    },
    url: String
  },
  metadata: {
    network: {
      callerConnection: String,
      receiverConnection: String
    },
    devices: {
      callerDevice: String,
      receiverDevice: String
    }
  }
}, { timestamps: true });

// Index for queries
callSessionSchema.index({ 'caller.user': 1, createdAt: -1 });
callSessionSchema.index({ 'receiver.user': 1, createdAt: -1 });
callSessionSchema.index({ patient: 1 });
callSessionSchema.index({ callId: 1 });

module.exports = mongoose.model('CallSession', callSessionSchema);
