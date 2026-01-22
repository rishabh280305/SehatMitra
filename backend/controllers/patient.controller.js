const Patient = require('../models/Patient');

// @desc    Register new patient
// @route   POST /api/v1/patients
// @access  Private (ASHA Worker)
exports.registerPatient = async (req, res, next) => {
  try {
    const { name, age, gender, symptoms, vitalSigns, notes } = req.body;

    // Create patient
    const patient = await Patient.create({
      name,
      age,
      gender,
      contactNumber: req.body.contactNumber || '',
      address: req.body.address || '',
      symptoms,
      vitalSigns,
      notes,
      registeredBy: req.user._id,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: patient,
      message: 'Patient registered successfully'
    });
  } catch (error) {
    console.error('Patient Registration Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering patient'
    });
  }
};

// @desc    Get all patients
// @route   GET /api/v1/patients
// @access  Private
exports.getPatients = async (req, res, next) => {
  try {
    const query = {};

    // Filter by registered by (for ASHA workers)
    if (req.user.role === 'asha_worker') {
      query.registeredBy = req.user._id;
    }

    // For doctors, only show patients with consultation requested
    if (req.user.role === 'doctor') {
      query.consultationRequested = true;
    }

    const patients = await Patient.find(query)
      .populate('registeredBy', 'fullName email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Get Patients Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching patients'
    });
  }
};

// @desc    Get single patient
// @route   GET /api/v1/patients/:id
// @access  Private
exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('registeredBy', 'fullName email');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get Patient Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching patient'
    });
  }
};

// @desc    Update patient
// @route   PUT /api/v1/patients/:id
// @access  Private
exports.updatePatient = async (req, res, next) => {
  try {
    let patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: patient,
      message: 'Patient updated successfully'
    });
  } catch (error) {
    console.error('Update Patient Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating patient'
    });
  }
};

// @desc    Request consultation for patient
// @route   POST /api/v1/patients/:id/request-consultation
// @access  Private (ASHA Worker)
exports.requestConsultation = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if patient was registered by this ASHA worker
    if (patient.registeredBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to request consultation for this patient'
      });
    }

    // Update consultation request
    patient.consultationRequested = true;
    patient.consultationRequestedAt = Date.now();
    patient.status = 'pending';
    await patient.save();

    res.status(200).json({
      success: true,
      data: patient,
      message: 'Consultation request sent to doctor'
    });
  } catch (error) {
    console.error('Request Consultation Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error requesting consultation'
    });
  }
};

module.exports = exports;
