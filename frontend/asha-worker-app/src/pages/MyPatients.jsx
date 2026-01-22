import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiHome, FiUser, FiCalendar, FiActivity, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import './MyPatients.css';

const API_BASE_URL = 'http://localhost:5000/api/v1';

function MyPatients({ user, onLogout }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || 'all';
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(filterParam);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    // Update filter when URL parameter changes
    setFilterStatus(filterParam);
  }, [filterParam]);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch patients');
      console.error('Fetch patients error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToDoctor = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/patients/${patientId}/request-consultation`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Consultation request sent to doctor successfully!');
        fetchPatients(); // Refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending consultation request');
      console.error('Request consultation error:', error);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.symptoms.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'in_consultation': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'referred': return '#8b5cf6';
      default: return '#718096';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <FiHome /> Dashboard
        </button>
        <div>
          <h1>My Patients</h1>
          <p>View and manage patients you have registered</p>
        </div>
      </div>

      <div className="controls-bar">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name or symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button 
            className={filterStatus === 'all' ? 'active' : ''} 
            onClick={() => setFilterStatus('all')}
          >
            All ({patients.length})
          </button>
          <button 
            className={filterStatus === 'pending' ? 'active' : ''} 
            onClick={() => setFilterStatus('pending')}
          >
            Pending ({patients.filter(p => p.status === 'pending').length})
          </button>
          <button 
            className={filterStatus === 'in_consultation' ? 'active' : ''} 
            onClick={() => setFilterStatus('in_consultation')}
          >
            In Consultation ({patients.filter(p => p.status === 'in_consultation').length})
          </button>
          <button 
            className={filterStatus === 'completed' ? 'active' : ''} 
            onClick={() => setFilterStatus('completed')}
          >
            Completed ({patients.filter(p => p.status === 'completed').length})
          </button>
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="empty-state">
          <FiUser size={64} />
          <h3>No patients found</h3>
          <p>
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter' 
              : 'Register your first patient to get started'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button className="btn-primary" onClick={() => navigate('/patient-register')}>
              Register Patient
            </button>
          )}
        </div>
      ) : (
        <div className="patients-grid">
          {filteredPatients.map(patient => (
            <div key={patient._id} className="patient-card">
              <div className="patient-card-header">
                <div className="patient-info">
                  <FiUser className="patient-icon" />
                  <div>
                    <h3>{patient.name}</h3>
                    <p>{patient.age} years • {patient.gender}</p>
                  </div>
                </div>
                <span 
                  className="status-badge"
                  style={{ 
                    backgroundColor: `${getStatusColor(patient.status)}20`,
                    color: getStatusColor(patient.status)
                  }}
                >
                  {patient.status.replace('_', ' ')}
                </span>
              </div>

              <div className="patient-card-body">
                <div className="info-section">
                  <h4>Chief Complaint</h4>
                  <p>{patient.symptoms}</p>
                </div>

                {patient.vitalSigns && (
                  <div className="vital-signs">
                    <h4>Vital Signs</h4>
                    <div className="vitals-grid">
                      {patient.vitalSigns.temperature && (
                        <div className="vital-item">
                          <span className="vital-label">Temp</span>
                          <span className="vital-value">{patient.vitalSigns.temperature}</span>
                        </div>
                      )}
                      {patient.vitalSigns.bloodPressure && (
                        <div className="vital-item">
                          <span className="vital-label">BP</span>
                          <span className="vital-value">{patient.vitalSigns.bloodPressure}</span>
                        </div>
                      )}
                      {patient.vitalSigns.pulseRate && (
                        <div className="vital-item">
                          <span className="vital-label">Pulse</span>
                          <span className="vital-value">{patient.vitalSigns.pulseRate}</span>
                        </div>
                      )}
                      {patient.vitalSigns.oxygenLevel && (
                        <div className="vital-item">
                          <span className="vital-label">SpO₂</span>
                          <span className="vital-value">{patient.vitalSigns.oxygenLevel}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {patient.notes && (
                  <div className="info-section">
                    <h4>Notes</h4>
                    <p>{patient.notes}</p>
                  </div>
                )}

                {patient.diagnosis && (
                  <div className="info-section diagnosis">
                    <h4>Diagnosis</h4>
                    <p>{patient.diagnosis}</p>
                  </div>
                )}

                {patient.prescription && (
                  <div className="info-section prescription">
                    <h4>Prescription</h4>
                    <p>{patient.prescription}</p>
                  </div>
                )}

                <div className="patient-meta">
                  <div className="meta-item">
                    <FiCalendar size={14} />
                    <span>Registered: {new Date(patient.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}</span>
                  </div>
                  {patient.followUpDate && (
                    <div className="meta-item">
                      <FiActivity size={14} />
                      <span>Follow-up: {new Date(patient.followUpDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}</span>
                    </div>
                  )}
                </div>

                {!patient.consultationRequested && patient.status !== 'completed' && (
                  <div className="patient-actions">
                    <button 
                      className="btn-send-to-doctor"
                      onClick={() => handleSendToDoctor(patient._id)}
                    >
                      Send to Doctor
                    </button>
                  </div>
                )}

                {patient.consultationRequested && (
                  <div className="consultation-status">
                    <span className="requested-badge">Consultation Requested</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPatients;
