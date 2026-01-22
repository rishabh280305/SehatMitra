# Voice Calling Feature - Setup & Deployment Guide

## Overview
Production-ready WebRTC voice calling system with:
- Real-time voice communication
- Only doctors can initiate calls
- Patients & ASHA workers can receive calls
- Automatic call transcription
- Complete call history with transcripts
- Socket.IO signaling for WebRTC

## Architecture

### Backend
- **WebRTC Signaling**: Socket.IO for real-time peer communication
- **Call Management**: REST API for call history and transcripts
- **Storage**: MongoDB for call sessions and transcripts
- **STUN/TURN**: Uses public STUN servers (Google, stunprotocol.org)

### Frontend
- **Doctor**: Can initiate calls via consultation page
- **Patient/ASHA**: Receives incoming call notifications
- **WebRTC**: Browser-native voice communication
- **Speech Recognition**: Automatic transcription (Chrome/Edge)

## Installation

### 1. Backend Setup

```bash
cd backend
npm install uuid  # Install new dependency
npm install       # Reinstall all dependencies
```

### 2. Frontend Setup

**Doctor App:**
```bash
cd frontend/doctor-app
npm install socket.io-client
npm install
```

**Patient App:**
```bash
cd frontend/patient-app
npm install socket.io-client
npm install
```

## Configuration for Production

### 1. Environment Variables (.env)

Add to `backend/.env`:
```env
# Existing variables...

# For production deployment
ALLOWED_ORIGINS=https://doctor.sehatmitra.com,https://patient.sehatmitra.com,https://asha.sehatmitra.com
```

### 2. Update API URLs for Production

**Doctor App** (`frontend/doctor-app/src/components/VoiceCall.jsx` & `CallHistory.jsx`):
```javascript
// Change from:
const API_BASE_URL = 'http://localhost:5000/api/v1';
const SOCKET_URL = 'http://localhost:5000';

// To:
const API_BASE_URL = 'https://api.sehatmitra.com/api/v1';
const SOCKET_URL = 'https://api.sehatmitra.com';
```

**Patient App** (`frontend/patient-app/src/components/IncomingCall.jsx` & `CallHistory.jsx`):
```javascript
// Same changes as doctor app
const API_BASE_URL = 'https://api.sehatmitra.com/api/v1';
const SOCKET_URL = 'https://api.sehatmitra.com';
```

### 3. Production TURN Servers (Optional but Recommended)

For NAT traversal in production, consider using:

**Free Options:**
- Twilio STUN/TURN: https://www.twilio.com/stun-turn
- Xirsys: https://xirsys.com (Free tier available)

**Self-hosted:**
- coturn: https://github.com/coturn/coturn

Update in `VoiceCall.jsx` and `IncomingCall.jsx`:
```javascript
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add TURN servers for production
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'your-username',
      credential: 'your-password'
    }
  ]
};
```

## Deployment

### Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)

**Backend:**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Clone and setup
git clone <your-repo>
cd backend
npm install
cp .env.example .env
# Edit .env with production values

# Start with PM2
pm2 start server.js --name "sehatmitra-api"
pm2 save
pm2 startup
```

**Nginx Configuration** (`/etc/nginx/sites-available/sehatmitra`):
```nginx
# Backend API + WebSocket
server {
    listen 80;
    server_name api.sehatmitra.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket specific
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}

# Frontend Apps
server {
    listen 80;
    server_name doctor.sehatmitra.com;
    root /var/www/doctor-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name patient.sehatmitra.com;
    root /var/www/patient-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**SSL with Certbot:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.sehatmitra.com -d doctor.sehatmitra.com -d patient.sehatmitra.com
```

### Option 2: Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
    restart: unless-stopped

  doctor-app:
    build: ./frontend/doctor-app
    ports:
      - "3002:80"
    depends_on:
      - api

  patient-app:
    build: ./frontend/patient-app
    ports:
      - "3000:80"
    depends_on:
      - api
```

### Option 3: Cloud Platforms

**Heroku:**
```bash
# Backend
cd backend
heroku create sehatmitra-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=<your-mongodb-uri>
git push heroku main
```

**Vercel/Netlify (Frontend):**
```bash
# Build settings
Build Command: npm run build
Output Directory: dist
```

## Testing the Feature

### Local Testing

1. **Start Backend:**
```bash
cd backend
npm run dev
```

2. **Start Doctor App:**
```bash
cd frontend/doctor-app
npm run dev
# Opens on http://localhost:3002
```

3. **Start Patient App:**
```bash
cd frontend/patient-app
npm run dev
# Opens on http://localhost:3000
```

4. **Test Flow:**
   - Login as doctor (3002)
   - Login as patient (3000)
   - Doctor: Navigate to any consultation → Click "Start Voice Call"
   - Patient: Should see incoming call notification
   - Patient: Accept call
   - Both parties can speak and hear each other
   - Transcripts are auto-generated (Chrome/Edge only)
   - End call from either side
   - View call history and transcripts

### Production Testing

1. **Check WebSocket Connection:**
   - Open browser console
   - Should see "Socket connected" message

2. **Test Microphone Permissions:**
   - Browser will prompt for microphone access
   - Grant permissions for both caller and receiver

3. **Verify STUN/TURN:**
   - Check console for ICE candidate gathering
   - Should see "connected" state in WebRTC

4. **Test Transcription:**
   - Speak clearly during call
   - Check call history for transcript segments

## Browser Compatibility

| Browser | Voice Call | Transcription |
|---------|-----------|---------------|
| Chrome  | ✅ Full    | ✅ Full       |
| Edge    | ✅ Full    | ✅ Full       |
| Firefox | ✅ Full    | ❌ No         |
| Safari  | ✅ Full    | ❌ No         |

**Note:** Transcription requires Chrome or Edge. Other browsers will have voice calls but no automatic transcription.

## Troubleshooting

### "Socket.io not initialized" Error
- Ensure backend server is running
- Check CORS settings in backend
- Verify Socket.IO is properly imported

### "Failed to get user media"
- Check browser microphone permissions
- Ensure HTTPS in production (required for getUserMedia)
- Test microphone in browser settings

### No Voice Connection
- Check STUN server accessibility
- Consider adding TURN servers for production
- Verify firewall rules allow WebRTC ports

### Transcription Not Working
- Only works in Chrome/Edge
- Requires HTTPS in production
- Check browser language settings

### Call History Not Showing
- Verify JWT token is valid
- Check MongoDB connection
- Ensure call status is being updated

## API Endpoints

### Calls

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/calls/initiate` | Initiate a call (doctor only) |
| PUT | `/api/v1/calls/:callId/status` | Update call status |
| POST | `/api/v1/calls/:callId/transcript` | Add transcript segment |
| GET | `/api/v1/calls/history` | Get call history |
| GET | `/api/v1/calls/:callId` | Get call details with transcript |

## Database Schema

**CallSession Model:**
```javascript
{
  callId: String (UUID),
  caller: {
    user: ObjectId,
    userType: 'doctor',
    name: String
  },
  receiver: {
    user: ObjectId,
    userType: 'patient' | 'asha_worker',
    name: String
  },
  patient: ObjectId,
  consultation: ObjectId,
  status: 'ringing' | 'ongoing' | 'completed' | 'missed' | 'rejected',
  startTime: Date,
  endTime: Date,
  duration: Number (seconds),
  transcript: String,
  transcriptSegments: [{
    speaker: 'caller' | 'receiver',
    text: String,
    timestamp: Date
  }]
}
```

## Security Considerations

1. **Authentication**: All Socket.IO connections require valid JWT
2. **Authorization**: Only doctors can initiate calls
3. **Call Access**: Users can only view their own call history
4. **Transcripts**: Stored securely with call access restrictions
5. **WebRTC**: Uses DTLS-SRTP for encrypted media streams

## Performance Optimization

1. **Call History Pagination**: Limit 50 calls per request
2. **Transcript Storage**: Segments stored for efficient loading
3. **Socket.IO Rooms**: Users join personal rooms for targeted events
4. **ICE Candidate Caching**: Faster subsequent connections

## Future Enhancements

- [ ] Video calling support
- [ ] Call recording (audio files)
- [ ] Group calls
- [ ] Screen sharing for doctors
- [ ] Real-time waveform visualization
- [ ] Call quality metrics
- [ ] Advanced transcription with AI (speaker diarization)
- [ ] Multi-language transcription
- [ ] Call analytics dashboard

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all dependencies are installed
3. Ensure environment variables are set
4. Test with different browsers
5. Check MongoDB connection

## License

Part of SehatMitra Healthcare Platform
