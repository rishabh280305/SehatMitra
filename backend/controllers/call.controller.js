const CallSession = require('../models/CallSession');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { v4: uuidv4 } = require('uuid');

// Initiate a call
const initiateCall = async (req, res) => {
  try {
    const { receiverId, receiverType, patientId, consultationId } = req.body;
    
    if (!receiverId || !receiverType) {
      return res.status(400).json({ message: 'Receiver ID and type are required' });
    }

    // Only doctors can initiate calls
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can initiate calls' });
    }

    const caller = await User.findById(req.user.id);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const callId = uuidv4();

    const callSession = await CallSession.create({
      callId,
      caller: {
        user: req.user.id,
        userType: 'doctor',
        name: caller.fullName
      },
      receiver: {
        user: receiverId,
        userType: receiverType,
        name: receiver.fullName
      },
      patient: patientId || null,
      consultation: consultationId || null,
      status: 'ringing'
    });

    res.status(201).json({
      success: true,
      message: 'Call initiated',
      data: callSession
    });
  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({ message: 'Error initiating call', error: error.message });
  }
};

// Update call status
const updateCallStatus = async (req, res) => {
  try {
    const { callId } = req.params;
    const { status, startTime, endTime, duration } = req.body;

    const callSession = await CallSession.findOne({ callId });

    if (!callSession) {
      return res.status(404).json({ message: 'Call session not found' });
    }

    callSession.status = status;
    
    if (startTime) callSession.startTime = startTime;
    if (endTime) callSession.endTime = endTime;
    if (duration) callSession.duration = duration;

    await callSession.save();

    res.status(200).json({
      success: true,
      message: 'Call status updated',
      data: callSession
    });
  } catch (error) {
    console.error('Error updating call status:', error);
    res.status(500).json({ message: 'Error updating call status', error: error.message });
  }
};

// Add transcript segment
const addTranscriptSegment = async (req, res) => {
  try {
    const { callId } = req.params;
    const { speaker, text, timestamp } = req.body;

    const callSession = await CallSession.findOne({ callId });

    if (!callSession) {
      return res.status(404).json({ message: 'Call session not found' });
    }

    callSession.transcriptSegments.push({
      speaker,
      text,
      timestamp: timestamp || new Date()
    });

    // Update full transcript
    callSession.transcript = callSession.transcriptSegments
      .map(seg => `[${seg.speaker}]: ${seg.text}`)
      .join('\n');

    await callSession.save();

    res.status(200).json({
      success: true,
      message: 'Transcript segment added',
      data: callSession
    });
  } catch (error) {
    console.error('Error adding transcript:', error);
    res.status(500).json({ message: 'Error adding transcript', error: error.message });
  }
};

// Get call history for a user
const getCallHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, skip = 0 } = req.query;

    const calls = await CallSession.find({
      $or: [
        { 'caller.user': userId },
        { 'receiver.user': userId }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('patient', 'name age gender')
      .populate('consultation');

    res.status(200).json({
      success: true,
      data: calls
    });
  } catch (error) {
    console.error('Error fetching call history:', error);
    res.status(500).json({ message: 'Error fetching call history', error: error.message });
  }
};

// Get call details with transcript
const getCallDetails = async (req, res) => {
  try {
    const { callId } = req.params;

    const call = await CallSession.findOne({ callId })
      .populate('caller.user', 'fullName email phone')
      .populate('receiver.user', 'fullName email phone')
      .populate('patient', 'name age gender')
      .populate('consultation');

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    // Check if user has access to this call
    const userId = req.user.id;
    if (call.caller.user._id.toString() !== userId && call.receiver.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({
      success: true,
      data: call
    });
  } catch (error) {
    console.error('Error fetching call details:', error);
    res.status(500).json({ message: 'Error fetching call details', error: error.message });
  }
};

module.exports = {
  initiateCall,
  updateCallStatus,
  addTranscriptSegment,
  getCallHistory,
  getCallDetails
};
