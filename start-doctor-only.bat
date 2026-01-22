@echo off
color 0C
title Doctor App

cd frontend\doctor-app

echo ========================================
echo   Doctor Portal - Starting
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
echo Starting Doctor App...
echo URL: http://localhost:3002
echo.
echo Login with:
echo   Email: doctor@test.com
echo   Password: password123
echo.
echo Keep this window OPEN.
echo Press Ctrl+C to stop.
echo.

call npm run dev

pause
