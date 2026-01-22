const mongoose = require('mongoose');

const followUpRequestSchema = new mongoose.Schema({
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: false
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'patientModel'
  },
  patientModel: {
    type: String,
    enum: ['Patient', 'User'],
    default: 'Patient'
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestType: {
    type: String,
    enum: ['more_info', 'audio_call', 'video_call'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  respondedAt: {
    type: Date
  }
}, { timestamps: true });

// Index for queries
followUpRequestSchema.index({ patient: 1, status: 1 });
followUpRequestSchema.index({ consultation: 1 });

module.exports = mongoose.model('FollowUpRequest', followUpRequestSchema);
