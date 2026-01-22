@echo off
echo ========================================
echo   SehatMitra Production Deployment
echo ========================================
echo.
echo This will deploy all 5 apps to Vercel.
echo Make sure you have Vercel CLI installed: npm i -g vercel
echo.
pause

echo.
echo [1/5] Deploying Backend...
cd backend
call vercel --prod
cd ..
echo.
echo Backend deployed! Copy the URL and update .env.production files in frontend apps.
echo.
pause

echo.
echo [2/5] Deploying Patient Portal...
cd frontend\patient-app
call vercel --prod
cd ..\..
echo.

echo [3/5] Deploying ASHA Worker Portal...
cd frontend\asha-worker-app
call vercel --prod
cd ..\..
echo.

echo [4/5] Deploying Doctor Portal...
cd frontend\doctor-app
call vercel --prod
cd ..\..
echo.

echo [5/5] Deploying Landing Page...
cd frontend\landing-page
call vercel --prod
cd ..\..
echo.

echo ========================================
echo   All apps deployed!
echo ========================================
echo.
echo IMPORTANT: Update environment variables in Vercel dashboard:
echo.
echo 1. Backend: Set MONGODB_URI and JWT_SECRET
echo 2. Frontend apps: Update with actual deployed URLs
echo 3. Landing page: Update with frontend app URLs
echo.
pause
