const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  // References
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Appointment reference is required']
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient reference is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor reference is required']
  },
  
  // Routing Logic - determines where prescription is sent
  routeTo: {
    type: String,
    enum: ['patient', 'asha_worker'],
    required: true
  },
  ashaWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Only populated if routeTo is 'asha_worker'
  },
  
  // Prescription Metadata
  prescriptionNumber: {
    type: String,
    unique: true,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  validUntil: {
    type: Date,
    required: function() {
      return this.medications && this.medications.some(med => med.isControlled);
    }
  },
  
  // Diagnosis
  diagnosis: {
    primary: {
      type: String,
      required: [true, 'Primary diagnosis is required'],
      trim: true
    },
    secondary: [{
      type: String,
      trim: true
    }],
    icdCode: String // International Classification of Diseases code
  },
  
  // Medications
  medications: [{
    name: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true
    },
    genericName: {
      type: String,
      trim: true
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true // e.g., "500mg", "10ml"
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      trim: true // e.g., "Twice daily", "Every 8 hours"
    },
    duration: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
        required: true
      }
    },
    timing: {
      type: String,
      enum: ['before_meal', 'after_meal', 'with_meal', 'empty_stomach', 'bedtime', 'as_needed'],
      default: 'after_meal'
    },
    route: {
      type: String,
      enum: ['oral', 'topical', 'injection', 'inhalation', 'sublingual', 'rectal', 'transdermal'],
      default: 'oral'
    },
    quantity: {
      type: Number,
      required: true // Total quantity to be dispensed
    },
    refills: {
      type: Number,
      default: 0,
      min: 0
    },
    specialInstructions: {
      type: String,
      trim: true
    },
    isControlled: {
      type: Boolean,
      default: false // Controlled substances require special handling
    },
    price: {
      type: Number,
      min: 0
    }
  }],
  
  // Lab Tests Recommended
  labTests: [{
    testName: {
      type: String,
      required: true,
      trim: true
    },
    reason: {
      type: String,
      trim: true
    },
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'stat'],
      default: 'routine'
    },
    estimatedCost: {
      type: Number,
      min: 0
    }
  }],
  
  // Dietary Recommendations
  dietaryAdvice: [{
    type: String,
    trim: true
  }],
  
  // Lifestyle Modifications
  lifestyleAdvice: [{
    type: String,
    trim: true
  }],
  
  // Warnings and Precautions
  warnings: [{
    type: String,
    trim: true
  }],
  allergies: [{
    type: String,
    trim: true
  }],
  
  // Follow-up Instructions
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    recommendedDate: Date,
    reason: {
      type: String,
      trim: true
    },
    instructions: {
      type: String,
      trim: true
    }
  },
  
  // Referral (if needed)
  referral: {
    required: {
      type: Boolean,
      default: false
    },
    specialist: {
      type: String,
      trim: true
    },
    reason: {
      type: String,
      trim: true
    },
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'emergency'],
      default: 'routine'
    }
  },
  
  // Additional Notes
  additionalNotes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  // Digital Signature
  digitalSignature: {
    type: String // Base64 encoded signature or URL
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: [
      'active',        // Currently valid prescription
      'completed',     // Patient completed the course
      'expired',       // Prescription validity expired
      'cancelled',     // Cancelled by doctor
      'partially_filled' // Some medications dispensed
    ],
    default: 'active'
  },
  
  // Dispensing Information
  dispensing: [{
    pharmacyName: String,
    pharmacistName: String,
    dispensedDate: {
      type: Date,
      default: Date.now
    },
    medicationsDispensed: [{
      medication: String,
      quantityDispensed: Number,
      batchNumber: String
    }],
    cost: {
      type: Number,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'insurance']
    }
  }],
  
  // Delivery Information (for home delivery via ASHA)
  delivery: {
    required: {
      type: Boolean,
      default: false
    },
    deliveredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // ASHA worker
    },
    deliveryDate: Date,
    deliveryStatus: {
      type: String,
      enum: ['pending', 'in_transit', 'delivered', 'failed'],
      default: 'pending'
    },
    deliveryNotes: String,
    patientSignature: String // Base64 or URL
  },
  
  // Notification Status
  notifications: {
    sentToPatient: {
      type: Boolean,
      default: false
    },
    sentToASHA: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  },
  
  // PDF Generation
  pdfUrl: {
    type: String,
    default: null
  },
  
  // Compliance Tracking
  compliance: {
    patientReported: {
      type: String,
      enum: ['fully_compliant', 'partially_compliant', 'non_compliant', 'not_reported'],
      default: 'not_reported'
    },
    lastUpdated: Date,
    notes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
prescriptionSchema.index({ prescriptionNumber: 1 }, { unique: true });
prescriptionSchema.index({ patient: 1, issueDate: -1 });
prescriptionSchema.index({ doctor: 1, issueDate: -1 });
prescriptionSchema.index({ ashaWorker: 1, status: 1 });
prescriptionSchema.index({ appointment: 1 });
prescriptionSchema.index({ status: 1, validUntil: 1 });

// Virtual for checking if prescription is valid
prescriptionSchema.virtual('isValid').get(function() {
  if (this.status !== 'active') return false;
  if (this.validUntil && new Date() > this.validUntil) return false;
  return true;
});

// Virtual for total medication cost
prescriptionSchema.virtual('totalCost').get(function() {
  if (!this.medications || this.medications.length === 0) return 0;
  
  return this.medications.reduce((total, med) => {
    return total + (med.price || 0) * (med.quantity || 1);
  }, 0);
});

// Virtual for total duration in days
prescriptionSchema.virtual('totalDurationDays').get(function() {
  if (!this.medications || this.medications.length === 0) return 0;
  
  const durations = this.medications.map(med => {
    let days = med.duration.value;
    if (med.duration.unit === 'weeks') days *= 7;
    if (med.duration.unit === 'months') days *= 30;
    return days;
  });
  
  return Math.max(...durations);
});

// Pre-save middleware to generate prescription number
prescriptionSchema.pre('save', async function(next) {
  if (this.isNew && !this.prescriptionNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Find the last prescription of this month
    const lastPrescription = await this.constructor
      .findOne({ 
        prescriptionNumber: new RegExp(`^RX${year}${month}`)
      })
      .sort({ prescriptionNumber: -1 })
      .select('prescriptionNumber')
      .lean();
    
    let sequence = 1;
    if (lastPrescription) {
      const lastSequence = parseInt(lastPrescription.prescriptionNumber.slice(-4));
      sequence = lastSequence + 1;
    }
    
    this.prescriptionNumber = `RX${year}${month}${String(sequence).padStart(4, '0')}`;
  }
  
  next();
});

// Pre-save middleware to set validUntil for controlled substances
prescriptionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('medications')) {
    const hasControlled = this.medications.some(med => med.isControlled);
    
    if (hasControlled && !this.validUntil) {
      // Set validity to 30 days for controlled substances
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);
      this.validUntil = validUntil;
    }
  }
  
  next();
});

// Method to mark as dispensed
prescriptionSchema.methods.markAsDispensed = function(dispensingInfo) {
  this.dispensing.push(dispensingInfo);
  
  // Check if all medications are dispensed
  const allMedsDispensed = this.medications.every(med => 
    this.dispensing.some(d => 
      d.medicationsDispensed.some(m => m.medication === med.name)
    )
  );
  
  if (allMedsDispensed) {
    this.status = 'completed';
  } else {
    this.status = 'partially_filled';
  }
  
  return this.save();
};

// Static method to get active prescriptions for a patient
prescriptionSchema.statics.getActiveForPatient = function(patientId) {
  return this.find({
    patient: patientId,
    status: 'active',
    $or: [
      { validUntil: { $exists: false } },
      { validUntil: { $gte: new Date() } }
    ]
  })
  .populate('doctor', 'fullName doctorDetails.specialization')
  .populate('appointment', 'appointmentDate')
  .sort({ issueDate: -1 })
  .exec();
};

// Static method to get prescriptions pending delivery for ASHA
prescriptionSchema.statics.getPendingDeliveryForASHA = function(ashaWorkerId) {
  return this.find({
    ashaWorker: ashaWorkerId,
    'delivery.required': true,
    'delivery.deliveryStatus': { $in: ['pending', 'in_transit'] }
  })
  .populate('patient', 'fullName phone location')
  .populate('doctor', 'fullName')
  .sort({ issueDate: -1 })
  .exec();
};

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
