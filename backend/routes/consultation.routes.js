const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  sendMessage, 
  getMessages,
  createFollowUpRequest,
  getFollowUpRequests,
  respondToFollowUpRequest,
  getScheduledCalls,
  getPendingCalls,
  updateCallStatus,
  getActiveConsultations
} = require('../controllers/consultation.controller');
const { protect } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/consultations/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images, videos, audio, and documents
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mp3|wav|webm|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, videos, audio files, and documents are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
  fileFilter: fileFilter
});

// Messaging routes
router.post('/send-message', protect, upload.array('files', 5), sendMessage);
router.get('/active', protect, getActiveConsultations); // Get all active consultations for doctors
router.get('/messages', protect, getMessages); // For logged-in patients
router.get('/my-requests', protect, getMessages); // Legacy route
router.get('/:patientId/messages', protect, getMessages);

// Follow-up request routes
router.post('/follow-up', protect, createFollowUpRequest);
router.get('/follow-up/:patientId', protect, getFollowUpRequests);
router.put('/follow-up/:requestId/respond', protect, respondToFollowUpRequest);

// Call scheduling routes
router.get('/calls/scheduled', protect, getScheduledCalls);
router.get('/calls/pending/:patientId', protect, getPendingCalls);
router.put('/calls/:callId/status', protect, updateCallStatus);

module.exports = router;
