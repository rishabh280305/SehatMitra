import React from 'react';
import './App.css';

function App() {
  const portals = [
    {
      title: 'Patient Portal',
      description: 'Book consultations, chat with doctors, and manage your health records',
      icon: '👤',
      color: '#4F46E5',
      url: process.env.REACT_APP_PATIENT_URL || 'http://localhost:3000',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'ASHA Worker Portal',
      description: 'Register patients, assist with consultations, and manage community health',
      icon: '🏥',
      color: '#10B981',
      url: process.env.REACT_APP_ASHA_URL || 'http://localhost:3001',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
    },
    {
      title: 'Doctor Portal',
      description: 'View patient consultations, schedule calls, and provide medical care',
      icon: '⚕️',
      color: '#F59E0B',
      url: process.env.REACT_APP_DOCTOR_URL || 'http://localhost:3002',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    }
  ];

  const handlePortalClick = (url) => {
    window.location.href = url;
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            <h1>SehatMitra</h1>
          </div>
          <p className="tagline">Empowering Healthcare for Rural India</p>
        </header>

        <div className="portals-grid">
          {portals.map((portal, index) => (
            <div
              key={index}
              className="portal-card"
              onClick={() => handlePortalClick(portal.url)}
              style={{ '--portal-gradient': portal.gradient }}
            >
              <div className="portal-icon">{portal.icon}</div>
              <h2 className="portal-title">{portal.title}</h2>
              <p className="portal-description">{portal.description}</p>
              <button className="portal-button">
                Enter Portal →
              </button>
            </div>
          ))}
        </div>

        <footer className="footer">
          <p>© 2026 SehatMitra. Bridging the healthcare gap in rural communities.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
