const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  initiateCall,
  answerCall,
  rejectCall,
  endCall,
  getPendingCalls,
  addIceCandidate,
  getCallStatus
} = require('../controllers/call.controller');

// All routes require authentication
router.use(protect);

// Call management
router.post('/initiate', initiateCall);
router.post('/answer', answerCall);
router.post('/reject', rejectCall);
router.post('/end', endCall);
router.post('/ice-candidate', addIceCandidate);

// Polling endpoints
router.get('/pending', getPendingCalls);
router.get('/status/:callId', getCallStatus);

module.exports = router;
