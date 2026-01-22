# Production Environment Variables Setup

## Backend (Vercel Dashboard)

Go to: https://vercel.com → Your Backend Project → Settings → Environment Variables

Add these variables for **Production**:

```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/sehatmitra?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NODE_ENV=production
PORT=5000
ALLOWED_ORIGINS=*
```

**IMPORTANT**: After adding/updating variables, you MUST redeploy!
- Go to Deployments tab
- Click the 3 dots on latest deployment
- Select "Redeploy"

---

## Frontend Apps (Vercel Dashboard)

### Patient App
Project: sehatmitra-patient

Environment Variables (Production):
```
VITE_API_URL=https://sehatmitra-backend.vercel.app/api/v1
```

### ASHA Worker App  
Project: sehatmitra-asha

Environment Variables (Production):
```
VITE_API_URL=https://sehatmitra-backend.vercel.app/api/v1
```

### Doctor App
Project: sehatmitra-doctor

Environment Variables (Production):
```
VITE_API_URL=https://sehatmitra-backend.vercel.app/api/v1
```

### Landing Page
Project: sehatmitra-landing

Environment Variables (Production):
```
VITE_PATIENT_URL=https://sehatmitra-patient.vercel.app
VITE_ASHA_URL=https://sehatmitra-asha.vercel.app
VITE_DOCTOR_URL=https://sehatmitra-doctor.vercel.app
```

---

## MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com
2. Select your cluster → Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Make sure to whitelist IP: 0.0.0.0/0 (allow from anywhere) for Vercel
7. Use this as MONGODB_URI in backend

---

## Verification Checklist

After setting all environment variables and redeploying:

✅ Backend health check: https://sehatmitra-backend.vercel.app/health
✅ Patient registration works
✅ Doctor registration works  
✅ ASHA worker registration works
✅ Landing page links work

---

## Common Issues

**"Cannot POST /api/v1/auth/register"**
- Backend not deployed or crashed
- Check backend logs in Vercel dashboard
- Verify MONGODB_URI is correct

**"Network Error" or "Failed to fetch"**
- Frontend environment variables not set
- Redeploy frontend after setting VITE_API_URL
- Check browser console for exact error

**"Unauthorized" or "Invalid token"**
- JWT_SECRET not set in backend
- Different JWT_SECRET between deployments
- Clear browser localStorage and re-login

**ASHA build fails**
- Check all imports are correct
- Verify config.js exists
- Check build logs for specific error

---

## Current URLs

- Landing: https://sehatmitra-landing.vercel.app
- Patient: https://sehatmitra-patient.vercel.app
- ASHA: https://sehatmitra-asha.vercel.app
- Doctor: https://sehatmitra-doctor.vercel.app
- Backend: https://sehatmitra-backend.vercel.app
