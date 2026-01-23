const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't return password by default
  },
  
  // Role-based Access Control
  role: {
    type: String,
    enum: ['patient', 'asha_worker', 'doctor', 'admin', 'district_officer', 'hospital_admin'],
    required: true,
    default: 'patient'
  },
  
  // Profile Information
  avatar: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date,
    required: function() {
      return this.role === 'patient';
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: function() {
      return this.role === 'patient';
    }
  },
  
  // Language Preference (for multilingual support)
  language: {
    type: String,
    enum: ['en', 'hi', 'mr', 'gu'],
    default: 'en'
  },
  
  // Face Verification (for ASHA workers)
  faceDescriptor: {
    type: [Number], // Array of 128 numbers from face-api.js
    default: null,
    select: false // Don't return by default for security
  },
  faceVerificationEnabled: {
    type: Boolean,
    default: false
  },
  
  // Location Information
  location: {
    address: {
      type: String,
      trim: true
    },
    village: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    pincode: {
      type: String,
      match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  
  // Role-Specific Fields for ASHA Workers
  ashaWorkerDetails: {
    type: {
      workerId: {
        type: String,
        unique: true,
        sparse: true
      },
      certificationNumber: String,
      assignedArea: String,
      yearsOfExperience: Number,
      languagesSpoken: [String],
      assignedSupplyShop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SupplyShop'
      }
    },
    required: function() {
      return this.role === 'asha_worker';
    }
  },
  
  // Role-Specific Fields for Doctors
  doctorDetails: {
    type: {
      medicalLicenseNumber: {
        type: String,
        unique: true,
        sparse: true
      },
      specialization: {
        type: String,
        required: true
      },
      qualifications: [String],
      yearsOfExperience: Number,
      hospitalAffiliation: String,
      consultationFee: {
        type: Number,
        min: 0
      },
      availableSlots: [{
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        startTime: String,
        endTime: String
      }],
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      totalConsultations: {
        type: Number,
        default: 0
      }
    },
    required: function() {
      return this.role === 'doctor';
    }
  },
  
  // Role-Specific Fields for Patients
  patientDetails: {
    type: {
      emergencyContact: {
        name: String,
        phone: String,
        relationship: String
      },
      bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
      },
      chronicConditions: [String],
      allergies: [String],
      currentMedications: [String],
      insuranceDetails: {
        provider: String,
        policyNumber: String
      }
    }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpiry: Date,
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  
  // Device/Session Management
  fcmToken: {
    type: String,
    default: null // For push notifications
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
userSchema.index({ 'ashaWorkerDetails.workerId': 1 }, { sparse: true });
userSchema.index({ 'doctorDetails.medicalLicenseNumber': 1 }, { sparse: true });

// Virtual for age calculation
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for full phone number with country code
userSchema.virtual('fullPhoneNumber').get(function() {
  return `+91${this.phone}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to generate JWT token (to be implemented in auth controller)
userSchema.methods.generateAuthToken = function() {
  // This will be implemented with JWT
  return null;
};

// Method to remove sensitive data before sending response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  delete user.resetPasswordToken;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
