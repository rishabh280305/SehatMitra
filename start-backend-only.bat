@echo off
color 0E
title Manual Backend Startup

echo ========================================
echo   SehatMitra Backend - Manual Start
echo ========================================
echo.

cd backend

echo [Step 1] Installing Dependencies...
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: npm install failed!
    echo Please check your internet connection.
    pause
    exit /b 1
)

echo.
echo [Step 2] Seeding Test Users...
call node seed.js
if errorlevel 1 (
    echo.
    echo ERROR: Database seeding failed!
    echo Check MongoDB connection in .env file.
    pause
    exit /b 1
)

echo.
echo [Step 3] Starting Backend Server...
echo.
echo Backend will start at: http://localhost:5000
echo.
echo Keep this window OPEN while testing.
echo Press Ctrl+C to stop the server.
echo.
echo ========================================
echo.

call npm run dev

pause
