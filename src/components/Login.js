import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', email);
        setError('');
        setTimeout(() => {
          navigate('/');
        }, 600);
      } else {
        setError(data.message || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Erreur réseau');
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f3fa', position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 12px rgba(30,60,90,0.08)', padding: 36, minWidth: 340, maxWidth: 380, width: '100%', boxSizing: 'border-box' }}>
        <h2 style={{ textAlign: 'center', color: '#4c2885', fontFamily: 'Bebas Neue, cursive', fontSize: '2rem', marginBottom: 8 }}>Connexion</h2>
        <p style={{ textAlign: 'center', color: '#b197d2', marginBottom: 24 }}>Accédez à votre dashboard</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#7c3aed', fontWeight: 600 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 16 }}
              placeholder="Votre email"
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#7c3aed', fontWeight: 600 }}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 38px 10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 16 }}
                placeholder="Votre mot de passe"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#b197d2', fontSize: 18 }} tabIndex={-1}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {error && <div style={{ color: '#ef4444', background: '#fee2e2', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontWeight: 500 }}>{error}</div>}
          {success && <div style={{ color: '#10b981', background: '#dcfce7', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontWeight: 500 }}>Connexion réussie !</div>}
          <button type="submit" style={{ width: '100%', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 17, cursor: 'pointer', marginTop: 8 }}>
            Se connecter
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 18, color: '#bdb6d5', fontSize: 14 }}>
          Contactez votre administrateur pour obtenir un accès
        </div>
      </div>
    </div>
  );
}

export default Login; 