# Frontend Applications

## 🚀 Quick Start

Each app runs on a different port:
- **Patient App**: http://localhost:3000
- **ASHA Worker App**: http://localhost:3001
- **Doctor App**: http://localhost:3002

### Start All Apps

Open 4 terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Patient App:**
```bash
cd frontend/patient-app
npm install
npm run dev
```

**Terminal 3 - ASHA Worker App:**
```bash
cd frontend/asha-worker-app
npm install
npm run dev
```

**Terminal 4 - Doctor App:**
```bash
cd frontend/doctor-app
npm install
npm run dev
```

## 📱 Testing the Apps

### 1. Patient App (Port 3000)
1. Go to http://localhost:3000
2. Register as a Patient
3. Features:
   - AI Health Assistant (chatbot)
   - Book Consultation
   - View Dashboard

### 2. ASHA Worker App (Port 3001)
1. Go to http://localhost:3001
2. Register as ASHA Worker
3. Enter ASHA-specific details (worker ID, certification, etc.)
4. Features:
   - Patient Intake Form
   - Inventory Management
   - Daily Tasks

### 3. Doctor App (Port 3002)
1. Go to http://localhost:3002
2. Register as Doctor
3. Enter doctor details (license, specialization, etc.)
4. Features:
   - Patient Queue
   - AI Analysis Tools
   - Prescription Management

## 🎨 Design

- **Patient**: Blue theme (#4F46E5)
- **ASHA Worker**: Purple theme (#8B5CF6)
- **Doctor**: Cyan theme (#06B6D4)

All apps are responsive and mobile-friendly!
