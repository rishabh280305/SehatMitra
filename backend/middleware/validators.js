const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation result checker middleware
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * User Registration Validation
 */
exports.registerValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['patient', 'asha_worker', 'doctor']).withMessage('Invalid role'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender'),
  
  // Allow nested objects for role-specific details
  body('doctorDetails').optional(),
  body('ashaWorkerDetails').optional(),
  body('location').optional(),
  
  exports.validate
];

/**
 * Login Validation
 */
exports.loginValidation = [
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required'),
  
  exports.validate
];

/**
 * Appointment Creation Validation
 */
exports.createAppointmentValidation = [
  body('patientId')
    .notEmpty().withMessage('Patient ID is required')
    .isMongoId().withMessage('Invalid patient ID'),
  
  body('doctorId')
    .notEmpty().withMessage('Doctor ID is required')
    .isMongoId().withMessage('Invalid doctor ID'),
  
  body('appointmentDate')
    .notEmpty().withMessage('Appointment date is required')
    .isISO8601().withMessage('Invalid date format'),
  
  body('appointmentTime')
    .notEmpty().withMessage('Appointment time is required'),
  
  body('chiefComplaints')
    .trim()
    .notEmpty().withMessage('Chief complaints are required')
    .isLength({ max: 1000 }).withMessage('Chief complaints too long'),
  
  body('consultationType')
    .optional()
    .isIn(['video', 'audio', 'chat', 'in_person']).withMessage('Invalid consultation type'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  
  exports.validate
];

/**
 * Prescription Creation Validation
 */
exports.createPrescriptionValidation = [
  body('appointmentId')
    .notEmpty().withMessage('Appointment ID is required')
    .isMongoId().withMessage('Invalid appointment ID'),
  
  body('diagnosis.primary')
    .trim()
    .notEmpty().withMessage('Primary diagnosis is required'),
  
  body('medications')
    .isArray({ min: 1 }).withMessage('At least one medication is required'),
  
  body('medications.*.name')
    .trim()
    .notEmpty().withMessage('Medication name is required'),
  
  body('medications.*.dosage')
    .trim()
    .notEmpty().withMessage('Medication dosage is required'),
  
  body('medications.*.frequency')
    .trim()
    .notEmpty().withMessage('Medication frequency is required'),
  
  body('medications.*.duration.value')
    .isInt({ min: 1 }).withMessage('Duration value must be a positive integer'),
  
  body('medications.*.duration.unit')
    .isIn(['days', 'weeks', 'months']).withMessage('Invalid duration unit'),
  
  exports.validate
];

/**
 * Medical Report Upload Validation
 */
exports.uploadReportValidation = [
  body('patientId')
    .notEmpty().withMessage('Patient ID is required')
    .isMongoId().withMessage('Invalid patient ID'),
  
  body('reportType')
    .notEmpty().withMessage('Report type is required')
    .isIn([
      'blood_test', 'urine_test', 'x_ray', 'ct_scan', 'mri', 
      'ultrasound', 'ecg', 'echo', 'biopsy', 'pathology', 
      'radiology', 'prescription', 'discharge_summary', 
      'vaccination_record', 'medical_image', 'other'
    ]).withMessage('Invalid report type'),
  
  body('reportName')
    .trim()
    .notEmpty().withMessage('Report name is required'),
  
  body('reportDate')
    .notEmpty().withMessage('Report date is required')
    .isISO8601().withMessage('Invalid date format'),
  
  exports.validate
];

/**
 * Inventory Item Validation
 */
exports.inventoryValidation = [
  body('supplyShopId')
    .notEmpty().withMessage('Supply shop ID is required')
    .isMongoId().withMessage('Invalid supply shop ID'),
  
  body('productName')
    .trim()
    .notEmpty().withMessage('Product name is required'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn([
      'medicine', 'surgical_supplies', 'diagnostic_tools', 'first_aid',
      'contraceptives', 'vitamins_supplements', 'maternal_health',
      'child_health', 'equipment', 'consumables', 'other'
    ]).withMessage('Invalid category'),
  
  body('currentStock')
    .isInt({ min: 0 }).withMessage('Current stock must be a non-negative integer'),
  
  body('reorderLevel')
    .isInt({ min: 0 }).withMessage('Reorder level must be a non-negative integer'),
  
  body('price.cost')
    .isFloat({ min: 0 }).withMessage('Cost price must be a non-negative number'),
  
  body('price.selling')
    .isFloat({ min: 0 }).withMessage('Selling price must be a non-negative number'),
  
  exports.validate
];

/**
 * MongoDB ID Validation
 */
exports.mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  exports.validate
];

/**
 * Query Parameter Validation
 */
exports.paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  exports.validate
];
