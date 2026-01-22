@echo off
color 0B
title Patient App

cd frontend\patient-app

echo ========================================
echo   Patient Portal - Starting
echo ========================================
echo.

echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo Starting Patient App...
echo URL: http://localhost:3000
echo.
echo Login with:
echo   Email: patient@test.com
echo   Password: password123
echo.
echo Keep this window OPEN.
echo Press Ctrl+C to stop.
echo.

call npm run dev

pause
