import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiLogOut, FiSend, FiPaperclip, FiMic, FiImage, FiFile, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import API_BASE_URL from '../config';
import './Consultation.css';

function Consultation({ user, onLogout }) {
  const location = useLocation();
  const selectedDoctor = location.state?.selectedDoctor || null;
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Load previous consultation messages with this doctor
    if (selectedDoctor) {
      fetchConsultationHistory();
    }
  }, [selectedDoctor]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConsultationHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching consultation history for doctor:', selectedDoctor?.id);
      const response = await axios.get(`${API_BASE_URL}/consultations/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        params: selectedDoctor ? { doctorId: selectedDoctor.id } : {}
      });
      console.log('Consultation history response:', response.data);
      if (response.data.success && response.data.data.length > 0) {
        // Filter messages for this specific doctor if doctor is selected
        const filteredMessages = selectedDoctor 
          ? response.data.data.filter(msg => msg.doctor?._id === selectedDoctor.id)
          : response.data.data;
        setMessages(filteredMessages);
      }
    } catch (error) {
      console.error('Error fetching consultation history:', error);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValid = file.size <= 10 * 1024 * 1024; // 10MB limit
      if (!isValid) {
        toast.error(`${file.name} is too large. Max size is 10MB`);
      }
      return isValid;
    });
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
        setSelectedFiles(prev => [...prev, audioFile]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Recording started...');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Voice note recorded');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) {
      toast.error('Please enter a message or attach files');
      return;
    }

    if (!selectedDoctor) {
      toast.error('Please select a doctor first');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('content', inputMessage);
      formData.append('senderType', 'patient');
      formData.append('doctorId', selectedDoctor.id);
      
      console.log('Sending message to doctor:', selectedDoctor.name);
      
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(
        `${API_BASE_URL}/consultations/send-message`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Message sent response:', response.data);

      if (response.data.success) {
        // Add the new message to the UI immediately
        const newMessage = {
          sender: 'patient',
          senderName: user.name,
          content: inputMessage,
          files: response.data.data.files || [],
          timestamp: new Date(),
          messageType: response.data.data.messageType
        };
        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setSelectedFiles([]);
        toast.success('Message sent to doctor');
        
        // Refresh messages to get the saved version from backend
        setTimeout(() => fetchConsultationHistory(), 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="container">
          <h1>SehatMitra</h1>
          <div className="nav-right">
            <Link to="/dashboard" className="btn btn-outline">Back to Dashboard</Link>
            <button onClick={onLogout} className="btn btn-outline">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container consultation-container">
        {!selectedDoctor ? (
          <div className="doctor-selection-prompt">
            <h2>No Doctor Selected</h2>
            <p>Please select a doctor to start your consultation</p>
            <Link to="/select-doctor" className="btn btn-primary">
              Select a Doctor
            </Link>
          </div>
        ) : (
          <>
            <div className="selected-doctor-info">
              <h3>Consulting with: {selectedDoctor.name}</h3>
              <p>{selectedDoctor.specialization}</p>
            </div>

            <div className="consultation-card">
              <div className="consultation-header">
                <h2>Consultation</h2>
                <p>Send your symptoms, reports, images or voice notes</p>
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <p>Start your consultation by sending a message to the doctor</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                  <div className="message-header">
                    <span className="sender-name">{msg.senderName || (msg.sender === 'patient' ? 'You' : 'Doctor')}</span>
                  </div>
                  <div className="message-content">
                    {msg.content && <p>{msg.content}</p>}
                    {msg.files && msg.files.length > 0 && (
                      <div className="message-files">
                        {msg.files.map((file, i) => (
                          <div key={i} className="file-badge">
                            {file.mimetype?.startsWith('image/') || file.type?.startsWith('image/') ? <FiImage /> : 
                             file.mimetype?.startsWith('audio/') || file.type?.startsWith('audio/') ? <FiMic /> : <FiFile />}
                            <span>{file.originalName || file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="message-time">
                    {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-chip">
                  {file.type.startsWith('image/') ? <FiImage /> : 
                   file.type.startsWith('audio/') ? <FiMic /> : <FiFile />}
                  <span>{file.name}</span>
                  <button onClick={() => removeFile(index)}><FiX /></button>
                </div>
              ))}
            </div>
          )}

          <div className="input-area">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              multiple
              style={{ display: 'none' }}
            />
            
            <button 
              className="attach-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Attach files"
            >
              <FiPaperclip />
            </button>

            <button 
              className={`record-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? 'Stop recording' : 'Record voice note'}
            >
              <FiMic />
            </button>

            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message, symptoms, or concerns..."
              rows="1"
            />

            <button 
              className="send-btn"
              onClick={handleSendMessage}
              disabled={loading || (!inputMessage.trim() && selectedFiles.length === 0)}
            >
              <FiSend />
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Consultation;
