import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiLogOut, FiUser, FiUsers, FiActivity, FiCheckCircle, FiPhone, 
  FiHome, FiList, FiCalendar, FiClock, FiFileText, FiBarChart2,
  FiMessageSquare, FiVideo, FiMic
} from 'react-icons/fi';
import axios from 'axios';
import API_BASE_URL from '../config';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  
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
      {/* Green Sidebar */}
      <aside className="dashboard-sidebar">
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
            className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
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
            className="nav-link"
            onClick={() => navigate('/consultation')}
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
          <button className="logout-btn" onClick={onLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h2>Welcome back, Dr. {user?.fullName?.split(' ')[user?.fullName?.split(' ').length - 1] || 'Doctor'}</h2>
            <p>Here's what's happening with your patients today</p>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card" onClick={() => navigate('/queue?filter=all')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon">
                <FiUsers />
              </div>
              <div className="stat-details">
                <h3>{loading ? '...' : stats.totalPatients}</h3>
                <p>Total Patients</p>
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/queue?filter=pending')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon">
                <FiActivity />
              </div>
              <div className="stat-details">
                <h3>{loading ? '...' : stats.waitingPatients}</h3>
                <p>Waiting</p>
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/queue?filter=completed')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon">
                <FiCheckCircle />
              </div>
              <div className="stat-details">
                <h3>{loading ? '...' : stats.completedToday}</h3>
                <p>Completed Today</p>
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/scheduled-calls')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon">
                <FiPhone />
              </div>
              <div className="stat-details">
                <h3>0</h3>
                <p>Scheduled Calls</p>
              </div>
            </div>
          </div>

          {/* Active Consultations */}
          <div className="consultations-section">
            <div className="section-header">
              <h3>
                <FiActivity />
                Active Consultations
              </h3>
              <button className="view-all-btn" onClick={() => navigate('/queue')}>
                View All
              </button>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : consultations.length === 0 && patients.filter(p => p.status === 'pending' || p.status === 'in_consultation').length === 0 ? (
              <div className="empty-state">
                <FiUsers />
                <h3>No Active Consultations</h3>
                <p>When patients request consultations, they will appear here</p>
              </div>
            ) : (
              <div className="consultation-list">
                {/* Message-based consultations */}
                {consultations.map(consult => (
                  <div 
                    key={consult.patient._id} 
                    className="consultation-item"
                    onClick={() => navigate('/consultation', { state: { patient: consult.patient, isUserPatient: consult.patient.isUserPatient } })}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="consultation-header-row">
                      <div className="patient-info">
                        <div className="patient-avatar">
                          {consult.patient.name?.charAt(0) || 'P'}
                        </div>
                        <div className="patient-details">
                          <h4>{consult.patient.name}</h4>
                          <p>
                            {consult.patient.age && `${consult.patient.age} years`}
                            {consult.patient.gender && ` • ${consult.patient.gender}`}
                          </p>
                        </div>
                      </div>
                      {consult.unreadCount > 0 && (
                        <span className="status-badge waiting">{consult.unreadCount} new</span>
                      )}
                    </div>

                    <div className="consultation-meta">
                      <div className="meta-item">
                        <FiMessageSquare />
                        <span>{consult.messageCount} messages</span>
                      </div>
                      {consult.lastMessage && (
                        <div className="meta-item">
                          <span className="last-message">{consult.lastMessage.substring(0, 60)}...</span>
                        </div>
                      )}
                    </div>

                    <div className="consultation-actions">
                      <button 
                        className="action-btn action-btn-primary"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          navigate('/consultation', { state: { patient: consult.patient, isUserPatient: consult.patient.isUserPatient } }); 
                        }}
                      >
                        <FiMessageSquare />
                        Reply
                      </button>
                      <button 
                        className="action-btn action-btn-secondary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiVideo />
                        Video Call
                      </button>
                    </div>
                  </div>
                ))}

                {/* ASHA-registered patients */}
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
                    className="consultation-item"
                    onClick={() => navigate('/consultation', { state: { patient } })}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="consultation-header-row">
                      <div className="patient-info">
                        <div className="patient-avatar">
                          {patient.name?.charAt(0) || 'P'}
                        </div>
                        <div className="patient-details">
                          <h4>{patient.name}</h4>
                          <p>{patient.age} years • {patient.gender}</p>
                        </div>
                      </div>
                      <span className={`status-badge ${patient.status === 'pending' ? 'waiting' : 'scheduled'}`}>
                        {patient.status === 'pending' ? 'Waiting' : 'In Progress'}
                      </span>
                    </div>

                    <div className="consultation-meta">
                      {patient.symptoms && (
                        <div className="meta-item">
                          <FiActivity />
                          <span>{patient.symptoms}</span>
                        </div>
                      )}
                      {patient.registeredBy && (
                        <div className="meta-item">
                          <span>Referred by ASHA Worker</span>
                        </div>
                      )}
                    </div>

                    <div className="consultation-actions">
                      <button 
                        className="action-btn action-btn-primary"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          navigate('/consultation', { state: { patient } }); 
                        }}
                      >
                        <FiActivity />
                        Start Consultation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
