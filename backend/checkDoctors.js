const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

async function checkDoctors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehatmitra');
    console.log('Connected to MongoDB');

    // Find all doctors
    const doctors = await User.find({ role: 'doctor' });
    
    console.log(`\n=== DOCTORS IN DATABASE (${doctors.length}) ===`);
    
    if (doctors.length === 0) {
      console.log('❌ No doctors found in database!');
      console.log('Please run: node seedDoctors.js');
    } else {
      doctors.forEach((doctor, index) => {
        console.log(`\n${index + 1}. ${doctor.fullName}`);
        console.log(`   Email: ${doctor.email}`);
        console.log(`   Specialization: ${doctor.doctorDetails?.specialization || 'Not set'}`);
        console.log(`   Experience: ${doctor.doctorDetails?.experience || 0} years`);
        console.log(`   Created: ${doctor.createdAt}`);
      });
    }

    // Also check for any users without proper role
    const allUsers = await User.find({});
    const nonDoctors = allUsers.filter(u => u.role !== 'doctor' && u.role !== 'patient' && u.role !== 'asha_worker');
    
    if (nonDoctors.length > 0) {
      console.log(`\n=== USERS WITH UNCLEAR ROLES (${nonDoctors.length}) ===`);
      nonDoctors.forEach(user => {
        console.log(`- ${user.fullName || user.name}: Role = "${user.role}"`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDoctors();