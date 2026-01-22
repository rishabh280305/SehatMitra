import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiUser, FiClock, FiHome } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Queue.css';

const API_BASE_URL = 'http://localhost:5000/api/v1';

function Queue() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || 'all';
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

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

  const ashaReferred = patients.filter(p => p.registeredBy);
  const directConsult = patients.filter(p => !p.registeredBy);

  // Filter patients based on URL parameter
  const getFilteredPatients = () => {
    const today = new Date().toDateString();
    switch (filterParam) {
      case 'pending':
        return patients.filter(p => p.status === 'pending');
      case 'completed':
        return patients.filter(p => {
          return p.status === 'completed' && new Date(p.updatedAt).toDateString() === today;
        });
      case 'asha':
        return ashaReferred;
      case 'all':
      default:
        return patients;
    }
  };

  const filteredPatients = getFilteredPatients();
  const filterTitle = {
    all: 'All Patients',
    pending: 'Waiting Patients',
    completed: 'Completed Today',
    asha: 'ASHA Referred Patients'
  }[filterParam] || 'Patient Queue';

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <FiHome /> Dashboard
        </button>
        <div>
          <h1>{filterTitle}</h1>
          <p>Showing {filteredPatients.length} patient(s)</p>
        </div>
      </div>

      <div className="queue-stats">
        <div className="stat-card">
          <h3>{patients.length}</h3>
          <p>Total Patients</p>
        </div>
        <div className="stat-card asha">
          <h3>{ashaReferred.length}</h3>
          <p>ASHA Referred</p>
        </div>
        <div className="stat-card direct">
          <h3>{directConsult.length}</h3>
          <p>Direct Consult</p>
        </div>
        <div className="stat-card high-priority">
          <h3>{patients.filter(p => p.status === 'pending').length}</h3>
          <p>Waiting</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading patients...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="empty-state">
          <FiUser size={64} />
          <h3>No patients found</h3>
          <p>{filterParam === 'all' ? 'Patients will appear here once they are registered' : `No ${filterTitle.toLowerCase()} at the moment`}</p>
        </div>
      ) : (
        <div className="queue-list">
          {filteredPatients.map(patient => (
            <div key={patient._id} className="queue-item">
              <div className="patient-header">
                <div className="patient-basic">
                  <FiUser className="patient-icon" />
                  <div>
                    <h3>{patient.name}</h3>
                    <p>{patient.age} years • {patient.gender}</p>
                  </div>
                </div>
                <div className="patient-badges">
                  <span className={`source-badge ${patient.registeredBy ? 'asha-referred' : 'direct'}`}>
                    {patient.registeredBy ? 'ASHA Referred' : 'Direct'}
                  </span>
                  <span className={`priority-badge ${patient.status}`}>
                    {patient.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="patient-details">
                {patient.registeredBy && (
                  <div className="detail-row">
                    <strong>Referred by ASHA:</strong>
                    <p>{patient.registeredBy.fullName || patient.registeredBy.name || 'ASHA Worker'}</p>
                  </div>
                )}
                <div className="detail-row">
                  <strong>Chief Complaint:</strong>
                  <p>{patient.symptoms}</p>
                </div>
                {patient.vitalSigns && (patient.vitalSigns.temperature || patient.vitalSigns.bloodPressure) && (
                  <div className="detail-row vitals">
                    <strong>Vital Signs:</strong>
                    <div className="vitals-display">
                      {patient.vitalSigns.temperature && <span>Temp: {patient.vitalSigns.temperature}</span>}
                      {patient.vitalSigns.bloodPressure && <span>BP: {patient.vitalSigns.bloodPressure}</span>}
                      {patient.vitalSigns.pulseRate && <span>Pulse: {patient.vitalSigns.pulseRate}</span>}
                      {patient.vitalSigns.oxygenLevel && <span>SpO₂: {patient.vitalSigns.oxygenLevel}</span>}
                    </div>
                  </div>
                )}
                {patient.notes && (
                  <div className="detail-row">
                    <strong>Notes:</strong>
                    <p>{patient.notes}</p>
                  </div>
                )}
              </div>

              <div className="patient-actions">
                <button className="btn btn-primary" onClick={() => navigate('/consultation', { state: { patient } })}>
                  Start Consultation
                </button>
                <button className="btn-secondary" onClick={() => toast.info('Patient history feature coming soon')}>
                  View History
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Queue;
