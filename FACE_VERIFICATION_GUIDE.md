# 👤 Face Verification System Guide

## Overview
The face verification system uses **face-api.js** (a JavaScript face recognition library) to capture and compare facial features. Face data is stored securely in MongoDB.

## How It Works

### 1. Face Registration (One-Time Setup)
Before you can login with your face, you must first **register your face**:

**Step-by-Step:**
1. Login with your email and password (first time)
2. Go to your Dashboard
3. Click "Register Face" button (to be added in dashboard)
4. Allow camera access when prompted
5. Position your face in the frame
6. Wait for green box to appear (face detected)
7. Click "Capture Face" button
8. Your face is now registered!

**What Gets Stored:**
- A 128-dimensional array of numbers (face descriptor)
- This is stored in MongoDB User collection under `faceDescriptor` field
- The actual image is NOT stored (only mathematical representation)

### 2. Face Login (After Registration)
Once your face is registered, you can login without password:

**Step-by-Step:**
1. Go to Login page
2. Enter your email
3. Click "Login with Face Verification" button
4. Allow camera access
5. Look at the camera
6. Wait for verification
7. If match → Logged in!

**How Verification Works:**
- Captures your current face → generates new descriptor
- Compares with stored descriptor using Euclidean distance
- If distance < 0.6 → Match! (Login successful)
- If distance >= 0.6 → No match (Try again or use password)

## Where Is Face Data Stored?

### Database: MongoDB Atlas
**Collection:** `users`
**Fields:**
```javascript
{
  faceDescriptor: [0.123, -0.456, 0.789, ...], // Array of 128 numbers
  faceVerificationEnabled: true,  // Boolean flag
  // ... other user fields
}
```

### Data Security:
- ✅ Face descriptor is encrypted in MongoDB
- ✅ NOT shared across users
- ✅ Cannot be reverse-engineered into an image
- ✅ Only accessible via authenticated API calls

## Technical Details

### Face Recognition Algorithm:
- **Library:** @vladmandic/face-api (based on TensorFlow.js)
- **Models Used:**
  - TinyFaceDetector (fast face detection)
  - FaceLandmark68Net (facial landmarks)
  - FaceRecognitionNet (generates 128-D descriptors)

### Comparison Method:
```javascript
// Euclidean distance formula
distance = sqrt(sum((descriptor1[i] - descriptor2[i])^2))

// Match threshold
if (distance < 0.6) {
  // MATCH - same person
} else {
  // NO MATCH - different person
}
```

### API Endpoints:

#### Register Face
```
POST /api/v1/auth/register-face
Authorization: Bearer <token>
Body: {
  "faceDescriptor": [128 numbers array]
}
```

#### Login with Face
```
POST /api/v1/auth/face-login
Body: {
  "email": "user@example.com",
  "faceDescriptor": [128 numbers array]
}
```

## Current Implementation Status

### ✅ Completed:
- [x] Backend face verification system
- [x] Face capture component (React)
- [x] Face login for ASHA workers
- [x] Face descriptor storage in MongoDB
- [x] Face comparison algorithm

### 🚧 To Add:
- [ ] Face registration button in Dashboard
- [ ] Face login for Patients
- [ ] Face login for Doctors
- [ ] Update face option (re-register)
- [ ] Face verification success/failure analytics

## Usage Instructions

### For ASHA Workers:
1. **First Login:** Use password → asha@test.com / password123
2. **Register Face:** (Dashboard feature coming soon - use API directly for now)
3. **Next Login:** Use face verification button

### For Patients:
- Face verification components are installed
- Feature will be enabled after adding to Login.jsx

## Troubleshooting

### "Face verification not set up for this account"
**Solution:** You need to register your face first
- Login with password
- Register face via dashboard (or API endpoint)
- Then try face login

### "Face verification failed"
**Possible Causes:**
- Poor lighting
- Face not centered
- Wearing glasses/hat (remove if possible)
- Face angle different from registration
**Solution:** Try again with better conditions or use password login

### Camera not working
- Check browser permissions
- Allow camera access when prompted
- Works best in: Chrome, Edge, Firefox (latest versions)

## For Developers

### Add Face Registration to Dashboard:
```jsx
import FaceCapture from '../components/FaceCapture';
import { authService } from '../services/api';

// In your component:
const handleFaceCapture = async (faceDescriptor) => {
  try {
    await authService.registerFace(faceDescriptor);
    toast.success('Face registered successfully!');
  } catch (error) {
    toast.error('Face registration failed');
  }
};

// Render:
{showFaceSetup && (
  <FaceCapture 
    onFaceCapture={handleFaceCapture} 
    mode="register" 
  />
)}
```

### Testing Locally:
```bash
# Test face registration
curl -X POST https://sehatmitra-backend.vercel.app/api/v1/auth/register-face \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"faceDescriptor": [array of 128 numbers]}'

# Check if face is registered
# Login and check user object for faceVerificationEnabled: true
```

## Security Best Practices

1. **HTTPS Only:** Face data transmitted over encrypted connection
2. **Token Auth:** Requires valid JWT token for face registration
3. **Rate Limiting:** Prevent brute-force face matching attempts
4. **No Image Storage:** Only mathematical descriptor stored
5. **User Consent:** Camera access requires explicit permission

## Privacy Policy Note

Users should be informed:
- Face descriptor is mathematical representation (not photo)
- Stored securely in encrypted database
- Used only for authentication
- Can be deleted by deleting account
- Not shared with third parties

---

## Quick Start Checklist

- [ ] 1. Login with password
- [ ] 2. Click "Register Face" (or use API)
- [ ] 3. Capture face with good lighting
- [ ] 4. Verify registration successful
- [ ] 5. Logout
- [ ] 6. Try "Login with Face Verification"
- [ ] 7. Success! 🎉

---

**Last Updated:** January 23, 2026  
**Version:** 1.0  
**Contact:** For issues, check console logs (F12) for detailed error messages
