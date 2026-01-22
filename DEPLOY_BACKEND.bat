@echo off
echo ========================================
echo   DEPLOYING BACKEND TO VERCEL
echo ========================================
echo.

cd backend

echo Deploying to production...
vercel --prod

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Testing backend health...
timeout /t 5 /nobreak >nul
curl https://sehatmitra-backend.vercel.app/health

echo.
echo.
echo Testing registration endpoint...
curl -X POST https://sehatmitra-backend.vercel.app/api/v1/test/register ^
  -H "Content-Type: application/json" ^
  -d "{\"test\": \"data\"}"

echo.
echo.
echo ========================================
echo   NEXT STEPS:
echo   1. Check Vercel logs if issues persist
echo   2. Redeploy frontends if needed
echo ========================================
pause
