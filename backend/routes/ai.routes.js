const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  chatWithAI, 
  analyzeSymptoms,
  analyzeReport,
  generatePatientSummary,
  getChatHistories, 
  getChatHistory, 
  deleteChatHistory 
} = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  }
});

// All routes are protected
router.use(protect);

// Chat with AI (with optional file uploads)
router.post('/chat', upload.array('files', 5), chatWithAI);

// Get all chat histories
router.get('/chats', getChatHistories);

// Get specific chat history
router.get('/chats/:chatId', getChatHistory);

// Delete chat history
router.delete('/chats/:chatId', deleteChatHistory);

// Analyze symptoms
router.post('/analyze-symptoms', analyzeSymptoms);

// Analyze medical report (for doctors)
router.post('/analyze-report', analyzeReport);

// Generate patient summary (for doctors during consultation)
router.post('/patient-summary', generatePatientSummary);

module.exports = router;
