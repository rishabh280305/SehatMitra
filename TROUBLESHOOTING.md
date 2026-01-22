# 🔧 Troubleshooting Guide

## ❌ "localhost refused to connect"

### Cause
The servers aren't running or haven't started yet.

### Solution
1. Close all terminal windows
2. Double-click `start-all.bat`
3. **Wait 15-20 seconds** for all services to start
4. You'll see 4 new terminal windows open
5. Wait for "Local:" messages in each terminal
6. Then access the URLs in your browser

---

## ❌ "Port already in use"

### Cause
Previous server instances are still running.

### Solution

**Option 1 - Task Manager (Easiest):**
1. Press `Ctrl + Shift + Esc`
2. Find all "node.exe" processes
3. Right-click → End Task
4. Run `start-all.bat` again

**Option 2 - Command Line:**
```cmd
taskkill /F /IM node.exe
```
Then run `start-all.bat` again

---

## ❌ Database Connection Failed

### Cause
MongoDB Atlas connection issue.

### Solution
1. Check internet connection
2. Verify `.env` file exists in `backend/` folder
3. Ensure `MONGODB_URI` is correct in `.env`
4. Try running seed script manually:
   ```cmd
   cd backend
   npm run seed
   ```

---

## ❌ "Cannot find module"

### Cause
Dependencies not installed.

### Solution
```cmd
cd backend
npm install

cd ../frontend/patient-app
npm install

cd ../asha-worker-app
npm install

cd ../doctor-app
npm install
```

---

## ❌ Login Not Working

### Cause
Database not seeded or wrong credentials.

### Solution
1. Run seed script:
   ```cmd
   cd backend
   npm run seed
   ```

2. Use exact credentials from `CREDENTIALS.md`
3. Check MongoDB Compass to verify users exist

---

## ❌ Vite Dev Server Not Starting

### Cause
Vite cache or dependency issues.

### Solution
```cmd
cd frontend/patient-app
rmdir /s /q node_modules
del package-lock.json
npm install
npm run dev
```

Repeat for `asha-worker-app` and `doctor-app` if needed.

---

## ✅ Verify Everything Works

### 1. Backend Running
Open http://localhost:5000 in browser
- Should see: "Cannot GET /" (this is normal!)
- Backend is running but has no root route

### 2. Patient App Running
Open http://localhost:3000
- Should see login page with blue theme

### 3. ASHA App Running
Open http://localhost:3001
- Should see login page with purple theme

### 4. Doctor App Running
Open http://localhost:3002
- Should see login page with cyan theme

### 5. Test Login
Use credentials from `CREDENTIALS.md`
- patient@test.com
- asha@test.com
- doctor@test.com
- All passwords: password123

---

## 🆘 Still Having Issues?

1. Close ALL terminal windows
2. Delete all `node_modules` folders
3. Delete all `package-lock.json` files
4. Run `start-all.bat` again (it will reinstall everything)

Or manually:
```cmd
cd backend
npm install
npm run seed
npm run dev
```

In 3 separate terminals:
```cmd
cd frontend/patient-app && npm install && npm run dev
cd frontend/asha-worker-app && npm install && npm run dev
cd frontend/doctor-app && npm install && npm run dev
```
