@echo off
echo Starting Landing Page on port 3004...
cd frontend\landing-page
start cmd /k "npm start"
echo Landing page starting at http://localhost:3004
timeout /t 3
