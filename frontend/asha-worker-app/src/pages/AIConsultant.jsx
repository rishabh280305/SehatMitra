import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiLogOut, FiSend, FiPaperclip, FiX, FiMessageSquare, FiPlus, FiTrash2, FiHome } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import API_BASE_URL from '../config';
import './AIConsultant.css';

function AIConsultant({ user, onLogout }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Health Assistant. How can I help you today? You can ask me about symptoms, general health advice, or medical questions. You can also upload images of reports, skin conditions, or other medical documents.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatHistories, setChatHistories] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    loadChatHistories();
  }, []);

  const loadChatHistories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/ai/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatHistories(response.data.chats || []);
    } catch (error) {
      console.error('Failed to load chat histories:', error);
    }
  };

  const loadChatHistory = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/ai/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.chat.messages);
      setCurrentChatId(chatId);
      setShowSidebar(false);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      toast.error('Failed to load chat history');
    }
  };

  const startNewChat = () => {
    setMessages([
      { role: 'assistant', content: 'Hello! I am your AI Health Assistant. How can I help you today? You can ask me about symptoms, general health advice, or medical questions. You can also upload images of reports, skin conditions, or other medical documents.' }
    ]);
    setCurrentChatId(null);
    setShowSidebar(false);
  };

  const deleteChatHistory = async (chatId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/ai/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Chat deleted');
      loadChatHistories();
      if (currentChatId === chatId) {
        startNewChat();
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const isValid = isImage || isPDF;
      
      if (!isValid) {
        toast.error(`${file.name} is not a supported file type. Please upload images or PDFs.`);
      }
      return isValid;
    });
    
    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;

    const userMessage = { 
      role: 'user', 
      content: input || '(Attached files)',
      files: attachedFiles.map(f => ({ filename: f.name }))
    };
    setMessages([...messages, userMessage]);
    const currentInput = input;
    const currentFiles = attachedFiles;
    setInput('');
    setAttachedFiles([]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('message', currentInput);
      if (currentChatId) {
        formData.append('chatId', currentChatId);
      }
      currentFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(
        `${API_BASE_URL}/ai/chat`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      const aiResponse = {
        role: 'assistant',
        content: response.data.response || response.data.message
      };
      setMessages(prev => [...prev, aiResponse]);
      
      if (response.data.chatId && !currentChatId) {
        setCurrentChatId(response.data.chatId);
      }
      
      loadChatHistories();
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or consult with a healthcare professional.'
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error(error.response?.data?.message || 'Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="container">
          <h1>SehatMitra AI</h1>
          <div className="nav-right">
            <button onClick={() => setShowSidebar(!showSidebar)} className="btn btn-outline">
              <FiMessageSquare /> Chat History
            </button>
            <Link to="/dashboard" className="btn btn-outline">
              <FiHome /> Dashboard
            </Link>
            <button onClick={onLogout} className="btn btn-outline">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: '2rem', maxWidth: '1200px', display: 'flex', gap: '1rem' }}>
        {showSidebar && (
          <div className="chat-sidebar card">
            <div className="sidebar-header">
              <h3>Previous Chats</h3>
              <button onClick={startNewChat} className="btn btn-sm btn-primary">
                <FiPlus /> New Chat
              </button>
            </div>
            <div className="chat-list">
              {chatHistories.length === 0 ? (
                <p className="no-chats">No previous chats</p>
              ) : (
                chatHistories.map(chat => (
                  <div 
                    key={chat._id} 
                    className={`chat-item ${currentChatId === chat._id ? 'active' : ''}`}
                    onClick={() => loadChatHistory(chat._id)}
                  >
                    <div className="chat-item-header">
                      <h4>{chat.title}</h4>
                      <button 
                        onClick={(e) => deleteChatHistory(chat._id, e)}
                        className="delete-btn"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    <p className="chat-preview">{chat.preview}</p>
                    <span className="chat-date">
                      {new Date(chat.lastMessageAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="chat-container card" style={{ flex: 1 }}>
          <div className="chat-header">
            <h2>AI Health Assistant</h2>
            <p>Get instant health guidance powered by AI {currentChatId && '• Conversation saved'}</p>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <div className="message-content">
                  <strong>{msg.role === 'user' ? 'You' : 'AI Assistant'}</strong>
                  <p>{msg.content}</p>
                  {msg.files && msg.files.length > 0 && (
                    <div className="message-files">
                      {msg.files.map((file, i) => (
                        <span key={i} className="file-badge">
                          {typeof file === 'string' ? file : file.filename || file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-content">
                  <strong>AI Assistant</strong>
                  <p>Analyzing... <div className="typing-indicator"><span></span><span></span><span></span></div></p>
                </div>
              </div>
            )}
          </div>

          {attachedFiles.length > 0 && (
            <div className="attached-files">
              {attachedFiles.map((file, index) => (
                <div key={index} className="file-chip">
                  <FiPaperclip size={14} />
                  <span>{file.name}</span>
                  <button onClick={() => removeFile(index)} className="remove-file">
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="chat-input">
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="file-upload-btn">
              <FiPaperclip />
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe symptoms or ask a health question..."
              disabled={loading}
            />
            <button 
              onClick={handleSend} 
              className="btn btn-primary"
              disabled={loading || (!input.trim() && attachedFiles.length === 0)}
            >
              <FiSend /> Send
            </button>
          </div>

          <div className="chat-disclaimer">
            <small>This is an AI assistant. Always consult a healthcare professional for medical diagnosis and treatment.</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIConsultant;
