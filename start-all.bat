@echo off
color 0A
echo ========================================
echo   SehatMitra - Healthcare System
echo ========================================
echo.

echo [1/5] Installing Backend Dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Backend npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/5] Seeding Database with Test Users...
call npm run seed
if errorlevel 1 (
    echo ERROR: Database seeding failed!
    pause
    exit /b 1
)

echo.
echo [3/5] Starting Backend Server...
start "Backend Server (Port 5000)" cmd /k "cd /d %CD% && npm run dev"
cd ..

echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo.
echo [4/5] Starting Frontend Applications...
start "Patient Portal (Port 3000)" cmd /k "cd frontend\patient-app && npm install && npm run dev"
timeout /t 2 /nobreak > nul

start "ASHA Worker Portal (Port 3001)" cmd /k "cd frontend\asha-worker-app && npm install && npm run dev"
timeout /t 2 /nobreak > nul

start "Doctor Portal (Port 3002)" cmd /k "cd frontend\doctor-app && npm install && npm run dev"

echo.
echo [5/5] All Services Started!
echo.
echo ========================================
echo   ACCESS PORTALS
echo ========================================
echo.
echo Backend API:  http://localhost:5000
echo.
echo Patient:      http://localhost:3000
echo   Email:      patient@test.com
echo   Password:   password123
echo.
echo ASHA Worker:  http://localhost:3001
echo   Email:      asha@test.com
echo   Password:   password123
echo.
echo Doctor:       http://localhost:3002
echo   Email:      doctor@test.com
echo   Password:   password123
echo.
echo ========================================
echo.
echo Wait 10-15 seconds for all apps to load...
echo Then open your browser to the URLs above.
echo.
pause
