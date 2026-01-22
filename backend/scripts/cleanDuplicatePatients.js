const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const cleanDuplicates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all patients
    const allPatients = await Patient.find({});
    console.log(`Total patients in database: ${allPatients.length}`);

    // Group by name + contactNumber to find duplicates
    const patientMap = new Map();
    const duplicates = [];

    allPatients.forEach(patient => {
      const key = `${patient.name}-${patient.contactNumber}`;
      if (patientMap.has(key)) {
        // This is a duplicate - keep the oldest one, mark newer ones for deletion
        duplicates.push(patient._id);
        console.log(`Found duplicate: ${patient.name} (${patient.contactNumber}) - ID: ${patient._id}`);
      } else {
        patientMap.set(key, patient);
      }
    });

    console.log(`\nFound ${duplicates.length} duplicate patients`);

    if (duplicates.length > 0) {
      console.log('\nRemoving duplicates...');
      const result = await Patient.deleteMany({ _id: { $in: duplicates } });
      console.log(`Deleted ${result.deletedCount} duplicate patients`);
      
      const remainingPatients = await Patient.find({});
      console.log(`\nRemaining unique patients: ${remainingPatients.length}`);
      remainingPatients.forEach(p => {
        console.log(`- ${p.name} (${p.contactNumber})`);
      });
    } else {
      console.log('No duplicates found!');
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error cleaning duplicates:', error);
    process.exit(1);
  }
};

cleanDuplicates();
