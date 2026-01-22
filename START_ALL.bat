@echo off
echo ========================================
echo     SehatMitra - Starting All Services
echo ========================================
echo.

echo [1/5] Starting Backend Server...
cd backend
start cmd /k "title Backend Server (Port 5001) && npm start"
cd ..
timeout /t 3

echo [2/5] Starting Patient Portal...
cd frontend\patient-app
start cmd /k "title Patient Portal (Port 3000) && npm start"
cd ..\..
timeout /t 2

echo [3/5] Starting ASHA Worker Portal...
cd frontend\asha-worker-app
start cmd /k "title ASHA Worker Portal (Port 3001) && npm start"
cd ..\..
timeout /t 2

echo [4/5] Starting Doctor Portal...
cd frontend\doctor-app
start cmd /k "title Doctor Portal (Port 3002) && npm start"
cd ..\..
timeout /t 2

echo [5/5] Starting Landing Page...
cd frontend\landing-page
start cmd /k "title Landing Page (Port 3004) && npm start"
cd ..\..

echo.
echo ========================================
echo All services are starting!
echo ========================================
echo.
echo Landing Page:      http://localhost:3004
echo Patient Portal:    http://localhost:3000
echo ASHA Worker:       http://localhost:3001
echo Doctor Portal:     http://localhost:3002
echo Backend API:       http://localhost:5001
echo.
echo Press any key to exit this window...
pause >nul
