const express = require('express');
const router = express.Router();
const EssentialMedicine = require('../models/EssentialMedicine');

// Search for cheaper alternatives
router.get('/search', async (req, res) => {
  try {
    const { medicine } = req.query;
    
    if (!medicine) {
      return res.status(400).json({ message: 'Medicine name required' });
    }
    
    // Search by text index
    const alternatives = await EssentialMedicine.find({
      $text: { $search: medicine }
    }).limit(5);
    
    // If no exact match, try partial match
    if (alternatives.length === 0) {
      const partialMatches = await EssentialMedicine.find({
        $or: [
          { medicineName: { $regex: medicine, $options: 'i' } },
          { genericName: { $regex: medicine, $options: 'i' } },
          { keywords: { $in: [medicine.toLowerCase()] } }
        ]
      }).limit(5);
      
      return res.json(partialMatches);
    }
    
    res.json(alternatives);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all medicines (for admin/reference)
router.get('/all', async (req, res) => {
  try {
    const { category, limit = 100 } = req.query;
    
    const query = category ? { category } : {};
    const medicines = await EssentialMedicine.find(query)
      .limit(parseInt(limit))
      .sort({ medicineName: 1 });
    
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get medicine categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await EssentialMedicine.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
