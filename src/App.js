import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import RealtimeMonitoring from './components/RealtimeMonitoring';
import EventAnomaly from './components/EventAnomaly';
import TrackingPlanHealth from './components/TrackingPlanHealth';
import Setting from './components/Setting';
import Login from './components/Login';
import './styles.css';
import { CacheProvider } from './components/CacheContext';

// Composant de protection des routes
function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
           (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <CacheProvider>
      <Router>
        <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </Router>
    </CacheProvider>
  );
}

function AppLayout({ darkMode, toggleDarkMode }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  return (
    <div className="app">
      {/* Sidebar seulement si pas sur /login */}
      {!isLoginPage && <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      <Routes>
        <Route path="/login" element={<LoginWithRedirect />} />
        <Route path="/" element={<RequireAuth><MainContent /></RequireAuth>} />
        <Route path="/realtime-monitoring" element={<RequireAuth><RealtimeMonitoring /></RequireAuth>} />
        <Route path="/event-anomaly" element={<RequireAuth><EventAnomaly /></RequireAuth>} />
        <Route path="/tracking-plan-health" element={<RequireAuth><TrackingPlanHealth /></RequireAuth>} />
        <Route 
          path="/setting" 
          element={<RequireAuth><Setting darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></RequireAuth>} 
        />
      </Routes>
    </div>
  );
}

// Redirection automatique après login si déjà connecté
function LoginWithRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/', { replace: true });
    }
  }, [navigate]);
  return <Login />;
}

export default App;