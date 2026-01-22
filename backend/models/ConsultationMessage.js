const mongoose = require('mongoose');

const consultationMessageSchema = new mongoose.Schema({
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
    required: false
  },
  sender: {
    type: String,
    enum: ['patient', 'doctor', 'asha'],
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  files: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  messageType: {
    type: String,
    enum: ['text', 'voice', 'file', 'mixed'],
    default: 'text'
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for faster queries
consultationMessageSchema.index({ patient: 1, createdAt: -1 });
consultationMessageSchema.index({ doctor: 1, createdAt: -1 });

module.exports = mongoose.model('ConsultationMessage', consultationMessageSchema);
