const mongoose = require('mongoose');

const essentialMedicineSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  dosage: {
    type: String,
    trim: true
  },
  form: {
    type: String,
    trim: true
  },
  availableAtFreeOrDiscounted: {
    type: Boolean,
    default: true
  },
  alternativeFor: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for faster searching
essentialMedicineSchema.index({ medicineName: 'text', genericName: 'text', keywords: 'text' });

module.exports = mongoose.model('EssentialMedicine', essentialMedicineSchema);
