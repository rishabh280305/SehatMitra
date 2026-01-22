const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  files: [{
    filename: String,
    mimetype: String,
    size: Number
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatHistorySchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'AI Consultation'
  },
  messages: [messageSchema],
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update lastMessageAt whenever messages are added
chatHistorySchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].timestamp;
  }
  next();
});

// Auto-generate title from first user message
chatHistorySchema.methods.generateTitle = function() {
  const firstUserMessage = this.messages.find(m => m.role === 'user');
  if (firstUserMessage) {
    const content = firstUserMessage.content.substring(0, 50);
    this.title = content + (content.length >= 50 ? '...' : '');
  }
};

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
