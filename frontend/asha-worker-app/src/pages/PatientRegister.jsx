import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCamera, FiUpload, FiHome } from 'react-icons/fi';
import axios from 'axios';
import API_BASE_URL from '../config';
import './PatientRegister.css';

function PatientRegister({ user, onLogout }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: '',
    symptoms: '',
    vitalSigns: {
      temperature: '',
      bloodPressure: '',
      pulseRate: '',
      oxygenLevel: ''
    },
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('vital_')) {
      const vitalKey = name.replace('vital_', '');
      setFormData({
        ...formData,
        vitalSigns: { ...formData.vitalSigns, [vitalKey]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/patients`, {
        name: formData.patientName,
        age: parseInt(formData.age),
        gender: formData.gender,
        symptoms: formData.symptoms,
        vitalSigns: formData.vitalSigns,
        notes: formData.notes,
        ashaWorkerId: user._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Patient registered successfully!');
      setFormData({
        patientName: '',
        age: '',
        gender: '',
        symptoms: '',
        vitalSigns: { temperature: '', bloodPressure: '', pulseRate: '', oxygenLevel: '' },
        notes: ''
      });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register patient');
    }
  };

  return (
    <div className="patient-intake-page">
      <div className="patient-intake-container">
        <button className="back-link" onClick={() => navigate('/dashboard')}>
          <FiHome /> Back to Dashboard
        </button>
        <div className="page-header">
          <h1>Register New Patient</h1>
          <p>Record patient information and symptoms</p>
        </div>

        <form onSubmit={handleSubmit} className="intake-form">
          <div className="form-section">
            <h3 className="form-section-title">Patient Information</h3>
            <div className="form-grid">
            <div className="form-group">
              <label>Patient Name</label>
              <input
                type="text"
                name="patientName"
                className="form-input"
                value={formData.patientName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                name="age"
                className="form-input"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" className="form-select" value={formData.gender} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Vital Signs</h3>
            <div className="vitals-grid">
            <div className="vital-input-group">
              <input
                type="number"
                step="0.1"
                name="vital_temperature"
                value={formData.vitalSigns.temperature}
                onChange={handleChange}
                placeholder="98.6"
              />
              <span className="vital-unit">°F</span>
            </div>
            <div className="vital-input-group">
              <input
                type="text"
                name="vital_bloodPressure"
                value={formData.vitalSigns.bloodPressure}
                onChange={handleChange}
                placeholder="120/80"
              />
              <span className="vital-unit">mmHg</span>
            </div>
            <div className="vital-input-group">
              <input
                type="number"
                name="vital_pulseRate"
                value={formData.vitalSigns.pulseRate}
                onChange={handleChange}
                placeholder="72"
              />
              <span className="vital-unit">bpm</span>
            </div>
            <div className="vital-input-group">
              <input
                type="number"
                name="vital_oxygenLevel"
                value={formData.vitalSigns.oxygenLevel}
                onChange={handleChange}
                placeholder="98"
              />
              <span className="vital-unit">%</span>
            </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Symptoms & Observations</h3>
            <div className="form-group full-width">
              <label>Chief Complaints</label>
              <textarea
                name="symptoms"
                className="form-textarea"
                value={formData.symptoms}
                onChange={handleChange}
                rows="4"
                placeholder="Describe patient's symptoms..."
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Additional Notes</label>
              <textarea
                name="notes"
                className="form-textarea"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional observations..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientRegister;
