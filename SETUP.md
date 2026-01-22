# 🚀 HackVision - Complete Healthcare Ecosystem

## Quick Start Guide

### Option 1: Automated Start (Windows)
Simply double-click `start-all.bat` in the root folder!

### Option 2: Manual Start

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

## 🌐 Access Points

Once all services are running:

- **Backend API**: http://localhost:5000
- **Patient Portal**: http://localhost:3000
- **ASHA Worker Portal**: http://localhost:3001
- **Doctor Portal**: http://localhost:3002

## 🧪 Testing the Complete System

### Step 1: Register Users

1. **Register a Patient** (http://localhost:3000/register)
   - Use any email/phone
   - Set role as "patient"

2. **Register an ASHA Worker** (http://localhost:3001/register)
   - Provide ASHA-specific details
   - Worker ID, certification, area

3. **Register a Doctor** (http://localhost:3002/register)
   - Provide medical license
   - Specialization, qualifications

### Step 2: Test Features

**As Patient:**
- ✅ AI Health Assistant chatbot
- ✅ Book consultations
- ✅ View dashboard

**As ASHA Worker:**
- ✅ Patient intake form
- ✅ Inventory management
- ✅ Daily task checklist

**As Doctor:**
- ✅ View patient queue
- ✅ AI analysis tools
- ✅ Create prescriptions

## 🤖 AI Features (Gemini-Powered)

All diagnosis and analysis uses **Google Gemini AI**:
- Symptom analysis
- Medical report interpretation
- Image analysis (X-rays, scans)
- Patient summaries
- Chatbot responses

## ✅ What's Working

### Backend ✅
- MongoDB Atlas connected
- JWT authentication
- User registration/login
- Protected routes
- Gemini AI service ready

### Frontend ✅
- All three apps with unique themes
- Authentication flows
- Role-based dashboards
- Responsive design
- API integration

## 📱 App Features

### Patient App (Blue Theme)
- Registration & Login
- AI Health Assistant (chatbot)
- Consultation booking
- Dashboard

### ASHA Worker App (Purple Theme)
- ASHA-specific registration
- Patient intake form
- Inventory view
- Task management

### Doctor App (Cyan Theme)
- Doctor registration
- Patient queue
- AI analysis tools
- Prescription management

## 🔧 Tech Stack

**Backend:**
- Node.js + Express
- MongoDB Atlas
- JWT Authentication
- Google Gemini AI
- bcrypt password hashing

**Frontend:**
- React 18
- Vite
- React Router
- Axios
- React Toastify

## 📞 Support

All core functionality is ready! You can now:
1. Register users in all three portals
2. Test authentication
3. Explore role-specific features
4. See the different UI themes

Enjoy testing your complete healthcare ecosystem! 🎉
