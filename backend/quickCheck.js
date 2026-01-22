const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

async function quickCheck() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehatmitra');
    
    const allDoctors = await User.find({ role: 'doctor' });
    console.log(`\n🔍 TOTAL DOCTORS FOUND: ${allDoctors.length}\n`);
    
    allDoctors.forEach((doc, i) => {
      console.log(`${i+1}. ${doc.fullName || doc.name}`);
      console.log(`   📧 ${doc.email}`);
      console.log(`   🏥 ${doc.doctorDetails?.specialization || 'No specialization'}`);
      console.log(`   👤 Role: ${doc.role}`);
      console.log('');
    });

    // Also test the exact same query the API uses
    const apiQuery = { role: 'doctor' };
    const apiDoctors = await User.find(apiQuery)
      .select('fullName email phone doctorDetails avatar')
      .sort({ 'doctorDetails.specialization': 1 });
      
    console.log(`🔍 API QUERY RESULT: ${apiDoctors.length} doctors`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

quickCheck();