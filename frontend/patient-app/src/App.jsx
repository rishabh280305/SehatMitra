import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authService } from './services/api';
import { LanguageProvider } from './contexts/LanguageContext';
import { CallProvider } from './contexts/CallContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AIConsultant from './pages/AIConsultant';
import Consultation from './pages/Consultation';
import FollowUpRequests from './pages/FollowUpRequests';
import DoctorSelection from './pages/DoctorSelection';
import ConsultationHistory from './pages/ConsultationHistory';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <LanguageProvider>
      <CallProvider user={user}>
        <Router>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register setUser={setUser} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/ai-consultant" 
          element={user ? <AIConsultant user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/consultation" 
          element={user ? <Consultation user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/select-doctor" 
          element={user ? <DoctorSelection user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/consultation-history" 
          element={user ? <ConsultationHistory user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/follow-up-requests" 
          element={user ? <FollowUpRequests user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
    </CallProvider>
    </LanguageProvider>
  );
}

export default App;
