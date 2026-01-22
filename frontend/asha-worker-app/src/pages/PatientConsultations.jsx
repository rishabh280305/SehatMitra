import { useState, useEffect } from 'react';
import { FiLogOut, FiUser, FiHome, FiFileText, FiCalendar, FiActivity } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './PatientConsultations.css';

function PatientConsultations({ user, onLogout }) {
  const [consultations] = useState([
    {
      id: 1,
      patientName: 'Rajesh Kumar',
      age: 45,
      date: '2026-01-22',
      doctor: 'Dr. Sharma',
      diagnosis: 'Hypertension',
      prescription: 'Amlodipine 5mg - Once daily, Lifestyle modifications',
      status: 'Active',
      followUp: '2026-02-22'
    },
    {
      id: 2,
      patientName: 'Priya Devi',
      age: 32,
      date: '2026-01-21',
      doctor: 'Dr. Patel',
      diagnosis: 'Common Cold',
      prescription: 'Paracetamol 500mg - TDS, Vitamin C',
      status: 'Completed',
      followUp: null
    },
    {
      id: 3,
      patientName: 'Amit Singh',
      age: 58,
      date: '2026-01-20',
      doctor: 'Dr. Sharma',
      diagnosis: 'Diabetes Type 2',
      prescription: 'Metformin 500mg - BD, Diet control',
      status: 'Active',
      followUp: '2026-02-20'
    },
    {
      id: 4,
      patientName: 'Sunita Sharma',
      age: 28,
      date: '2026-01-19',
      doctor: 'Dr. Verma',
      diagnosis: 'Prenatal Checkup',
      prescription: 'Folic acid, Iron supplements',
      status: 'Active',
      followUp: '2026-02-02'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConsultations = consultations.filter(consultation => {
    const matchesFilter = filter === 'all' || consultation.status.toLowerCase() === filter;
    const matchesSearch = consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <h1>Patient Consultations</h1>
          <div className="header-actions">
            <Link to="/dashboard" className="btn-back">
              <FiHome /> Dashboard
            </Link>
            <button onClick={onLogout} className="btn-logout">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="page-main">
        <div className="controls-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by patient name or diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-tabs">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              All ({consultations.length})
            </button>
            <button 
              className={filter === 'active' ? 'active' : ''} 
              onClick={() => setFilter('active')}
            >
              Active ({consultations.filter(c => c.status === 'Active').length})
            </button>
            <button 
              className={filter === 'completed' ? 'active' : ''} 
              onClick={() => setFilter('completed')}
            >
              Completed ({consultations.filter(c => c.status === 'Completed').length})
            </button>
          </div>
        </div>

        <div className="consultations-grid">
          {filteredConsultations.length === 0 ? (
            <div className="no-data">
              <FiFileText size={48} />
              <p>No consultations found</p>
            </div>
          ) : (
            filteredConsultations.map(consultation => (
              <div key={consultation.id} className="consultation-card">
                <div className="card-header">
                  <div className="patient-info">
                    <FiUser size={20} />
                    <div>
                      <h3>{consultation.patientName}</h3>
                      <span className="age">Age: {consultation.age}</span>
                    </div>
                  </div>
                  <span className={`status-badge ${consultation.status.toLowerCase()}`}>
                    {consultation.status}
                  </span>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <FiCalendar size={16} />
                    <span>Date: {new Date(consultation.date).toLocaleDateString()}</span>
                  </div>
                  <div className="info-row">
                    <FiActivity size={16} />
                    <span>Doctor: {consultation.doctor}</span>
                  </div>
                  <div className="diagnosis-section">
                    <strong>Diagnosis:</strong>
                    <p>{consultation.diagnosis}</p>
                  </div>
                  <div className="prescription-section">
                    <strong>Prescription:</strong>
                    <p>{consultation.prescription}</p>
                  </div>
                  {consultation.followUp && (
                    <div className="follow-up">
                      <strong>Follow-up:</strong> {new Date(consultation.followUp).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default PatientConsultations;
