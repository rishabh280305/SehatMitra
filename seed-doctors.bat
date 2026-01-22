@echo off
echo ========================================
echo   Adding 5 Doctors to Database
echo ========================================
echo.

cd backend
node seedDoctors.js

echo.
echo ========================================
echo   Checking Database...
echo ========================================
echo.
node quickCheck.js

echo.
echo Now restart your backend server!
echo.
pause
