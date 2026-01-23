const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehatmitra')
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => console.error('✗ MongoDB connection error:', err));

const User = require('./models/User');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');

// Dummy data for patients
const patientsData = [
  {
    fullName: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '9876543210',
    password: 'Password123!',
    role: 'patient',
    gender: 'male',
    dateOfBirth: new Date('1985-06-15'),
    patientDetails: {
      bloodGroup: 'B+',
      height: 175,
      weight: 72,
      chronicConditions: ['Diabetes', 'Hypertension'],
      allergies: ['Penicillin'],
      emergencyContact: {
        name: 'Sunita Kumar',
        relationship: 'Spouse',
        phone: '9876543211'
      }
    }
  },
  {
    fullName: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '9876543220',
    password: 'Password123!',
    role: 'patient',
    gender: 'female',
    dateOfBirth: new Date('1992-03-22'),
    patientDetails: {
      bloodGroup: 'O+',
      height: 162,
      weight: 58,
      chronicConditions: [],
      allergies: ['Sulfa drugs'],
      emergencyContact: {
        name: 'Amit Sharma',
        relationship: 'Father',
        phone: '9876543221'
      }
    }
  },
  {
    fullName: 'Mohammed Ali',
    email: 'mohammed.ali@example.com',
    phone: '9876543230',
    password: 'Password123!',
    role: 'patient',
    gender: 'male',
    dateOfBirth: new Date('1978-11-08'),
    patientDetails: {
      bloodGroup: 'A+',
      height: 170,
      weight: 80,
      chronicConditions: ['Asthma'],
      allergies: [],
      emergencyContact: {
        name: 'Fatima Ali',
        relationship: 'Wife',
        phone: '9876543231'
      }
    }
  },
  {
    fullName: 'Lakshmi Devi',
    email: 'lakshmi.devi@example.com',
    phone: '9876543240',
    password: 'Password123!',
    role: 'patient',
    gender: 'female',
    dateOfBirth: new Date('1995-07-19'),
    patientDetails: {
      bloodGroup: 'AB+',
      height: 158,
      weight: 52,
      chronicConditions: [],
      allergies: ['Aspirin'],
      emergencyContact: {
        name: 'Ramesh Devi',
        relationship: 'Husband',
        phone: '9876543241'
      }
    }
  },
  {
    fullName: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '9876543250',
    password: 'Password123!',
    role: 'patient',
    gender: 'male',
    dateOfBirth: new Date('1988-12-30'),
    patientDetails: {
      bloodGroup: 'O-',
      height: 182,
      weight: 85,
      chronicConditions: ['Hypertension'],
      allergies: [],
      emergencyContact: {
        name: 'Kaur Singh',
        relationship: 'Mother',
        phone: '9876543251'
      }
    }
  }
];

// Dummy ASHA worker
const ashaWorkerData = {
  fullName: 'Sunita Verma',
  email: 'sunita.verma@health.gov.in',
  phone: '9876543260',
  password: 'Password123!',
  role: 'asha_worker',
  gender: 'female',
  dateOfBirth: new Date('1990-05-10'),
  ashaWorkerDetails: {
    workerId: 'ASHA-MH-2024-001',
    certificationNumber: 'CERT-2024-001',
    assignedArea: 'Mumbai Central',
    yearsOfExperience: 5,
    languagesSpoken: ['Hindi', 'Marathi', 'English']
  }
};

// Dummy Doctor
const doctorData = {
  fullName: 'Dr. Arun Mehta',
  email: 'dr.arun.mehta@hospital.com',
  phone: '9876543270',
  password: 'Password123!',
  role: 'doctor',
  gender: 'male',
  dateOfBirth: new Date('1980-08-15'),
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
};

// Dummy patients with symptoms (for ASHA worker)
const ashaPatientData = [
  {
    name: 'Geeta Sharma',
    age: 35,
    gender: 'female',
    symptoms: 'High fever (102°F) for 3 days, severe headache, body aches, weakness',
    vitalSigns: {
      temperature: '102.5',
      bloodPressure: '130/85',
      pulseRate: '95',
      oxygenLevel: '96'
    },
    notes: 'Patient reports mosquito bites. Living in area with recent dengue cases.',
    status: 'pending'
  },
  {
    name: 'Ram Prasad',
    age: 55,
    gender: 'male',
    symptoms: 'Persistent cough for 2 weeks, shortness of breath, chest pain',
    vitalSigns: {
      temperature: '99.8',
      bloodPressure: '145/92',
      pulseRate: '88',
      oxygenLevel: '92'
    },
    notes: 'Heavy smoker (20 years). Family history of respiratory issues.',
    status: 'pending'
  },
  {
    name: 'Kavita Patel',
    age: 28,
    gender: 'female',
    symptoms: 'Severe abdominal pain, vomiting, diarrhea for 2 days',
    vitalSigns: {
      temperature: '100.2',
      bloodPressure: '110/70',
      pulseRate: '100',
      oxygenLevel: '97'
    },
    notes: 'Consumed street food 2 days ago. Shows signs of dehydration.',
    status: 'pending'
  },
  {
    name: 'Suresh Yadav',
    age: 42,
    gender: 'male',
    symptoms: 'Sudden severe chest pain, sweating, difficulty breathing',
    vitalSigns: {
      temperature: '98.6',
      bloodPressure: '160/105',
      pulseRate: '110',
      oxygenLevel: '94'
    },
    notes: 'URGENT: Possible cardiac event. Diabetic patient. Needs immediate doctor attention.',
    status: 'critical'
  }
];

async function seedDatabase() {
  try {
    console.log('\n🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({ email: { $regex: '@example.com|@health.gov.in|@hospital.com' } });
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    console.log('✓ Existing data cleared\n');

    // Create Doctor first
    console.log('👨‍⚕️  Creating doctor account...');
    const doctor = await User.create(doctorData);
    console.log(`✓ Doctor created: ${doctor.fullName} (${doctor.email})`);
    console.log(`   Password: Password123!\n`);

    // Create ASHA Worker
    console.log('👩‍⚕️  Creating ASHA worker account...');
    const ashaWorker = await User.create(ashaWorkerData);
    console.log(`✓ ASHA Worker created: ${ashaWorker.fullName} (${ashaWorker.email})`);
    console.log(`   Password: Password123!\n`);

    // Create Patients
    console.log('👥 Creating patient accounts...');
    for (const patientData of patientsData) {
      const patient = await User.create(patientData);
      console.log(`✓ Patient created: ${patient.fullName} (${patient.email})`);
    }
    console.log(`   Password for all: Password123!\n`);

    // Create ASHA's patient records
    console.log('📋 Creating patient records for ASHA worker...');
    for (const patData of ashaPatientData) {
      const patient = await Patient.create({
        ...patData,
        registeredBy: ashaWorker._id
      });
      console.log(`✓ Patient record created: ${patient.name} - ${patient.symptoms.substring(0, 50)}...`);
    }

    // Create some appointments
    console.log('\n📅 Creating sample appointments...');
    const registeredPatients = await User.find({ role: 'patient', email: { $regex: '@example.com' } });
    
    const appointmentsData = [
      {
        patient: registeredPatients[0]._id,
        doctor: doctor._id,
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        appointmentTime: '10:00',
        chiefComplaints: 'Routine diabetes check-up, blood sugar monitoring',
        symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue'],
        status: 'confirmed',
        bookingSource: 'patient_direct'
      },
      {
        patient: registeredPatients[1]._id,
        doctor: doctor._id,
        ashaWorker: ashaWorker._id,
        appointmentDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
        appointmentTime: '11:30',
        chiefComplaints: 'Fever and body aches',
        symptoms: ['High fever', 'Body aches', 'Headache'],
        vitalSigns: {
          temperature: 101.5,
          bloodPressure: '120/80',
          pulseRate: 90,
          oxygenLevel: 97
        },
        status: 'pending',
        bookingSource: 'asha_worker'
      },
      {
        patient: registeredPatients[2]._id,
        doctor: doctor._id,
        appointmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
        appointmentTime: '14:00',
        chiefComplaints: 'Asthma follow-up',
        symptoms: ['Shortness of breath', 'Wheezing'],
        status: 'completed',
        bookingSource: 'patient_direct',
        diagnosis: 'Asthma exacerbation, well-controlled with medication',
        prescription: 'Continue Salbutamol inhaler as needed, Budesonide inhaler daily'
      }
    ];

    for (const aptData of appointmentsData) {
      const appointment = await Appointment.create(aptData);
      console.log(`✓ Appointment created: ${appointment.status} - ${new Date(appointment.appointmentDate).toDateString()}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${patientsData.length} Patient accounts created`);
    console.log(`   - ${ashaPatientData.length} ASHA patient records created`);
    console.log(`   - 1 ASHA Worker account created`);
    console.log(`   - 1 Doctor account created`);
    console.log(`   - ${appointmentsData.length} Appointments created`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('\nDoctor:');
    console.log(`   Email: ${doctorData.email}`);
    console.log(`   Password: Password123!`);
    console.log('\nASHA Worker:');
    console.log(`   Email: ${ashaWorkerData.email}`);
    console.log(`   Password: Password123!`);
    console.log('\nPatients (all use same password):');
    patientsData.forEach(p => {
      console.log(`   Email: ${p.email}`);
    });
    console.log(`   Password: Password123!`);

    console.log('\n🤖 AI Predictions:');
    console.log('   - Access DHO portal to see AI-powered disease outbreak predictions');
    console.log('   - Chat with AI consultant in ASHA/Patient app for symptom analysis');
    console.log('   - All predictions are generated dynamically using weather, AQI, and health data');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
