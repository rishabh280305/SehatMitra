import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ConsultationHistory.css';

function ConsultationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConsultationHistory();
  }, []);

  const fetchConsultationHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/v1/consultations/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Consultation history:', response.data);

      // Group messages by doctor
      const messagesData = response.data.data || [];
      const groupedByDoctor = {};

      messagesData.forEach(msg => {
        const doctorId = msg.doctor?._id || 'general';
        const doctorName = msg.doctor?.fullName || msg.senderName || 'General Consultation';
        
        if (!groupedByDoctor[doctorId]) {
          groupedByDoctor[doctorId] = {
            doctorId,
            doctorName,
            doctor: msg.doctor,
            messages: [],
            lastMessage: null,
            unreadCount: 0
          };
        }

        groupedByDoctor[doctorId].messages.push(msg);
        
        if (!groupedByDoctor[doctorId].lastMessage || 
            new Date(msg.createdAt) > new Date(groupedByDoctor[doctorId].lastMessage.createdAt)) {
          groupedByDoctor[doctorId].lastMessage = msg;
        }

        if (!msg.read && msg.sender === 'doctor') {
          groupedByDoctor[doctorId].unreadCount++;
        }
      });

      const historyArray = Object.values(groupedByDoctor).sort((a, b) => 
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      );

      setHistory(historyArray);
    } catch (error) {
      console.error('Error fetching consultation history:', error);
      alert('Failed to load consultation history');
    } finally {
      setLoading(false);
    }
  };

  const continueConsultation = (consultation) => {
    navigate('/consultation', { 
      state: { 
        selectedDoctor: consultation.doctor ? {
          id: consultation.doctor._id,
          name: consultation.doctor.fullName,
          specialization: consultation.doctor.doctorDetails?.specialization
        } : null
      } 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="consultation-history">
      <div className="page-header">
        <h1>Consultation History</h1>
        <p>View and continue your past consultations</p>
      </div>

      {loading ? (
        <div className="loading">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="no-history">
          <p>No consultation history yet</p>
          <button onClick={() => navigate('/select-doctor')}>
            Start a Consultation
          </button>
        </div>
      ) : (
        <div className="history-list">
          {history.map((consultation) => (
            <div key={consultation.doctorId} className="history-card">
              <div className="card-header">
                <div className="doctor-info">
                  <h3>{consultation.doctorName}</h3>
                  {consultation.doctor?.doctorDetails?.specialization && (
                    <span className="specialization">
                      {consultation.doctor.doctorDetails.specialization}
                    </span>
                  )}
                </div>
                {consultation.unreadCount > 0 && (
                  <span className="unread-badge">{consultation.unreadCount} new</span>
                )}
              </div>

              <div className="card-body">
                <p className="last-message">
                  <strong>{consultation.lastMessage.senderName}:</strong> {consultation.lastMessage.content}
                </p>
                <p className="message-time">{formatDate(consultation.lastMessage.createdAt)}</p>
                <p className="message-count">
                  Total messages: {consultation.messages.length}
                </p>
              </div>

              <button 
                className="continue-btn" 
                onClick={() => continueConsultation(consultation)}
              >
                Continue Consultation
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConsultationHistory;
