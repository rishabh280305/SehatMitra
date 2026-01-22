const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout,
  updateFcmToken,
  faceLogin,
  registerFace
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validators');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/face-login', faceLogin);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);
router.get('/logout', logout);
router.put('/fcm-token', updateFcmToken);
router.post('/register-face', registerFace);

module.exports = router;
