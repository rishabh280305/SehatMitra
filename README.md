# SehatMitra - Healthcare Management System

A comprehensive healthcare system designed to bridge the gap between rural patients and healthcare professionals through technology.

## 🎯 Overview

SehatMitra consists of:
- **Centralized Backend**: Node.js/Express + MongoDB + OpenAI GPT-4o
- **Three Frontends**: 
  - Patient App (Mobile)
  - ASHA Worker App (Mobile)  
  - Doctor App (Desktop)

## 🚀 Quick Start

### 1. Create User Accounts First
Before seeding dummy data, you need at least one ASHA worker account:

1. Start backend: `cd backend && npm start`
2. Start ASHA app: `cd frontend/asha-worker-app && npm run dev`
3. Register an ASHA worker account at http://localhost:3001
4. Optionally create a doctor account at http://localhost:3002

### 2. Seed Dummy Data

**Option A - Easy (Windows):**
```bash
seed-data.bat
```

**Option B - Manual:**
```bash
cd backend
node scripts/seedPatients.js
```

**What gets created:**
- 5 dummy patients (real data in MongoDB)
- 4 consultation records
- 1 pending patient (Rajesh Kumar)
- 2 in consultation (Sita Devi, Mohan Singh)
- 2 completed with diagnosis (Geeta Sharma, Ram Prasad)

### 3. Run All Applications

```bash
# Terminal 1 - Backend (port 5000)
cd backend && npm start

# Terminal 2 - Patient App (port 3000)
cd frontend/patient-app && npm run dev

# Terminal 3 - ASHA Worker App (port 3001)
cd frontend/asha-worker-app && npm run dev

# Terminal 4 - Doctor App (port 3002)
cd frontend/doctor-app && npm run dev
```

## 💡 Key Features

### Patient App
- AI health consultant with chat history
- File upload for medical reports
- Image analysis for symptoms
- Conversation context maintained

### ASHA Worker App
- Patient registration
- "Send to Doctor" for consultation requests
- View registered patients (My Patients)
- Tasks with mark as done functionality
- Inventory tracking
- All stats clickable for navigation

### Doctor App
- Patient queue (only consultation requests)
- See ASHA worker name who referred patient
- AI report analysis
- Diagnosis & prescription management

## 🔄 Workflow

1. ASHA worker registers patient → Saved to database
2. ASHA clicks "Send to Doctor" → Consultation request sent
3. Doctor sees patient in queue (with ASHA worker name)
4. Doctor completes consultation → Diagnosis saved
5. Patient appears in ASHA's completed list

## 🏗️ Architecture

### Technology Stack
- **Backend**: Node.js, Express.js, MongoDB Atlas
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: OpenAI GPT-4o with vision capabilities
- **Authentication**: JWT-based auth with bcrypt
- **Frontend**: React 18, Vite, React Router, Axios

## 📋 Features

### ASHA Worker App
- Daily task checklist dashboard
- Inventory monitoring (local supply shop stock levels)
- Patient intake with photo/report upload
- "Ask a Question" feature → Routes to Doctor

### Doctor App
- Queue management (ASHA vs Patient flagging)
- Complete patient history view
- AI-assisted analysis (Gemini integration)
- Digital prescription pad with intelligent routing
- Prescription routes to ASHA or Patient based on source

### Rural Patient App
- Direct consultation requests
- AI Consultant chatbot (Gemini-powered)
- Voice note support for low-literacy users
- Attachment support (images/videos)

## 🗂️ Project Structure

```
HackVision/
├── backend/
│   ├── models/
│   │   ├── User.js              # User schema (Patient, Doctor, ASHA)
│   │   ├── Appointment.js       # Consultation appointments
│   │   ├── Prescription.js      # Digital prescriptions
│   │   ├── MedicalReport.js     # Medical reports & AI analysis
│   │   ├── Inventory.js         # Supply shop inventory
│   │   ├── SupplyShop.js        # Supply shop management
│   │   └── index.js             # Model exports
│   ├── controllers/             # Route controllers (to be created)
│   ├── routes/                  # API routes (to be created)
│   ├── middleware/              # Auth, validation, etc. (to be created)
│   ├── utils/                   # Helper functions (to be created)
│   ├── config/                  # Configuration files (to be created)
│   ├── services/                # Business logic (to be created)
│   │   ├── gemini.service.js   # Gemini AI integration
│   │   └── cnn.service.js      # CNN model integration
│   ├── .env.example            # Environment variables template
│   ├── package.json            # Dependencies
│   └── server.js               # Entry point (to be created)
├── mobile-apps/                # Mobile frontends (to be created)
│   ├── asha-worker-app/
│   ├── doctor-app/
│   └── patient-app/
└── README.md
```

## 🗄️ Database Schema Overview

### User Model
- Multi-role support: Patient, ASHA Worker, Doctor, Admin
- Role-specific fields with validation
- Location tracking with coordinates
- Authentication with bcrypt password hashing

### Appointment Model
- Patient-Doctor consultations
- ASHA worker mediation tracking
- Source flagging (direct patient vs ASHA)
- Voice notes, attachments, vital signs
- AI analysis integration
- Status tracking (pending → completed)

### Prescription Model
- Intelligent routing (Patient or ASHA)
- Digital signature support
- Medication tracking with batch numbers
- Follow-up & referral management
- Dispensing & delivery tracking

### Medical Report Model
- Multi-format support (images, PDFs, documents)
- OCR text extraction
- Gemini text analysis
- CNN image analysis for medical images
- Doctor review workflow

### Inventory Model
- Batch tracking with expiry dates
- Low-stock & expiry alerts
- Transaction history
- Pricing with discounts
- Supplier management

### Supply Shop Model
- Location-based services
- ASHA worker assignments
- Operating hours management
- Performance metrics
- Review system

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. **Navigate to backend**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment is already configured!**
   - ✅ MongoDB Atlas connected
   - ✅ JWT secret configured
   - ✅ Gemini API key set up

4. **Start the server**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

5. **Test the API**
```bash
# Health check
curl http://localhost:5000/health

# See GETTING_STARTED.md for detailed API testing
```

📖 **Full setup guide**: See [backend/GETTING_STARTED.md](backend/GETTING_STARTED.md)

## ✅ Configuration Status

All core services are configured and ready:

1. **✅ Google Gemini API** - Configured
   - Text analysis, symptom diagnosis, chatbot
   - Medical image analysis (Gemini Vision)
   - Report summarization

2. **✅ MongoDB Atlas** - Connected
   - Database: hackvision
   - All schemas deployed

3. **✅ JWT Authentication** - Ready
   - Secure token generation
   - Password hashing with bcrypt

### Optional Services (Not Required for Core Features)

4. **Google Maps API** (Optional)
   - For enhanced location tracking
   - Get from: https://console.cloud.google.com

5. **Cloudinary** (Optional)
   - For image/file storage
   - Sign up at: https://cloudinary.com

6. **Email Service** (Optional)
   - For notifications
   - Configure SMTP in .env

## 📊 Key Relationships

```
User (Patient) ─┬─→ Appointments ─→ Prescription
                │                      ↓
                ├─→ Medical Reports    └─→ Routes to ASHA or Patient
                │
                └─→ Inventory (via Transactions)

User (ASHA) ─┬─→ Appointments (mediated)
             ├─→ Supply Shop (assigned)
             └─→ Prescriptions (receives for patients)

User (Doctor) ─┬─→ Appointments (handles)
               └─→ Prescriptions (creates)

Supply Shop ─→ Inventory Items
            └─→ ASHA Workers (assigned)
```

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Input validation & sanitization
- Rate limiting
- MongoDB injection prevention
- CORS configuration
- Helmet security headers

## 📝 Next Steps

After schema setup, the following need to be implemented:

1. **Controllers**: Business logic for each model
2. **Routes**: RESTful API endpoints
3. **Middleware**: Auth, validation, error handling
4. **Services**: 
   - Gemini API integration
   - CNN model integration
   - File upload handling
   - Email/SMS notifications
5. **Mobile Apps**: Three separate React Native apps
6. **Testing**: Unit & integration tests
7. **Documentation**: API documentation (Swagger/Postman)

## 🤝 Contributing

This is a hackathon project. Contributions welcome!

## 📄 License

MIT License

## 📞 Support

For questions or issues, please open a GitHub issue.

---

**Built with ❤️ for improving rural healthcare access**
