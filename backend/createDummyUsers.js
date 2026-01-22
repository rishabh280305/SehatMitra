require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const dummyUsers = [
  {
    fullName: 'Dr. Sarah Johnson',
    email: 'doctor@test.com',
    password: 'doctor123',
    phone: '9876543210',
    role: 'doctor',
    isActive: true,
    doctorDetails: {
      specialization: 'General Physician',
      medicalLicenseNumber: 'MED123456',
      yearsOfExperience: 5,
      qualification: 'MBBS, MD',
      availability: {
        monday: { available: true, slots: ['09:00-12:00', '14:00-17:00'] },
        tuesday: { available: true, slots: ['09:00-12:00', '14:00-17:00'] },
        wednesday: { available: true, slots: ['09:00-12:00', '14:00-17:00'] },
        thursday: { available: true, slots: ['09:00-12:00', '14:00-17:00'] },
        friday: { available: true, slots: ['09:00-12:00', '14:00-17:00'] },
        saturday: { available: true, slots: ['09:00-13:00'] },
        sunday: { available: false, slots: [] }
      }
    }
  },
  {
    fullName: 'Priya Sharma',
    email: 'asha@test.com',
    password: 'asha123',
    phone: '9876543211',
    role: 'asha_worker',
    isActive: true,
    ashaWorkerDetails: {
      workerId: 'ASHA001',
      assignedArea: 'Rural District A',
      assignedVillages: ['Village 1', 'Village 2', 'Village 3'],
      certificationDate: new Date('2022-01-15'),
      trainingCompleted: true
    }
  },
  {
    fullName: 'Raj Kumar',
    email: 'patient@test.com',
    password: 'patient123',
    phone: '9876543212',
    role: 'patient',
    isActive: true,
    dateOfBirth: new Date('1990-05-15'),
    gender: 'male',
    bloodGroup: 'O+',
    address: '123 Main Street, Test Village',
    emergencyContact: {
      name: 'Emergency Contact',
      relationship: 'Brother',
      phone: '9876543213'
    }
  },
  {
    fullName: 'Dr. District Officer',
    email: 'dho@test.com',
    password: 'dho123',
    phone: '9876543214',
    role: 'admin',
    isActive: true
  },
  {
    fullName: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    phone: '9876543215',
    role: 'admin',
    isActive: true
  }
];

async function createUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');

    // Clear existing test users
    await User.deleteMany({ 
      email: { 
        $in: dummyUsers.map(u => u.email) 
      } 
    });
    console.log('🗑️  Cleared existing test users');

    // Create new users
    for (const userData of dummyUsers) {
      const user = await User.create(userData);
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    console.log('\n🎉 All dummy users created successfully!\n');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('='.repeat(50));
    dummyUsers.forEach(user => {
      console.log(`\n${user.role.toUpperCase().replace('_', ' ')}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
    });
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createUsers();
