# 🚀 Complete Vercel Deployment Guide

## Step 1: Deploy Backend to Vercel

### A. Push Latest Code to Git (if using GitHub)
1. Open terminal in `HackVision` folder
2. Run:
```bash
git add .
git commit -m "Fixed backend for serverless"
git push
```

### B. Deploy via Vercel Dashboard

#### **Option 1: Through Website (Recommended)**

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Login with your account

2. **Find Your Backend Project**
   - Click on `sehatmitra-backend` project
   - Or if it doesn't exist, click **"Add New..."** → **"Project"**

3. **If Creating New Project:**
   - Click **"Import Git Repository"**
   - Select your GitHub repo
   - Set **Root Directory**: `backend`
   - Click **"Import"**

4. **Configure Build Settings:**
   - Framework Preset: **Other**
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

5. **Click "Deploy"** (Don't set environment variables yet, we'll do that next)

---

## Step 2: Set Environment Variables in Vercel

### **For Backend Project** (`sehatmitra-backend`)

1. **Go to Project Settings**
   - In Vercel dashboard, click on `sehatmitra-backend`
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in left sidebar

2. **Add Each Variable:**

Click **"Add New"** for each variable below:

#### **Variable 1: MONGODB_URI**
```
Name: MONGODB_URI
Value: mongodb+srv://rishabhjhaveri2803_db_user:AteRMTS2kipaTlRB@cluster0.ko9voqe.mongodb.net/hackvision?retryWrites=true&w=majority
Environment: Production (check the box)
```

#### **Variable 2: JWT_SECRET**
```
Name: JWT_SECRET
Value: e930a8367b9ee432ffd5971c7f74e33f92e30c4f631222f29a198fbd8ba0fa8f
Environment: Production
```

#### **Variable 3: NODE_ENV**
```
Name: NODE_ENV
Value: production
Environment: Production
```

#### **Variable 4: JWT_EXPIRE**
```
Name: JWT_EXPIRE
Value: 7d
Environment: Production
```

#### **Variable 5: JWT_COOKIE_EXPIRE**
```
Name: JWT_COOKIE_EXPIRE
Value: 7
Environment: Production
```

#### **Variable 6: GEMINI_API_KEY** (for AI features)
```
Name: GEMINI_API_KEY
Value: AIzaSyDTtuG9QjnTdYo2f1OzCbLtqq9EoEsJ5Js
Environment: Production
```

#### **Variable 7: API_VERSION**
```
Name: API_VERSION
Value: v1
Environment: Production
```

3. **Save All Variables**
   - Click **"Save"** after adding each variable

---

## Step 3: Redeploy Backend

1. **Go to Deployments Tab**
   - Click **"Deployments"** in top menu
   
2. **Trigger New Deployment**
   - Click on the **three dots (...)** next to latest deployment
   - Click **"Redeploy"**
   - Check **"Use existing build cache"** → UNCHECK it
   - Click **"Redeploy"**

3. **Wait for Deployment**
   - Status will show "Building..." then "Ready"
   - Should take 30-60 seconds

---

## Step 4: Test Backend

### A. Test Health Endpoint
1. Open browser
2. Go to: `https://sehatmitra-backend.vercel.app/health`
3. Should see:
```json
{
  "success": true,
  "message": "SehatMitra API is running",
  "database": "connected",
  "environment": "production",
  "version": "v1"
}
```

**If you see "database": "disconnected"**:
- MongoDB URI is wrong or MongoDB Atlas isn't allowing connections
- Go to Step 5 below

---

## Step 5: Configure MongoDB Atlas

1. **Go to MongoDB Atlas**
   - Visit: https://cloud.mongodb.com
   - Login with your account

2. **Select Your Cluster**
   - Click on your cluster (cluster0)

3. **Configure Network Access**
   - Click **"Network Access"** in left sidebar
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"**
   - Enter `0.0.0.0/0` in IP Address
   - Click **"Confirm"**

4. **Verify Database User**
   - Click **"Database Access"** in left sidebar
   - Verify user `rishabhjhaveri2803_db_user` exists
   - If not, create new user with password `AteRMTS2kipaTlRB`

5. **Test Connection String**
   - Go back to Vercel dashboard
   - Check MONGODB_URI is exactly:
   ```
   mongodb+srv://rishabhjhaveri2803_db_user:AteRMTS2kipaTlRB@cluster0.ko9voqe.mongodb.net/hackvision?retryWrites=true&w=majority
   ```

---

## Step 6: Set Environment Variables for Frontends

### **For Patient App** (`sehatmitra-patient`)

1. Go to project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Add:
```
Name: VITE_API_URL
Value: https://sehatmitra-backend.vercel.app/api/v1
Environment: Production
```

### **For Doctor App** (`sehatmitra-doctor`)

1. Go to project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Add:
```
Name: VITE_API_URL
Value: https://sehatmitra-backend.vercel.app/api/v1
Environment: Production
```

### **For ASHA Worker App** (`sehatmitra-asha`)

1. Go to project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Add:
```
Name: VITE_API_URL
Value: https://sehatmitra-backend.vercel.app/api/v1
Environment: Production
```

---

## Step 7: Redeploy All Frontends

For **each frontend** (patient, doctor, asha):

1. Go to project in Vercel dashboard
2. Click **"Deployments"** tab
3. Click **three dots (...)** next to latest deployment
4. Click **"Redeploy"**
5. **UNCHECK** "Use existing build cache"
6. Click **"Redeploy"**

Wait for all three to finish deploying.

---

## Step 8: Test Complete Flow

### Test Patient Registration

1. **Open Patient App**
   - Go to: `https://sehatmitra-patient.vercel.app`

2. **Click "Register"**

3. **Fill Form:**
   - Full Name: `Test User`
   - Email: `testuser@example.com`
   - Phone: `9999999998`
   - Password: `test123`
   - Date of Birth: `1995-01-01`
   - Gender: `Male`

4. **Click Submit**

5. **Should redirect to dashboard**

### Test Doctor Registration

1. **Open Doctor App**
   - Go to: `https://sehatmitra-doctor.vercel.app`

2. **Click "Register"**

3. **Fill Form:**
   - Full Name: `Dr. Test User`
   - Email: `testdoctor@example.com`
   - Phone: `9999999997`
   - Password: `test123`
   - Medical License: `TEST123`
   - Specialization: `General Medicine`
   - Years of Experience: `5`
   - Consultation Fee: `500`

4. **Click Submit**

5. **Should redirect to dashboard**

---

## 🔍 Troubleshooting

### Issue: Backend shows 404
**Solution:**
- Verify `vercel.json` in backend folder has:
```json
{
  "version": 2,
  "builds": [{"src": "index.js", "use": "@vercel/node"}],
  "routes": [{"src": "/(.*)", "dest": "/index.js"}]
}
```
- Redeploy backend

### Issue: Database disconnected
**Solution:**
- Check MongoDB Atlas Network Access allows `0.0.0.0/0`
- Verify MONGODB_URI in Vercel environment variables
- Check MongoDB Atlas cluster is running (not paused)

### Issue: CORS error in browser
**Solution:**
- Open browser console (F12)
- Check exact error message
- Verify frontend URL is in backend CORS whitelist
- Redeploy backend

### Issue: "Email already registered"
**Solution:**
- User already exists in database
- Use different email or login instead
- Or delete user from MongoDB Atlas

### Issue: Frontend shows "Network Error"
**Solution:**
- Check `VITE_API_URL` is set in frontend environment variables
- Redeploy frontend after setting variable
- Clear browser cache (Ctrl+Shift+Delete)

---

## 📋 Quick Checklist

### Backend:
- [ ] Deployed to Vercel
- [ ] Environment variables set (7 variables)
- [ ] `/health` endpoint returns success
- [ ] Database shows "connected"

### MongoDB:
- [ ] Network access allows 0.0.0.0/0
- [ ] Database user exists
- [ ] Connection string is correct

### Frontends:
- [ ] All 3 deployed to Vercel
- [ ] VITE_API_URL set for each
- [ ] Redeployed after setting variables

### Testing:
- [ ] Patient registration works
- [ ] Doctor registration works
- [ ] Login works
- [ ] Dashboard loads

---

## 🆘 Still Having Issues?

### Check Vercel Logs:

1. Go to project in Vercel dashboard
2. Click **"Deployments"** tab
3. Click on latest deployment
4. Click **"View Function Logs"**
5. Look for error messages

### Share These for Help:
- Screenshot of browser console (F12)
- Screenshot of Vercel function logs
- Screenshot of Network tab showing failed request
- Exact error message you're seeing

---

## 📞 Support Commands

### View Backend Logs:
```bash
vercel logs sehatmitra-backend --prod
```

### Test Backend from Terminal:
```bash
curl https://sehatmitra-backend.vercel.app/health
```

### Test Registration from Terminal:
```bash
curl -X POST https://sehatmitra-backend.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@test.com","phone":"9999999996","password":"test123","role":"patient","dateOfBirth":"1990-01-01","gender":"male"}'
```

---

**Last Updated:** January 22, 2026
