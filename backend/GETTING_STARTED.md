# HackVision Backend - Getting Started Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

You should see:
```
✅ MongoDB Connected: cluster0-shard-00-00.ko9voqe.mongodb.net
📊 Database: hackvision

╔════════════════════════════════════════════════════════════╗
║          🏥  HackVision API Server Started  🏥            ║
╠════════════════════════════════════════════════════════════╣
║  Environment:  development                                 ║
║  Port:         5000                                        ║
║  URL:          http://localhost:5000                       ║
║  API Version:  v1                                          ║
╠════════════════════════════════════════════════════════════╣
║  📍 Endpoints:                                             ║
║     Health:    http://localhost:5000/health                ║
║     Auth:      http://localhost:5000/api/v1/auth          ║
╚════════════════════════════════════════════════════════════╝
```

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "HackVision API is running",
  "timestamp": "2026-01-22T...",
  "environment": "development",
  "version": "v1"
}
```

### Test User Registration

#### Register a Patient
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Ravi Kumar",
    "email": "ravi@example.com",
    "phone": "9876543210",
    "password": "password123",
    "role": "patient",
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "location": {
      "village": "Dharampur",
      "district": "Valsad",
      "state": "Gujarat",
      "pincode": "396050"
    }
  }'
```

#### Register an ASHA Worker
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Meera Patel",
    "email": "meera@example.com",
    "phone": "9876543211",
    "password": "password123",
    "role": "asha_worker",
    "location": {
      "village": "Dharampur",
      "district": "Valsad",
      "state": "Gujarat",
      "pincode": "396050"
    },
    "ashaWorkerDetails": {
      "workerId": "ASHA001",
      "certificationNumber": "CERT123",
      "assignedArea": "Dharampur Block",
      "yearsOfExperience": 5,
      "languagesSpoken": ["Hindi", "Gujarati"]
    }
  }'
```

#### Register a Doctor
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Dr. Anjali Shah",
    "email": "anjali@example.com",
    "phone": "9876543212",
    "password": "password123",
    "role": "doctor",
    "doctorDetails": {
      "medicalLicenseNumber": "MH12345",
      "specialization": "General Medicine",
      "qualifications": ["MBBS", "MD"],
      "yearsOfExperience": 10,
      "consultationFee": 500
    }
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ravi@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "fullName": "Ravi Kumar",
    "email": "ravi@example.com",
    "role": "patient",
    ...
  }
}
```

### Test Protected Route (Get Profile)
```bash
# Replace YOUR_TOKEN with the token from login response
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📱 Using with Mobile Apps

### Authentication Flow
1. **Register/Login** → Receive JWT token
2. **Store token** in secure storage (AsyncStorage/SecureStore)
3. **Include token** in all API requests:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   }
   ```

### Example React Native Code

```javascript
// API Service
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth functions
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
```

## 🔐 Available Endpoints

### Auth Routes (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (Protected)
- `PUT /updatedetails` - Update user details (Protected)
- `PUT /updatepassword` - Update password (Protected)
- `GET /logout` - Logout (Protected)
- `PUT /fcm-token` - Update FCM token for push notifications (Protected)

## 🤖 Gemini AI Integration

The Gemini service is ready and configured. It provides:

1. **Symptom Analysis** - Analyze patient symptoms and provide probable diagnosis
2. **Medical Report Analysis** - Analyze lab reports, blood tests, etc.
3. **Medical Image Analysis** - Analyze X-rays, CT scans, MRI images using Gemini Vision
4. **AI Chatbot** - Answer patient questions in simple language
5. **Patient Summary** - Generate comprehensive summaries for doctors
6. **Prescription Safety** - Check for drug interactions and safety

Example usage in controllers:
```javascript
const geminiService = require('../services/gemini.service');

// Analyze symptoms
const analysis = await geminiService.analyzeSymptomsForDiagnosis({
  symptoms: ['fever', 'cough', 'headache'],
  chiefComplaints: 'Fever for 3 days',
  duration: '3 days',
  vitalSigns: { temperature: { value: 102, unit: 'fahrenheit' } }
});

// Chatbot
const response = await geminiService.chatbotResponse(
  "What should I do for fever?",
  { currentSymptoms: 'fever, headache' }
);
```

## 🗂️ Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── auth.controller.js   # Auth logic
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── errorHandler.js      # Global error handler
│   └── validators.js        # Input validation
├── models/
│   ├── User.js              # User schema
│   ├── Appointment.js       # Appointment schema
│   ├── Prescription.js      # Prescription schema
│   ├── MedicalReport.js     # Medical report schema
│   ├── Inventory.js         # Inventory schema
│   ├── SupplyShop.js        # Supply shop schema
│   └── index.js             # Model exports
├── routes/
│   └── auth.routes.js       # Auth routes
├── services/
│   └── gemini.service.js    # Gemini AI integration
├── .env                     # Environment variables (configured)
├── .gitignore              # Git ignore
├── package.json            # Dependencies
└── server.js               # Entry point
```

## 🔜 Next Steps

You can now:
1. ✅ Start the server and test authentication
2. Create additional controllers (appointments, prescriptions, etc.)
3. Build the mobile apps
4. Implement file upload for medical images
5. Add Socket.io for real-time features
6. Deploy to production

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Check your IP is whitelisted in MongoDB Atlas
- Verify connection string in `.env`

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Change port in .env
PORT=5001
```

### Dependencies Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For issues, check:
- Server logs in the terminal
- MongoDB Atlas logs
- Error responses from API

---

**You're all set! The backend is fully configured and ready to use. 🎉**
