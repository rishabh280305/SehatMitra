# 🚀 STEP-BY-STEP STARTUP GUIDE

## ⚠️ Important: Follow These Steps in Order!

### Step 1: Start Backend (MUST DO FIRST!)

1. Double-click **`start-backend-only.bat`**
2. Wait for this message:
   ```
   🏥  HackVision API Server Started  🏥
   ```
3. **DO NOT CLOSE THIS WINDOW**
4. Backend is now running at http://localhost:5000

### Step 2: Test Backend is Working

1. Open your browser
2. Go to: http://localhost:5000
3. You should see:
   ```json
   {
     "success": true,
     "message": "Welcome to HackVision..."
   }
   ```
4. ✅ If you see this, backend is working!
5. ❌ If you see "can't reach this page", backend didn't start

### Step 3: Start Frontend Apps (One by One)

**Option A - Patient Portal:**
1. Double-click **`start-patient-only.bat`**
2. Wait for: `Local: http://localhost:3000`
3. Open: http://localhost:3000
4. Login with `patient@test.com` / `password123`

**Option B - ASHA Worker Portal:**
1. Double-click **`start-asha-only.bat`**
2. Wait for: `Local: http://localhost:3001`
3. Open: http://localhost:3001
4. Login with `asha@test.com` / `password123`

**Option C - Doctor Portal:**
1. Double-click **`start-doctor-only.bat`**
2. Wait for: `Local: http://localhost:3002`
3. Open: http://localhost:3002
4. Login with `doctor@test.com` / `password123`

---

## 🐛 If Backend Doesn't Start

### Check 1: Kill Existing Node Processes
```cmd
taskkill /F /IM node.exe
```
Then run `start-backend-only.bat` again

### Check 2: Manually Install & Run
Open Command Prompt and run:
```cmd
cd C:\Users\Rishabh\Desktop\HackVision\backend
npm install
node seed.js
npm run dev
```

### Check 3: Verify MongoDB Connection
Open `backend\.env` and check `MONGODB_URI` is correct:
```
mongodb+srv://rishabhjhaveri2803_db_user:AteRMTS2kipaTlRB@cluster0.ko9voqe.mongodb.net/hackvision?retryWrites=true&w=majority
```

### Check 4: Test MongoDB Manually
```cmd
cd backend
node seed.js
```
If this works, database is fine!

---

## 📝 Summary

**DO THIS:**
1. ✅ Run `start-backend-only.bat` FIRST
2. ✅ Wait until you see "Server Started" message
3. ✅ Test http://localhost:5000 in browser
4. ✅ THEN run frontend apps

**DON'T DO THIS:**
1. ❌ Don't close backend window
2. ❌ Don't run frontends before backend
3. ❌ Don't run multiple instances of same app

---

## 🎯 Expected Windows After Startup

You should have these windows open:
- **Window 1**: Backend (Yellow text) - Port 5000
- **Window 2**: Patient App (Blue text) - Port 3000
- **Window 3**: ASHA App (Purple text) - Port 3001  
- **Window 4**: Doctor App (Red text) - Port 3002

**Keep ALL windows open while testing!**

---

## ✅ Quick Test Checklist

- [ ] Backend responds at http://localhost:5000
- [ ] Patient login page loads at http://localhost:3000
- [ ] Can login with patient@test.com / password123
- [ ] Dashboard shows after login
- [ ] AI chatbot works

If all ✅ = System working perfectly! 🎉
