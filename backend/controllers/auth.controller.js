const User = require('../models/User');
const { generateToken, sendTokenResponse } = require('../middleware/auth');
const { compareFaces, isValidDescriptor } = require('../utils/faceVerification');

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    console.log('===== REGISTRATION REQUEST =====');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const {
      fullName,
      email,
      phone,
      password,
      role,
      dateOfBirth,
      gender,
      location,
      ashaWorkerDetails,
      doctorDetails,
      faceDescriptor,
      faceVerificationEnabled
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: fullName, email, phone, password, role'
      });
    }

    // Validate face descriptor if provided
    if (faceDescriptor && !isValidDescriptor(faceDescriptor)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid face descriptor. Must be array of 128 numbers.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Phone number already registered'
      });
    }

    console.log('Creating user with role:', role);
    if (faceDescriptor) {
      console.log('Face verification will be enabled during registration');
    }
    
    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role,
      dateOfBirth,
      gender,
      location,
      ashaWorkerDetails: role === 'asha_worker' ? ashaWorkerDetails : undefined,
      doctorDetails: role === 'doctor' ? doctorDetails : undefined,
      faceDescriptor: faceDescriptor || undefined,
      faceVerificationEnabled: faceDescriptor ? true : false
    });

    console.log('User created successfully:', user._id);
    
    sendTokenResponse(user, 201, res, 'User registered successfully');
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    // Validate email/phone and password
    if ((!email && !phone) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/phone and password'
      });
    }

    // Find user by email or phone
    const query = email ? { email } : { phone };
    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/v1/auth/updatedetails
 * @access  Private
 */
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      location: req.body.location,
      avatar: req.body.avatar
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Details updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/v1/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / clear cookie
 * @route   GET /api/v1/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update FCM token for push notifications
 * @route   PUT /api/v1/auth/fcm-token
 * @access  Private
 */
exports.updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fcmToken },
      { new: true, runValidators: false }
    );

    res.status(200).json({
      success: true,
      message: 'FCM token updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login with face verification
 * @route   POST /api/v1/auth/face-login
 * @access  Public
 */
exports.faceLogin = async (req, res, next) => {
  try {
    const { email, faceDescriptor } = req.body;

    // Validate input
    if (!email || !faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: 'Email and face descriptor are required'
      });
    }

    // Validate face descriptor format
    if (!isValidDescriptor(faceDescriptor)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid face descriptor format'
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+faceDescriptor');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has face verification enabled
    if (!user.faceVerificationEnabled || !user.faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: 'Face verification not set up for this account. Please register your face first.'
      });
    }

    // Compare faces
    const comparisonResult = compareFaces(faceDescriptor, user.faceDescriptor);

    if (!comparisonResult.isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Face verification failed. Please try again or use password login.',
        debug: {
          confidence: comparisonResult.confidence,
          distance: comparisonResult.distance
        }
      });
    }

    console.log(`Face verification successful for ${email} (confidence: ${comparisonResult.confidence}%)`);

    sendTokenResponse(user, 200, res, 'Face login successful');
  } catch (error) {
    console.error('Face login error:', error);
    next(error);
  }
};

/**
 * @desc    Register face for existing user
 * @route   POST /api/v1/auth/register-face
 * @access  Private
 */
exports.registerFace = async (req, res, next) => {
  try {
    const { faceDescriptor } = req.body;

    if (!faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: 'Face descriptor is required'
      });
    }

    // Validate face descriptor format
    if (!isValidDescriptor(faceDescriptor)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid face descriptor format. Must be array of 128 numbers.'
      });
    }

    // Update user with face descriptor
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        faceDescriptor,
        faceVerificationEnabled: true
      },
      { new: true, runValidators: false }
    );

    res.status(200).json({
      success: true,
      message: 'Face registered successfully. You can now login with face verification.',
      data: {
        faceVerificationEnabled: user.faceVerificationEnabled
      }
    });
  } catch (error) {
    console.error('Face registration error:', error);
    next(error);
  }
};
