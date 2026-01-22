const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Patient Information
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient reference is required']
  },
  
  // Doctor Information
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor reference is required']
  },
  
  // ASHA Worker (if consultation was initiated through ASHA)
  ashaWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Source Tracking
  consultationSource: {
    type: String,
    enum: ['patient_direct', 'asha_worker', 'emergency'],
    required: true,
    default: 'patient_direct'
  },
  
  // Appointment Details
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required']
  },
  duration: {
    type: Number,
    default: 30, // Duration in minutes
    min: 15,
    max: 120
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: [
      'pending',           // Awaiting doctor confirmation
      'confirmed',         // Doctor confirmed the appointment
      'in_progress',       // Consultation is happening
      'completed',         // Consultation finished
      'cancelled',         // Cancelled by patient or doctor
      'no_show',           // Patient didn't show up
      'rescheduled'        // Appointment was rescheduled
    ],
    default: 'pending',
    required: true
  },
  
  // Priority Level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Consultation Type
  consultationType: {
    type: String,
    enum: ['video', 'audio', 'chat', 'in_person'],
    required: true,
    default: 'video'
  },
  
  // Chief Complaints and Symptoms
  chiefComplaints: {
    type: String,
    required: [true, 'Chief complaints are required'],
    trim: true,
    maxlength: 1000
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  symptomDuration: {
    type: String,
    trim: true // e.g., "3 days", "2 weeks"
  },
  
  // Voice Notes (for patients who cannot type)
  voiceNotes: [{
    url: {
      type: String,
      required: true
    },
    duration: Number, // in seconds
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Media Attachments
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document', 'audio'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    fileName: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  
  // Questions from ASHA/Patient
  questions: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    askedAt: {
      type: Date,
      default: Date.now
    },
    answer: {
      type: String,
      trim: true
    },
    answeredAt: Date
  }],
  
  // Vital Signs (if recorded by ASHA)
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      unit: {
        type: String,
        default: 'mmHg'
      }
    },
    heartRate: {
      value: Number,
      unit: {
        type: String,
        default: 'bpm'
      }
    },
    temperature: {
      value: Number,
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      }
    },
    oxygenSaturation: {
      value: Number,
      unit: {
        type: String,
        default: '%'
      }
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
      }
    },
    height: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'inches'],
        default: 'cm'
      }
    },
    recordedAt: Date,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Doctor's Notes
  doctorNotes: {
    diagnosis: {
      type: String,
      trim: true
    },
    observations: {
      type: String,
      trim: true
    },
    treatmentPlan: {
      type: String,
      trim: true
    },
    additionalNotes: {
      type: String,
      trim: true
    }
  },
  
  // AI Analysis Results (Gemini-based)
  aiAnalysis: {
    geminiSummary: {
      type: String,
      trim: true
    },
    probableDiagnosis: [{
      condition: String,
      confidence: {
        type: Number,
        min: 0,
        max: 100
      },
      reasoning: String
    }],
    recommendations: [{
      type: String,
      trim: true
    }],
    warningFlags: [{
      type: String,
      trim: true
    }],
    imageAnalysis: [{
      imageUrl: String,
      description: String,
      observations: [String],
      detectedConditions: [{
        condition: String,
        confidence: Number,
        reasoning: String
      }],
      analyzedAt: Date
    }],
    analyzedAt: Date,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Prescription Reference
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    default: null
  },
  
  // Follow-up Information
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    date: Date,
    notes: String
  },
  
  // Cancellation/Rescheduling
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  rescheduledTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  
  // Payment Information
  payment: {
    amount: {
      type: Number,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'waived'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['cash', 'upi', 'card', 'insurance', 'government_scheme']
    },
    transactionId: String,
    paidAt: Date
  },
  
  // Communication Log
  communicationLog: [{
    type: {
      type: String,
      enum: ['call', 'message', 'notification', 'reminder']
    },
    content: String,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Consultation Duration Tracking
  consultationStartedAt: Date,
  consultationEndedAt: Date,
  
  // Feedback
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1, status: 1 });
appointmentSchema.index({ ashaWorker: 1, status: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ consultationSource: 1 });
appointmentSchema.index({ priority: 1, status: 1 });

// Virtual for calculated consultation duration
appointmentSchema.virtual('actualDuration').get(function() {
  if (this.consultationStartedAt && this.consultationEndedAt) {
    return Math.round((this.consultationEndedAt - this.consultationStartedAt) / (1000 * 60)); // in minutes
  }
  return null;
});

// Virtual for checking if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return this.appointmentDate > now && ['pending', 'confirmed'].includes(this.status);
});

// Pre-save middleware to validate doctor and patient roles
appointmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const User = mongoose.model('User');
      
      const patient = await User.findById(this.patient);
      const doctor = await User.findById(this.doctor);
      
      if (!patient || patient.role !== 'patient') {
        throw new Error('Invalid patient reference');
      }
      
      if (!doctor || doctor.role !== 'doctor') {
        throw new Error('Invalid doctor reference');
      }
      
      if (this.ashaWorker) {
        const asha = await User.findById(this.ashaWorker);
        if (!asha || asha.role !== 'asha_worker') {
          throw new Error('Invalid ASHA worker reference');
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Method to mark appointment as completed
appointmentSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.consultationEndedAt = new Date();
  return this.save();
};

// Static method to get doctor's queue
appointmentSchema.statics.getDoctorQueue = function(doctorId, filters = {}) {
  const query = {
    doctor: doctorId,
    status: { $in: ['pending', 'confirmed'] },
    ...filters
  };
  
  return this.find(query)
    .populate('patient', 'fullName phone avatar patientDetails')
    .populate('ashaWorker', 'fullName phone')
    .sort({ priority: -1, appointmentDate: 1 })
    .exec();
};

// Static method to get patient's consultation history
appointmentSchema.statics.getPatientHistory = function(patientId) {
  return this.find({ patient: patientId })
    .populate('doctor', 'fullName doctorDetails.specialization avatar')
    .populate('prescription')
    .sort({ appointmentDate: -1 })
    .exec();
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
