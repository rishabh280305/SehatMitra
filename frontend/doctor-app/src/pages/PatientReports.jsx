import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiFile, FiUser, FiCalendar, FiDownload, FiEye, FiZap, FiX, FiLoader } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import './PatientReports.css';

const API_BASE_URL = 'http://localhost:5000/api/v1';

function PatientReports({ user, onLogout }) {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [filter, setFilter] = useState('all');
  
  // Sample reports data - in production, fetch from backend
  const [reports] = useState([
    {
      id: 1,
      patientName: 'Rajesh Kumar',
      patientAge: 45,
      patientGender: 'Male',
      reportType: 'blood_test',
      reportName: 'Complete Blood Count',
      reportDate: '2026-01-20',
      uploadedBy: 'ASHA Worker - Sunita Devi',
      source: 'asha_worker',
      fileUrl: null,
      status: 'pending_review',
      findings: 'Hemoglobin: 11.5 g/dL (Low), WBC: 8,500/µL (Normal), Platelets: 220,000/µL (Normal)',
      vitalSigns: {
        temperature: '101.2°F',
        bloodPressure: '140/90',
        pulseRate: '88 bpm',
        oxygenLevel: '96%'
      }
    },
    {
      id: 2,
      patientName: 'Priya Sharma',
      patientAge: 32,
      patientGender: 'Female',
      reportType: 'x_ray',
      reportName: 'Chest X-Ray',
      reportDate: '2026-01-21',
      uploadedBy: 'Patient',
      source: 'patient_direct',
      fileUrl: null,
      status: 'pending_review',
      findings: 'Mild pulmonary congestion observed in lower lobes. No significant abnormalities in cardiac silhouette.',
      vitalSigns: {
        temperature: '98.6°F',
        bloodPressure: '120/80',
        pulseRate: '72 bpm',
        oxygenLevel: '98%'
      }
    },
    {
      id: 3,
      patientName: 'Amit Patel',
      patientAge: 52,
      patientGender: 'Male',
      reportType: 'blood_test',
      reportName: 'Lipid Profile',
      reportDate: '2026-01-19',
      uploadedBy: 'ASHA Worker - Priya Sharma',
      source: 'asha_worker',
      fileUrl: null,
      status: 'reviewed',
      findings: 'Total Cholesterol: 245 mg/dL (High), LDL: 165 mg/dL (High), HDL: 38 mg/dL (Low), Triglycerides: 210 mg/dL (High)',
      vitalSigns: {
        temperature: '98.4°F',
        bloodPressure: '145/95',
        pulseRate: '80 bpm',
        oxygenLevel: '97%'
      }
    },
    {
      id: 4,
      patientName: 'Sunita Devi',
      patientAge: 28,
      patientGender: 'Female',
      reportType: 'ultrasound',
      reportName: 'Abdominal Ultrasound',
      reportDate: '2026-01-22',
      uploadedBy: 'Patient',
      source: 'patient_direct',
      fileUrl: null,
      status: 'pending_review',
      findings: 'Liver, kidneys, and spleen appear normal. Mild gallbladder wall thickening noted.',
      vitalSigns: {
        temperature: '99.1°F',
        bloodPressure: '118/75',
        pulseRate: '76 bpm',
        oxygenLevel: '99%'
      }
    },
    {
      id: 5,
      patientName: 'Vikram Singh',
      patientAge: 55,
      patientGender: 'Male',
      reportType: 'ecg',
      reportName: 'Electrocardiogram',
      reportDate: '2026-01-21',
      uploadedBy: 'ASHA Worker - Sunita Devi',
      source: 'asha_worker',
      fileUrl: null,
      status: 'pending_review',
      findings: 'Sinus rhythm with occasional PVCs. ST segment elevation in leads V2-V4 suggesting possible anterior wall ischemia.',
      vitalSigns: {
        temperature: '98.8°F',
        bloodPressure: '155/98',
        pulseRate: '92 bpm',
        oxygenLevel: '94%'
      }
    }
  ]);

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(r => r.source === filter);

  const handleAISummary = async (report) => {
    setLoadingSummary(true);
    setSelectedReport(report);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/ai/analyze-report`,
        {
          reportData: {
            patientName: report.patientName,
            patientAge: report.patientAge,
            patientGender: report.patientGender,
            reportType: report.reportType,
            reportName: report.reportName,
            findings: report.findings,
            vitalSigns: report.vitalSigns
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setAiSummary(response.data.summary);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate AI summary');
      console.error('AI Summary Error:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const closeModal = () => {
    setSelectedReport(null);
    setAiSummary(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <FiHome /> Dashboard
        </button>
        <div>
          <h1>Patient Reports</h1>
          <p>Review medical reports and generate AI-powered insights</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All Reports ({reports.length})
        </button>
        <button 
          className={filter === 'asha_worker' ? 'active' : ''} 
          onClick={() => setFilter('asha_worker')}
        >
          ASHA Referred ({reports.filter(r => r.source === 'asha_worker').length})
        </button>
        <button 
          className={filter === 'patient_direct' ? 'active' : ''} 
          onClick={() => setFilter('patient_direct')}
        >
          Direct Patients ({reports.filter(r => r.source === 'patient_direct').length})
        </button>
      </div>

      <div className="reports-grid">
        {filteredReports.map(report => (
          <div key={report.id} className={`report-card ${report.status}`}>
            <div className="report-header">
              <div className="report-title">
                <FiFile className="report-icon" />
                <div>
                  <h3>{report.reportName}</h3>
                  <p className="report-type">{report.reportType.replace('_', ' ')}</p>
                </div>
              </div>
              <span className={`status-badge ${report.status}`}>
                {report.status.replace('_', ' ')}
              </span>
            </div>

            <div className="patient-info">
              <div className="info-row">
                <FiUser size={16} />
                <span><strong>{report.patientName}</strong> • {report.patientAge} yrs • {report.patientGender}</span>
              </div>
              <div className="info-row">
                <FiCalendar size={16} />
                <span>{new Date(report.reportDate).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}</span>
              </div>
              <div className="info-row">
                <FiUser size={16} />
                <span className="uploaded-by">{report.uploadedBy}</span>
              </div>
            </div>

            <div className="vital-signs">
              <h4>Vital Signs</h4>
              <div className="vitals-grid">
                <div className="vital-item">
                  <span className="vital-label">Temp</span>
                  <span className="vital-value">{report.vitalSigns.temperature}</span>
                </div>
                <div className="vital-item">
                  <span className="vital-label">BP</span>
                  <span className="vital-value">{report.vitalSigns.bloodPressure}</span>
                </div>
                <div className="vital-item">
                  <span className="vital-label">Pulse</span>
                  <span className="vital-value">{report.vitalSigns.pulseRate}</span>
                </div>
                <div className="vital-item">
                  <span className="vital-label">SpO₂</span>
                  <span className="vital-value">{report.vitalSigns.oxygenLevel}</span>
                </div>
              </div>
            </div>

            <div className="report-findings">
              <h4>Findings</h4>
              <p>{report.findings}</p>
            </div>

            <div className="report-actions">
              <button className="btn-view" onClick={() => toast.info('View report functionality coming soon')}>
                <FiEye /> View
              </button>
              <button 
                className="btn-ai-summary" 
                onClick={() => handleAISummary(report)}
              >
                <FiZap /> AI Summary
              </button>
              <button className="btn-download" onClick={() => toast.info('Download functionality coming soon')}>
                <FiDownload /> Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedReport && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FiZap className="ai-icon" />
                AI Analysis Summary
              </h2>
              <button className="close-btn" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="report-summary-header">
                <h3>{selectedReport.reportName}</h3>
                <p><strong>{selectedReport.patientName}</strong> • {selectedReport.patientAge} years • {selectedReport.patientGender}</p>
              </div>

              {loadingSummary ? (
                <div className="loading-state">
                  <FiLoader className="spinner" />
                  <p>Analyzing report with AI...</p>
                </div>
              ) : aiSummary ? (
                <div className="ai-summary-content">
                  <div className="summary-section">
                    <h4>AI Analysis</h4>
                    <div className="summary-text">{aiSummary}</div>
                  </div>
                </div>
              ) : (
                <div className="error-state">
                  <p>Unable to generate AI summary. Please try again.</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>
                Close
              </button>
              <button className="btn-primary" onClick={() => toast.info('Write prescription functionality coming soon')}>
                Write Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientReports;
