const express = require('express');
const router = express.Router();
const {
  registerPatient,
  getPatients,
  getPatient,
  updatePatient,
  requestConsultation
} = require('../controllers/patient.controller');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Register new patient & get all patients
router.route('/')
  .post(registerPatient)
  .get(getPatients);

// Get, update single patient
router.route('/:id')
  .get(getPatient)
  .put(updatePatient);

// Request consultation
router.post('/:id/request-consultation', requestConsultation);

module.exports = router;
