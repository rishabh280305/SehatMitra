const ChatHistory = require('../models/ChatHistory');
const aiService = require('../services/ai.service');

// @desc    Chat with AI assistant (with history)
// @route   POST /api/v1/ai/chat
// @access  Private
exports.chatWithAI = async (req, res, next) => {
  try {
    const { message, chatId } = req.body;
    const files = req.files || [];

    if (!message && files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message or files are required'
      });
    }

    let chatHistory;

    // Get or create chat history
    if (chatId) {
      chatHistory = await ChatHistory.findOne({ _id: chatId, patient: req.user._id });
      if (!chatHistory) {
        return res.status(404).json({
          success: false,
          message: 'Chat history not found'
        });
      }
    } else {
      // Create new chat history
      chatHistory = new ChatHistory({
        patient: req.user._id,
        messages: []
      });
    }

    // Add user message to history
    const userMessage = {
      role: 'user',
      content: message || 'Please analyze the attached medical image(s).',
      files: files.map(f => ({
        filename: f.originalname,
        mimetype: f.mimetype,
        size: f.size
      })),
      timestamp: new Date()
    };
    chatHistory.messages.push(userMessage);

    // Prepare conversation history for AI (last 10 messages for context)
    const recentMessages = chatHistory.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Call AI chatbot service with files and conversation history
    const response = await aiService.chatbotResponse(
      message || 'Please analyze the attached medical image(s).',
      {
        conversationHistory: recentMessages,
        hasAttachments: files.length > 0
      },
      files
    );

    // Add assistant response to history
    const assistantMessage = {
      role: 'assistant',
      content: response.response,
      timestamp: new Date()
    };
    chatHistory.messages.push(assistantMessage);

    // Generate title if it's the first message
    if (chatHistory.messages.length === 2) {
      chatHistory.generateTitle();
    }

    await chatHistory.save();

    res.status(200).json({
      success: true,
      response: response.response,
      suggestions: response.suggestions,
      filesProcessed: files.length,
      chatId: chatHistory._id
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error communicating with AI'
    });
  }
};

// @desc    Get all chat histories for current user
// @route   GET /api/v1/ai/chats
// @access  Private
exports.getChatHistories = async (req, res, next) => {
  try {
    const chats = await ChatHistory.find({ 
      patient: req.user._id,
      isActive: true 
    })
    .select('title lastMessageAt messages')
    .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      chats: chats.map(chat => ({
        _id: chat._id,
        title: chat.title,
        lastMessageAt: chat.lastMessageAt,
        messageCount: chat.messages.length,
        preview: chat.messages[chat.messages.length - 1]?.content.substring(0, 100) || ''
      }))
    });
  } catch (error) {
    console.error('Get Chat Histories Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching chat histories'
    });
  }
};

// @desc    Get specific chat history
// @route   GET /api/v1/ai/chats/:chatId
// @access  Private
exports.getChatHistory = async (req, res, next) => {
  try {
    const chat = await ChatHistory.findOne({
      _id: req.params.chatId,
      patient: req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat history not found'
      });
    }

    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    console.error('Get Chat History Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching chat history'
    });
  }
};

// @desc    Delete chat history
// @route   DELETE /api/v1/ai/chats/:chatId
// @access  Private
exports.deleteChatHistory = async (req, res, next) => {
  try {
    const chat = await ChatHistory.findOne({
      _id: req.params.chatId,
      patient: req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat history not found'
      });
    }

    chat.isActive = false;
    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Chat history deleted'
    });
  } catch (error) {
    console.error('Delete Chat History Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting chat history'
    });
  }
};

// @desc    Analyze symptoms with AI
// @route   POST /api/v1/ai/analyze-symptoms
// @access  Private
exports.analyzeSymptoms = async (req, res, next) => {
  try {
    const patientData = req.body;

    const analysis = await aiService.analyzeSymptomsForDiagnosis(patientData);

    res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Symptom Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error analyzing symptoms'
    });
  }
};

// @desc    Analyze medical report with AI (for doctors)
// @route   POST /api/v1/ai/analyze-report
// @access  Private (Doctor only)
exports.analyzeReport = async (req, res, next) => {
  try {
    const { reportData } = req.body;

    if (!reportData) {
      return res.status(400).json({
        success: false,
        message: 'Report data is required'
      });
    }

    // Generate AI summary for the report
    const summary = await aiService.analyzeReportForDoctor(reportData);

    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Report Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error analyzing report'
    });
  }
};

// @desc    Generate patient summary with AI (for doctors during consultation)
// @route   POST /api/v1/ai/patient-summary
// @access  Private (Doctor only)
exports.generatePatientSummary = async (req, res, next) => {
  try {
    const { patientData } = req.body;

    if (!patientData) {
      return res.status(400).json({
        success: false,
        message: 'Patient data is required'
      });
    }

    // Generate comprehensive patient summary
    const summary = await aiService.generatePatientSummary(patientData);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Patient Summary Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating patient summary'
    });
  }
};

module.exports = exports;
