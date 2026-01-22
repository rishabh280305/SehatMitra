@echo off
echo ========================================
echo   Deploying Landing Page to Vercel
echo ========================================
echo.
echo Make sure you updated .env.production with frontend URLs!
echo.
pause

cd frontend\landing-page
call vercel --prod
cd ..\..

echo.
echo ========================================
echo   Landing Page Deployed!
echo ========================================
echo.
echo Your SehatMitra platform is now live!
echo Share the landing page URL for demos.
echo.
pause
