const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  // Supply Shop Information
  supplyShop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupplyShop',
    required: [true, 'Supply shop reference is required']
  },
  
  // Product Information
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  
  // Product Category
  category: {
    type: String,
    enum: [
      'medicine',
      'surgical_supplies',
      'diagnostic_tools',
      'first_aid',
      'contraceptives',
      'vitamins_supplements',
      'maternal_health',
      'child_health',
      'equipment',
      'consumables',
      'other'
    ],
    required: true
  },
  
  subcategory: {
    type: String,
    trim: true
  },
  
  // Medicine-Specific Fields
  medicineDetails: {
    form: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'powder', 'other']
    },
    strength: String, // e.g., "500mg", "10mg/ml"
    manufacturer: String,
    composition: String,
    requiresPrescription: {
      type: Boolean,
      default: false
    },
    isControlled: {
      type: Boolean,
      default: false
    },
    storageConditions: String // e.g., "Store in cool, dry place", "Refrigerate"
  },
  
  // Stock Information
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reorderLevel: {
    type: Number,
    required: true,
    min: 0,
    default: 10 // Alert when stock falls below this
  },
  maximumStock: {
    type: Number,
    min: 0 // Maximum stock capacity
  },
  unit: {
    type: String,
    required: true,
    enum: ['pieces', 'bottles', 'boxes', 'strips', 'vials', 'kg', 'grams', 'liters', 'ml'],
    default: 'pieces'
  },
  
  // Batch Information
  batches: [{
    batchNumber: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    manufacturingDate: Date,
    expiryDate: {
      type: Date,
      required: true
    },
    supplierName: String,
    costPrice: {
      type: Number,
      min: 0
    },
    sellingPrice: {
      type: Number,
      min: 0
    },
    receivedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'recalled', 'damaged'],
      default: 'active'
    }
  }],
  
  // Pricing
  price: {
    cost: {
      type: Number,
      required: true,
      min: 0
    },
    selling: {
      type: Number,
      required: true,
      min: 0
    },
    mrp: {
      type: Number,
      min: 0 // Maximum Retail Price
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0 // Discount percentage
    }
  },
  
  // Stock Status
  status: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'],
    default: 'in_stock'
  },
  
  // Alerts and Notifications
  alerts: [{
    type: {
      type: String,
      enum: ['low_stock', 'near_expiry', 'expired', 'reorder_needed', 'overstock']
    },
    message: String,
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'warning'
    },
    triggeredAt: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: Date
  }],
  
  // Transaction History
  transactions: [{
    type: {
      type: String,
      enum: ['purchase', 'sale', 'adjustment', 'expired', 'damaged', 'return'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    batchNumber: String,
    transactionDate: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Patient who purchased
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    },
    amount: {
      type: Number,
      min: 0
    },
    notes: String
  }],
  
  // Supplier Information
  supplier: {
    name: {
      type: String,
      trim: true
    },
    contactPerson: String,
    phone: String,
    email: String,
    address: String,
    leadTime: {
      type: Number, // Days required for delivery
      min: 0
    }
  },
  
  // Product Identification
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  
  // Additional Information
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  usageInstructions: {
    type: String,
    trim: true
  },
  sideEffects: [{
    type: String,
    trim: true
  }],
  contraindications: [{
    type: String,
    trim: true
  }],
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Popularity Metrics
  popularity: {
    totalSales: {
      type: Number,
      default: 0
    },
    monthlySales: {
      type: Number,
      default: 0
    },
    lastSoldDate: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
inventorySchema.index({ supplyShop: 1, productName: 1 });
inventorySchema.index({ category: 1, status: 1 });
inventorySchema.index({ status: 1, currentStock: 1 });
inventorySchema.index({ sku: 1 }, { unique: true, sparse: true });
inventorySchema.index({ barcode: 1 });
inventorySchema.index({ 'batches.expiryDate': 1 });

// Text search index
inventorySchema.index({
  productName: 'text',
  genericName: 'text',
  description: 'text',
  tags: 'text'
});

// Virtual for stock percentage
inventorySchema.virtual('stockPercentage').get(function() {
  if (!this.maximumStock || this.maximumStock === 0) return null;
  return (this.currentStock / this.maximumStock) * 100;
});

// Virtual for available (non-expired) stock
inventorySchema.virtual('availableStock').get(function() {
  if (!this.batches || this.batches.length === 0) return this.currentStock;
  
  const now = new Date();
  return this.batches
    .filter(batch => batch.status === 'active' && batch.expiryDate > now)
    .reduce((total, batch) => total + batch.quantity, 0);
});

// Virtual for expired stock
inventorySchema.virtual('expiredStock').get(function() {
  if (!this.batches || this.batches.length === 0) return 0;
  
  const now = new Date();
  return this.batches
    .filter(batch => batch.expiryDate <= now)
    .reduce((total, batch) => total + batch.quantity, 0);
});

// Virtual for nearest expiry date
inventorySchema.virtual('nearestExpiry').get(function() {
  if (!this.batches || this.batches.length === 0) return null;
  
  const activeBatches = this.batches.filter(batch => batch.status === 'active');
  if (activeBatches.length === 0) return null;
  
  return activeBatches.reduce((nearest, batch) => {
    return !nearest || batch.expiryDate < nearest ? batch.expiryDate : nearest;
  }, null);
});

// Virtual for selling price after discount
inventorySchema.virtual('finalPrice').get(function() {
  if (!this.price || !this.price.selling) return 0;
  
  const discount = this.price.discount || 0;
  return this.price.selling - (this.price.selling * discount / 100);
});

// Pre-save middleware to update stock status
inventorySchema.pre('save', function(next) {
  // Update status based on current stock
  if (this.currentStock === 0) {
    this.status = 'out_of_stock';
  } else if (this.currentStock <= this.reorderLevel) {
    this.status = 'low_stock';
  } else if (this.status !== 'discontinued') {
    this.status = 'in_stock';
  }
  
  // Check for expiry alerts
  if (this.batches && this.batches.length > 0) {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    this.batches.forEach(batch => {
      // Mark expired batches
      if (batch.expiryDate <= now && batch.status === 'active') {
        batch.status = 'expired';
        
        // Add alert for expired batch
        this.alerts.push({
          type: 'expired',
          message: `Batch ${batch.batchNumber} has expired`,
          severity: 'critical',
          triggeredAt: now
        });
      }
      // Alert for near-expiry batches
      else if (batch.expiryDate <= thirtyDaysFromNow && batch.status === 'active') {
        const existingAlert = this.alerts.find(
          alert => alert.type === 'near_expiry' && !alert.resolved
        );
        
        if (!existingAlert) {
          this.alerts.push({
            type: 'near_expiry',
            message: `Batch ${batch.batchNumber} expiring on ${batch.expiryDate.toDateString()}`,
            severity: 'warning',
            triggeredAt: now
          });
        }
      }
    });
  }
  
  // Alert for low stock
  if (this.currentStock <= this.reorderLevel) {
    const existingAlert = this.alerts.find(
      alert => (alert.type === 'low_stock' || alert.type === 'reorder_needed') && !alert.resolved
    );
    
    if (!existingAlert) {
      this.alerts.push({
        type: this.currentStock === 0 ? 'out_of_stock' : 'low_stock',
        message: `Stock level is ${this.currentStock} ${this.unit}. Reorder needed.`,
        severity: this.currentStock === 0 ? 'critical' : 'warning',
        triggeredAt: now
      });
    }
  }
  
  next();
});

// Method to add stock
inventorySchema.methods.addStock = function(batchInfo, performedBy) {
  this.batches.push(batchInfo);
  this.currentStock += batchInfo.quantity;
  
  this.transactions.push({
    type: 'purchase',
    quantity: batchInfo.quantity,
    batchNumber: batchInfo.batchNumber,
    performedBy: performedBy,
    amount: batchInfo.costPrice * batchInfo.quantity,
    notes: `Stock added - Batch: ${batchInfo.batchNumber}`
  });
  
  return this.save();
};

// Method to reduce stock (sale)
inventorySchema.methods.reduceStock = function(quantity, customerId, prescriptionId, performedBy, batchNumber = null) {
  if (this.currentStock < quantity) {
    throw new Error('Insufficient stock');
  }
  
  this.currentStock -= quantity;
  
  // Update batch quantity if specified
  if (batchNumber) {
    const batch = this.batches.find(b => b.batchNumber === batchNumber);
    if (batch) {
      batch.quantity -= quantity;
    }
  }
  
  this.transactions.push({
    type: 'sale',
    quantity: quantity,
    batchNumber: batchNumber,
    performedBy: performedBy,
    customer: customerId,
    prescription: prescriptionId,
    amount: this.finalPrice * quantity,
    transactionDate: new Date()
  });
  
  // Update popularity
  this.popularity.totalSales += quantity;
  this.popularity.monthlySales += quantity;
  this.popularity.lastSoldDate = new Date();
  
  return this.save();
};

// Static method to get low stock items for a supply shop
inventorySchema.statics.getLowStock = function(supplyShopId) {
  return this.find({
    supplyShop: supplyShopId,
    status: { $in: ['low_stock', 'out_of_stock'] },
    isActive: true
  })
  .sort({ currentStock: 1 })
  .exec();
};

// Static method to get items expiring soon
inventorySchema.statics.getExpiringSoon = function(supplyShopId, days = 30) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  return this.find({
    supplyShop: supplyShopId,
    isActive: true,
    'batches.expiryDate': { $lte: expiryDate, $gt: new Date() },
    'batches.status': 'active'
  })
  .sort({ 'batches.expiryDate': 1 })
  .exec();
};

// Static method to search inventory
inventorySchema.statics.searchProducts = function(supplyShopId, searchText, filters = {}) {
  const query = {
    supplyShop: supplyShopId,
    isActive: true,
    $text: { $search: searchText },
    ...filters
  };
  
  return this.find(query, {
    score: { $meta: 'textScore' }
  })
  .sort({ score: { $meta: 'textScore' } })
  .limit(50)
  .exec();
};

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
