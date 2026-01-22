@echo off
echo ========================================
echo   FINAL FIX - Deploying Everything
echo ========================================
echo.

echo Step 1: Deploying Backend with CORS fix...
cd backend
call vercel --prod
cd ..
timeout /t 3
echo.

echo Step 2: Deploying Patient App...
cd frontend\patient-app
call vercel --prod
cd ..\..
timeout /t 2
echo.

echo Step 3: Deploying Doctor App...
cd frontend\doctor-app
call vercel --prod
cd ..\..
timeout /t 2
echo.

echo Step 4: Deploying ASHA Worker App...
cd frontend\asha-worker-app
call vercel --prod
cd ..\..
timeout /t 2
echo.

echo Step 5: Deploying Landing Page...
cd frontend\landing-page
call vercel --prod
cd ..\..
echo.

echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo IMPORTANT NEXT STEPS IN VERCEL DASHBOARD:
echo.
echo 1. Backend - Verify these environment variables:
echo    - MONGODB_URI = your-mongodb-connection-string
echo    - JWT_SECRET = any-random-long-string
echo    - NODE_ENV = production
echo.
echo 2. If backend health check fails:
echo    - https://sehatmitra-backend.vercel.app/health
echo    - Go to Vercel Dashboard ^> Backend Project
echo    - Settings ^> Environment Variables
echo    - Add/Update variables above
echo    - Deployments ^> Redeploy latest
echo.
echo 3. Test Registration:
echo    - https://sehatmitra-patient.vercel.app
echo    - Click Register
echo    - Fill form and submit
echo    - Should work without errors
echo.
echo 4. Check browser console (F12) for any errors
echo.
pause
