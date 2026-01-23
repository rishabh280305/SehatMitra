const mongoose = require('mongoose');
const User = require('./models/User');
const Patient = require('./models/Patient');
const ConsultationMessage = require('./models/ConsultationMessage');
require('dotenv').config();

const seedConsultations = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a doctor (we'll use the first doctor in the system)
    const doctor = await User.findOne({ role: 'doctor' });
    if (!doctor) {
      console.error('No doctor found! Please add a doctor first.');
      process.exit(1);
    }
    console.log('Using doctor:', doctor.fullName, doctor._id);

    // Find or create an ASHA worker
    let ashaWorker = await User.findOne({ role: 'asha_worker' });
    if (!ashaWorker) {
      ashaWorker = await User.create({
        fullName: 'Anita Devi',
        email: 'asha1@test.com',
        phone: '9876543215',
        password: 'Password123!',
        role: 'asha_worker',
        isVerified: true,
        ashaDetails: {
          workerId: 'ASHA001',
          state: 'Uttar Pradesh',
          district: 'Lucknow',
          block: 'Malihabad',
          village: 'Rampur'
        }
      });
      console.log('Created ASHA worker:', ashaWorker.fullName);
    } else {
      console.log('Using existing ASHA worker:', ashaWorker.fullName);
    }

    // Clear existing messages for cleaner demo
    console.log('Clearing existing consultation messages...');
    await ConsultationMessage.deleteMany({});

    // 1. Create ASHA-registered patients with messages
    console.log('\n=== Creating ASHA-Registered Patients ===');
    
    const ashaPatient1 = await Patient.create({
      name: 'Rajesh Kumar',
      age: 45,
      gender: 'male',
      contactNumber: '+91-9876543210',
      symptoms: 'Persistent cough, fever for 5 days, body ache',
      registeredBy: ashaWorker._id,
      location: {
        village: 'Rampur',
        primaryHealthCenter: 'Rampur PHC',
        coordinates: {
          latitude: 28.7041,
          longitude: 77.1025
        }
      },
      medicalHistory: {
        chronicConditions: ['Diabetes'],
        allergies: ['Penicillin'],
        currentMedications: ['Metformin']
      },
      vitalSigns: {
        temperature: '101.5',
        bloodPressure: '130/85',
        pulseRate: '88'
      }
    });
    console.log('Created patient:', ashaPatient1.name);

    // Messages for patient 1
    await ConsultationMessage.create([
      {
        patient: ashaPatient1._id,
        patientModel: 'Patient',
        doctor: doctor._id,
        sender: 'patient',
        senderName: ashaPatient1.name,
        content: 'Namaste Doctor, I have been having a bad cough and fever for the past 5 days. Also experiencing body ache.',
        messageType: 'text',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        patient: ashaPatient1._id,
        patientModel: 'Patient',
        doctor: doctor._id,
        sender: 'doctor',
        senderName: doctor.fullName,
        content: 'Hello Rajesh, I can see you have fever and cough. Have you been experiencing difficulty breathing?',
        messageType: 'text',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000)
      },
      {
        patient: ashaPatient1._id,
        patientModel: 'Patient',
        doctor: doctor._id,
        sender: 'patient',
        senderName: ashaPatient1.name,
        content: 'No breathing problem, but the cough is persistent especially at night.',
        messageType: 'text',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000)
      }
    ]);

    const ashaPatient2 = await Patient.create({
      name: 'Sunita Devi',
      age: 32,
      gender: 'female',
      contactNumber: '+91-9876543211',
      symptoms: 'Severe headache, dizziness, nausea for 2 days',
      registeredBy: ashaWorker._id,
      vitalSigns: {
        temperature: '98.6',
        bloodPressure: '150/95',
        pulseRate: '92'
      }
    });
    console.log('Created patient:', ashaPatient2.name);

    await ConsultationMessage.create([
      {
        patient: ashaPatient2._id,
        patientModel: 'Patient',
        doctor: doctor._id,
        sender: 'patient',
        senderName: ashaPatient2.name,
        content: 'Doctor sahib, I am having severe headache since yesterday. Also feeling dizzy and nauseous.',
        messageType: 'text',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]);

    const ashaPatient3 = await Patient.create({
      name: 'Mohan Singh',
      age: 58,
      gender: 'male',
      contactNumber: '+91-9876543212',
      symptoms: 'Chest pain, shortness of breath, sweating',
      registeredBy: ashaWorker._id,
      vitalSigns: {
        temperature: '98.4',
        bloodPressure: '160/100',
        pulseRate: '105'
      }
    });
    console.log('Created patient:', ashaPatient3.name);

    await ConsultationMessage.create([
      {
        patient: ashaPatient3._id,
        patientModel: 'Patient',
        doctor: doctor._id,
        sender: 'patient',
        senderName: ashaPatient3.name,
        content: 'Doctor ji, I am having chest pain on the left side. Also having difficulty breathing and sweating a lot.',
        messageType: 'text',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        patient: ashaPatient3._id,
        patientModel: 'Patient',
        doctor: doctor._id,
        sender: 'doctor',
        senderName: doctor.fullName,
        content: 'This sounds serious. How long have you been experiencing this? Is the pain radiating to your arm or jaw?',
        messageType: 'text',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000)
      },
      {
        patient: ashaPatient3._id,
        patientModel: 'Patient',
        doctor: doctor._id,
        sender: 'patient',
        senderName: ashaPatient3.name,
        content: 'Yes doctor, the pain is going to my left arm. Started about 2 hours ago.',
        messageType: 'text',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000)
      }
    ]);

    // 2. Create message-based consultations from logged-in patient users
    console.log('\n=== Creating Message-Based Patient Users ===');
    
    // Check if patient users exist, create if not
    let patientUser1 = await User.findOne({ email: 'patient1@test.com' });
    if (!patientUser1) {
      patientUser1 = await User.create({
        fullName: 'Priya Sharma',
        email: 'patient1@test.com',
        phone: '9876543213',
        password: 'Password123!',
        role: 'patient',
        isVerified: true,
        dateOfBirth: new Date('1990-05-15'),
        gender: 'female',
        address: 'Lucknow, Uttar Pradesh'
      });
      console.log('Created patient user:', patientUser1.fullName);
    } else {
      console.log('Using existing patient user:', patientUser1.fullName);
    }

    await ConsultationMessage.create([
      {
        patient: patientUser1._id,
        patientModel: 'User',
        doctor: doctor._id,
        sender: 'patient',
        senderName: patientUser1.fullName,
        content: 'Hello Doctor, I am having stomach pain and acidity for the past week. Also experiencing bloating after meals.',
        messageType: 'text',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        patient: patientUser1._id,
        patientModel: 'User',
        doctor: doctor._id,
        sender: 'doctor',
        senderName: doctor.fullName,
        content: 'I understand. Are you experiencing any burning sensation? When does the pain usually occur - before or after meals?',
        messageType: 'text',
        createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000)
      },
      {
        patient: patientUser1._id,
        patientModel: 'User',
        doctor: doctor._id,
        sender: 'patient',
        senderName: patientUser1.fullName,
        content: 'Yes, burning sensation is there. Pain occurs mostly after eating, especially spicy food.',
        messageType: 'text',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ]);

    let patientUser2 = await User.findOne({ email: 'patient2@test.com' });
    if (!patientUser2) {
      patientUser2 = await User.create({
        fullName: 'Amit Verma',
        email: 'patient2@test.com',
        phone: '9876543216',
        password: 'Password123!',
        role: 'patient',
        isVerified: true,
        dateOfBirth: new Date('1985-08-20'),
        gender: 'male',
        address: 'Lucknow, Uttar Pradesh'
      });
      console.log('Created patient user:', patientUser2.fullName);
    } else {
      console.log('Using existing patient user:', patientUser2.fullName);
    }

    await ConsultationMessage.create([
      {
        patient: patientUser2._id,
        patientModel: 'User',
        doctor: doctor._id,
        sender: 'patient',
        senderName: patientUser2.fullName,
        content: 'Doctor, I have been having back pain for 3 days. It started after lifting heavy objects. The pain is in the lower back.',
        messageType: 'text',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        patient: patientUser2._id,
        patientModel: 'User',
        doctor: doctor._id,
        sender: 'doctor',
        senderName: doctor.fullName,
        content: 'I see. Is the pain constant or does it come and go? Have you tried any pain relief medication?',
        messageType: 'text',
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
      },
      {
        patient: patientUser2._id,
        patientModel: 'User',
        doctor: doctor._id,
        sender: 'patient',
        senderName: patientUser2.fullName,
        content: 'Pain is worse when I bend or sit for long time. Took paracetamol but it only helps for few hours.',
        messageType: 'text',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ]);

    console.log('\n✅ Successfully created dummy consultation data!');
    console.log('\nSummary:');
    console.log('- 3 ASHA-registered patients with messages');
    console.log('- 2 patient users with message consultations');
    console.log('- Total: 5 active consultations for doctor:', doctor.fullName);
    console.log('\nAll consultations are assigned to doctor ID:', doctor._id);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding consultations:', error);
    process.exit(1);
  }
};

seedConsultations();
