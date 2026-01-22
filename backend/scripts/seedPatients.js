const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Consultation = require('../models/Consultation');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedPatients = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected...');

    // Find an ASHA worker to assign patients to
    let ashaWorker = await User.findOne({ role: 'asha_worker' });
    
    if (!ashaWorker) {
      console.log('No ASHA worker found. Please create an ASHA worker account first.');
      process.exit(1);
    }

    console.log(`Found ASHA worker: ${ashaWorker.fullName}`);

    // Clear existing patients (optional - remove this line if you want to keep existing patients)
    // await Patient.deleteMany({});
    // console.log('Existing patients cleared');

    // Dummy patient data
    const dummyPatients = [
      {
        name: 'Rajesh Kumar',
        age: 45,
        gender: 'male',
        contactNumber: '+91 98765 43210',
        address: 'Village: Rampur, District: Varanasi, UP',
        symptoms: 'Persistent cough for 2 weeks, mild fever, chest pain',
        vitalSigns: {
          temperature: '99.2°F',
          bloodPressure: '130/85 mmHg',
          pulseRate: '82 bpm',
          oxygenLevel: '96%'
        },
        notes: 'Patient works in construction, possible dust exposure. Has history of smoking.',
        registeredBy: ashaWorker._id,
        status: 'pending',
        consultationRequested: false
      },
      {
        name: 'Sita Devi',
        age: 32,
        gender: 'female',
        contactNumber: '+91 87654 32109',
        address: 'Village: Shivpur, District: Varanasi, UP',
        symptoms: 'Severe headache, dizziness, nausea for 3 days',
        vitalSigns: {
          temperature: '98.6°F',
          bloodPressure: '145/95 mmHg',
          pulseRate: '88 bpm',
          oxygenLevel: '98%'
        },
        notes: 'Mother of 3 children. Complains of stress and lack of sleep. BP slightly elevated.',
        registeredBy: ashaWorker._id,
        status: 'in_consultation',
        consultationRequested: true,
        consultationRequestedAt: new Date()
      },
      {
        name: 'Mohan Singh',
        age: 58,
        gender: 'male',
        contactNumber: '+91 76543 21098',
        address: 'Village: Gangapur, District: Varanasi, UP',
        symptoms: 'Joint pain in knees and hands, difficulty walking',
        vitalSigns: {
          temperature: '98.4°F',
          bloodPressure: '140/90 mmHg',
          pulseRate: '75 bpm',
          oxygenLevel: '97%'
        },
        notes: 'Farmer, works long hours in fields. Family history of arthritis.',
        registeredBy: ashaWorker._id,
        status: 'in_consultation',
        consultationRequested: true,
        consultationRequestedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        name: 'Geeta Sharma',
        age: 28,
        gender: 'female',
        contactNumber: '+91 65432 10987',
        address: 'Village: Rampur, District: Varanasi, UP',
        symptoms: 'Abdominal pain, irregular periods',
        vitalSigns: {
          temperature: '98.8°F',
          bloodPressure: '120/80 mmHg',
          pulseRate: '78 bpm',
          oxygenLevel: '99%'
        },
        notes: 'Recently married, concerned about reproductive health.',
        registeredBy: ashaWorker._id,
        status: 'completed',
        consultationRequested: true,
        consultationRequestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        diagnosis: 'Polycystic Ovary Syndrome (PCOS) - suspected. Referred for ultrasound and hormone tests.',
        prescription: 'Tab. Metformin 500mg BD after meals for 30 days. Lifestyle modifications - 30 min exercise daily, reduce sugar intake. Follow-up with gynecologist.',
        followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14) // 14 days from now
      },
      {
        name: 'Ram Prasad',
        age: 62,
        gender: 'male',
        contactNumber: '+91 54321 09876',
        address: 'Village: Shivpur, District: Varanasi, UP',
        symptoms: 'Diabetes follow-up, blurred vision, increased thirst',
        vitalSigns: {
          temperature: '98.6°F',
          bloodPressure: '135/88 mmHg',
          pulseRate: '80 bpm',
          oxygenLevel: '96%'
        },
        notes: 'Known diabetic for 5 years. On medication but irregular compliance. Needs eye check-up.',
        registeredBy: ashaWorker._id,
        status: 'completed',
        consultationRequested: true,
        consultationRequestedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        diagnosis: 'Type 2 Diabetes Mellitus - uncontrolled. Diabetic retinopathy suspected.',
        prescription: 'Tab. Metformin 1000mg BD, Tab. Glimepiride 2mg OD before breakfast. Refer to ophthalmologist urgently. HbA1c test recommended.',
        followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days from now
      }
    ];

    // Check for existing patients and only create new ones
    const createdPatients = [];
    for (const patientData of dummyPatients) {
      // Check if patient already exists by name and contact number
      const existingPatient = await Patient.findOne({ 
        name: patientData.name,
        contactNumber: patientData.contactNumber 
      });

      if (existingPatient) {
        console.log(`Patient ${patientData.name} already exists, skipping...`);
        createdPatients.push(existingPatient);
        continue;
      }

      // Create new patient
      const patient = await Patient.create(patientData);
      createdPatients.push(patient);
      console.log(`Created patient: ${patient.name}`);
    }

    console.log(`\n${createdPatients.filter(p => p.isNew !== false).length} new patients created successfully!`);

    // Find a doctor to assign consultations to
    let doctor = await User.findOne({ role: 'doctor' });
    
    if (!doctor) {
      console.log('No doctor found. Consultations will be created without assigned doctor.');
    } else {
      console.log(`Found doctor: ${doctor.fullName}`);
    }

    // Create consultations for patients where consultationRequested is true
    const consultationData = [];
    
    for (const patient of createdPatients) {
      if (patient.consultationRequested) {
        consultationData.push({
          patient: patient._id,
          doctor: doctor ? doctor._id : null,
          ashaWorker: ashaWorker._id,
          symptoms: patient.symptoms,
          diagnosis: patient.diagnosis || '',
          prescription: patient.prescription || '',
          notes: patient.notes || '',
          status: patient.status === 'completed' ? 'completed' : patient.status === 'in_consultation' ? 'in_progress' : 'pending',
          consultationDate: patient.consultationRequestedAt || new Date(),
          followUpDate: patient.followUpDate
        });
      }
    }

    if (consultationData.length > 0) {
      const createdConsultations = await Consultation.insertMany(consultationData);
      console.log(`${createdConsultations.length} consultations created successfully!`);
    }

    // Display summary
    console.log('\n--- Patient Summary ---');
    console.log(`Pending: ${createdPatients.filter(p => p.status === 'pending').length}`);
    console.log(`In Consultation: ${createdPatients.filter(p => p.status === 'in_consultation').length}`);
    console.log(`Completed: ${createdPatients.filter(p => p.status === 'completed').length}`);
    console.log(`Consultation Requested: ${createdPatients.filter(p => p.consultationRequested).length}`);
    console.log(`\n--- Consultation Summary ---`);
    console.log(`Total Consultations: ${consultationData.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding patients:', error);
    process.exit(1);
  }
};

seedPatients();
