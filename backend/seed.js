const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const dummyUsers = [
  {
    fullName: 'Test Patient',
    email: 'patient@test.com',
    phone: '9876543210',
    password: 'password123',
    role: 'patient',
    dateOfBirth: new Date('1988-05-15'),
    gender: 'male',
    location: {
      address: '123 Health Street',
      village: 'Andheri',
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    patientDetails: {
      age: 35,
      gender: 'Male',
      bloodGroup: 'O+',
      address: {
        street: '123 Health Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '9876543211',
        relationship: 'Spouse'
      }
    }
  },
  {
    fullName: 'Test ASHA Worker',
    email: 'asha@test.com',
    phone: '9876543220',
    password: 'password123',
    role: 'asha_worker',
    dateOfBirth: new Date('1990-08-20'),
    gender: 'female',
    location: {
      address: 'ASHA Center, Mumbai Central',
      village: 'Mumbai Central',
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400008'
    },
    ashaWorkerDetails: {
      workerId: 'ASHA001',
      certificationNumber: 'CERT12345',
      assignedArea: 'Mumbai Central',
      yearsOfExperience: 5,
      languagesSpoken: ['Hindi', 'English', 'Marathi']
    }
  },
  {
    fullName: 'Dr. Test Doctor',
    email: 'doctor@test.com',
    phone: '9876543230',
    password: 'password123',
    role: 'doctor',
    dateOfBirth: new Date('1980-03-10'),
    gender: 'male',
    location: {
      address: 'City Hospital',
      village: 'Bandra',
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050'
    },
    doctorDetails: {
      medicalLicenseNumber: 'MH-MED-12345',
      specialization: 'General Medicine',
      qualifications: ['MBBS', 'MD'],
      yearsOfExperience: 10,
      consultationFee: 500,
      availability: {
        monday: { isAvailable: true, slots: ['09:00-12:00', '14:00-17:00'] },
        tuesday: { isAvailable: true, slots: ['09:00-12:00', '14:00-17:00'] },
        wednesday: { isAvailable: true, slots: ['09:00-12:00', '14:00-17:00'] },
        thursday: { isAvailable: true, slots: ['09:00-12:00', '14:00-17:00'] },
        friday: { isAvailable: true, slots: ['09:00-12:00', '14:00-17:00'] },
        saturday: { isAvailable: true, slots: ['09:00-12:00'] },
        sunday: { isAvailable: false, slots: [] }
      }
    }
  }
];

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});
    console.log('✅ Cleared existing users\n');

    console.log('👥 Creating dummy users...');
    for (const userData of dummyUsers) {
      const user = await User.create(userData);
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📝 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n👤 PATIENT PORTAL (http://localhost:3000)');
    console.log('   Email:    patient@test.com');
    console.log('   Password: password123');
    console.log('\n💜 ASHA WORKER PORTAL (http://localhost:3001)');
    console.log('   Email:    asha@test.com');
    console.log('   Password: password123');
    console.log('\n👨‍⚕️  DOCTOR PORTAL (http://localhost:3002)');
    console.log('   Email:    doctor@test.com');
    console.log('   Password: password123');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
