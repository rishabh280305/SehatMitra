import { Link } from 'react-router-dom';
import { FiLogOut, FiMessageSquare, FiFileText, FiUserCheck, FiBell } from 'react-icons/fi';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="container">
          <h1>SehatMitra</h1>
          <div className="nav-right">
            <span>Welcome, {user.fullName}</span>
            <button onClick={onLogout} className="btn btn-outline">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="welcome-card card">
          <h2>Welcome to Your Health Portal</h2>
          <p>Access healthcare services from the comfort of your home</p>
        </div>

        <div className="features-grid">
          <Link to="/select-doctor" className="feature-card card">
            <div className="feature-icon">
              <FiUserCheck size={40} />
            </div>
            <h3>Select Doctor</h3>
            <p>Choose a specialist for your consultation</p>
          </Link>

          <Link to="/consultation-history" className="feature-card card">
            <div className="feature-icon">
              <FiMessageSquare size={40} />
            </div>
            <h3>Consultation History</h3>
            <p>View and continue your past consultations</p>
          </Link>

          <Link to="/follow-up-requests" className="feature-card card">
            <div className="feature-icon">
              <FiBell size={40} />
            </div>
            <h3>Follow-up Requests</h3>
            <p>View and respond to doctor's follow-up requests</p>
          </Link>

          <Link to="/ai-consultant" className="feature-card card">
            <div className="feature-icon">
              <FiMessageSquare size={40} />
            </div>
            <h3>AI Health Assistant</h3>
            <p>Get instant health guidance and symptom analysis</p>
          </Link>

          <div className="feature-card card" style={{ opacity: 0.6 }}>
            <div className="feature-icon">
              <FiFileText size={40} />
            </div>
            <h3>Medical Records</h3>
            <p>View and manage your medical history</p>
            <small style={{ color: 'var(--text-secondary)' }}>Coming soon</small>
          </div>
        </div>

        <div className="info-section card">
          <h3>Your Profile Information</h3>
          <div className="info-grid">
            <div>
              <strong>Name:</strong> {user.fullName}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Phone:</strong> {user.phone}
            </div>
            <div>
              <strong>Role:</strong> {user.role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
