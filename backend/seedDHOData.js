const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehatmitra')
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => console.error('✗ MongoDB connection error:', err));

const User = require('./models/User');
const Patient = require('./models/Patient');
const HospitalManagement = require('./models/HospitalManagement');
const StockSupply = require('./models/StockSupply');
const StockRequest = require('./models/StockRequest');

// Essential medicines list
const essentialMedicines = [
  { name: 'Paracetamol 500mg', category: 'Analgesics', unit: 'Tablets', minStock: 5000 },
  { name: 'Ibuprofen 400mg', category: 'Analgesics', unit: 'Tablets', minStock: 3000 },
  { name: 'Amoxicillin 500mg', category: 'Antibiotics', unit: 'Capsules', minStock: 2000 },
  { name: 'Azithromycin 250mg', category: 'Antibiotics', unit: 'Tablets', minStock: 1500 },
  { name: 'Ciprofloxacin 500mg', category: 'Antibiotics', unit: 'Tablets', minStock: 1200 },
  { name: 'Metformin 500mg', category: 'Diabetes', unit: 'Tablets', minStock: 4000 },
  { name: 'Glimepiride 2mg', category: 'Diabetes', unit: 'Tablets', minStock: 2000 },
  { name: 'Insulin (Regular)', category: 'Diabetes', unit: 'Vials', minStock: 200 },
  { name: 'Amlodipine 5mg', category: 'Cardiovascular', unit: 'Tablets', minStock: 3000 },
  { name: 'Atenolol 50mg', category: 'Cardiovascular', unit: 'Tablets', minStock: 2500 },
  { name: 'Enalapril 5mg', category: 'Cardiovascular', unit: 'Tablets', minStock: 2000 },
  { name: 'Salbutamol Inhaler', category: 'Respiratory', unit: 'Inhalers', minStock: 500 },
  { name: 'Budesonide Inhaler', category: 'Respiratory', unit: 'Inhalers', minStock: 400 },
  { name: 'Prednisolone 5mg', category: 'Corticosteroids', unit: 'Tablets', minStock: 1000 },
  { name: 'Chloroquine 250mg', category: 'Antimalarial', unit: 'Tablets', minStock: 1500 },
  { name: 'Artemether + Lumefantrine', category: 'Antimalarial', unit: 'Tablets', minStock: 1000 },
  { name: 'ORS Packets', category: 'Hydration', unit: 'Packets', minStock: 5000 },
  { name: 'IV Saline 500ml', category: 'Hydration', unit: 'Bottles', minStock: 2000 },
  { name: 'IV Ringer Lactate 500ml', category: 'Hydration', unit: 'Bottles', minStock: 1500 },
  { name: 'Glucose 5% 500ml', category: 'Hydration', unit: 'Bottles', minStock: 1000 },
  { name: 'Dextrose Solution', category: 'Hydration', unit: 'Bottles', minStock: 800 },
  { name: 'Vitamin B Complex', category: 'Vitamins', unit: 'Tablets', minStock: 3000 },
  { name: 'Iron + Folic Acid', category: 'Vitamins', unit: 'Tablets', minStock: 4000 },
  { name: 'Calcium + Vitamin D3', category: 'Vitamins', unit: 'Tablets', minStock: 2500 },
  { name: 'Zinc Sulfate', category: 'Minerals', unit: 'Tablets', minStock: 2000 },
  { name: 'Cetrizine 10mg', category: 'Antihistamines', unit: 'Tablets', minStock: 2000 },
  { name: 'Omeprazole 20mg', category: 'Antacids', unit: 'Capsules', minStock: 2500 },
  { name: 'Ranitidine 150mg', category: 'Antacids', unit: 'Tablets', minStock: 2000 },
  { name: 'Tetanus Toxoid', category: 'Vaccines', unit: 'Vials', minStock: 500 },
  { name: 'Polio Vaccine (OPV)', category: 'Vaccines', unit: 'Doses', minStock: 1000 },
  { name: 'Measles Vaccine', category: 'Vaccines', unit: 'Vials', minStock: 300 },
  { name: 'BCG Vaccine', category: 'Vaccines', unit: 'Vials', minStock: 500 },
  { name: 'Hepatitis B Vaccine', category: 'Vaccines', unit: 'Vials', minStock: 400 },
  { name: 'Albendazole 400mg', category: 'Antiparasitic', unit: 'Tablets', minStock: 1500 },
  { name: 'Mebendazole 100mg', category: 'Antiparasitic', unit: 'Tablets', minStock: 1200 },
  { name: 'Antiseptic Solution', category: 'Antiseptics', unit: 'Bottles', minStock: 500 },
  { name: 'Betadine Solution', category: 'Antiseptics', unit: 'Bottles', minStock: 400 },
  { name: 'Bandages (Sterile)', category: 'Supplies', unit: 'Rolls', minStock: 2000 },
  { name: 'Gauze Pads', category: 'Supplies', unit: 'Packs', minStock: 1500 },
  { name: 'Cotton Wool', category: 'Supplies', unit: 'Packets', minStock: 1000 },
  { name: 'Disposable Syringes 5ml', category: 'Supplies', unit: 'Pieces', minStock: 3000 },
  { name: 'Disposable Syringes 2ml', category: 'Supplies', unit: 'Pieces', minStock: 5000 },
  { name: 'IV Cannula 20G', category: 'Supplies', unit: 'Pieces', minStock: 1000 },
  { name: 'IV Giving Set', category: 'Supplies', unit: 'Pieces', minStock: 800 },
  { name: 'Surgical Gloves', category: 'Supplies', unit: 'Pairs', minStock: 5000 },
  { name: 'Face Masks', category: 'Supplies', unit: 'Pieces', minStock: 10000 },
  { name: 'Hand Sanitizer', category: 'Supplies', unit: 'Bottles', minStock: 500 },
  { name: 'Thermometer (Digital)', category: 'Equipment', unit: 'Pieces', minStock: 100 },
  { name: 'BP Apparatus', category: 'Equipment', unit: 'Pieces', minStock: 50 },
  { name: 'Pulse Oximeter', category: 'Equipment', unit: 'Pieces', minStock: 80 }
];

// District Health Officer
const dhoData = {
  fullName: 'Dr. Rajesh Patel',
  email: 'dr.rajesh.patel@dho.gov.in',
  phone: '9876543280',
  password: 'Password123!',
  role: 'district_officer',
  gender: 'male',
  dateOfBirth: new Date('1975-04-20'),
  district: 'Mumbai'
};

// Hospital Admins
const hospitalAdmins = [
  {
    fullName: 'Priya Kapoor',
    email: 'priya.kapoor@cityhospital.com',
    phone: '9876543290',
    password: 'Password123!',
    role: 'hospital_admin',
    gender: 'female',
    dateOfBirth: new Date('1985-09-12'),
    hospitalName: 'City General Hospital'
  },
  {
    fullName: 'Amit Desai',
    email: 'amit.desai@districthospital.com',
    phone: '9876543300',
    password: 'Password123!',
    role: 'hospital_admin',
    gender: 'male',
    dateOfBirth: new Date('1982-11-25'),
    hospitalName: 'District Medical Center'
  },
  {
    fullName: 'Kavita Reddy',
    email: 'kavita.reddy@communityhospital.com',
    phone: '9876543310',
    password: 'Password123!',
    role: 'hospital_admin',
    gender: 'female',
    dateOfBirth: new Date('1988-03-08'),
    hospitalName: 'Community Health Center'
  }
];

// Doctors for hospitals
const doctorsData = [
  {
    fullName: 'Dr. Arun Mehta',
    email: 'dr.arun.mehta@cityhospital.com',
    phone: '9876543270',
    password: 'Password123!',
    role: 'doctor',
    gender: 'male',
    dateOfBirth: new Date('1980-08-15'),
    hospitalName: 'City General Hospital',
    doctorDetails: {
      medicalLicenseNumber: 'MH-DOC-2024-12345',
      specialization: 'General Physician',
      experience: 10,
      qualifications: ['MBBS', 'MD'],
      hospitalAffiliation: 'City General Hospital',
      consultationFee: 500,
      availableSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '13:00' },
        { day: 'Tuesday', startTime: '09:00', endTime: '13:00' },
        { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
        { day: 'Thursday', startTime: '09:00', endTime: '13:00' },
        { day: 'Friday', startTime: '09:00', endTime: '13:00' }
      ]
    }
  },
  {
    fullName: 'Dr. Sneha Iyer',
    email: 'dr.sneha.iyer@districthospital.com',
    phone: '9876543320',
    password: 'Password123!',
    role: 'doctor',
    gender: 'female',
    dateOfBirth: new Date('1985-06-22'),
    hospitalName: 'District Medical Center',
    doctorDetails: {
      medicalLicenseNumber: 'MH-DOC-2024-12346',
      specialization: 'Pediatrician',
      experience: 8,
      qualifications: ['MBBS', 'MD Pediatrics'],
      hospitalAffiliation: 'District Medical Center',
      consultationFee: 600,
      availableSlots: [
        { day: 'Monday', startTime: '14:00', endTime: '18:00' },
        { day: 'Wednesday', startTime: '14:00', endTime: '18:00' },
        { day: 'Friday', startTime: '14:00', endTime: '18:00' }
      ]
    }
  },
  {
    fullName: 'Dr. Ramesh Kumar',
    email: 'dr.ramesh.kumar@communityhospital.com',
    phone: '9876543330',
    password: 'Password123!',
    role: 'doctor',
    gender: 'male',
    dateOfBirth: new Date('1978-12-10'),
    hospitalName: 'Community Health Center',
    doctorDetails: {
      medicalLicenseNumber: 'MH-DOC-2024-12347',
      specialization: 'Gynecologist',
      experience: 15,
      qualifications: ['MBBS', 'MD Obstetrics & Gynecology'],
      hospitalAffiliation: 'Community Health Center',
      consultationFee: 700,
      availableSlots: [
        { day: 'Tuesday', startTime: '10:00', endTime: '14:00' },
        { day: 'Thursday', startTime: '10:00', endTime: '14:00' },
        { day: 'Saturday', startTime: '10:00', endTime: '13:00' }
      ]
    }
  }
];

// Hospital data
const hospitalsData = [
  {
    hospitalName: 'City General Hospital',
    district: 'Mumbai',
    beds: {
      total: 500,
      occupied: 380,
      icu: { total: 30, occupied: 22 },
      general: { total: 420, occupied: 323 },
      emergency: { total: 50, occupied: 35 }
    },
    staff: {
      nurses: 120,
      technicians: 45,
      support: 80
    },
    facilities: [
      { facilityName: 'Emergency', available: true, status: 'operational' },
      { facilityName: 'ICU', available: true, status: 'operational' },
      { facilityName: 'Operation Theater', available: true, status: 'operational' },
      { facilityName: 'Blood Bank', available: true, status: 'operational' },
      { facilityName: 'Laboratory', available: true, status: 'operational' },
      { facilityName: 'Radiology', available: true, status: 'operational' },
      { facilityName: 'Pharmacy', available: true, status: 'operational' }
    ],
    emergencyContact: { phone: '022-12345678', email: 'emergency@cityhospital.com' },
    operatingHours: '24/7'
  },
  {
    hospitalName: 'District Medical Center',
    district: 'Mumbai',
    beds: {
      total: 300,
      occupied: 250,
      icu: { total: 20, occupied: 15 },
      general: { total: 250, occupied: 215 },
      emergency: { total: 30, occupied: 20 }
    },
    staff: {
      nurses: 80,
      technicians: 30,
      support: 50
    },
    facilities: [
      { facilityName: 'Emergency', available: true, status: 'operational' },
      { facilityName: 'ICU', available: true, status: 'operational' },
      { facilityName: 'Operation Theater', available: true, status: 'operational' },
      { facilityName: 'Laboratory', available: true, status: 'operational' },
      { facilityName: 'Pharmacy', available: true, status: 'operational' },
      { facilityName: 'Maternity Ward', available: true, status: 'operational' }
    ],
    emergencyContact: { phone: '022-23456789', email: 'emergency@districthospital.com' },
    operatingHours: '24/7'
  },
  {
    hospitalName: 'Community Health Center',
    district: 'Mumbai',
    beds: {
      total: 150,
      occupied: 100,
      icu: { total: 10, occupied: 6 },
      general: { total: 125, occupied: 84 },
      emergency: { total: 15, occupied: 10 }
    },
    staff: {
      nurses: 40,
      technicians: 15,
      support: 25
    },
    facilities: [
      { facilityName: 'Emergency', available: true, status: 'operational' },
      { facilityName: 'ICU', available: true, status: 'operational' },
      { facilityName: 'Laboratory', available: true, status: 'operational' },
      { facilityName: 'Pharmacy', available: true, status: 'operational' },
      { facilityName: 'Maternity Ward', available: true, status: 'operational' },
      { facilityName: 'Pediatric Ward', available: true, status: 'operational' }
    ],
    emergencyContact: { phone: '022-34567890', email: 'emergency@communityhospital.com' },
    operatingHours: '24/7'
  }
];

function generateStockLevel(medicine, hospitalTotalBeds) {
  const baseMultiplier = hospitalTotalBeds / 500; // Normalize to City General Hospital
  const minStock = Math.floor(medicine.minStock * baseMultiplier);
  const randomVariation = 0.6 + Math.random() * 0.8; // 60% to 140%
  return Math.floor(minStock * randomVariation);
}

async function seedDatabase() {
  try {
    console.log('\n🌱 Starting comprehensive database seeding for DHO & HA...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({ 
      email: { 
        $regex: '@example.com|@health.gov.in|@hospital.com|@dho.gov.in|@cityhospital.com|@districthospital.com|@communityhospital.com' 
      } 
    });
    await HospitalManagement.deleteMany({});
    await StockSupply.deleteMany({});
    await StockRequest.deleteMany({});
    console.log('✓ Existing data cleared\n');

    // Create DHO
    console.log('👨‍💼 Creating District Health Officer...');
    const dho = await User.create(dhoData);
    console.log(`✓ DHO created: ${dho.fullName} (${dho.email})`);
    console.log(`   Password: Password123!\n`);

    // Create Hospital Admins
    console.log('👨‍💻 Creating Hospital Administrators...');
    const createdAdmins = [];
    for (const adminData of hospitalAdmins) {
      const admin = await User.create(adminData);
      createdAdmins.push(admin);
      console.log(`✓ Hospital Admin created: ${admin.fullName} - ${adminData.hospitalName}`);
    }
    console.log(`   Password for all: Password123!\n`);

    // Create Doctors
    console.log('👨‍⚕️  Creating Doctors...');
    for (const doctorData of doctorsData) {
      const doctor = await User.create(doctorData);
      console.log(`✓ Doctor created: ${doctor.fullName} - ${doctorData.hospitalName}`);
    }
    console.log(`   Password for all: Password123!\n`);

    // Create Hospitals with stock
    console.log('🏥 Creating Hospitals with Stock Data...');
    for (let i = 0; i < hospitalsData.length; i++) {
      const hospitalData = hospitalsData[i];
      const admin = createdAdmins[i];
      
      const hospital = await HospitalManagement.create({
        hospital: admin._id,
        ...hospitalData
      });
      
      console.log(`✓ Hospital created: ${hospital.hospitalName}`);
      console.log(`   Capacity: ${hospital.beds.total} beds (${hospital.beds.occupied} occupied)`);
      console.log(`   Emergency: ${hospital.beds.emergency.total} beds (${hospital.beds.emergency.occupied} occupied)`);
      console.log(`   ICU: ${hospital.beds.icu.total} beds (${hospital.beds.icu.occupied} occupied)`);
      
      // Create stock for each medicine
      let lowStockCount = 0;
      let criticalCount = 0;
      
      for (const medicine of essentialMedicines) {
        const currentStock = generateStockLevel(medicine, hospitalData.beds.total);
        const minStock = Math.floor(medicine.minStock * (hospitalData.beds.total / 500));
        
        let status = 'sufficient';
        if (currentStock === 0) {
          status = 'out_of_stock';
        } else if (currentStock < minStock * 0.3) {
          status = 'critical';
          criticalCount++;
        } else if (currentStock < minStock * 0.6) {
          status = 'low';
          lowStockCount++;
        }
        
        await StockSupply.create({
          itemName: medicine.name,
          itemType: 'medicine',
          quantity: currentStock,
          unit: medicine.unit,
          location: {
            hospital: hospital.hospital,
            district: hospital.district
          },
          currentStock,
          minimumThreshold: minStock,
          expiryDate: new Date(Date.now() + (180 + Math.random() * 365) * 24 * 60 * 60 * 1000), // 6 months to 1 year
          status
        });
      }
      
      console.log(`   ✓ ${essentialMedicines.length} medicines stocked`);
      console.log(`   ⚠️  ${lowStockCount} items low stock, ${criticalCount} critical\n`);
    }

    // Generate some AI-predicted stock requests
    console.log('🤖 Generating AI-Predicted Stock Requests...');
    
    const hospitals = await HospitalManagement.find();
    const requestReasons = [
      { reason: 'Predicted dengue outbreak based on weather patterns - high rainfall and humidity', severity: 'high', medicines: ['Paracetamol 500mg', 'IV Saline 500ml', 'ORS Packets'] },
      { reason: 'High AQI levels (PM2.5 > 150) - respiratory cases surge expected', severity: 'medium', medicines: ['Salbutamol Inhaler', 'Budesonide Inhaler', 'Prednisolone 5mg'] },
      { reason: 'Routine stock replenishment - approaching minimum levels', severity: 'low', medicines: ['Amoxicillin 500mg', 'Metformin 500mg', 'Amlodipine 5mg'] },
      { reason: 'Emergency preparedness - earthquake alert from news API', severity: 'critical', medicines: ['Tetanus Toxoid', 'Bandages (Sterile)', 'Antiseptic Solution', 'IV Saline 500ml'] }
    ];

    for (let i = 0; i < hospitals.length; i++) {
      const hospital = hospitals[i];
      const requestReason = requestReasons[i % requestReasons.length];
      
      const items = [];
      for (const medicineName of requestReason.medicines) {
        const stockItem = await StockSupply.findOne({ 
          'location.hospital': hospital.hospital, 
          itemName: medicineName 
        });
        if (stockItem) {
          const requestQuantity = Math.floor(stockItem.minimumThreshold * 0.5); // Request 50% of min stock
          items.push({
            itemName: medicineName,
            itemType: 'medicine',
            requestedQuantity: requestQuantity,
            unit: stockItem.unit,
            urgency: requestReason.severity,
            reason: requestReason.reason
          });
        }
      }
      
      if (items.length > 0) {
        await StockRequest.create({
          requestedBy: hospital.hospital,
          requesterType: 'hospital',
          items: items,
          district: hospital.district,
          status: 'pending',
          aiRecommendation: {
            recommended: true,
            confidence: 75 + Math.floor(Math.random() * 20),
            reasoning: requestReason.reason,
            predictedNeed: items.reduce((sum, item) => sum + item.requestedQuantity, 0)
          }
        });
      }
      
      console.log(`✓ Request created for ${hospital.hospitalName} - ${requestReason.reason}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - 1 District Health Officer created`);
    console.log(`   - ${hospitalAdmins.length} Hospital Administrators created`);
    console.log(`   - ${doctorsData.length} Doctors created`);
    console.log(`   - ${hospitalsData.length} Hospitals created`);
    console.log(`   - ${essentialMedicines.length} types of medicines/supplies`);
    console.log(`   - ${hospitals.length * essentialMedicines.length} stock entries created`);
    console.log(`   - ${await StockRequest.countDocuments()} AI-predicted supply requests created`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('\n👨‍💼 District Health Officer (DHO):');
    console.log(`   Email: ${dhoData.email}`);
    console.log(`   Password: Password123!`);
    console.log(`   Role: Approve/reject supply requests, monitor district health`);
    
    console.log('\n🏥 Hospital Administrators:');
    hospitalAdmins.forEach(admin => {
      console.log(`   ${admin.hospitalName}:`);
      console.log(`   Email: ${admin.email} | Password: Password123!`);
    });
    
    console.log('\n👨‍⚕️  Doctors:');
    doctorsData.forEach(doc => {
      console.log(`   ${doc.fullName} (${doc.doctorDetails.specialization})`);
      console.log(`   Email: ${doc.email} | Password: Password123!`);
    });

    console.log('\n🤖 AI Features:');
    console.log('   - Weather-based disease outbreak predictions');
    console.log('   - AQI-based respiratory illness forecasts');
    console.log('   - News API for disaster/emergency preparedness');
    console.log('   - Automatic supply shortage predictions');
    console.log('   - Smart stock request generation');
    console.log('   - DHO approval workflow for critical supplies');

    console.log('\n📍 Access Points:');
    console.log('   - DHO Portal: /api/v1/ai-predictions/:district');
    console.log('   - Hospital Stock: /api/v1/stock-supplies');
    console.log('   - Stock Requests: /api/v1/stock-requests');
    console.log('   - Weather Data: Real-time via OpenWeatherMap API');
    console.log('   - AQI Data: Real-time air quality monitoring');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
