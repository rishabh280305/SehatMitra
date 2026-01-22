@echo off
echo ========================================
echo   Checking Database for Doctors
echo ========================================
echo.

cd backend
node quickCheck.js

echo.
echo If you only see 1 doctor above, run:
echo   seed-doctors.bat
echo.
echo Then RESTART your backend server!
echo.
pause