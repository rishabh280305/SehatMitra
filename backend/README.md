# SehatMitra Backend

Healthcare management system backend API

# SehatMitra Backend

Healthcare management system backend API

## Quick Start - Seed Dummy Data

### Option 1: Run the batch file (Windows)
From the project root directory:
```bash
seed-data.bat
```

### Option 2: Run manually
From the backend directory:
```bash
cd backend
node scripts/seedPatients.js
```

### What Gets Created

**5 Dummy Patients:**
1. **Rajesh Kumar** (45M) - Pending, not sent to doctor yet
2. **Sita Devi** (32F) - In Consultation with doctor
3. **Mohan Singh** (58M) - In Consultation with doctor  
4. **Geeta Sharma** (28F) - Completed with diagnosis
5. **Ram Prasad** (62M) - Completed with diagnosis

**4 Consultations:**
- Patients 2-5 have consultation records with doctor
- Complete with diagnosis and prescription for completed ones

**Prerequisites:**
- You must have created at least one ASHA worker account
- Optionally create a doctor account for full functionality

The script will assign all patients to the first ASHA worker found in your database.

## API Endpoints

### Patients
- `POST /api/v1/patients` - Register new patient (ASHA Worker)
- `GET /api/v1/patients` - Get patients (filtered by role)
  - ASHA workers: See only their registered patients
  - Doctors: See only patients with consultation requested
- `GET /api/v1/patients/:id` - Get single patient details
- `PUT /api/v1/patients/:id` - Update patient
- `POST /api/v1/patients/:id/request-consultation` - Send patient to doctor (ASHA Worker)

### Features
- Patient registration by ASHA workers
- Consultation request workflow (ASHA → Doctor)
- Real-time stats from database
- AI-powered diagnosis assistance
- Chat history with conversation context
- File upload for medical reports
