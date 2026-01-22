const mongoose = require('mongoose');

const supplyShopSchema = new mongoose.Schema({
  // Shop Information
  shopName: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true,
    unique: true
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  
  // Contact Information
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    alternatePhone: String,
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    }
  },
  
  // Location Information
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    village: {
      type: String,
      required: true,
      trim: true
    },
    block: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    },
    landmark: String
  },
  
  // Operating Details
  operatingHours: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    openTime: {
      type: String,
      required: true // e.g., "09:00"
    },
    closeTime: {
      type: String,
      required: true // e.g., "18:00"
    }
  }],
  
  // Shop Manager/Owner
  manager: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    email: String,
    qualification: String,
    registrationNumber: String // Pharmacist registration number
  },
  
  // Assigned ASHA Workers
  assignedAshaWorkers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Coverage Area
  coverageArea: {
    villages: [{
      type: String,
      trim: true
    }],
    radius: {
      type: Number, // in kilometers
      default: 10
    },
    estimatedPopulation: Number
  },
  
  // Inventory Stats
  inventoryStats: {
    totalProducts: {
      type: Number,
      default: 0
    },
    lowStockItems: {
      type: Number,
      default: 0
    },
    outOfStockItems: {
      type: Number,
      default: 0
    },
    expiringSoonItems: {
      type: Number,
      default: 0
    },
    lastUpdated: Date
  },
  
  // Services Offered
  services: [{
    type: String,
    enum: [
      'medicine_dispensing',
      'health_checkups',
      'vaccination',
      'first_aid',
      'health_consultation',
      'diagnostic_tests',
      'home_delivery',
      'emergency_services'
    ]
  }],
  
  // Facilities
  facilities: {
    hasRefrigeration: {
      type: Boolean,
      default: false
    },
    hasPowerBackup: {
      type: Boolean,
      default: false
    },
    hasComputerSystem: {
      type: Boolean,
      default: false
    },
    hasInternetConnection: {
      type: Boolean,
      default: false
    },
    storageCapacity: String // e.g., "500 sq ft"
  },
  
  // Certifications and Compliance
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    certificateUrl: String
  }],
  
  // Financial Information
  financial: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String,
    gstNumber: String
  },
  
  // Performance Metrics
  metrics: {
    totalTransactions: {
      type: Number,
      default: 0
    },
    monthlyTransactions: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    monthlyRevenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  
  // Reviews and Ratings
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    reviewDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'under_maintenance'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['low_stock', 'expiry', 'order', 'system', 'alert']
    },
    message: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['license', 'registration', 'certificate', 'agreement', 'other']
    },
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date
  }],
  
  // Additional Information
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  images: [{
    type: String
  }],
  
  // Government Scheme Integration
  governmentSchemes: [{
    schemeName: String,
    schemeId: String,
    enrollmentDate: Date,
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended']
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
supplyShopSchema.index({ shopName: 1 });
supplyShopSchema.index({ registrationNumber: 1 }, { unique: true });
supplyShopSchema.index({ licenseNumber: 1 }, { unique: true });
supplyShopSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
supplyShopSchema.index({ 'location.district': 1, 'location.village': 1 });
supplyShopSchema.index({ status: 1 });

// Virtual for checking if shop is currently open
supplyShopSchema.virtual('isCurrentlyOpen').get(function() {
  const now = new Date();
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const todayHours = this.operatingHours.find(oh => oh.day === dayName);
  
  if (!todayHours || !todayHours.isOpen) return false;
  
  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
});

// Virtual for full address
supplyShopSchema.virtual('fullAddress').get(function() {
  const loc = this.location;
  return `${loc.address}, ${loc.village}, ${loc.district}, ${loc.state} - ${loc.pincode}`;
});

// Method to add review
supplyShopSchema.methods.addReview = function(userId, rating, comment) {
  this.reviews.push({
    user: userId,
    rating: rating,
    comment: comment
  });
  
  // Recalculate average rating
  this.metrics.totalRatings = this.reviews.length;
  this.metrics.averageRating = this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length;
  
  return this.save();
};

// Method to update inventory stats
supplyShopSchema.methods.updateInventoryStats = async function() {
  const Inventory = mongoose.model('Inventory');
  
  const stats = await Inventory.aggregate([
    { $match: { supplyShop: this._id, isActive: true } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        lowStockItems: {
          $sum: {
            $cond: [{ $eq: ['$status', 'low_stock'] }, 1, 0]
          }
        },
        outOfStockItems: {
          $sum: {
            $cond: [{ $eq: ['$status', 'out_of_stock'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.inventoryStats = {
      ...stats[0],
      lastUpdated: new Date()
    };
  }
  
  return this.save();
};

// Static method to find nearby shops
supplyShopSchema.statics.findNearby = function(latitude, longitude, maxDistance = 10) {
  // maxDistance in kilometers
  const earthRadiusKm = 6371;
  
  return this.find({
    status: 'active',
    'location.coordinates.latitude': {
      $gte: latitude - (maxDistance / earthRadiusKm) * (180 / Math.PI),
      $lte: latitude + (maxDistance / earthRadiusKm) * (180 / Math.PI)
    },
    'location.coordinates.longitude': {
      $gte: longitude - (maxDistance / earthRadiusKm) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180),
      $lte: longitude + (maxDistance / earthRadiusKm) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180)
    }
  })
  .exec();
};

// Static method to get shops by district
supplyShopSchema.statics.getByDistrict = function(district) {
  return this.find({
    'location.district': new RegExp(district, 'i'),
    status: 'active'
  })
  .sort({ 'metrics.averageRating': -1 })
  .exec();
};

const SupplyShop = mongoose.model('SupplyShop', supplyShopSchema);

module.exports = SupplyShop;
