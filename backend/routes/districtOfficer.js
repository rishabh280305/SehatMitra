const express = require('express');
const router = express.Router();
const StockRequest = require('../models/StockRequest');
const StockSupply = require('../models/StockSupply');
const HospitalManagement = require('../models/HospitalManagement');
const Prescription = require('../models/Prescription');
const auth = require('../middleware/auth');

// Get all stock requests for a district
router.get('/requests/:district', auth, async (req, res) => {
  try {
    const { district } = req.params;
    const { status } = req.query;
    
    const query = { district };
    if (status) query.status = status;
    
    const requests = await StockRequest.find(query)
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve stock request
router.put('/requests/:id/approve', auth, async (req, res) => {
  try {
    const request = await StockRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    request.status = 'approved';
    request.approvedBy = req.user.id;
    request.approvedAt = new Date();
    request.notes = req.body.notes || '';
    
    await request.save();
    
    res.json({ message: 'Request approved', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject stock request
router.put('/requests/:id/reject', auth, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    const request = await StockRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    request.status = 'rejected';
    request.approvedBy = req.user.id;
    request.rejectionReason = rejectionReason;
    
    await request.save();
    
    res.json({ message: 'Request rejected', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get AI predictions for stock needs
router.get('/ai-predictions/:district', auth, async (req, res) => {
  try {
    const { district } = req.params;
    
    // Get historical prescription data
    const prescriptions = await Prescription.find({
      createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
    }).select('medications');
    
    // Get historical stock requests
    const pastRequests = await StockRequest.find({
      district,
      status: { $in: ['approved', 'fulfilled'] },
      createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
    });
    
    // Aggregate medicine usage
    const medicineUsage = {};
    prescriptions.forEach(presc => {
      presc.medications.forEach(med => {
        const key = med.name.toLowerCase();
        medicineUsage[key] = (medicineUsage[key] || 0) + 1;
      });
    });
    
    // Generate predictions
    const predictions = Object.entries(medicineUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([medicine, usage]) => ({
        itemName: medicine,
        predictedNeed: Math.ceil(usage * 1.2), // 20% buffer
        confidence: Math.min(95, (usage / prescriptions.length) * 100),
        trend: usage > 50 ? 'increasing' : 'stable',
        reasoning: `Based on ${usage} prescriptions in last 90 days`
      }));
    
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all hospitals in district
router.get('/hospitals/:district', auth, async (req, res) => {
  try {
    const { district } = req.params;
    
    const hospitals = await HospitalManagement.find({ district })
      .populate('hospital', 'name email phone')
      .sort({ hospitalName: 1 });
    
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get hospital details
router.get('/hospitals/details/:hospitalId', auth, async (req, res) => {
  try {
    const hospital = await HospitalManagement.findOne({ 
      hospital: req.params.hospitalId 
    }).populate('hospital', 'name email phone address');
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get district statistics
router.get('/stats/:district', auth, async (req, res) => {
  try {
    const { district } = req.params;
    
    const [
      totalHospitals,
      pendingRequests,
      totalBeds,
      stockItems
    ] = await Promise.all([
      HospitalManagement.countDocuments({ district }),
      StockRequest.countDocuments({ district, status: 'pending' }),
      HospitalManagement.aggregate([
        { $match: { district } },
        { $group: { 
          _id: null, 
          total: { $sum: '$beds.total' },
          occupied: { $sum: '$beds.occupied' },
          available: { $sum: '$beds.available' }
        }}
      ]),
      StockSupply.countDocuments({ 'location.district': district })
    ]);
    
    res.json({
      totalHospitals,
      pendingRequests,
      beds: totalBeds[0] || { total: 0, occupied: 0, available: 0 },
      stockItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
