const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById } = require('../controllers/doctor.controller');
const { protect } = require('../middleware/auth');

// Get all doctors
router.get('/', protect, getDoctors);

// Get doctor by ID
router.get('/:id', protect, getDoctorById);

module.exports = router;
