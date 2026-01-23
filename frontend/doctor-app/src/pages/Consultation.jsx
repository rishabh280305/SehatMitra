import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiX, FiUser, FiActivity, FiFileText, FiSave, FiZap, FiPhone, FiVideo, 
  FiInfo, FiMessageSquare, FiSend, FiSearch, FiPlus, FiGift, FiLogOut,
  FiHome, FiList, FiCalendar, FiClock, FiBarChart2
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCall } from '../contexts/CallContext';
import VoiceCall from '../components/VoiceCall';
import API_BASE_URL from '../config';
import './Consultation.css';

function Consultation({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient;
  const isUserPatient = location.state?.isUserPatient;
  const { initiateCall } = useCall();

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
  const [currentPage, setCurrentPage] = useState('consultation');
  
  // Essential Medicines state
  const [freeMedicines, setFreeMedicines] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showMedicinePanel, setShowMedicinePanel] = useState(false);

  useEffect(() => {
    if (isUserPatient) {
      fetchMessages();
    }
  }, [isUserPatient]);

  // Fetch free medicine suggestions when symptoms/diagnosis changes
  useEffect(() => {
    if (patient?.symptoms || diagnosis) {
      fetchFreeMedicineSuggestions();
    }
  }, [patient?.symptoms, diagnosis]);

  const fetchFreeMedicineSuggestions = async () => {
    try {
      setLoadingMedicines(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/medicines/suggest`,
        {
          symptoms: patient?.symptoms || '',
          diagnosis: diagnosis
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setFreeMedicines(response.data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching medicine suggestions:', error);
    } finally {
      setLoadingMedicines(false);
    }
  };

  const searchMedicines = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(
        `${API_BASE_URL}/medicines/search?query=${searchTerm}`
      );
      if (response.data.success) {
        setSearchResults(response.data.medicines || []);
      }
    } catch (error) {
      console.error('Error searching medicines:', error);
    }
  };

  const addMedicineToPrescription = (medicine) => {
    const medicineText = `${medicine.name} ${medicine.strength} (${medicine.form}) - ${medicine.dosage} [FREE at SHC]`;
    setPrescription(prev => prev ? `${prev}\n${medicineText}` : medicineText);
    toast.success(`Added ${medicine.name} to prescription`);
  };

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
      
      // For message-based consultations, extract chief complaint from messages
      let chiefComplaint = patient.symptoms || '';
      if (!chiefComplaint && messages.length > 0) {
        // Get first patient message as chief complaint
        const firstPatientMessage = messages.find(m => m.senderType === 'patient');
        if (firstPatientMessage) {
          chiefComplaint = firstPatientMessage.content;
        }
      }
      
      // If still no chief complaint, check if there's a diagnosis field
      if (!chiefComplaint && diagnosis) {
        chiefComplaint = diagnosis;
      }
      
      // If still nothing, show error
      if (!chiefComplaint) {
        toast.error('No chief complaint found. Please review patient messages or enter diagnosis first.');
        setLoadingAI(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/ai/patient-summary`,
        {
          patientData: {
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            symptoms: chiefComplaint,
            vitalSigns: patient.vitalSigns,
            notes: patient.notes || notes,
            medicalHistory: patient.medicalHistory || 'Not provided',
            recentMessages: messages.slice(0, 5).map(m => ({
              sender: m.senderType,
              message: m.content,
              timestamp: m.createdAt
            }))
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
    <div className="consultation-container">
      {/* Green Sidebar */}
      <aside className="consultation-sidebar">
        <div className="sidebar-header">
          <h1>SehatMitra</h1>
          <p className="subtitle">Doctor Portal</p>
        </div>

        <div className="doctor-profile">
          <div className="doctor-avatar">
            {user?.fullName?.charAt(0) || 'D'}
          </div>
          <div className="doctor-info">
            <h3>{user?.fullName || 'Doctor'}</h3>
            <p>Medical Professional</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div 
            className="nav-link"
            onClick={() => navigate('/dashboard')}
          >
            <FiHome />
            <span>Dashboard</span>
          </div>
          <div 
            className="nav-link"
            onClick={() => navigate('/queue')}
          >
            <FiList />
            <span>Patient Queue</span>
          </div>
          <div 
            className={`nav-link ${currentPage === 'consultation' ? 'active' : ''}`}
            onClick={() => setCurrentPage('consultation')}
          >
            <FiActivity />
            <span>Active Consultation</span>
          </div>
          <div 
            className="nav-link"
            onClick={() => navigate('/scheduled-calls')}
          >
            <FiCalendar />
            <span>Scheduled Calls</span>
          </div>
          <div 
            className="nav-link"
            onClick={() => navigate('/call-history')}
          >
            <FiClock />
            <span>Call History</span>
          </div>
          <div 
            className="nav-link"
            onClick={() => navigate('/reports')}
          >
            <FiFileText />
            <span>Patient Reports</span>
          </div>
          <div 
            className="nav-link"
            onClick={() => navigate('/ai-analysis')}
          >
            <FiBarChart2 />
            <span>AI Analysis</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout || (() => navigate('/login'))}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="consultation-main">
        <header className="consultation-header">
          <div className="consultation-title">
            <h2>Patient Consultation</h2>
            <p>Complete diagnosis and treatment plan</p>
          </div>
          <div className="header-actions">
            {isUserPatient && (
              <button className="btn btn-messages" onClick={() => setShowMessages(!showMessages)}>
                <FiMessageSquare />
                {showMessages ? 'Hide Messages' : 'View Messages'}
              </button>
            )}
            <button 
              className="btn btn-voice" 
              onClick={() => initiateCall(
                patient._id || patient.id, 
                patient.name,
                'voice',
                patient.language || 'en'
              )}
            >
              <FiPhone />
              Voice Call
            </button>
            <button 
              className="btn btn-video" 
              onClick={() => initiateCall(
                patient._id || patient.id, 
                patient.name,
                'video',
                patient.language || 'en'
              )}
            >
              <FiVideo />
              Video Call
            </button>
            <button className="btn btn-close" onClick={() => navigate('/queue')}>
              <FiX />
            </button>
          </div>
        </header>

        <div className="consultation-content">
          {/* Patient Info Card */}
          <div className="patient-info-card">
            <h3>
              <FiUser />
              Patient Information
            </h3>
            <div className="patient-details-grid">
              <div className="detail-item">
                <span className="detail-label">Name</span>
                <span className="detail-value">{patient?.name || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Age</span>
                <span className="detail-value">{patient?.age ? `${patient.age} years` : 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{patient?.gender || 'N/A'}</span>
              </div>
            </div>
            {patient?.symptoms && (
              <div style={{ marginTop: '1rem' }}>
                <div className="detail-item">
                  <span className="detail-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                    <FiActivity style={{ marginRight: '0.5rem' }} />
                    Chief Complaint
                  </span>
                  <span className="detail-value">{patient.symptoms}</span>
                </div>
              </div>
            )}
          </div>

          {/* Messages Panel (if user patient) */}
          {isUserPatient && showMessages && (
            <div className="consultation-form">
              <div className="section-header">
                <h3>
                  <FiMessageSquare />
                  Messages
                </h3>
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
                  className="form-textarea"
                />
                <button onClick={sendMessage} className="action-btn action-btn-primary">
                  <FiSend /> Send
                </button>
              </div>
            </div>
          )}

          {/* Consultation Form */}
          <form onSubmit={handleSubmit} className="consultation-form">
            <div className="form-section">
              <div className="section-header">
                <h3>
                  <FiActivity />
                  Chief Complaint
                </h3>
                <button 
                  type="button"
                  className="ai-analyze-btn"
                  onClick={getAISummary}
                  disabled={loadingAI}
                >
                  <FiZap />
                  {loadingAI ? 'Analyzing...' : 'Get AI Analysis'}
                </button>
              </div>

              {/* AI Analysis Results Card */}
              {aiSummary && (
                <div className="ai-results-card">
                  <div className="ai-results-header">
                    <FiZap className="ai-icon" />
                    <h4>AI Analysis Results</h4>
                  </div>

                  {aiSummary.possibleDiagnoses && aiSummary.possibleDiagnoses.length > 0 && (
                    <div className="ai-section">
                      <h5>🔍 Possible Diagnoses:</h5>
                      <ul className="ai-list">
                        {aiSummary.possibleDiagnoses.map((diagnosis, idx) => (
                          <li key={idx}>
                            {diagnosis}
                            <button
                              type="button"
                              onClick={() => applyAISuggestion('diagnosis', diagnosis)}
                              className="apply-suggestion-btn"
                            >
                              Apply
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiSummary.suggestedTreatment && (
                    <div className="ai-section">
                      <h5>💊 Suggested Treatment:</h5>
                      <p className="ai-text">{aiSummary.suggestedTreatment}</p>
                      <button
                        type="button"
                        onClick={() => applyAISuggestion('prescription', aiSummary.suggestedTreatment)}
                        className="apply-suggestion-btn"
                      >
                        Apply to Prescription
                      </button>
                    </div>
                  )}

                  {aiSummary.recommendedTests && aiSummary.recommendedTests.length > 0 && (
                    <div className="ai-section">
                      <h5>🧪 Recommended Tests:</h5>
                      <ul className="ai-list">
                        {aiSummary.recommendedTests.map((test, idx) => (
                          <li key={idx}>{test}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiSummary.redFlags && aiSummary.redFlags.length > 0 && (
                    <div className="ai-section ai-section-warning">
                      <h5>⚠️ Red Flags / Warning Signs:</h5>
                      <ul className="ai-list">
                        {aiSummary.redFlags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiSummary.suggestedDiagnosis && (
                    <div className="ai-section">
                      <h5>📋 Primary Diagnosis:</h5>
                      <p className="ai-text">{aiSummary.suggestedDiagnosis}</p>
                      <button
                        type="button"
                        onClick={() => applyAISuggestion('diagnosis', aiSummary.suggestedDiagnosis)}
                        className="apply-suggestion-btn"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {aiSummary.suggestedPrescription && (
                    <div className="ai-section">
                      <h5>💊 Suggested Prescription:</h5>
                      <p className="ai-text">{aiSummary.suggestedPrescription}</p>
                      <button
                        type="button"
                        onClick={() => applyAISuggestion('prescription', aiSummary.suggestedPrescription)}
                        className="apply-suggestion-btn"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label>
                  Diagnosis <span className="required">*</span>
                </label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter your diagnosis..."
                  className="form-textarea"
                  required
                  rows={4}
                />
              </div>

              {aiSummary && aiSummary.suggestedDiagnosis && (
                <div className="ai-suggestion">
                  <div className="ai-suggestion-header">
                    <FiZap style={{ color: '#10b981' }} />
                    <span>AI Suggested Diagnosis</span>
                    <button
                      type="button"
                      onClick={() => applyAISuggestion('diagnosis', aiSummary.suggestedDiagnosis)}
                      className="apply-btn"
                    >
                      Apply
                    </button>
                  </div>
                  <p>{aiSummary.suggestedDiagnosis}</p>
                </div>
              )}
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3>Prescription</h3>
                <button 
                  type="button"
                  className="show-medicines-btn"
                  onClick={() => setShowMedicinePanel(!showMedicinePanel)}
                >
                  <FiGift />
                  {showMedicinePanel ? 'Hide' : 'Show'} Free Medicines
                </button>
              </div>

              {showMedicinePanel && (
                <div className="medicines-panel">
                  <div className="search-box">
                    <FiSearch />
                    <input
                      type="text"
                      placeholder="Search medicines..."
                      value={medicineSearch}
                      onChange={(e) => {
                        setMedicineSearch(e.target.value);
                        searchMedicines(e.target.value);
                      }}
                      className="form-input"
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <div className="medicine-results">
                      {searchResults.map((med) => (
                        <div key={med._id} className="medicine-item">
                          <div>
                            <strong>{med.name}</strong> {med.strength}
                            <br />
                            <small>{med.form} â€¢ {med.dosage}</small>
                          </div>
                          <button
                            type="button"
                            onClick={() => addMedicineToPrescription(med)}
                            className="add-medicine-btn"
                          >
                            <FiPlus />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {freeMedicines.length > 0 && !medicineSearch && (
                    <div className="suggested-medicines">
                      <h4>Suggested Free Medicines</h4>
                      {freeMedicines.map((med) => (
                        <div key={med._id} className="medicine-item">
                          <div>
                            <strong>{med.name}</strong> {med.strength}
                            <br />
                            <small>{med.form} â€¢ {med.dosage}</small>
                          </div>
                          <button
                            type="button"
                            onClick={() => addMedicineToPrescription(med)}
                            className="add-medicine-btn"
                          >
                            <FiPlus />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <textarea
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="Enter prescription details (medications, dosage, duration)..."
                  className="form-textarea"
                  rows={5}
                />
              </div>

              {aiSummary && aiSummary.suggestedPrescription && (
                <div className="ai-suggestion">
                  <div className="ai-suggestion-header">
                    <FiZap style={{ color: '#10b981' }} />
                    <span>AI Suggested Prescription</span>
                    <button
                      type="button"
                      onClick={() => applyAISuggestion('prescription', aiSummary.suggestedPrescription)}
                      className="apply-btn"
                    >
                      Apply
                    </button>
                  </div>
                  <p>{aiSummary.suggestedPrescription}</p>
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>Additional Notes</h3>
              <div className="form-group">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional observations or instructions..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Follow-up Date (Optional)</h3>
              <div className="form-group">
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="form-actions">
              <div className="form-actions-left">
                <button
                  type="button"
                  className="btn-followup"
                  onClick={() => setShowFollowUpModal(true)}
                >
                  <FiInfo />
                  Request Follow-up
                </button>
              </div>
              <div className="form-actions-right">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate('/queue')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-complete"
                  disabled={loading}
                >
                  <FiSave />
                  {loading ? 'Saving...' : 'Complete Consultation'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Consultation;
