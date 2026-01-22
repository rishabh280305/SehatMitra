const User = require('../models/User');

// Get all doctors
const getDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    
    const query = { role: 'doctor' };
    if (specialization) {
      query['doctorDetails.specialization'] = specialization;
    }

    console.log('Fetching doctors with query:', query);

    const doctors = await User.find(query)
      .select('fullName email phone doctorDetails avatar')
      .sort({ 'doctorDetails.specialization': 1 });

    console.log(`Found ${doctors.length} doctors:`, doctors.map(d => ({
      name: d.fullName, 
      specialization: d.doctorDetails?.specialization,
      email: d.email
    })));

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching doctors', 
      error: error.message 
    });
  }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
      .select('fullName email phone doctorDetails avatar');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor',
      error: error.message
    });
  }
};

module.exports = {
  getDoctors,
  getDoctorById
};
