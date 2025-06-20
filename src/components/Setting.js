import React, { useState, useEffect } from 'react';
import '../CSS/Setting.css';

function Setting({ darkMode, toggleDarkMode, user = {}, onLogout }) {
  const [profilePhoto, setProfilePhoto] = useState(
    localStorage.getItem('profilePhoto') || 
    user.photoURL || 
    'https://www.anecdote-du-jour.com/wp-content/images/2009/02/homer-simpson-mg.jpg'
  );

  useEffect(() => {
    if (profilePhoto) {
      localStorage.setItem('profilePhoto', profilePhoto);
      // Déclencher un événement personnalisé pour notifier le changement
      window.dispatchEvent(new Event('profilePhotoChanged'));
    }
  }, [profilePhoto]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La photo ne doit pas dépasser 5MB');
        return;
      }

      // Vérifier le type (image seulement)
      if (!file.type.match('image.*')) {
        alert('Veuillez sélectionner une image valide');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhoto(event.target.result); // Met à jour l'état et déclenche le useEffect
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`settings-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="settings-header">
        <h1>Paramètres</h1>
        <p>Gérez vos préférences et votre compte</p>
      </div>

      <div className="profile-section">
        <div className="avatar-container">
          <img 
            src={profilePhoto} 
            alt="Profil" 
            className="profile-avatar"
          />
          <label htmlFor="avatar-upload" className="avatar-upload-label">
            ✏️ Modifier
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoChange}
              className="avatar-upload-input"
            />
          </label>
        </div>
        <div className="profile-info">
          <h2>{user.displayName || 'Utilisateur'}</h2>
          <p>{user.email || 'email@exemple.com'}</p>
        </div>
      </div>

      <div className="settings-options">
        <div className="settings-group">
          <h3>Apparence</h3>
          <button 
            onClick={toggleDarkMode}
            className={`theme-switcher ${darkMode ? 'dark' : 'light'}`}
          >
            {darkMode ? '☀️ Passer en mode clair' : '🌙 Passer en mode sombre'}
          </button>
        </div>

        <div className="settings-group">
          <h3>Compte</h3>
          <button className="settings-button">
            🔄 Changer de compte
          </button>
          <button 
            onClick={onLogout} 
            className="settings-button logout"
          >
            🚪 Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}

export default Setting;