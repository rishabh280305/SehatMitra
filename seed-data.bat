@echo off
echo ========================================
echo SehatMitra - Database Seeding
echo ========================================
echo.
echo This will create 5 dummy patients in your database.
echo Make sure you have created at least one ASHA worker account.
echo.
pause

cd backend
node scripts/seedPatients.js

echo.
echo ========================================
echo Seeding Complete!
echo ========================================
pause
