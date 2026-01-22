import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiX, FiUser, FiActivity, FiFileText, FiSave, FiZap, FiPhone, FiVideo, FiInfo, FiMessageSquare, FiSend } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import VoiceCall from '../components/VoiceCall';
import './Consultation.css';

const API_BASE_URL = 'http://localhost:5000/api/v1';

function Consultation() {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient;
  const isUserPatient = location.state?.isUserPatient;

  const [diagnosis, setDiagnosis] = useState(patient?.diagnosis || '');
  const [prescription, setPrescription] = useState(patient?.prescription || '');
  const [notes, setNotes] = useState(patient?.notes || '');
  const [followUpDate, setFollowUpDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [followUpType, setFollowUpType] = useState('more_info');
  const [followUpDescription, setFollowUpDescription] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    if (isUserPatient) {
      fetchMessages();
    }
  }, [isUserPatient]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/consultations/${patient._id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/consultations/send-message`,
        {
          content: newMessage,
          senderType: 'doctor',
          patientId: patient._id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNewMessage('');
        fetchMessages();
        toast.success('Message sent');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  if (!patient) {
    navigate('/queue');
    return null;
  }

  const getAISummary = async () => {
    setLoadingAI(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/ai/patient-summary`,
        {
          patientData: {
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            symptoms: patient.symptoms,
            vitalSigns: patient.vitalSigns,
            notes: patient.notes,
            medicalHistory: patient.medicalHistory || 'Not provided'
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAiSummary(response.data.data);
        toast.success('AI summary generated!');
      }
    } catch (error) {
      console.error('AI Summary Error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate AI summary');
    } finally {
      setLoadingAI(false);
    }
  };

  const applyAISuggestion = (field, value) => {
    if (field === 'diagnosis') {
      setDiagnosis(value);
      toast.info('Diagnosis applied from AI suggestion');
    } else if (field === 'prescription') {
      setPrescription(value);
      toast.info('Prescription applied from AI suggestion');
    }
  };

  const handleFollowUpRequest = async () => {
    if (!followUpDescription.trim()) {
      toast.error('Please provide a description for the follow-up request');
      return;
    }

    if ((followUpType === 'audio_call' || followUpType === 'video_call') && !scheduledTime) {
      toast.error('Please select a date and time for the call');
      return;
    }

    setLoadingFollowUp(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/consultations/follow-up`,
        {
          consultationId: patient.consultationId || null,
          patientId: patient._id,
          patientModel: isUserPatient ? 'User' : 'Patient',
          requestType: followUpType,
          description: followUpDescription,
          scheduledTime: scheduledTime || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Follow-up request sent successfully!');
        setShowFollowUpModal(false);
        setFollowUpDescription('');
        setScheduledTime('');
      }
    } catch (error) {
      console.error('Follow-up Request Error:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error creating follow-up request');
    } finally {
      setLoadingFollowUp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!diagnosis.trim()) {
      toast.error('Please provide a diagnosis');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/patients/${patient._id}`,
        {
          diagnosis,
          prescription,
          notes,
          followUpDate: followUpDate || null,
          status: 'completed'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Consultation completed successfully!');
        navigate('/queue');
      }
    } catch (error) {
      console.error('Update Patient Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save consultation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consultation-overlay">
      <div className="consultation-modal">
        <div className="modal-header">
          <div>
            <h2>Patient Consultation</h2>
            <p>Complete diagnosis and treatment plan</p>
          </div>
          <div className="header-actions">
            {isUserPatient && (
              <button className="btn-messages" onClick={() => setShowMessages(!showMessages)}>
                <FiMessageSquare />
                {showMessages ? 'Hide Messages' : 'View Messages'}
              </button>
            )}
            <button className="btn-voice-call" onClick={() => setShowVoiceCall(true)}>
              <FiPhone />
              Start Voice Call
            </button>
            <button className="close-btn" onClick={() => navigate('/queue')}>
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="consultation-grid">
            {/* Left Side - Patient Info and Messages */}
            <div className="patient-info-section">
              {isUserPatient && showMessages && (
                <div className="info-card messages-card">
                  <div className="info-header">
                    <FiMessageSquare />
                    <h3>Messages</h3>
                  </div>
                  <div className="messages-list">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`message-item ${msg.sender}`}>
                        <div className="message-sender">{msg.senderName}</div>
                        <div className="message-text">{msg.content}</div>
                        <div className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="message-input">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your response..."
                      rows={2}
                    />
                    <button onClick={sendMessage} className="btn-send">
                      <FiSend /> Send
                    </button>
                  </div>
                </div>
              )}
              
              <div className="info-card">
                <div className="info-header">
                  <FiUser />
                  <h3>Patient Information</h3>
                </div>
                <div className="info-content">
                  <div className="info-row">
                    <span className="label">Name:</span>
                    <span className="value">{patient.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Age:</span>
                    <span className="value">{patient.age} years</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Gender:</span>
                    <span className="value">{patient.gender}</span>
                  </div>
                  {patient.registeredBy && (
                    <div className="info-row">
                      <span className="label">Referred by:</span>
                      <span className="value">{patient.registeredBy.fullName || 'ASHA Worker'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card">
                <div className="info-header">
                  <FiActivity />
                  <h3>Chief Complaint</h3>
                </div>
                <div className="info-content">
                  <p className="complaint-text">{patient.symptoms}</p>
                </div>
              </div>

              {patient.vitalSigns && (patient.vitalSigns.temperature || patient.vitalSigns.bloodPressure) && (
                <div className="info-card">
                  <div className="info-header">
                    <FiActivity />
                    <h3>Vital Signs</h3>
                  </div>
                  <div className="vitals-grid">
                    {patient.vitalSigns.temperature && (
                      <div className="vital-box">
                        <span className="vital-label">Temperature</span>
                        <span className="vital-value">{patient.vitalSigns.temperature}</span>
                      </div>
                    )}
                    {patient.vitalSigns.bloodPressure && (
                      <div className="vital-box">
                        <span className="vital-label">Blood Pressure</span>
                        <span className="vital-value">{patient.vitalSigns.bloodPressure}</span>
                      </div>
                    )}
                    {patient.vitalSigns.pulseRate && (
                      <div className="vital-box">
                        <span className="vital-label">Pulse Rate</span>
                        <span className="vital-value">{patient.vitalSigns.pulseRate}</span>
                      </div>
                    )}
                    {patient.vitalSigns.oxygenLevel && (
                      <div className="vital-box">
                        <span className="vital-label">Oxygen Level</span>
                        <span className="vital-value">{patient.vitalSigns.oxygenLevel}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {patient.notes && (
                <div className="info-card">
                  <div className="info-header">
                    <FiFileText />
                    <h3>Additional Notes</h3>
                  </div>
                  <div className="info-content">
                    <p className="notes-text">{patient.notes}</p>
                  </div>
                </div>
              )}

              <button 
                className="btn-ai-summary"
                onClick={getAISummary}
                disabled={loadingAI}
              >
                <FiZap />
                {loadingAI ? 'Generating AI Summary...' : 'Get AI Analysis'}
              </button>

              {aiSummary && (
                <div className="info-card ai-summary-card">
                  <div className="info-header">
                    <FiZap />
                    <h3>AI Analysis</h3>
                  </div>
                  <div className="ai-summary-content">
                    <div className="summary-section">
                      <h4>Patient Overview</h4>
                      <p>{aiSummary.overview}</p>
                    </div>
                    <div className="summary-section">
                      <h4>Possible Diagnosis</h4>
                      <p>{aiSummary.possibleDiagnosis}</p>
                      <button 
                        className="btn-apply-suggestion"
                        onClick={() => applyAISuggestion('diagnosis', aiSummary.possibleDiagnosis)}
                      >
                        Apply to Diagnosis
                      </button>
                    </div>
                    <div className="summary-section">
                      <h4>Treatment Recommendations</h4>
                      <p>{aiSummary.recommendations}</p>
                      <button 
                        className="btn-apply-suggestion"
                        onClick={() => applyAISuggestion('prescription', aiSummary.recommendations)}
                      >
                        Apply to Prescription
                      </button>
                    </div>
                    {aiSummary.urgency && (
                      <div className="summary-section urgency">
                        <h4>Urgency Level</h4>
                        <p className={`urgency-badge ${aiSummary.urgency.toLowerCase()}`}>
                          {aiSummary.urgency}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Consultation Form */}
            <div className="consultation-form-section">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="diagnosis">
                    Diagnosis <span className="required">*</span>
                  </label>
                  <textarea
                    id="diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Enter your diagnosis..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prescription">Prescription</label>
                  <textarea
                    id="prescription"
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    placeholder="Enter prescription details (medications, dosage, duration)..."
                    rows="6"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional observations or instructions..."
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="followUpDate">Follow-up Date (Optional)</label>
                  <input
                    type="date"
                    id="followUpDate"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-follow-up"
                    onClick={() => setShowFollowUpModal(true)}
                  >
                    <FiInfo />
                    Request Follow-up
                  </button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => navigate('/queue')}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={loading}
                  >
                    <FiSave />
                    {loading ? 'Saving...' : 'Complete Consultation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Follow-up Request Modal */}
        {showFollowUpModal && (
          <div className="follow-up-modal-overlay" onClick={() => setShowFollowUpModal(false)}>
            <div className="follow-up-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Request Follow-up</h3>
                <button className="close-btn" onClick={() => setShowFollowUpModal(false)}>
                  <FiX size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Request Type</label>
                  <select 
                    value={followUpType} 
                    onChange={(e) => setFollowUpType(e.target.value)}
                    className="follow-up-select"
                  >
                    <option value="more_info">Request More Information</option>
                    <option value="audio_call">Schedule Audio Call</option>
                    <option value="video_call">Schedule Video Call</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={followUpDescription}
                    onChange={(e) => setFollowUpDescription(e.target.value)}
                    placeholder="Describe what information you need or the purpose of the call..."
                    rows="4"
                    className="follow-up-textarea"
                  />
                </div>

                {(followUpType === 'audio_call' || followUpType === 'video_call') && (
                  <div className="form-group">
                    <label>Scheduled Time</label>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="follow-up-datetime"
                    />
                  </div>
                )}

                <div className="modal-actions">
                  <button 
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowFollowUpModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    className="btn-submit"
                    onClick={handleFollowUpRequest}
                    disabled={loadingFollowUp}
                  >
                    {followUpType === 'audio_call' ? <FiPhone /> : followUpType === 'video_call' ? <FiVideo /> : <FiInfo />}
                    {loadingFollowUp ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voice Call Component */}
        {showVoiceCall && patient && (
          <VoiceCall
            receiverId={patient.registeredBy?._id || patient._id}
            receiverType={patient.registeredBy ? 'asha_worker' : 'patient'}
            receiverName={patient.registeredBy?.fullName || patient.name}
            patientId={patient._id}
            consultationId={patient._id}
            onClose={() => setShowVoiceCall(false)}
          />
        )}
      </div>
    </div>
  );
}

export default Consultation;
