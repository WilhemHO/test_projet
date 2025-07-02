import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import '../CSS/sidebar.css';

function Sidebar() {
  const [profilePhoto, setProfilePhoto] = useState(
    localStorage.getItem('profilePhoto') || 
    'https://www.anecdote-du-jour.com/wp-content/images/2009/02/homer-simpson-mg.jpg'
  );
  const navigate = useNavigate();

  useEffect(() => {
    const handleProfilePhotoChange = () => {
      const photo = localStorage.getItem('profilePhoto');
      if (photo) {
        setProfilePhoto(photo); // Met à jour l'état local
      }
    };

    // Écoute l'événement personnalisé
    window.addEventListener('profilePhotoChanged', handleProfilePhotoChange);

    // Nettoyage
    return () => {
      window.removeEventListener('profilePhotoChanged', handleProfilePhotoChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-image"></div>
      </div>
      
      <div className="sidebar-content">
        <div className="user-profile">
          <div 
            className="user-avatar"
            style={{ 
              backgroundImage: `url(${profilePhoto})`, 
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
          <div className="user-info">
            <div className="user-name">Hamis</div>
            <div className="user-role">Admin</div>
          </div>
        </div>
        
        <div className="menu-section">
          <div className="section-title">OVERVIEW</div>
          <NavLink to="/" className={({ isActive }) => "menu-item" + (isActive ? " active" : "")}>Dashboard</NavLink>
          <NavLink to="/realtime-monitoring" className={({ isActive }) => "menu-item" + (isActive ? " active" : "")}>Realtime Monitoring</NavLink>
          <NavLink to="/event-anomaly" className={({ isActive }) => "menu-item" + (isActive ? " active" : "")}>Event Anomaly</NavLink>
          <NavLink to="/tracking-plan-health" className={({ isActive }) => "menu-item" + (isActive ? " active" : "")}>Tracking Plan Health</NavLink>
        </div>
      </div>
      
      <div className="sidebar-footer">
        <div className="menu-section settings-section">
          <div className="section-title">SETTINGS</div>
          <Link to="/setting" className="settings-item">Setting</Link>
          <div className="settings-item" onClick={handleLogout} style={{ cursor: 'pointer', fontWeight: 600 }}>Logout</div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;