const mongoose = require('mongoose');

const callScheduleSchema = new mongoose.Schema({
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: false
  },
  followUpRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FollowUpRequest',
    required: true
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
  callType: {
    type: String,
    enum: ['audio', 'video'],
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 30
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'missed', 'cancelled'],
    default: 'pending'
  },
  acceptedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userType: {
      type: String,
      enum: ['doctor', 'patient', 'asha']
    },
    acceptedAt: Date
  }],
  callLink: {
    type: String
  },
  notes: {
    type: String
  }
}, { timestamps: true });

// Index for queries
callScheduleSchema.index({ doctor: 1, status: 1, scheduledTime: 1 });
callScheduleSchema.index({ patient: 1, status: 1 });
callScheduleSchema.index({ scheduledTime: 1 });

module.exports = mongoose.model('CallSchedule', callScheduleSchema);
