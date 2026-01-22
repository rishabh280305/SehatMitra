@echo off
echo ========================================
echo   Redeploying All Apps to Production
echo ========================================
echo.

echo [1/4] Redeploying Patient Portal...
cd frontend\patient-app
call vercel --prod
cd ..\..
echo.

echo [2/4] Redeploying ASHA Worker Portal...
cd frontend\asha-worker-app
call vercel --prod
cd ..\..
echo.

echo [3/4] Redeploying Doctor Portal...
cd frontend\doctor-app
call vercel --prod
cd ..\..
echo.

echo [4/4] Redeploying Landing Page...
cd frontend\landing-page
call vercel --prod
cd ..\..
echo.

echo ========================================
echo   All apps redeployed successfully!
echo ========================================
echo.
echo Your live platform: https://sehatmitra-landing.vercel.app
echo.
pause
