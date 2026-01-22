import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser, FiUsers, FiActivity, FiCheckCircle, FiPhone } from 'react-icons/fi';
import axios from 'axios';
import './Dashboard.css';

const API_BASE_URL = 'http://localhost:5000/api/v1';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPatients();
    fetchActiveConsultations();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Deduplicate patients by ID before setting state
      const uniquePatients = [];
      const seenIds = new Set();
      
      (response.data.data || []).forEach(patient => {
        if (!seenIds.has(patient._id)) {
          seenIds.add(patient._id);
          uniquePatients.push(patient);
        }
      });
      
      console.log('Total patients from API:', response.data.data?.length);
      console.log('Unique patients after dedup:', uniquePatients.length);
      
      setPatients(uniquePatients);
    } catch (error) {
      console.error('Fetch patients error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveConsultations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/consultations/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Active consultations response:', response.data);
      setConsultations(response.data.data || []);
    } catch (error) {
      console.error('Fetch consultations error:', error);
    }
  };

  const stats = {
    totalPatients: patients.length,
    waitingPatients: patients.filter(p => p.status === 'pending' || p.status === 'in_consultation').length + consultations.length,
    completedToday: patients.filter(p => {
      const today = new Date().toDateString();
      return p.status === 'completed' && new Date(p.updatedAt).toDateString() === today;
    }).length,
    ashaReferred: patients.filter(p => p.registeredBy).length
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>SehatMitra Doctor</h1>
          <div className="user-info">
            <FiUser />
            <span>{user?.fullName || 'Doctor'}</span>
            <button onClick={onLogout} className="btn-logout">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="stats-grid">
          <div className="stat-card total" onClick={() => navigate('/queue?filter=all')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon">
              <FiUsers size={24} />
            </div>
            <div className="stat-info">
              <h3>{loading ? '...' : stats.totalPatients}</h3>
              <p>Total Patients</p>
            </div>
          </div>
          <div className="stat-card pending" onClick={() => navigate('/queue?filter=pending')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon">
              <FiActivity size={24} />
            </div>
            <div className="stat-info">
              <h3>{loading ? '...' : stats.waitingPatients}</h3>
              <p>Waiting</p>
            </div>
          </div>
          <div className="stat-card completed" onClick={() => navigate('/queue?filter=completed')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon">
              <FiCheckCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{loading ? '...' : stats.completedToday}</h3>
              <p>Completed Today</p>
            </div>
          </div>
          <div className="stat-card calls" onClick={() => navigate('/scheduled-calls')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon">
              <FiPhone size={24} />
            </div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Scheduled Calls</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="patients-section">
            <div className="section-header">
              <h2><FiActivity /> Active Consultations</h2>
              <button className="btn-view-all" onClick={() => navigate('/queue')}>
                View All
              </button>
            </div>
            
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading consultations...</p>
              </div>
            ) : consultations.length === 0 && patients.filter(p => p.status === 'pending' || p.status === 'in_consultation').length === 0 ? (
              <div className="empty-state">
                <p>No active consultations</p>
              </div>
            ) : (
              <div className="patients-list">
                {/* Show message-based consultations first */}
                {consultations.map(consult => (
                  <div 
                    key={consult.patient._id} 
                    className="patient-item active-consult"
                    onClick={() => navigate('/consultation', { state: { patient: consult.patient, isUserPatient: consult.patient.isUserPatient } })}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="patient-info">
                      <FiUser className="patient-icon" />
                      <div className="patient-details">
                        <h4>{consult.patient.name}</h4>
                        {consult.patient.age && <p>{consult.patient.age} yrs • {consult.patient.gender}</p>}
                        <p className="last-message">{consult.lastMessage?.substring(0, 50)}...</p>
                      </div>
                    </div>
                    <div className="patient-meta">
                      {consult.unreadCount > 0 && (
                        <span className="unread-badge">{consult.unreadCount} new</span>
                      )}
                      <span className="message-count">{consult.messageCount} messages</span>
                    </div>
                    <button className="btn-action" onClick={(e) => { e.stopPropagation(); navigate('/consultation', { state: { patient: consult.patient, isUserPatient: consult.patient.isUserPatient } }); }}>
                      Reply
                    </button>
                  </div>
                ))}
                
                {/* Show ASHA-registered patients (deduplicated) */}
                {(() => {
                  const seen = new Set();
                  return patients
                    .filter(p => p.status === 'pending' || p.status === 'in_consultation')
                    .filter(p => {
                      if (seen.has(p._id)) return false;
                      seen.add(p._id);
                      return true;
                    })
                    .slice(0, 5);
                })().map(patient => (
                  <div 
                    key={patient._id} 
                    className={`patient-item ${patient.status}`}
                    onClick={() => navigate('/consultation', { state: { patient } })}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="patient-info">
                      <FiUser className="patient-icon" />
                      <div className="patient-details">
                        <h4>{patient.name}</h4>
                        <p>{patient.age} yrs • {patient.gender}</p>
                        <p className="symptoms">{patient.symptoms}</p>
                      </div>
                    </div>
                    <div className="patient-meta">
                      <span className={`status-badge ${patient.status}`}>
                        {patient.status.replace('_', ' ')}
                      </span>
                    </div>
                    <button className="btn-action" onClick={(e) => { e.stopPropagation(); navigate('/consultation', { state: { patient } }); }}>
                      Start
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
