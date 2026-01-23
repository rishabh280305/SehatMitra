import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/api';
import './Auth.css';

function Register({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'doctor',
    doctorDetails: {
      medicalLicenseNumber: '',
      specialization: '',
      qualifications: [],
      yearsOfExperience: 0,
      consultationFee: 0
    }
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    if (e.target.name.startsWith('doctor_')) {
      const field = e.target.name.replace('doctor_', '');
      setFormData({
        ...formData,
        doctorDetails: {
          ...formData.doctorDetails,
          [field]: ['yearsOfExperience', 'consultationFee'].includes(field) 
            ? parseInt(e.target.value) || 0 
            : e.target.value
        }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const quals = formData.doctorDetails.qualifications;
      const submitData = {
        ...formData,
        doctorDetails: {
          ...formData.doctorDetails,
          qualifications: typeof quals === 'string' ? quals.split(',').map(q => q.trim()) : quals
        }
      };

      const data = await authService.register(submitData);
      setUser(data.user);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <h1>SehatMitra</h1>
          <h2>Doctor Registration</h2>
          <p>Join our healthcare network</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h3 style={{ marginBottom: '1rem' }}>Personal Information</h3>
          
          <div className="input-group">
            <label>Full Name (Dr.)</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} pattern="[0-9]{10}" required />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} minLength="6" required />
          </div>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Professional Details</h3>

          <div className="form-row">
            <div className="input-group">
              <label>Medical License Number</label>
              <input type="text" name="doctor_medicalLicenseNumber" value={formData.doctorDetails.medicalLicenseNumber} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Specialization</label>
              <input type="text" name="doctor_specialization" value={formData.doctorDetails.specialization} onChange={handleChange} placeholder="e.g., General Medicine" required />
            </div>
          </div>

          <div className="input-group">
            <label>Qualifications (comma-separated)</label>
            <input 
              type="text" 
              name="doctor_qualifications" 
              value={formData.doctorDetails.qualifications} 
              onChange={handleChange}
              placeholder="MBBS, MD, etc."
              required 
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Years of Experience</label>
              <input type="number" name="doctor_yearsOfExperience" value={formData.doctorDetails.yearsOfExperience} onChange={handleChange} min="0" required />
            </div>
            <div className="input-group">
              <label>Consultation Fee (₹)</label>
              <input type="number" name="doctor_consultationFee" value={formData.doctorDetails.consultationFee} onChange={handleChange} min="0" required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register as Doctor'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already registered? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
