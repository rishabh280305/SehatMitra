import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCamera, FiUpload, FiHome } from 'react-icons/fi';
import axios from 'axios';
import API_BASE_URL from '../config';
import './PatientIntake.css';

function PatientIntake({ user, onLogout }) {
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
    <div className="page-container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <FiHome /> Dashboard
        </button>
        <h1>Register New Patient</h1>
        <p>Record patient information and symptoms</p>
      </div>

      <form onSubmit={handleSubmit} className="intake-form">
        <div className="form-section">
          <h3>Patient Information</h3>
          <div className="form-row">
            <div className="input-group">
              <label>Patient Name</label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Vital Signs</h3>
          <div className="form-row">
            <div className="input-group">
              <label>Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                name="vital_temperature"
                value={formData.vitalSigns.temperature}
                onChange={handleChange}
                placeholder="98.6"
              />
            </div>
            <div className="input-group">
              <label>Blood Pressure</label>
              <input
                type="text"
                name="vital_bloodPressure"
                value={formData.vitalSigns.bloodPressure}
                onChange={handleChange}
                placeholder="120/80"
              />
            </div>
            <div className="input-group">
              <label>Pulse Rate (bpm)</label>
              <input
                type="number"
                name="vital_pulseRate"
                value={formData.vitalSigns.pulseRate}
                onChange={handleChange}
                placeholder="72"
              />
            </div>
            <div className="input-group">
              <label>Oxygen Level (%)</label>
              <input
                type="number"
                name="vital_oxygenLevel"
                value={formData.vitalSigns.oxygenLevel}
                onChange={handleChange}
                placeholder="98"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Symptoms & Observations</h3>
          <div className="input-group">
            <label>Chief Complaints</label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows="4"
              placeholder="Describe patient's symptoms..."
              required
            />
          </div>
          <div className="input-group">
            <label>Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Any additional observations..."
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Medical Records</h3>
          <div className="upload-area">
            <FiCamera />
            <p>Take Photo or Upload Report</p>
            <button type="button" className="btn-secondary">
              <FiUpload /> Choose File
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Register Patient
        </button>
      </form>
    </div>
  );
}

export default PatientIntake;
