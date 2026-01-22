@echo off
color 0D
title ASHA Worker App

cd frontend\asha-worker-app

echo ========================================
echo   ASHA Worker Portal - Starting
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
echo Starting ASHA Worker App...
echo URL: http://localhost:3001
echo.
echo Login with:
echo   Email: asha@test.com
echo   Password: password123
echo.
echo Keep this window OPEN.
echo Press Ctrl+C to stop.
echo.

call npm run dev

pause
