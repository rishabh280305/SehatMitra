const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mongoose = require('mongoose');
require('dotenv').config();

const EssentialMedicine = require('./models/EssentialMedicine');

const extractMedicinesFromPDF = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const pdfPath = path.join(__dirname, '..', 'AAM SHC EML.pdf');
    const dataBuffer = fs.readFileSync(pdfPath);
    
    console.log('Parsing PDF...');
    const data = await pdf(dataBuffer);
    
    const text = data.text;
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    const medicines = [];
    let currentCategory = '';
    
    for (let line of lines) {
      line = line.trim();
      
      // Skip headers and page numbers
      if (line.match(/^\d+$/) || line.includes('Page') || line.length < 3) continue;
      
      // Detect category headings (usually in CAPS or specific patterns)
      if (line.toUpperCase() === line && line.length > 5 && !line.includes('.')) {
        currentCategory = line;
        continue;
      }
      
      // Extract medicine names (usually followed by dosage or form)
      const medicineMatch = line.match(/^([A-Za-z\s\-\(\)]+?)(\d+|\(|\[|$)/);
      
      if (medicineMatch) {
        const medicineName = medicineMatch[1].trim();
        
        // Extract dosage and form
        const dosageMatch = line.match(/(\d+\s*(mg|ml|mcg|g|%|IU|units?))/i);
        const formMatch = line.match(/(tablet|capsule|injection|syrup|suspension|cream|ointment|drops|powder)/i);
        
        if (medicineName.length > 2) {
          const medicine = {
            medicineName: medicineName,
            category: currentCategory || 'General',
            dosage: dosageMatch ? dosageMatch[0] : '',
            form: formMatch ? formMatch[1] : '',
            availableAtFreeOrDiscounted: true,
            keywords: medicineName.toLowerCase().split(' ').filter(w => w.length > 2)
          };
          
          // Try to identify generic name (often in parentheses)
          const genericMatch = line.match(/\(([A-Za-z\s]+)\)/);
          if (genericMatch) {
            medicine.genericName = genericMatch[1].trim();
            medicine.keywords.push(...genericMatch[1].toLowerCase().split(' ').filter(w => w.length > 2));
          }
          
          medicines.push(medicine);
        }
      }
    }
    
    console.log(`Extracted ${medicines.length} medicines from PDF`);
    
    // Clear existing data
    await EssentialMedicine.deleteMany({});
    console.log('Cleared existing medicine data');
    
    // Insert medicines
    if (medicines.length > 0) {
      await EssentialMedicine.insertMany(medicines);
      console.log(`✅ Successfully inserted ${medicines.length} medicines into database`);
    }
    
    // Display sample
    console.log('\nSample medicines:');
    const samples = await EssentialMedicine.find().limit(10);
    samples.forEach(med => {
      console.log(`- ${med.medicineName} (${med.dosage}) - ${med.form}`);
    });
    
  } catch (error) {
    console.error('Error extracting medicines:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

extractMedicinesFromPDF();
