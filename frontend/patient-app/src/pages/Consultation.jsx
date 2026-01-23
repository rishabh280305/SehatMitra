import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiLogOut, FiSend, FiPaperclip, FiMic, FiImage, FiFile, FiX, FiUser, FiCalendar, FiActivity, FiAlertCircle, FiClock, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import API_BASE_URL from '../config';
import './Consultation.css';

function Consultation({ user, onLogout }) {
  const location = useLocation();
  const selectedDoctor = location.state?.selectedDoctor || null;
  
  // Form fields
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [symptoms, setSymptoms] = useState([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const addSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const removeSymptom = (symptom) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!chiefComplaint.trim()) {
      toast.error('Please describe your main health concern');
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
      
      // Build comprehensive consultation message
      let consultationReport = `**Chief Complaint:** ${chiefComplaint}\n\n`;
      
      if (duration) {
        consultationReport += `**Duration:** ${duration}\n\n`;
      }
      
      consultationReport += `**Severity:** ${severity}\n\n`;
      
      if (symptoms.length > 0) {
        consultationReport += `**Symptoms:**\n${symptoms.map(s => `• ${s}`).join('\n')}\n\n`;
      }
      
      if (medicalHistory) {
        consultationReport += `**Medical History:** ${medicalHistory}\n\n`;
      }
      
      if (currentMedications) {
        consultationReport += `**Current Medications:** ${currentMedications}\n\n`;
      }
      
      if (allergies) {
        consultationReport += `**Allergies:** ${allergies}\n\n`;
      }
      
      if (additionalNotes) {
        consultationReport += `**Additional Notes:** ${additionalNotes}`;
      }
      
      formData.append('content', consultationReport);
      formData.append('senderType', 'patient');
      formData.append('doctorId', selectedDoctor.id);
      
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

      if (response.data.success) {
        setSubmitted(true);
        toast.success('Consultation request sent to doctor successfully!');
      }
    } catch (error) {
      console.error('Error sending consultation:', error);
      toast.error(error.response?.data?.message || 'Failed to send consultation request');
    } finally {
      setLoading(false);
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
            <FiAlertCircle size={64} />
            <h2>No Doctor Selected</h2>
            <p>Please select a doctor to start your consultation</p>
            <Link to="/select-doctor" className="btn btn-primary">
              Select a Doctor
            </Link>
          </div>
        ) : submitted ? (
          <div className="success-message">
            <FiCheckCircle size={80} />
            <h2>Consultation Request Submitted!</h2>
            <p>Your consultation request has been sent to Dr. {selectedDoctor.name}</p>
            <p className="sub-text">The doctor will review your information and respond shortly.</p>
            <div className="action-buttons">
              <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
              <Link to="/consultation-history" className="btn btn-outline">View History</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="selected-doctor-card">
              <div className="doctor-icon">
                <FiUser size={24} />
              </div>
              <div className="doctor-details">
                <h3>Consulting with: Dr. {selectedDoctor.name}</h3>
                <p>{selectedDoctor.specialization}</p>
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="consultation-form">
              <div className="form-header">
                <h2>Medical Consultation Form</h2>
                <p>Please provide detailed information to help the doctor understand your condition</p>
              </div>

              {/* Chief Complaint */}
              <div className="form-section">
                <h3 className="section-title">
                  <FiActivity /> Primary Health Concern
                </h3>
                <div className="form-group">
                  <label>What is your main health concern? *</label>
                  <textarea
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="Describe your primary symptom or health issue..."
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>How long have you had this issue?</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g., 3 days, 2 weeks, 1 month"
                    />
                  </div>
                  <div className="form-group">
                    <label>Severity Level</label>
                    <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              <div className="form-section">
                <h3 className="section-title">
                  <FiAlertCircle /> Additional Symptoms
                </h3>
                <div className="form-group">
                  <label>List other symptoms you're experiencing</label>
                  <div className="symptom-input">
                    <input
                      type="text"
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                      placeholder="Type symptom and press Enter"
                    />
                    <button type="button" onClick={addSymptom} className="add-btn">
                      Add
                    </button>
                  </div>
                  <div className="symptoms-list">
                    {symptoms.map((symptom, index) => (
                      <span key={index} className="symptom-chip">
                        {symptom}
                        <button type="button" onClick={() => removeSymptom(symptom)}>
                          <FiX />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="form-section">
                <h3 className="section-title">
                  <FiCalendar /> Medical Background
                </h3>
                <div className="form-group">
                  <label>Past Medical History</label>
                  <textarea
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    placeholder="Previous illnesses, surgeries, chronic conditions..."
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Current Medications</label>
                  <textarea
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    placeholder="List any medications you're currently taking..."
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>Known Allergies</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Food, medication, or environmental allergies..."
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="form-section">
                <h3 className="section-title">
                  <FiFile /> Additional Information
                </h3>
                <div className="form-group">
                  <label>Any other details you'd like to share</label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Lifestyle factors, recent travel, family history..."
                    rows="3"
                  />
                </div>
              </div>

              {/* File Attachments */}
              <div className="form-section">
                <h3 className="section-title">
                  <FiPaperclip /> Attachments (Optional)
                </h3>
                <p className="helper-text">Upload medical reports, test results, images, or voice notes</p>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  multiple
                  style={{ display: 'none' }}
                />
                
                <div className="attachment-buttons">
                  <button 
                    type="button"
                    className="attach-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FiPaperclip /> Attach Files
                  </button>

                  <button 
                    type="button"
                    className={`record-btn ${isRecording ? 'recording' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    <FiMic /> {isRecording ? 'Stop Recording' : 'Record Voice Note'}
                  </button>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="attached-files">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <div className="file-icon">
                          {file.type.startsWith('image/') ? <FiImage /> : 
                           file.type.startsWith('audio/') ? <FiMic /> : <FiFile />}
                        </div>
                        <div className="file-info">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeFile(index)} 
                          className="remove-file"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading || !chiefComplaint.trim()}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiSend /> Submit Consultation Request
                    </>
                  )}
                </button>
                <p className="privacy-note">
                  Your information is encrypted and will only be shared with your selected doctor
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Consultation;
