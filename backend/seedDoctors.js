const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const doctors = [
  {
    fullName: 'Dr. Rajesh Kumar',
    email: 'dr.rajesh@sehatmitra.com',
    password: 'doctor123',
    phone: '9100000001',
    role: 'doctor',
    doctorDetails: {
      specialization: 'General Medicine',
      qualification: 'MBBS, MD',
      experience: 15
    }
  },
  {
    fullName: 'Dr. Priya Sharma',
    email: 'dr.priya@sehatmitra.com',
    password: 'doctor123',
    phone: '9100000002',
    role: 'doctor',
    doctorDetails: {
      specialization: 'Pediatrics',
      qualification: 'MBBS, DCH',
      experience: 12
    }
  },
  {
    fullName: 'Dr. Amit Patel',
    email: 'dr.amit@sehatmitra.com',
    password: 'doctor123',
    phone: '9100000003',
    role: 'doctor',
    doctorDetails: {
      specialization: 'Cardiology',
      qualification: 'MBBS, MD, DM (Cardiology)',
      experience: 20
    }
  },
  {
    fullName: 'Dr. Sneha Reddy',
    email: 'dr.sneha@sehatmitra.com',
    password: 'doctor123',
    phone: '9100000004',
    role: 'doctor',
    doctorDetails: {
      specialization: 'Gynecology',
      qualification: 'MBBS, MS (Obstetrics & Gynecology)',
      experience: 18
    }
  },
  {
    fullName: 'Dr. Vikram Singh',
    email: 'dr.vikram@sehatmitra.com',
    password: 'doctor123',
    phone: '9100000005',
    role: 'doctor',
    doctorDetails: {
      specialization: 'Orthopedics',
      qualification: 'MBBS, MS (Orthopedics)',
      experience: 10
    }
  }
];

async function seedDoctors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehatmitra');
    console.log('Connected to MongoDB');

    // Clear existing doctors (optional - comment out if you want to keep existing)
    // await User.deleteMany({ role: 'doctor' });
    // console.log('Cleared existing doctors');

    // Check if doctors already exist
    for (const doctorData of doctors) {
      const existingDoctor = await User.findOne({ email: doctorData.email });
      
      if (existingDoctor) {
        console.log(`Doctor ${doctorData.fullName} already exists, skipping...`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(doctorData.password, salt);

      // Create doctor
      const doctor = await User.create({
        ...doctorData,
        password: hashedPassword
      });

      console.log(`Created doctor: ${doctor.fullName} (${doctor.doctorDetails.specialization})`);
    }

    console.log('\n✅ Doctor seeding completed!');
    console.log('\nDoctor credentials:');
    doctors.forEach(doc => {
      console.log(`\nName: ${doc.fullName}`);
      console.log(`Email: ${doc.email}`);
      console.log(`Password: ${doc.password}`);
      console.log(`Specialization: ${doc.doctorDetails.specialization}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
}

seedDoctors();
