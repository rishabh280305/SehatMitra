const express = require('express');
const router = express.Router();
const { 
  initiateCall, 
  updateCallStatus, 
  addTranscriptSegment,
  getCallHistory,
  getCallDetails
} = require('../controllers/call.controller');
const { protect } = require('../middleware/auth');

// Call management routes
router.post('/initiate', protect, initiateCall);
router.put('/:callId/status', protect, updateCallStatus);
router.post('/:callId/transcript', protect, addTranscriptSegment);
router.get('/history', protect, getCallHistory);
router.get('/:callId', protect, getCallDetails);

module.exports = router;
