import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DoctorSelection.css';

function DoctorSelection() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const navigate = useNavigate();

  const specializations = [
    'All',
    'General Medicine',
    'Pediatrics',
    'Cardiology',
    'Gynecology',
    'Orthopedics',
    'Dermatology',
    'Neurology'
  ];

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialization]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found!');
        alert('Please login first');
        return;
      }

      const params = selectedSpecialization && selectedSpecialization !== 'All' 
        ? { specialization: selectedSpecialization }
        : {};

      console.log('Fetching doctors from API...');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('URL:', 'http://localhost:5000/api/v1/doctors');

      const response = await axios.get('http://localhost:5000/api/v1/doctors', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      console.log('Doctors API Response:', response.data);
      console.log('Number of doctors:', response.data?.data?.length || 0);
      
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
      } else if (error.response?.status === 404) {
        alert('Doctor API endpoint not found. Please check backend.');
      } else {
        alert(`Failed to load doctors: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectDoctor = (doctor) => {
    navigate('/consultation', { 
      state: { 
        selectedDoctor: {
          id: doctor._id,
          name: doctor.fullName,
          specialization: doctor.doctorDetails?.specialization
        }
      } 
    });
  };

  return (
    <div className="doctor-selection">
      <div className="page-header">
        <h1>Select a Doctor</h1>
        <p>Choose a specialist for your consultation</p>
      </div>

      <div className="filter-section">
        <label>Filter by Specialization:</label>
        <select 
          value={selectedSpecialization} 
          onChange={(e) => setSelectedSpecialization(e.target.value)}
        >
          {specializations.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="no-doctors">No doctors available</div>
      ) : (
        <div className="doctors-grid">
          {doctors.map(doctor => (
            <div key={doctor._id} className="doctor-card">
              <div className="doctor-avatar">
                {doctor.avatar ? (
                  <img src={doctor.avatar} alt={doctor.fullName} />
                ) : (
                  <div className="avatar-placeholder">
                    {doctor.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="doctor-info">
                <h3>{doctor.fullName}</h3>
                <p className="specialization">
                  {doctor.doctorDetails?.specialization || 'General Medicine'}
                </p>
                <p className="qualification">
                  {doctor.doctorDetails?.qualification || 'MBBS'}
                </p>
                <p className="experience">
                  Experience: {doctor.doctorDetails?.experience || 0} years
                </p>
              </div>
              <button 
                className="select-btn" 
                onClick={() => selectDoctor(doctor)}
              >
                Select Doctor
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorSelection;
