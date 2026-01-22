import { useState, useEffect } from 'react';
import { FiPhone, FiClock, FiFileText, FiUser, FiCheck, FiX, FiPhoneMissed } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import './CallHistory.css';

const API_BASE_URL = 'http://localhost:5000/api/v1';

function CallHistory() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const fetchCallHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/calls/history?limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCalls(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching call history:', error);
      toast.error('Failed to load call history');
    } finally {
      setLoading(false);
    }
  };

  const viewTranscript = async (call) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/calls/${call.callId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSelectedCall(response.data.data);
        setShowTranscript(true);
      }
    } catch (error) {
      console.error('Error fetching call details:', error);
      toast.error('Failed to load call transcript');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheck className="status-icon completed" />;
      case 'missed':
        return <FiPhoneMissed className="status-icon missed" />;
      case 'rejected':
        return <FiX className="status-icon rejected" />;
      default:
        return <FiPhone className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'missed':
        return 'missed';
      case 'rejected':
        return 'rejected';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="call-history-container">
        <div className="loading">Loading call history...</div>
      </div>
    );
  }

  return (
    <div className="call-history-container">
      <div className="page-header">
        <h1>Call History</h1>
        <p>View all your voice calls and transcripts</p>
      </div>

      {calls.length === 0 ? (
        <div className="empty-state">
          <FiPhone size={64} />
          <h3>No Call History</h3>
          <p>Your call history will appear here</p>
        </div>
      ) : (
        <div className="calls-list">
          {calls.map((call) => {
            const { date, time } = formatDateTime(call.createdAt);
            const user = JSON.parse(localStorage.getItem('user'));
            const isCaller = call.caller.user === user.id;
            const otherParty = isCaller ? call.receiver : call.caller;

            return (
              <div 
                key={call._id} 
                className={`call-item ${getStatusColor(call.status)}`}
              >
                <div className="call-icon-wrapper">
                  {getStatusIcon(call.status)}
                </div>

                <div className="call-details">
                  <div className="call-main-info">
                    <div className="call-participant">
                      <FiUser className="user-icon" />
                      <span className="participant-name">
                        {otherParty.name}
                      </span>
                      <span className="call-direction">
                        ({isCaller ? 'Outgoing' : 'Incoming'})
                      </span>
                    </div>
                    {call.patient && (
                      <div className="patient-info">
                        Patient: {call.patient.name}
                      </div>
                    )}
                  </div>

                  <div className="call-metadata">
                    <span className="call-date">{date} at {time}</span>
                    {call.duration > 0 && (
                      <>
                        <span className="separator">•</span>
                        <span className="call-duration">
                          <FiClock size={14} />
                          {formatDuration(call.duration)}
                        </span>
                      </>
                    )}
                    <span className="separator">•</span>
                    <span className={`call-status ${getStatusColor(call.status)}`}>
                      {call.status}
                    </span>
                  </div>
                </div>

                {call.transcript && call.status === 'completed' && (
                  <button 
                    className="btn-view-transcript"
                    onClick={() => viewTranscript(call)}
                  >
                    <FiFileText />
                    View Transcript
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Transcript Modal */}
      {showTranscript && selectedCall && (
        <div className="transcript-modal-overlay" onClick={() => setShowTranscript(false)}>
          <div className="transcript-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Call Transcript</h3>
                <p className="modal-subtitle">
                  {selectedCall.receiver.name} • {formatDuration(selectedCall.duration)}
                </p>
              </div>
              <button className="close-btn" onClick={() => setShowTranscript(false)}>
                <FiX size={24} />
              </button>
            </div>

            <div className="transcript-content">
              {selectedCall.transcriptSegments && selectedCall.transcriptSegments.length > 0 ? (
                selectedCall.transcriptSegments.map((segment, index) => (
                  <div key={index} className={`transcript-segment ${segment.speaker}`}>
                    <div className="segment-header">
                      <span className="speaker-label">
                        {segment.speaker === 'caller' ? 'You' : selectedCall.receiver.name}
                      </span>
                      <span className="segment-time">
                        {new Date(segment.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="segment-text">{segment.text}</p>
                  </div>
                ))
              ) : selectedCall.transcript ? (
                <div className="transcript-plain">
                  <pre>{selectedCall.transcript}</pre>
                </div>
              ) : (
                <div className="empty-transcript">
                  <FiFileText size={48} />
                  <p>No transcript available for this call</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CallHistory;
