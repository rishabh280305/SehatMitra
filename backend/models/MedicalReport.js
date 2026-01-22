const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  // References
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient reference is required']
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null // Can be null if uploaded outside of consultation
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Can be patient, ASHA worker, or doctor
  },
  
  // Report Metadata
  reportType: {
    type: String,
    enum: [
      'blood_test',
      'urine_test',
      'x_ray',
      'ct_scan',
      'mri',
      'ultrasound',
      'ecg',
      'echo',
      'biopsy',
      'pathology',
      'radiology',
      'prescription',
      'discharge_summary',
      'vaccination_record',
      'medical_image',
      'other'
    ],
    required: true
  },
  reportName: {
    type: String,
    required: [true, 'Report name is required'],
    trim: true
  },
  reportDate: {
    type: Date,
    required: [true, 'Report date is required']
  },
  facilityName: {
    type: String,
    trim: true // Lab or hospital name where test was done
  },
  
  // File Information
  files: [{
    url: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      enum: ['image', 'pdf', 'document'],
      required: true
    },
    fileSize: {
      type: Number, // in bytes
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    thumbnailUrl: String, // For images
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Text Extraction (OCR or manual entry)
  extractedText: {
    type: String,
    trim: true
  },
  
  // Structured Test Results (for blood tests, etc.)
  testResults: [{
    testName: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      trim: true
    },
    referenceRange: {
      min: String,
      max: String,
      text: String // e.g., "Normal", "10-20 mg/dL"
    },
    status: {
      type: String,
      enum: ['normal', 'abnormal', 'critical', 'borderline'],
      default: 'normal'
    },
    notes: String
  }],
  
  // AI Analysis
  aiAnalysis: {
    processed: {
      type: Boolean,
      default: false
    },
    processedAt: Date,
    
    // Gemini Text Analysis
    geminiAnalysis: {
      summary: {
        type: String,
        trim: true
      },
      keyFindings: [{
        finding: String,
        severity: {
          type: String,
          enum: ['normal', 'mild', 'moderate', 'severe', 'critical']
        }
      }],
      recommendations: [String],
      flaggedAbnormalities: [{
        parameter: String,
        actualValue: String,
        expectedRange: String,
        deviationLevel: String
      }]
    },
    
    // Gemini Vision Analysis (for medical images)
    imageAnalysis: {
      description: String,
      observations: [String],
      abnormalities: [{
        finding: String,
        location: String,
        severity: {
          type: String,
          enum: ['normal', 'mild', 'moderate', 'severe', 'critical']
        }
      }],
      probableConditions: [{
        condition: String,
        confidence: {
          type: Number,
          min: 0,
          max: 100
        },
        reasoning: String
      }],
      recommendations: [String]
    },
    
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    requiresReview: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Doctor who reviewed AI analysis
    },
    reviewedAt: Date,
    reviewNotes: String
  },
  
  // Doctor's Review
  doctorReview: {
    reviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    interpretation: {
      type: String,
      trim: true
    },
    clinicalSignificance: {
      type: String,
      enum: ['normal', 'requires_monitoring', 'requires_treatment', 'urgent_attention'],
      default: 'normal'
    },
    additionalNotes: {
      type: String,
      trim: true
    }
  },
  
  // Tags and Categories
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: ['diagnostic', 'preventive', 'follow_up', 'emergency', 'routine'],
    default: 'diagnostic'
  },
  
  // Privacy and Access Control
  isPrivate: {
    type: Boolean,
    default: false // If true, only patient and explicitly granted users can view
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    accessLevel: {
      type: String,
      enum: ['view', 'comment', 'edit'],
      default: 'view'
    }
  }],
  
  // Comments and Annotations
  comments: [{
    commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    commentedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Report Status
  status: {
    type: String,
    enum: ['pending', 'processed', 'reviewed', 'archived'],
    default: 'pending'
  },
  
  // Quality Flags
  quality: {
    imageQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    readability: {
      type: String,
      enum: ['clear', 'readable', 'partial', 'unclear'],
      default: 'clear'
    },
    completeness: {
      type: String,
      enum: ['complete', 'incomplete', 'missing_data'],
      default: 'complete'
    }
  },
  
  // Metadata
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  description: {
    type: String,
    trim: true
  },
  
  // Archive Information
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  archiveReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
medicalReportSchema.index({ patient: 1, reportDate: -1 });
medicalReportSchema.index({ uploadedBy: 1, createdAt: -1 });
medicalReportSchema.index({ appointment: 1 });
medicalReportSchema.index({ reportType: 1, patient: 1 });
medicalReportSchema.index({ status: 1 });
medicalReportSchema.index({ 'aiAnalysis.processed': 1 });
medicalReportSchema.index({ tags: 1 });
medicalReportSchema.index({ 'doctorReview.clinicalSignificance': 1 });

// Text search index
medicalReportSchema.index({ 
  reportName: 'text', 
  extractedText: 'text', 
  notes: 'text',
  description: 'text'
});

// Virtual for total file size
medicalReportSchema.virtual('totalFileSize').get(function() {
  if (!this.files || this.files.length === 0) return 0;
  return this.files.reduce((total, file) => total + file.fileSize, 0);
});

// Virtual for checking if report needs urgent attention
medicalReportSchema.virtual('needsUrgentAttention').get(function() {
  if (this.doctorReview && this.doctorReview.clinicalSignificance === 'urgent_attention') {
    return true;
  }
  
  if (this.aiAnalysis && this.aiAnalysis.processed) {
    // Check for critical findings
    const hasCriticalFindings = this.testResults.some(test => test.status === 'critical');
    const hasSevereFindings = this.aiAnalysis.geminiAnalysis?.keyFindings?.some(
      finding => finding.severity === 'critical' || finding.severity === 'severe'
    );
    
    return hasCriticalFindings || hasSevereFindings;
  }
  
  return false;
});

// Pre-save middleware to update status
medicalReportSchema.pre('save', function(next) {
  if (this.aiAnalysis && this.aiAnalysis.processed && this.status === 'pending') {
    this.status = 'processed';
  }
  
  if (this.doctorReview && this.doctorReview.reviewed && this.status === 'processed') {
    this.status = 'reviewed';
  }
  
  next();
});

// Method to share report with a user
medicalReportSchema.methods.shareWith = function(userId, accessLevel = 'view') {
  const existingShare = this.sharedWith.find(
    share => share.user.toString() === userId.toString()
  );
  
  if (!existingShare) {
    this.sharedWith.push({
      user: userId,
      accessLevel: accessLevel,
      sharedAt: new Date()
    });
  } else {
    existingShare.accessLevel = accessLevel;
  }
  
  return this.save();
};

// Method to add AI analysis
medicalReportSchema.methods.addAIAnalysis = function(analysisData) {
  this.aiAnalysis = {
    ...this.aiAnalysis,
    ...analysisData,
    processed: true,
    processedAt: new Date()
  };
  
  return this.save();
};

// Static method to get reports needing AI analysis
medicalReportSchema.statics.getPendingAIAnalysis = function() {
  return this.find({
    'aiAnalysis.processed': false,
    reportType: { $in: ['blood_test', 'x_ray', 'ct_scan', 'mri', 'medical_image'] }
  })
  .populate('patient', 'fullName')
  .limit(50)
  .exec();
};

// Static method to get patient's medical history
medicalReportSchema.statics.getPatientHistory = function(patientId, filters = {}) {
  const query = {
    patient: patientId,
    status: { $ne: 'archived' },
    ...filters
  };
  
  return this.find(query)
    .sort({ reportDate: -1 })
    .populate('uploadedBy', 'fullName role')
    .populate('doctorReview.reviewedBy', 'fullName doctorDetails.specialization')
    .exec();
};

// Static method to search reports
medicalReportSchema.statics.searchReports = function(patientId, searchText) {
  return this.find({
    patient: patientId,
    $text: { $search: searchText }
  }, {
    score: { $meta: 'textScore' }
  })
  .sort({ score: { $meta: 'textScore' } })
  .limit(20)
  .exec();
};

const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);

module.exports = MedicalReport;
