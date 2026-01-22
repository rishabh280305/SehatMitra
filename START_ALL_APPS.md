# 🏥 SehatMitra - Complete Startup Guide

## Quick Start - All Applications

### 1. Start Backend Server (Port 5000)
```bash
cd backend
npm install
npm run dev
```

**Verify Backend is Running:**
- You should see: ✅ Server running on port 5000
- Check: http://localhost:5000/api/v1/health

### 2. Start Patient App (Port 3000)
**Open a NEW terminal:**
```bash
cd frontend/patient-app
npm install
npm run dev
```
- Opens at: http://localhost:3000
- Login: patient@test.com / password123

### 3. Start ASHA Worker App (Port 3001)
**Open a NEW terminal:**
```bash
cd frontend/asha-worker-app
npm install
npm run dev
```
- Opens at: http://localhost:3001
- Login: asha@test.com / password123

### 4. Start Doctor App (Port 3002)
**Open a NEW terminal:**
```bash
cd frontend/doctor-app
npm install
npm run dev
```
- Opens at: http://localhost:3002
- Login: doctor@test.com / password123

---

## 🐛 Troubleshooting Login Issues

### If ASHA or Doctor Login Fails:

#### Step 1: Verify Backend is Running
```bash
# Test the backend health endpoint
curl http://localhost:5000/api/v1/health
```

#### Step 2: Verify Database Has Users
```bash
cd backend
node seed.js
```
This will create test users for all three portals.

#### Step 3: Test Login Endpoint Directly
```bash
# Test ASHA Worker Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"asha@test.com\",\"password\":\"password123\"}"

# Test Doctor Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"doctor@test.com\",\"password\":\"password123\"}"
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "asha@test.com",
    "role": "asha_worker",
    ...
  }
}
```

#### Step 4: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try logging in
4. Look for red errors

Common issues:
- ❌ "Failed to fetch" → Backend not running
- ❌ "CORS error" → Check backend .env ALLOWED_ORIGINS
- ❌ "401 Unauthorized" → Wrong credentials or user doesn't exist
- ❌ "403 Forbidden" → Account deactivated

#### Step 5: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try logging in
4. Look for the POST request to `/api/v1/auth/login`
5. Check the response

---

## 📝 Test Credentials

| Portal | Email | Password | URL |
|--------|-------|----------|-----|
| Patient | patient@test.com | password123 | http://localhost:3000 |
| ASHA Worker | asha@test.com | password123 | http://localhost:3001 |
| Doctor | doctor@test.com | password123 | http://localhost:3002 |

---

## 🔍 Detailed Debugging Steps

### Check if Frontend Can Reach Backend

**For ASHA Worker App (Port 3001):**
```bash
# In browser console at http://localhost:3001
fetch('/api/v1/health')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

**For Doctor App (Port 3002):**
```bash
# In browser console at http://localhost:3002
fetch('/api/v1/health')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

If this fails, the Vite proxy isn't working. Verify `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 3001, // or 3002 for doctor app
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

---

## ✅ Expected Behavior

### Patient App (Port 3000) - ✅ Working
- Login works
- Dashboard loads
- AI Consultant works with OpenAI
- Mobile-responsive UI

### ASHA Worker App (Port 3001) - 🔄 Testing
- Should redirect to dashboard after login
- Should show ASHA-specific features
- Should have mobile-responsive UI

### Doctor App (Port 3002) - 🔄 Testing
- Should redirect to dashboard after login
- Should show doctor-specific features
- Desktop-only UI (no mobile responsive)

---

## 🚨 Common Errors and Fixes

### Error: "Access denied. ASHA Worker credentials required"
**Cause:** You're trying to log into ASHA portal with patient or doctor credentials  
**Fix:** Use asha@test.com / password123

### Error: "Access denied. Doctor credentials required"
**Cause:** You're trying to log into Doctor portal with patient or ASHA credentials  
**Fix:** Use doctor@test.com / password123

### Error: "Invalid credentials"
**Cause:** Database doesn't have the user  
**Fix:** Run `node seed.js` in backend folder

### Error: "Failed to fetch"
**Cause:** Backend server not running  
**Fix:** Start backend first with `npm run dev` in backend folder

### Error: "Network Error"
**Cause:** Frontend can't reach backend  
**Fix:** 
1. Verify backend is on port 5000
2. Check vite.config.js proxy settings
3. Restart frontend dev server

---

## 🎯 Next Steps After Login Works

1. **Test AI Chat Integration**
   - Patient portal → AI Consultant
   - Should use OpenAI GPT-4-turbo
   - API Key configured in backend/.env

2. **Complete Backend APIs**
   - Appointments
   - Prescriptions
   - Patient records
   - Inventory management

3. **Connect Frontend to Backend**
   - Wire up all dashboard stats
   - Connect forms to backend
   - Implement real-time features

---

## 📞 Quick Command Reference

```bash
# Start Backend
cd backend && npm run dev

# Start Patient App
cd frontend/patient-app && npm run dev

# Start ASHA App
cd frontend/asha-worker-app && npm run dev

# Start Doctor App
cd frontend/doctor-app && npm run dev

# Seed Database
cd backend && node seed.js

# Test Backend Health
curl http://localhost:5000/api/v1/health

# Test Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"asha@test.com\",\"password\":\"password123\"}"
```

---

**Last Updated:** 2024
**System:** SehatMitra Healthcare Platform
**Tech Stack:** Node.js + Express + MongoDB + React + Vite
