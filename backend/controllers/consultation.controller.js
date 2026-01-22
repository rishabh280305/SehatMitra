const ConsultationMessage = require('../models/ConsultationMessage');
const Patient = require('../models/Patient');
const User = require('../models/User');
const FollowUpRequest = require('../models/FollowUpRequest');
const CallSchedule = require('../models/CallSchedule');
const Consultation = require('../models/Consultation');

// Send a message in consultation
const sendMessage = async (req, res) => {
  try {
    console.log('sendMessage called:', { body: req.body, user: req.user });
    const { content, senderType, doctorId } = req.body;
    // For patients who are logged-in users, use req.user.id
    // For patients registered by ASHA workers, use req.body.patientId
    let patientId;
    if (senderType === 'patient' && req.user.role === 'patient') {
      // Logged-in patient - use their user ID as the patient reference
      patientId = req.user.id;
      console.log('Logged-in patient, using user ID:', patientId);
    } else {
      // Doctor/ASHA sending on behalf of a registered patient
      patientId = req.body.patientId || req.user.patientId;
      console.log('Other sender type, patientId:', patientId);
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Get sender name
    let senderName;
    if (senderType === 'patient') {
      if (req.user.role === 'patient') {
        // Logged-in patient user
        senderName = req.user.name || 'Patient';
      } else {
        // Registered patient by ASHA
        const patient = await Patient.findById(patientId);
        senderName = patient?.name || 'Patient';
      }
    } else if (senderType === 'doctor') {
      const doctor = await User.findById(req.user.id);
      senderName = doctor?.name || 'Doctor';
    } else {
      const asha = await User.findById(req.user.id);
      senderName = asha?.name || 'ASHA Worker';
    }

    // Handle file uploads
    const files = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        files.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }

    // Determine message type
    let messageType = 'text';
    if (files.length > 0) {
      const hasAudio = files.some(f => f.mimetype.startsWith('audio/'));
      const hasOther = files.some(f => !f.mimetype.startsWith('audio/'));
      
      if (hasAudio && !hasOther) {
        messageType = 'voice';
      } else if (hasOther && !hasAudio) {
        messageType = 'file';
      } else {
        messageType = 'mixed';
      }
    }

    // Determine patient model type
    const patientModel = (senderType === 'patient' && req.user.role === 'patient') ? 'User' : 'Patient';
    
    console.log('Creating message with:', { patientId, patientModel, doctorId, sender: senderType, senderName });

    const messageData = {
      patient: patientId,
      patientModel,
      sender: senderType,
      senderName,
      content,
      files,
      messageType
    };

    // Add doctor reference if provided
    if (doctorId) {
      messageData.doctor = doctorId;
    }

    const message = await ConsultationMessage.create(messageData);

    console.log('Message created successfully:', message._id);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Get messages for a patient
const getMessages = async (req, res) => {
  try {
    let patientId;
    let query = {};
    
    if (req.user.role === 'patient') {
      // Logged-in patient user
      patientId = req.user.id;
      query.patient = patientId;
      query.patientModel = 'User';
      
      // Filter by doctor if doctorId is provided
      if (req.query.doctorId) {
        query.doctor = req.query.doctorId;
      }
    } else {
      // Doctor/ASHA accessing patient's messages
      patientId = req.params.patientId || req.user.patientId;
      query.patient = patientId;
    }
    
    const messages = await ConsultationMessage.find(query)
      .populate('doctor', 'fullName doctorDetails')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

// Create follow-up request
const createFollowUpRequest = async (req, res) => {
  try {
    console.log('Creating follow-up request with data:', req.body);
    const { consultationId, patientId, patientModel, requestType, description, scheduledTime } = req.body;
    
    if (!['more_info', 'audio_call', 'video_call'].includes(requestType)) {
      return res.status(400).json({ message: 'Invalid request type' });
    }

    let consultation = null;
    let finalPatientId = patientId;

    // Try to find consultation if ID provided
    if (consultationId) {
      consultation = await Consultation.findById(consultationId);
      if (consultation) {
        finalPatientId = consultation.patient;
      }
    }

    // If no consultation or patient ID, return error
    if (!finalPatientId) {
      console.error('Missing patient ID');
      return res.status(400).json({ message: 'Patient ID or Consultation ID required' });
    }

    console.log('Creating follow-up request for patient:', finalPatientId);

    const followUpRequest = await FollowUpRequest.create({
      consultation: consultationId || null,
      patient: finalPatientId,
      patientModel: patientModel || 'Patient',
      doctor: req.user.id,
      requestType,
      description
    });

    console.log('Follow-up request created:', followUpRequest._id);

    // If it's a call request, create a call schedule
    if (requestType === 'audio_call' || requestType === 'video_call') {
      if (!scheduledTime) {
        return res.status(400).json({ message: 'Scheduled time is required for call requests' });
      }

      await CallSchedule.create({
        consultation: consultationId || null,
        followUpRequest: followUpRequest._id,
        patient: finalPatientId,
        patientModel: patientModel || 'Patient',
        doctor: req.user.id,
        callType: requestType === 'audio_call' ? 'audio' : 'video',
        scheduledTime,
        acceptedBy: [{
          user: req.user.id,
          userType: 'doctor',
          acceptedAt: new Date()
        }]
      });
    }

    res.status(201).json({
      success: true,
      message: 'Follow-up request created successfully',
      data: followUpRequest
    });
  } catch (error) {
    console.error('Error creating follow-up request:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Error creating follow-up request', 
      error: error.message 
    });
  }
};

// Get follow-up requests for a patient
const getFollowUpRequests = async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user.patientId;
    
    const requests = await FollowUpRequest.find({ patient: patientId })
      .populate('doctor', 'name specialization')
      .populate('consultation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching follow-up requests:', error);
    res.status(500).json({ message: 'Error fetching follow-up requests', error: error.message });
  }
};

// Respond to follow-up request
const respondToFollowUpRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const followUpRequest = await FollowUpRequest.findById(requestId);
    if (!followUpRequest) {
      return res.status(404).json({ message: 'Follow-up request not found' });
    }

    followUpRequest.status = status;
    followUpRequest.respondedAt = new Date();
    await followUpRequest.save();

    // If accepted and it's a call, update call schedule
    if (status === 'accepted' && (followUpRequest.requestType === 'audio_call' || followUpRequest.requestType === 'video_call')) {
      const callSchedule = await CallSchedule.findOne({ followUpRequest: requestId });
      if (callSchedule) {
        callSchedule.acceptedBy.push({
          user: req.user.id,
          userType: req.user.role,
          acceptedAt: new Date()
        });
        
        // If both parties accepted, mark as accepted and generate call link
        if (callSchedule.acceptedBy.length >= 2) {
          callSchedule.status = 'accepted';
          // Generate Jitsi Meet link with unique room ID
          const roomName = `SehatMitra-${callSchedule._id}`;
          callSchedule.callLink = `https://meet.jit.si/${roomName}`;
        }
        
        await callSchedule.save();
      }
    } else if (status === 'rejected') {
      // If rejected, cancel the call schedule
      await CallSchedule.findOneAndUpdate(
        { followUpRequest: requestId },
        { status: 'cancelled' }
      );
    }

    res.status(200).json({
      success: true,
      message: `Follow-up request ${status}`,
      data: followUpRequest
    });
  } catch (error) {
    console.error('Error responding to follow-up request:', error);
    res.status(500).json({ message: 'Error responding to follow-up request', error: error.message });
  }
};

// Get scheduled calls for doctor
const getScheduledCalls = async (req, res) => {
  try {
    const calls = await CallSchedule.find({ 
      doctor: req.user.id,
      status: { $in: ['pending', 'accepted'] }
    })
      .populate('patient', 'name phone age gender')
      .populate('consultation')
      .sort({ scheduledTime: 1 });

    res.status(200).json({
      success: true,
      data: calls
    });
  } catch (error) {
    console.error('Error fetching scheduled calls:', error);
    res.status(500).json({ message: 'Error fetching scheduled calls', error: error.message });
  }
};

// Get pending calls for patient/ASHA
const getPendingCalls = async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user.patientId;
    
    const calls = await CallSchedule.find({ 
      patient: patientId,
      status: { $in: ['pending', 'accepted'] }
    })
      .populate('doctor', 'name specialization')
      .populate('consultation')
      .sort({ scheduledTime: 1 });

    res.status(200).json({
      success: true,
      data: calls
    });
  } catch (error) {
    console.error('Error fetching pending calls:', error);
    res.status(500).json({ message: 'Error fetching pending calls', error: error.message });
  }
};

// Update call status
const updateCallStatus = async (req, res) => {
  try {
    const { callId } = req.params;
    const { status, notes } = req.body;

    if (!['completed', 'missed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const call = await CallSchedule.findByIdAndUpdate(
      callId,
      { status, notes },
      { new: true }
    );

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Call status updated',
      data: call
    });
  } catch (error) {
    console.error('Error updating call status:', error);
    res.status(500).json({ message: 'Error updating call status', error: error.message });
  }
};

// Get all active consultations for doctors (patients who have sent messages)
const getActiveConsultations = async (req, res) => {
  try {
    console.log('getActiveConsultations called by doctor:', req.user.id);
    
    // Get all unique patients who have sent messages to THIS doctor
    const consultations = await ConsultationMessage.aggregate([
      {
        $match: {
          doctor: req.user._id || req.user.id
        }
      },
      {
        $group: {
          _id: { patient: '$patient', patientModel: '$patientModel' },
          lastMessage: { $last: '$content' },
          lastMessageTime: { $last: '$createdAt' },
          unreadCount: {
            $sum: { $cond: [{ $and: [{ $eq: ['$sender', 'patient'] }, { $eq: ['$read', false] }] }, 1, 0] }
          },
          messageCount: { $sum: 1 }
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    console.log('Found consultations:', consultations.length);

    // Populate patient details
    const populatedConsultations = await Promise.all(
      consultations.map(async (consult) => {
        let patientData;
        if (consult._id.patientModel === 'User') {
          patientData = await require('../models/User').findById(consult._id.patient).select('name email phone');
          return {
            patient: {
              _id: patientData._id,
              name: patientData.name,
              contactNumber: patientData.phone,
              isUserPatient: true
            },
            lastMessage: consult.lastMessage,
            lastMessageTime: consult.lastMessageTime,
            unreadCount: consult.unreadCount,
            messageCount: consult.messageCount
          };
        } else {
          patientData = await require('../models/Patient').findById(consult._id.patient);
          return {
            patient: {
              _id: patientData._id,
              name: patientData.name,
              age: patientData.age,
              gender: patientData.gender,
              symptoms: patientData.symptoms,
              contactNumber: patientData.contactNumber,
              isUserPatient: false
            },
            lastMessage: consult.lastMessage,
            lastMessageTime: consult.lastMessageTime,
            unreadCount: consult.unreadCount,
            messageCount: consult.messageCount
          };
        }
      })
    );

    console.log('Populated consultations:', populatedConsultations.length);

    res.status(200).json({
      success: true,
      data: populatedConsultations
    });
  } catch (error) {
    console.error('Error fetching active consultations:', error);
    res.status(500).json({ message: 'Error fetching active consultations', error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  createFollowUpRequest,
  getFollowUpRequests,
  respondToFollowUpRequest,
  getScheduledCalls,
  getPendingCalls,
  updateCallStatus,
  getActiveConsultations
};
