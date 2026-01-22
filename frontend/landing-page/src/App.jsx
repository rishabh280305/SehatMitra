import React from 'react';
import './App.css';

function App() {
  const portals = [
    {
      title: 'Patient Portal',
      description: 'Book consultations, chat with doctors, and manage your health records seamlessly',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      url: 'https://sehatmitra-patient.vercel.app',
      accent: '#6366f1'
    },
    {
      title: 'ASHA Worker Portal',
      description: 'Register patients, assist with consultations, and manage community health initiatives',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        </svg>
      ),
      url: 'https://sehatmitra-asha.vercel.app',
      accent: '#10b981'
    },
    {
      title: 'Doctor Portal',
      description: 'View patient consultations, conduct video calls, and provide quality medical care',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
      url: 'https://sehatmitra-doctor.vercel.app',
      accent: '#f59e0b'
    },
    {
      title: 'Hospital Admin',
      description: 'Manage hospital beds, doctor rotations, inventory, and stock supply requests',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
        </svg>
      ),
      url: 'https://sehatmitra-ha.vercel.app',
      accent: '#ec4899'
    },
    {
      title: 'District Health Officer',
      description: 'Approve stock requests, view AI predictions, and oversee district health analytics',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
        </svg>
      ),
      url: 'https://sehatmitra-dho.vercel.app',
      accent: '#8b5cf6'
    }
  ];

  const features = [
    { icon: '01', title: 'AI-Powered Diagnostics', desc: 'Smart symptom analysis and health recommendations' },
    { icon: '02', title: 'Telemedicine', desc: 'Connect with doctors via video calls from anywhere' },
    { icon: '03', title: 'Multi-language Support', desc: 'Access healthcare in Hindi and regional languages' },
    { icon: '04', title: 'Face Verification', desc: 'Secure authentication with facial recognition' }
  ];

  return (
    <div className="app">
      <div className="bg-gradient"></div>
      <div className="bg-grid"></div>
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>

      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <div className="logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="logo-text">SehatMitra</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#portals">Portals</a>
            <a href="#about">About</a>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Transforming Rural Healthcare
          </div>
          <h1 className="hero-title">
            Healthcare Made
            <span className="gradient-text"> Accessible</span>
            <br />For Everyone
          </h1>
          <p className="hero-subtitle">
            Bridging the healthcare gap in rural India with AI-powered diagnostics, 
            telemedicine, and seamless connectivity between patients, doctors, and health workers.
          </p>
          <div className="hero-cta">
            <a href="#portals" className="btn-primary">
              Get Started
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#features" className="btn-secondary">
              Learn More
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">10K+</span>
              <span className="stat-label">Patients Served</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">500+</span>
              <span className="stat-label">Healthcare Workers</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">50+</span>
              <span className="stat-label">Districts Covered</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-tag">Features</span>
          <h2>Why Choose SehatMitra</h2>
          <p>Advanced healthcare technology designed for accessibility</p>
        </div>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <span className="feature-number">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="portals" className="portals-section">
        <div className="section-header">
          <span className="section-tag">Access Points</span>
          <h2>Choose Your Portal</h2>
          <p>Dedicated interfaces for every stakeholder in the healthcare ecosystem</p>
        </div>
        <div className="portals-grid">
          {portals.map((portal, index) => (
            <a
              key={index}
              href={portal.url}
              className="portal-card"
              style={{ '--accent': portal.accent }}
            >
              <div className="portal-icon">
                {portal.icon}
              </div>
              <div className="portal-content">
                <h3 className="portal-title">{portal.title}</h3>
                <p className="portal-description">{portal.description}</p>
              </div>
              <div className="portal-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-content">
          <span className="section-tag">About Us</span>
          <h2>Empowering Communities Through Technology</h2>
          <p>
            SehatMitra is a comprehensive digital health platform designed to address 
            the healthcare challenges faced by rural India. By leveraging AI, telemedicine, 
            and a network of ASHA workers, we bring quality healthcare to every doorstep.
          </p>
          <div className="about-features">
            <div className="about-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Government Recognized</span>
            </div>
            <div className="about-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>HIPAA Compliant</span>
            </div>
            <div className="about-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="logo-text">SehatMitra</span>
            </div>
            <p>Bridging the healthcare gap in rural communities across India.</p>
          </div>
          <div className="footer-bottom">
            <p>2026 SehatMitra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
