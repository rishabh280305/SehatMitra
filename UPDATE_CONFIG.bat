@echo off
echo ========================================
echo   Updating all files to use config...
echo ========================================
echo.
echo This script will create a Python script to update all API_BASE_URL references.
echo.

echo import os > update_api_urls.py
echo import re >> update_api_urls.py
echo. >> update_api_urls.py
echo # Files to update >> update_api_urls.py
echo files = [ >> update_api_urls.py
echo     r'frontend\patient-app\src\pages\AIConsultant.jsx', >> update_api_urls.py
echo     r'frontend\patient-app\src\pages\Consultation.jsx', >> update_api_urls.py
echo     r'frontend\patient-app\src\pages\FollowUpRequests.jsx', >> update_api_urls.py
echo     r'frontend\patient-app\src\pages\CallHistory.jsx', >> update_api_urls.py
echo     r'frontend\patient-app\src\components\IncomingCall.jsx', >> update_api_urls.py
echo     r'frontend\asha-worker-app\src\pages\Dashboard.jsx', >> update_api_urls.py
echo     r'frontend\asha-worker-app\src\pages\PatientIntake.jsx', >> update_api_urls.py
echo     r'frontend\asha-worker-app\src\pages\AIConsultant.jsx', >> update_api_urls.py
echo     r'frontend\asha-worker-app\src\pages\MyPatients.jsx', >> update_api_urls.py
echo     r'frontend\asha-worker-app\src\pages\CallHistory.jsx', >> update_api_urls.py
echo     r'frontend\asha-worker-app\src\components\IncomingCall.jsx', >> update_api_urls.py
echo     r'frontend\doctor-app\src\pages\Dashboard.jsx', >> update_api_urls.py
echo     r'frontend\doctor-app\src\pages\Queue.jsx', >> update_api_urls.py
echo     r'frontend\doctor-app\src\pages\Consultation.jsx', >> update_api_urls.py
echo     r'frontend\doctor-app\src\pages\PatientReports.jsx', >> update_api_urls.py
echo     r'frontend\doctor-app\src\pages\ScheduledCalls.jsx', >> update_api_urls.py
echo     r'frontend\doctor-app\src\pages\CallHistory.jsx', >> update_api_urls.py
echo     r'frontend\doctor-app\src\components\VoiceCall.jsx', >> update_api_urls.py
echo ] >> update_api_urls.py
echo. >> update_api_urls.py
echo for file_path in files: >> update_api_urls.py
echo     try: >> update_api_urls.py
echo         with open(file_path, 'r', encoding='utf-8'^) as f: >> update_api_urls.py
echo             content = f.read(^) >> update_api_urls.py
echo. >> update_api_urls.py
echo         # Add import at the top if not already there >> update_api_urls.py
echo         if 'import API_BASE_URL from' not in content: >> update_api_urls.py
echo             # Find the last import statement >> update_api_urls.py
echo             import_match = re.search(r"(import .+?;[\n\r]+)+", content^) >> update_api_urls.py
echo             if import_match: >> update_api_urls.py
echo                 last_import_end = import_match.end(^) >> update_api_urls.py
echo                 content = content[:last_import_end] + "import API_BASE_URL from '../config';\n" + content[last_import_end:] >> update_api_urls.py
echo. >> update_api_urls.py
echo         # Remove the const API_BASE_URL line >> update_api_urls.py
echo         content = re.sub(r"const API_BASE_URL = 'http://localhost:5000/api/v1';[\n\r]*", '', content^) >> update_api_urls.py
echo. >> update_api_urls.py
echo         with open(file_path, 'w', encoding='utf-8'^) as f: >> update_api_urls.py
echo             f.write(content^) >> update_api_urls.py
echo. >> update_api_urls.py
echo         print(f'Updated {file_path}'^) >> update_api_urls.py
echo     except Exception as e: >> update_api_urls.py
echo         print(f'Error updating {file_path}: {e}'^) >> update_api_urls.py
echo. >> update_api_urls.py
echo print('\nAll files updated!'^) >> update_api_urls.py

python update_api_urls.py
del update_api_urls.py

echo.
echo ========================================
echo   Files updated successfully!
echo ========================================
pause
