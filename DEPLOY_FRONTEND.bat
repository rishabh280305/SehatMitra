@echo off
echo ========================================
echo   Deploying Frontend Apps to Vercel
echo ========================================
echo.
echo Backend URL: https://sehatmitra-backend.vercel.app
echo.
echo Make sure Vercel CLI is installed and you're logged in!
echo.
pause

echo.
echo [1/3] Deploying Patient Portal...
cd frontend\patient-app
call vercel --prod
cd ..\..
echo.
echo Patient Portal deployed!
pause

echo.
echo [2/3] Deploying ASHA Worker Portal...
cd frontend\asha-worker-app
call vercel --prod
cd ..\..
echo.
echo ASHA Worker Portal deployed!
pause

echo.
echo [3/3] Deploying Doctor Portal...
cd frontend\doctor-app
call vercel --prod
cd ..\..
echo.
echo Doctor Portal deployed!
pause

echo.
echo ========================================
echo   Frontend apps deployed!
echo ========================================
echo.
echo NEXT STEP:
echo Copy the deployed URLs above and update:
echo frontend\landing-page\.env.production
echo.
echo Then run DEPLOY_LANDING_PAGE.bat
echo.
pause
