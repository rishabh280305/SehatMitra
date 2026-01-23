const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// In-memory storage for demo (replace with MongoDB in production)
let hospitals = [];
let inventoryItems = [];
let stockRequests = [];

// Initialize dummy data
function initializeDummyData() {
  if (hospitals.length > 0) return;
  
  const districts = ['Mumbai', 'Pune', 'Ahmedabad', 'Test District'];
  const hospitalTypes = ['Primary Health Center', 'Community Health Center', 'District Hospital', 'Sub-District Hospital'];
  
  // Create 20 hospitals across districts
  hospitals = [];
  for (let i = 1; i <= 20; i++) {
    const district = districts[Math.floor(Math.random() * districts.length)];
    const type = hospitalTypes[Math.floor(Math.random() * hospitalTypes.length)];
    hospitals.push({
      id: `hosp_${i}`,
      name: `${type} ${district} - Unit ${i}`,
      type,
      district,
      address: `${100 + i} Healthcare Avenue, ${district}`,
      phone: `+91 ${9000000000 + i}`,
      email: `hospital${i}@sehatmitra.gov.in`,
      totalBeds: Math.floor(50 + Math.random() * 150),
      availableBeds: Math.floor(10 + Math.random() * 50),
      icuBeds: Math.floor(5 + Math.random() * 20),
      availableIcuBeds: Math.floor(1 + Math.random() * 10),
      ventilators: Math.floor(3 + Math.random() * 15),
      availableVentilators: Math.floor(1 + Math.random() * 8),
      doctors: Math.floor(5 + Math.random() * 30),
      nurses: Math.floor(10 + Math.random() * 50),
      operationalStatus: Math.random() > 0.1 ? 'operational' : 'partial',
      lastUpdated: new Date().toISOString(),
      coordinates: {
        lat: 18.5 + Math.random() * 4,
        lng: 72 + Math.random() * 6
      }
    });
  }
  
  // Create inventory items for each hospital
  const medicines = [
    { name: 'Paracetamol 500mg', category: 'Analgesic', unit: 'tablets', minStock: 500, maxStock: 10000 },
    { name: 'Amoxicillin 250mg', category: 'Antibiotic', unit: 'capsules', minStock: 300, maxStock: 5000 },
    { name: 'ORS Packets', category: 'Rehydration', unit: 'packets', minStock: 200, maxStock: 3000 },
    { name: 'Metformin 500mg', category: 'Antidiabetic', unit: 'tablets', minStock: 400, maxStock: 6000 },
    { name: 'Amlodipine 5mg', category: 'Antihypertensive', unit: 'tablets', minStock: 300, maxStock: 5000 },
    { name: 'Salbutamol Inhaler', category: 'Bronchodilator', unit: 'units', minStock: 50, maxStock: 500 },
    { name: 'Insulin Regular', category: 'Antidiabetic', unit: 'vials', minStock: 30, maxStock: 200 },
    { name: 'Omeprazole 20mg', category: 'Antacid', unit: 'capsules', minStock: 400, maxStock: 5000 },
    { name: 'Cetirizine 10mg', category: 'Antihistamine', unit: 'tablets', minStock: 300, maxStock: 4000 },
    { name: 'Azithromycin 500mg', category: 'Antibiotic', unit: 'tablets', minStock: 200, maxStock: 3000 },
    { name: 'IV Saline 500ml', category: 'IV Fluid', unit: 'bottles', minStock: 100, maxStock: 1000 },
    { name: 'Dextrose 5%', category: 'IV Fluid', unit: 'bottles', minStock: 100, maxStock: 800 },
    { name: 'Diclofenac 50mg', category: 'NSAID', unit: 'tablets', minStock: 400, maxStock: 5000 },
    { name: 'Ciprofloxacin 500mg', category: 'Antibiotic', unit: 'tablets', minStock: 300, maxStock: 4000 },
    { name: 'Prednisolone 5mg', category: 'Corticosteroid', unit: 'tablets', minStock: 200, maxStock: 3000 },
    { name: 'Chloroquine 250mg', category: 'Antimalarial', unit: 'tablets', minStock: 100, maxStock: 2000 },
    { name: 'Artemether 80mg', category: 'Antimalarial', unit: 'tablets', minStock: 100, maxStock: 1500 },
    { name: 'Tetanus Toxoid', category: 'Vaccine', unit: 'vials', minStock: 50, maxStock: 500 },
    { name: 'Rabies Vaccine', category: 'Vaccine', unit: 'vials', minStock: 20, maxStock: 200 },
    { name: 'Surgical Gloves', category: 'Supplies', unit: 'pairs', minStock: 500, maxStock: 5000 }
  ];
  
  inventoryItems = [];
  let itemId = 1;
  hospitals.forEach(hospital => {
    medicines.forEach(med => {
      const currentStock = Math.floor(med.minStock + Math.random() * (med.maxStock - med.minStock));
      const status = currentStock < med.minStock * 1.2 ? 'low' : currentStock > med.maxStock * 0.8 ? 'overstocked' : 'adequate';
      
      inventoryItems.push({
        id: `inv_${itemId++}`,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        district: hospital.district,
        medicineName: med.name,
        category: med.category,
        unit: med.unit,
        currentStock,
        minStock: med.minStock,
        maxStock: med.maxStock,
        status,
        expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        batchNumber: `BATCH-${Math.floor(100000 + Math.random() * 900000)}`,
        lastUpdated: new Date().toISOString()
      });
    });
  });
  
  // Create some stock requests
  const requestStatuses = ['pending', 'approved', 'dispatched', 'delivered', 'rejected'];
  const urgencyLevels = ['normal', 'urgent', 'critical'];
  
  stockRequests = [];
  for (let i = 1; i <= 30; i++) {
    const hospital = hospitals[Math.floor(Math.random() * hospitals.length)];
    const medicine = medicines[Math.floor(Math.random() * medicines.length)];
    const status = requestStatuses[Math.floor(Math.random() * requestStatuses.length)];
    
    stockRequests.push({
      id: `req_${i}`,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      district: hospital.district,
      medicineName: medicine.name,
      category: medicine.category,
      requestedQuantity: Math.floor(100 + Math.random() * 1000),
      unit: medicine.unit,
      urgency: urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)],
      reason: ['Low stock alert', 'Emergency requirement', 'Seasonal demand', 'Outbreak response'][Math.floor(Math.random() * 4)],
      status,
      requestedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      approvedBy: status !== 'pending' ? 'DHO Admin' : null,
      notes: status === 'rejected' ? 'Insufficient district stock' : null
    });
  }
  
  console.log(`Initialized ${hospitals.length} hospitals, ${inventoryItems.length} inventory items, ${stockRequests.length} stock requests`);
}

// Initialize on module load
initializeDummyData();

// GET all hospitals
router.get('/hospitals', protect, (req, res) => {
  const { district } = req.query;
  let result = hospitals;
  
  if (district && district !== 'all') {
    result = hospitals.filter(h => h.district.toLowerCase() === district.toLowerCase());
  }
  
  res.json({
    success: true,
    count: result.length,
    hospitals: result
  });
});

// GET hospital by ID
router.get('/hospitals/:id', protect, (req, res) => {
  const hospital = hospitals.find(h => h.id === req.params.id);
  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }
  res.json({ success: true, hospital });
});

// GET hospital statistics for district
router.get('/stats/:district', protect, (req, res) => {
  const { district } = req.params;
  const districtHospitals = district === 'all' ? hospitals : hospitals.filter(h => h.district.toLowerCase() === district.toLowerCase());
  
  const stats = {
    totalHospitals: districtHospitals.length,
    totalBeds: districtHospitals.reduce((sum, h) => sum + h.totalBeds, 0),
    availableBeds: districtHospitals.reduce((sum, h) => sum + h.availableBeds, 0),
    totalIcuBeds: districtHospitals.reduce((sum, h) => sum + h.icuBeds, 0),
    availableIcuBeds: districtHospitals.reduce((sum, h) => sum + h.availableIcuBeds, 0),
    totalVentilators: districtHospitals.reduce((sum, h) => sum + h.ventilators, 0),
    availableVentilators: districtHospitals.reduce((sum, h) => sum + h.availableVentilators, 0),
    totalDoctors: districtHospitals.reduce((sum, h) => sum + h.doctors, 0),
    totalNurses: districtHospitals.reduce((sum, h) => sum + h.nurses, 0),
    operationalHospitals: districtHospitals.filter(h => h.operationalStatus === 'operational').length,
    bedOccupancyRate: Math.round((1 - districtHospitals.reduce((sum, h) => sum + h.availableBeds, 0) / districtHospitals.reduce((sum, h) => sum + h.totalBeds, 0)) * 100),
    byType: hospitalTypes.reduce((acc, type) => {
      acc[type] = districtHospitals.filter(h => h.type === type).length;
      return acc;
    }, {})
  };
  
  const hospitalTypes = ['Primary Health Center', 'Community Health Center', 'District Hospital', 'Sub-District Hospital'];
  stats.byType = {};
  hospitalTypes.forEach(type => {
    stats.byType[type] = districtHospitals.filter(h => h.type === type).length;
  });
  
  res.json({ success: true, district, stats });
});

// GET all inventory items
router.get('/inventory', protect, (req, res) => {
  const { district, status, category, hospitalId } = req.query;
  let result = inventoryItems;
  
  if (district && district !== 'all') {
    result = result.filter(i => i.district.toLowerCase() === district.toLowerCase());
  }
  if (status) {
    result = result.filter(i => i.status === status);
  }
  if (category) {
    result = result.filter(i => i.category === category);
  }
  if (hospitalId) {
    result = result.filter(i => i.hospitalId === hospitalId);
  }
  
  res.json({
    success: true,
    count: result.length,
    inventory: result
  });
});

// GET inventory summary for district
router.get('/inventory/summary/:district', protect, (req, res) => {
  const { district } = req.params;
  const districtInventory = district === 'all' ? inventoryItems : inventoryItems.filter(i => i.district.toLowerCase() === district.toLowerCase());
  
  const summary = {
    totalItems: districtInventory.length,
    lowStockItems: districtInventory.filter(i => i.status === 'low').length,
    adequateItems: districtInventory.filter(i => i.status === 'adequate').length,
    overstockedItems: districtInventory.filter(i => i.status === 'overstocked').length,
    criticalShortages: districtInventory.filter(i => i.currentStock < i.minStock * 0.5),
    byCategory: {}
  };
  
  const categories = [...new Set(districtInventory.map(i => i.category))];
  categories.forEach(cat => {
    const catItems = districtInventory.filter(i => i.category === cat);
    summary.byCategory[cat] = {
      total: catItems.length,
      low: catItems.filter(i => i.status === 'low').length,
      adequate: catItems.filter(i => i.status === 'adequate').length
    };
  });
  
  res.json({ success: true, district, summary });
});

// GET all stock requests
router.get('/stock-requests', protect, (req, res) => {
  const { district, status, urgency } = req.query;
  let result = stockRequests;
  
  if (district && district !== 'all') {
    result = result.filter(r => r.district.toLowerCase() === district.toLowerCase());
  }
  if (status) {
    result = result.filter(r => r.status === status);
  }
  if (urgency) {
    result = result.filter(r => r.urgency === urgency);
  }
  
  // Sort by urgency and date
  result.sort((a, b) => {
    const urgencyOrder = { critical: 0, urgent: 1, normal: 2 };
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    return new Date(b.requestedAt) - new Date(a.requestedAt);
  });
  
  res.json({
    success: true,
    count: result.length,
    requests: result
  });
});

// POST create new stock request
router.post('/stock-requests', protect, (req, res) => {
  const { hospitalId, medicineName, requestedQuantity, unit, urgency, reason } = req.body;
  
  const hospital = hospitals.find(h => h.id === hospitalId);
  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }
  
  const newRequest = {
    id: `req_${Date.now()}`,
    hospitalId,
    hospitalName: hospital.name,
    district: hospital.district,
    medicineName,
    requestedQuantity,
    unit,
    urgency: urgency || 'normal',
    reason: reason || 'Stock replenishment',
    status: 'pending',
    requestedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  stockRequests.unshift(newRequest);
  
  res.status(201).json({
    success: true,
    message: 'Stock request created successfully',
    request: newRequest
  });
});

// PUT update stock request status
router.put('/stock-requests/:id', protect, (req, res) => {
  const { status, notes } = req.body;
  const request = stockRequests.find(r => r.id === req.params.id);
  
  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }
  
  request.status = status;
  request.notes = notes;
  request.updatedAt = new Date().toISOString();
  if (status !== 'pending') {
    request.approvedBy = req.user?.name || 'DHO Admin';
  }
  
  res.json({
    success: true,
    message: 'Request updated successfully',
    request
  });
});

// PUT update hospital beds/resources
router.put('/hospitals/:id/resources', protect, (req, res) => {
  const { availableBeds, availableIcuBeds, availableVentilators } = req.body;
  const hospital = hospitals.find(h => h.id === req.params.id);
  
  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }
  
  if (availableBeds !== undefined) hospital.availableBeds = availableBeds;
  if (availableIcuBeds !== undefined) hospital.availableIcuBeds = availableIcuBeds;
  if (availableVentilators !== undefined) hospital.availableVentilators = availableVentilators;
  hospital.lastUpdated = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'Hospital resources updated',
    hospital
  });
});

// PUT update inventory stock
router.put('/inventory/:id', protect, (req, res) => {
  const { currentStock } = req.body;
  const item = inventoryItems.find(i => i.id === req.params.id);
  
  if (!item) {
    return res.status(404).json({ success: false, message: 'Inventory item not found' });
  }
  
  item.currentStock = currentStock;
  item.status = currentStock < item.minStock * 1.2 ? 'low' : currentStock > item.maxStock * 0.8 ? 'overstocked' : 'adequate';
  item.lastUpdated = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'Inventory updated',
    item
  });
});

module.exports = router;
