# SehatMitra Production Deployment Guide

## Prerequisites

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

## Step-by-Step Deployment

### STEP 1: Deploy Backend

```bash
cd backend
vercel
```

- Follow prompts and select "Deploy"
- Copy the production URL (e.g., `https://sehatmitra-backend.vercel.app`)
- Go to Vercel Dashboard > Your Backend Project > Settings > Environment Variables
- Add these variables:
  - `MONGODB_URI`: Your MongoDB connection string
  - `JWT_SECRET`: A random secret string (e.g., `your-super-secret-jwt-key-12345`)
  - `NODE_ENV`: `production`
- Redeploy: `vercel --prod`

**Important:** Copy the backend URL, you'll need it for the next steps!

---

### STEP 2: Update Frontend Environment Files

Update these files with your actual backend URL:

**File: `frontend/patient-app/.env.production`**
```
REACT_APP_API_URL=https://YOUR-BACKEND-URL.vercel.app/api/v1
```

**File: `frontend/asha-worker-app/.env.production`**
```
REACT_APP_API_URL=https://YOUR-BACKEND-URL.vercel.app/api/v1
```

**File: `frontend/doctor-app/.env.production`**
```
REACT_APP_API_URL=https://YOUR-BACKEND-URL.vercel.app/api/v1
```

---

### STEP 3: Deploy Patient Portal

```bash
cd frontend/patient-app
vercel --prod
```

Copy the deployed URL (e.g., `https://sehatmitra-patient.vercel.app`)

---

### STEP 4: Deploy ASHA Worker Portal

```bash
cd frontend/asha-worker-app
vercel --prod
```

Copy the deployed URL (e.g., `https://sehatmitra-asha.vercel.app`)

---

### STEP 5: Deploy Doctor Portal

```bash
cd frontend/doctor-app
vercel --prod
```

Copy the deployed URL (e.g., `https://sehatmitra-doctor.vercel.app`)

---

### STEP 6: Update Landing Page Environment

**File: `frontend/landing-page/.env.production`**
```
REACT_APP_PATIENT_URL=https://YOUR-PATIENT-APP.vercel.app
REACT_APP_ASHA_URL=https://YOUR-ASHA-APP.vercel.app
REACT_APP_DOCTOR_URL=https://YOUR-DOCTOR-APP.vercel.app
```

---

### STEP 7: Deploy Landing Page

```bash
cd frontend/landing-page
vercel --prod
```

---

## Quick Deployment (Automated)

Run the batch file:
```bash
DEPLOY_ALL.bat
```

This will deploy all 5 apps sequentially.

---

## Post-Deployment Checklist

✅ Backend deployed with environment variables set  
✅ MongoDB connection working  
✅ Patient portal can login and fetch data  
✅ ASHA portal can register patients  
✅ Doctor portal shows consultations  
✅ Landing page links to all portals  

---

## Troubleshooting

**CORS Errors:**
- Backend automatically allows all origins in production (configured in server.js)

**API Not Found:**
- Check that `.env.production` files have correct backend URL
- Make sure to rebuild: `vercel --prod`

**Database Connection Failed:**
- Verify `MONGODB_URI` in Vercel dashboard
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

---

## URLs Summary

After deployment, you'll have:

- **Landing Page**: https://sehatmitra.vercel.app
- **Patient Portal**: https://sehatmitra-patient.vercel.app
- **ASHA Worker**: https://sehatmitra-asha.vercel.app
- **Doctor Portal**: https://sehatmitra-doctor.vercel.app
- **Backend API**: https://sehatmitra-backend.vercel.app

Share the landing page URL for demos!
