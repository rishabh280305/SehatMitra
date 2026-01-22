const Call = require('../models/Call');
const User = require('../models/User');

/**
 * @desc    Initiate a call
 * @route   POST /api/v1/calls/initiate
 * @access  Private
 */
exports.initiateCall = async (req, res, next) => {
  try {
    const { receiverId, callType, offer } = req.body;

    if (!receiverId || !callType) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and call type are required'
      });
    }

    // Get receiver details
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create call session
    const callId = `${req.user.id}-${receiverId}-${Date.now()}`;
    const call = await Call.create({
      callId,
      caller: req.user.id,
      callerName: req.user.fullName,
      receiver: receiverId,
      receiverName: receiver.fullName,
      callType,
      offer,
      status: 'ringing'
    });

    console.log(`📞 Call initiated: ${req.user.fullName} calling ${receiver.fullName} (${callType})`);

    res.status(201).json({
      success: true,
      message: 'Call initiated',
      data: {
        callId: call.callId,
        receiver: {
          id: receiver._id,
          name: receiver.fullName
        },
        callType: call.callType,
        status: call.status
      }
    });
  } catch (error) {
    console.error('Initiate call error:', error);
    next(error);
  }
};

/**
 * @desc    Answer a call
 * @route   POST /api/v1/calls/answer
 * @access  Private
 */
exports.answerCall = async (req, res, next) => {
  try {
    const { callId, answer } = req.body;

    if (!callId) {
      return res.status(400).json({
        success: false,
        message: 'Call ID is required'
      });
    }

    const call = await Call.findOne({ callId });
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Verify user is the receiver
    if (call.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to answer this call'
      });
    }

    call.status = 'active';
    call.answer = answer;
    await call.save();

    console.log(`✅ Call answered: ${callId}`);

    res.status(200).json({
      success: true,
      message: 'Call answered',
      data: {
        callId: call.callId,
        status: call.status,
        answer: call.answer
      }
    });
  } catch (error) {
    console.error('Answer call error:', error);
    next(error);
  }
};

/**
 * @desc    Reject a call
 * @route   POST /api/v1/calls/reject
 * @access  Private
 */
exports.rejectCall = async (req, res, next) => {
  try {
    const { callId } = req.body;

    const call = await Call.findOne({ callId });
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    call.status = 'rejected';
    call.endTime = Date.now();
    await call.save();

    console.log(`❌ Call rejected: ${callId}`);

    res.status(200).json({
      success: true,
      message: 'Call rejected'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    End a call
 * @route   POST /api/v1/calls/end
 * @access  Private
 */
exports.endCall = async (req, res, next) => {
  try {
    const { callId } = req.body;

    const call = await Call.findOne({ callId });
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    call.status = 'ended';
    call.endTime = Date.now();
    await call.save();

    console.log(`📴 Call ended: ${callId}`);

    res.status(200).json({
      success: true,
      message: 'Call ended'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add ICE candidate
 * @route   POST /api/v1/calls/ice-candidate
 * @access  Private
 */
exports.addIceCandidate = async (req, res, next) => {
  try {
    const { callId, candidate } = req.body;

    const call = await Call.findOne({ callId });
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    call.iceCandidates.push({
      from: req.user.id,
      candidate
    });
    await call.save();

    res.status(200).json({
      success: true,
      message: 'ICE candidate added'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pending calls for user (polling endpoint)
 * @route   GET /api/v1/calls/pending
 * @access  Private
 */
exports.getPendingCalls = async (req, res, next) => {
  try {
    // Find calls where user is receiver and status is ringing
    const calls = await Call.find({
      receiver: req.user.id,
      status: 'ringing',
      createdAt: { $gte: new Date(Date.now() - 60000) } // Last 1 minute
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: calls.length,
      data: calls.map(call => ({
        callId: call.callId,
        caller: {
          id: call.caller,
          name: call.callerName
        },
        callType: call.callType,
        offer: call.offer,
        createdAt: call.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get call status (for both parties)
 * @route   GET /api/v1/calls/status/:callId
 * @access  Private
 */
exports.getCallStatus = async (req, res, next) => {
  try {
    const { callId } = req.params;

    const call = await Call.findOne({ callId });
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Only caller or receiver can check status
    if (call.caller.toString() !== req.user.id && call.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Get new ICE candidates for this user
    const userId = req.user.id;
    const otherUserId = call.caller.toString() === userId ? call.receiver.toString() : call.caller.toString();
    const newIceCandidates = call.iceCandidates
      .filter(ice => ice.from === otherUserId)
      .map(ice => ice.candidate);

    res.status(200).json({
      success: true,
      data: {
        callId: call.callId,
        status: call.status,
        answer: call.answer,
        offer: call.offer,
        iceCandidates: newIceCandidates
      }
    });
  } catch (error) {
    next(error);
  }
};
