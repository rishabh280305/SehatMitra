# 🔐 HackVision Test Credentials

## Quick Access

### 👤 Patient Portal
- **URL**: http://localhost:3000
- **Email**: `patient@test.com`
- **Password**: `password123`

### 💜 ASHA Worker Portal
- **URL**: http://localhost:3001
- **Email**: `asha@test.com`
- **Password**: `password123`

### 👨‍⚕️ Doctor Portal
- **URL**: http://localhost:3002
- **Email**: `doctor@test.com`
- **Password**: `password123`

---

## 🎯 How to Use

1. **Start All Services**: Double-click `start-all.bat`
2. **Wait 15 seconds** for all servers to initialize
3. **Open Browser**: Navigate to any portal URL above
4. **Login**: Use the credentials for that specific portal
5. **Test Features**: Explore role-specific dashboards

---

## 📊 Database Info

All test users are automatically created in MongoDB Atlas when you run the startup script.

**Database Details:**
- Cluster: `cluster0.ko9voqe.mongodb.net`
- Database: `hackvision`
- Collection: `users`

**Test User Data:**

### Patient (Test Patient)
- Full Name: Test Patient
- Phone: 9876543210
- Age: 35, Male, O+
- Address: Mumbai, Maharashtra

### ASHA Worker (Test ASHA Worker)
- Full Name: Test ASHA Worker
- Phone: 9876543220
- Worker ID: ASHA001
- Certification: CERT12345
- Area: Mumbai Central
- Experience: 5 years
- Languages: Hindi, English, Marathi

### Doctor (Dr. Test Doctor)
- Full Name: Dr. Test Doctor
- Phone: 9876543230
- License: MH-MED-12345
- Specialization: General Medicine
- Qualifications: MBBS, MD
- Experience: 10 years
- Fee: ₹500

---

## 🔄 Reset Database

To recreate dummy users:

```bash
cd backend
npm run seed
```

This will clear all existing users and create fresh test accounts.
