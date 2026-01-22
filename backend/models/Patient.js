const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: 0,
    max: 150
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other']
  },
  contactNumber: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  symptoms: {
    type: String,
    required: [true, 'Symptoms are required']
  },
  vitalSigns: {
    temperature: { type: String, default: '' },
    bloodPressure: { type: String, default: '' },
    pulseRate: { type: String, default: '' },
    oxygenLevel: { type: String, default: '' }
  },
  notes: {
    type: String,
    default: ''
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  consultationRequested: {
    type: Boolean,
    default: false
  },
  consultationRequestedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'in_consultation', 'completed', 'referred'],
    default: 'pending'
  },
  diagnosis: {
    type: String,
    default: ''
  },
  prescription: {
    type: String,
    default: ''
  },
  followUpDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
