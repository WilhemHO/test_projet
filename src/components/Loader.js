import React from 'react';

const loaderContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minHeight: '60vh',
  width: '100%',
  position: 'relative',
  top: 0,
  left: 0,
  zIndex: 2000,
  marginTop: '240px',
};

const spinnerStyle = {
  border: '10px solid #ede9fe',
  borderTop: '10px solid #7c3aed',
  borderRadius: '50%',
  width: '80px',
  height: '80px',
  animation: 'spin 1s linear infinite',
  marginBottom: '24px',
};

const loaderTextStyle = {
  color: '#7c3aed',
  fontSize: '2rem',
  fontWeight: 700,
  textAlign: 'center',
};

const Loader = ({ text = "Chargement..." }) => (
  <div style={loaderContainerStyle}>
    {/* Animation keyframes via style tag */}
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg);}
        100% { transform: rotate(360deg);}
      }
    `}</style>
    <div style={spinnerStyle}></div>
    <div style={loaderTextStyle}>{text}</div>
  </div>
);

export default Loader; 