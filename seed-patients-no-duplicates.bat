@echo off
echo ========================================
echo   Seeding ASHA Patients (No Duplicates)
echo ========================================
echo.
echo Note: Make sure you have an ASHA worker account created first!
echo.

cd backend
node scripts/seedPatients.js

echo.
echo ========================================
echo   Patient Seeding Complete!
echo ========================================
echo.
echo Now restart your backend and check ASHA dashboard!
echo.
pause