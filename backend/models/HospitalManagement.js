const mongoose = require('mongoose');

const hospitalManagementSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  beds: {
    total: {
      type: Number,
      required: true,
      min: 0
    },
    occupied: {
      type: Number,
      default: 0,
      min: 0
    },
    available: {
      type: Number,
      default: 0,
      min: 0
    },
    icu: {
      total: Number,
      occupied: Number,
      available: Number
    },
    general: {
      total: Number,
      occupied: Number,
      available: Number
    },
    emergency: {
      total: Number,
      occupied: Number,
      available: Number
    }
  },
  doctors: [{
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    specialization: String,
    shift: {
      type: String,
      enum: ['morning', 'evening', 'night', 'rotating']
    },
    daysAvailable: [String],
    currentlyOnDuty: {
      type: Boolean,
      default: false
    }
  }],
  staff: {
    nurses: Number,
    technicians: Number,
    support: Number
  },
  facilities: [{
    facilityName: String,
    available: Boolean,
    status: String
  }],
  emergencyContact: {
    phone: String,
    email: String
  },
  operatingHours: {
    type: String,
    default: '24/7'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update available beds when occupied changes
hospitalManagementSchema.pre('save', function(next) {
  this.beds.available = this.beds.total - this.beds.occupied;
  
  if (this.beds.icu) {
    this.beds.icu.available = this.beds.icu.total - this.beds.icu.occupied;
  }
  if (this.beds.general) {
    this.beds.general.available = this.beds.general.total - this.beds.general.occupied;
  }
  if (this.beds.emergency) {
    this.beds.emergency.available = this.beds.emergency.total - this.beds.emergency.occupied;
  }
  
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('HospitalManagement', hospitalManagementSchema);
