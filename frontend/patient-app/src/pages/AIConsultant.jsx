import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiLogOut, FiSend, FiPaperclip, FiX, FiMessageSquare, FiPlus, FiTrash2 } from 'react-icons/fi';
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
      
      // Create FormData for file upload
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
      
      // Update chatId if it's a new chat
      if (response.data.chatId && !currentChatId) {
        setCurrentChatId(response.data.chatId);
      }
      
      // Reload chat histories to show the new/updated chat
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
    <div style={{ background: '#f5f5f7', minHeight: '100vh' }}>
      <nav style={{ 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
        padding: '1rem 2rem',
        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              background: 'white',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              color: '#10b981',
              fontSize: '1.2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              AI
            </div>
            <div>
              <h1 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: '600' }}>SehatMitra AI</h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>Health Assistant</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setShowSidebar(!showSidebar)} style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiMessageSquare size={16} /> History
            </button>
            <Link to="/dashboard" style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none'
            }}>
              Back
            </Link>
            <button onClick={onLogout} style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'flex', gap: '1.5rem' }}>
        {showSidebar && (
          <div style={{
            width: '320px',
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            maxHeight: 'calc(100vh - 140px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>Chat History</h3>
              <button onClick={startNewChat} style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FiPlus size={14} /> New
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {chatHistories.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>No previous chats</p>
              ) : (
                chatHistories.map(chat => (
                  <div 
                    key={chat._id} 
                    onClick={() => loadChatHistory(chat._id)}
                    style={{
                      padding: '1rem',
                      marginBottom: '0.75rem',
                      background: currentChatId === chat._id ? '#f0fdf4' : '#f9fafb',
                      border: `1px solid ${currentChatId === chat._id ? '#10b981' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#1f2937', flex: 1 }}>{chat.title}</h4>
                      <button 
                        onClick={(e) => deleteChatHistory(chat._id, e)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '0.25rem'
                        }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.preview}</p>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {new Date(chat.lastMessageAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div style={{
          flex: 1,
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 140px)'
        }}>
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '2px solid #f3f4f6' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>AI Health Assistant</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
              Get instant health guidance powered by AI {currentChatId && <span style={{ color: '#10b981' }}>• Conversation saved</span>}
            </p>
          </div>

          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            marginBottom: '1.5rem',
            paddingRight: '0.5rem'
          }}>
            {messages.map((msg, index) => (
              <div key={index} style={{
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  background: msg.role === 'user' 
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : '#f9fafb',
                  color: msg.role === 'user' ? 'white' : '#1f2937',
                  border: msg.role === 'user' ? 'none' : '1px solid #e5e7eb'
                }}>
                  <strong style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    opacity: msg.role === 'user' ? 0.9 : 1,
                    color: msg.role === 'user' ? 'white' : '#10b981'
                  }}>
                    {msg.role === 'user' ? 'You' : 'AI Assistant'}
                  </strong>
                  <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.95rem' }}>{msg.content}</p>
                  {msg.files && msg.files.length > 0 && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {msg.files.map((file, i) => (
                        <span key={i} style={{
                          background: msg.role === 'user' ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          <FiPaperclip size={12} />
                          {typeof file === 'string' ? file : file.filename || file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb'
                }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#10b981' }}>AI Assistant</strong>
                  <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                    Analyzing...
                    <span style={{ display: 'inline-flex', gap: '0.25rem' }}>
                      <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }}></span>
                      <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }}></span>
                      <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {attachedFiles.length > 0 && (
            <div style={{ 
              marginBottom: '1rem',
              padding: '0.75rem',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {attachedFiles.map((file, index) => (
                <div key={index} style={{
                  background: 'white',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <FiPaperclip size={14} color="#10b981" />
                  <span style={{ color: '#1f2937' }}>{file.name}</span>
                  <button onClick={() => removeFile(index)} style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '0.125rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ 
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '10px',
            border: '2px solid #e5e7eb'
          }}>
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" style={{
              width: '40px',
              height: '40px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#10b981',
              transition: 'all 0.2s'
            }}>
              <FiPaperclip size={18} />
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your symptoms or ask a health question..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'white',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
            <button 
              onClick={handleSend} 
              disabled={loading || (!input.trim() && attachedFiles.length === 0)}
              style={{
                background: loading || (!input.trim() && attachedFiles.length === 0)
                  ? '#d1d5db'
                  : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: loading || (!input.trim() && attachedFiles.length === 0) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <FiSend size={16} /> Send
            </button>
          </div>

          <div style={{ 
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: '#fef3c7',
            border: '1px solid #fde047',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: '#92400e',
            textAlign: 'center',
            lineHeight: '1.5'
          }}>
            ⚠️ This is an AI assistant. Always consult a healthcare professional for medical diagnosis and treatment.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default AIConsultant;
