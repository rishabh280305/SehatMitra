const express = require('express');
const router = express.Router();
const HospitalManagement = require('../models/HospitalManagement');
const StockSupply = require('../models/StockSupply');
const StockRequest = require('../models/StockRequest');
const auth = require('../middleware/auth');

// Get hospital management data
router.get('/data', auth, async (req, res) => {
  try {
    const hospitalData = await HospitalManagement.findOne({ 
      hospital: req.user.id 
    }).populate('doctors.doctorId', 'name specialization');
    
    if (!hospitalData) {
      return res.status(404).json({ message: 'Hospital data not found' });
    }
    
    res.json(hospitalData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update hospital data
router.put('/data', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    let hospitalData = await HospitalManagement.findOne({ hospital: req.user.id });
    
    if (!hospitalData) {
      hospitalData = new HospitalManagement({
        hospital: req.user.id,
        hospitalName: req.user.name,
        district: updates.district || 'Mumbai',
        ...updates
      });
    } else {
      Object.assign(hospitalData, updates);
    }
    
    await hospitalData.save();
    
    res.json({ message: 'Hospital data updated', data: hospitalData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get hospital inventory/stock
router.get('/inventory', auth, async (req, res) => {
  try {
    const inventory = await StockSupply.find({ 
      'location.hospital': req.user.id 
    }).sort({ itemName: 1 });
    
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add/Update stock item
router.post('/inventory', auth, async (req, res) => {
  try {
    const { itemName, itemType, quantity, unit, expiryDate, minimumThreshold } = req.body;
    
    const stockItem = new StockSupply({
      itemName,
      itemType,
      quantity,
      unit,
      currentStock: quantity,
      expiryDate,
      minimumThreshold,
      location: {
        hospital: req.user.id,
        district: req.body.district || 'Mumbai'
      },
      status: quantity > minimumThreshold ? 'sufficient' : 
              quantity > 0 ? 'low' : 'out_of_stock'
    });
    
    await stockItem.save();
    
    res.json({ message: 'Stock item added', item: stockItem });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update stock quantity
router.put('/inventory/:id', auth, async (req, res) => {
  try {
    const { currentStock } = req.body;
    
    const stockItem = await StockSupply.findById(req.params.id);
    
    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }
    
    stockItem.currentStock = currentStock;
    stockItem.status = currentStock > stockItem.minimumThreshold ? 'sufficient' :
                       currentStock > 0 ? 'low' : 'out_of_stock';
    
    await stockItem.save();
    
    res.json({ message: 'Stock updated', item: stockItem });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create stock request
router.post('/request-stock', auth, async (req, res) => {
  try {
    const { items, district, notes } = req.body;
    
    const request = new StockRequest({
      requestedBy: req.user.id,
      requesterType: 'hospital',
      items,
      district: district || 'Mumbai',
      notes,
      status: 'pending'
    });
    
    await request.save();
    
    res.json({ message: 'Stock request submitted', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get hospital's stock requests
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await StockRequest.find({ 
      requestedBy: req.user.id 
    }).sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update bed availability
router.put('/beds', auth, async (req, res) => {
  try {
    const { beds } = req.body;
    
    const hospitalData = await HospitalManagement.findOne({ hospital: req.user.id });
    
    if (!hospitalData) {
      return res.status(404).json({ message: 'Hospital data not found' });
    }
    
    hospitalData.beds = beds;
    await hospitalData.save();
    
    res.json({ message: 'Bed availability updated', data: hospitalData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add doctor to hospital
router.post('/doctors', auth, async (req, res) => {
  try {
    const { doctorId, name, specialization, shift, daysAvailable } = req.body;
    
    const hospitalData = await HospitalManagement.findOne({ hospital: req.user.id });
    
    if (!hospitalData) {
      return res.status(404).json({ message: 'Hospital data not found' });
    }
    
    hospitalData.doctors.push({
      doctorId,
      name,
      specialization,
      shift,
      daysAvailable,
      currentlyOnDuty: false
    });
    
    await hospitalData.save();
    
    res.json({ message: 'Doctor added', data: hospitalData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update doctor duty status
router.put('/doctors/:doctorId/duty', auth, async (req, res) => {
  try {
    const { currentlyOnDuty } = req.body;
    
    const hospitalData = await HospitalManagement.findOne({ hospital: req.user.id });
    
    if (!hospitalData) {
      return res.status(404).json({ message: 'Hospital data not found' });
    }
    
    const doctor = hospitalData.doctors.find(d => 
      d.doctorId.toString() === req.params.doctorId
    );
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    doctor.currentlyOnDuty = currentlyOnDuty;
    await hospitalData.save();
    
    res.json({ message: 'Doctor duty status updated', data: hospitalData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
