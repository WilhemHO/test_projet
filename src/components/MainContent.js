// components/MainContent.js
import React from 'react';
import Graphique from './Graphique';

function MainContent() {
  return (
    <div className="main-content">
      <header className="main-header">
        <div className="welcome-container">
          <h1>Bienvenue Hamis !</h1>
          <p className="welcome-message">Tableau de bord des événements</p>
        </div>
        <div className="date-display">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}
        </div>
      </header>

      <div className="stats-summary">
        <div className="stat-card success">
          <h3>Événements traités avec succès</h3>
          <p className="stat-value">863 700</p>
          <p className="stat-percentage">37,2% du total</p>
        </div>
        <div className="stat-card error">
          <h3>Événements en échec</h3>
          <p className="stat-value">1 474 224</p>
          <p className="stat-percentage">63,5% du total</p>
        </div>
        <div className="stat-card highlight">
          <h3>Taux d'échec</h3>
          <p className="stat-value">63,5%</p>
          <div className="trend-indicator negative">↑ 2,1% vs hier</div>
        </div>
        <div className="stat-card">
          <h3>Dernière actualisation</h3>
          <p className="stat-value">10:59</p>
          <p className="stat-meta">Temps réel</p>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2>Analyse des événements</h2>
          <div className="time-filter">
            <button className="active">24h</button>
            <button>7j</button>
            <button>30j</button>
            <button>Personnalisé</button>
          </div>
        </div>
        
        <div className="graphiques-grid">
          <Graphique title="Événements par heure" type="line" />
          <Graphique title="Répartition des erreurs" type="donut" />
          <Graphique title="Tendance du taux d'échec" type="area" />
          <Graphique title="Top 5 des erreurs" type="bar" />
        </div>
      </div>

      <style jsx>{`
        .main-content {
          padding: 24px;
          background-color: #f8fafc;
          min-height: 100vh;
          font-family: 'Segoe UI', Roboto, sans-serif;
        }
        
        [data-theme="dark"] .main-content {
          background-color: rgba(30, 0, 60, 0.85);
          color: #E1D5F5;
        }
        
        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        [data-theme="dark"] .main-header {
          border-bottom: 1px solid rgba(126, 87, 194, 0.2);
        }
        
        .welcome-container h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }
        
        [data-theme="dark"] .welcome-container h1 {
          color: #E1D5F5;
        }
        
        .welcome-message {
          color: #64748b;
          font-size: 16px;
          margin: 0;
        }
        
        [data-theme="dark"] .welcome-message {
          color: #B39DDB;
        }
        
        .date-display {
          background-color: #ffffff;
          padding: 8px 16px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          color: #475569;
          font-weight: 500;
        }
        
        [data-theme="dark"] .date-display {
          background-color: rgba(69, 39, 160, 0.2);
          color: #E1D5F5;
          box-shadow: 0 1px 3px rgba(103, 58, 183, 0.1);
        }
        
        .stats-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }
        
        .stat-card {
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s;
          position: relative;
          overflow: hidden;
        }
        
        [data-theme="dark"] .stat-card {
          background-color: rgba(69, 39, 160, 0.15);
          box-shadow: 0 1px 3px rgba(103, 58, 183, 0.1);
          border: 1px solid rgba(126, 87, 194, 0.2);
        }
        
        .stat-card.success {
          border-top: 4px solid #10b981;
        }
        
        .stat-card.error {
          border-top: 4px solid #ef4444;
        }
        
        .stat-card.highlight {
          border-top: 4px solid #6366f1;
          background-color: #f8fafc;
        }
        
        [data-theme="dark"] .stat-card.highlight {
          background-color: rgba(69, 39, 160, 0.3);
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        [data-theme="dark"] .stat-card:hover {
          box-shadow: 0 4px 6px rgba(103, 58, 183, 0.2);
        }
        
        .stat-card h3 {
          color: #64748b;
          font-size: 14px;
          margin-top: 0;
          margin-bottom: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        [data-theme="dark"] .stat-card h3 {
          color: #B39DDB;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px 0;
        }
        
        [data-theme="dark"] .stat-value {
          color: #E1D5F5;
        }
        
        .stat-percentage, .stat-meta {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }
        
        [data-theme="dark"] .stat-percentage,
        [data-theme="dark"] .stat-meta {
          color: #B39DDB;
        }
        
        .trend-indicator {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 8px;
        }
        
        .trend-indicator.negative {
          background-color: #fee2e2;
          color: #dc2626;
        }
        
        [data-theme="dark"] .trend-indicator.negative {
          background-color: rgba(220, 38, 38, 0.2);
        }
        
        .content-section {
          background-color: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 24px;
        }
        
        [data-theme="dark"] .content-section {
          background-color: rgba(69, 39, 160, 0.15);
          border: 1px solid rgba(126, 87, 194, 0.2);
          box-shadow: 0 1px 3px rgba(103, 58, 183, 0.1);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .section-header h2 {
          font-size: 20px;
          color: #1e293b;
          margin: 0;
        }
        
        [data-theme="dark"] .section-header h2 {
          color: #E1D5F5;
        }
        
        .time-filter button {
          background: none;
          border: none;
          padding: 6px 12px;
          margin-left: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          color: #64748b;
          transition: all 0.2s;
        }
        
        [data-theme="dark"] .time-filter button {
          color: #B39DDB;
        }
        
        .time-filter button:hover {
          background-color: #f1f5f9;
        }
        
        [data-theme="dark"] .time-filter button:hover {
          background-color: rgba(69, 39, 160, 0.3);
        }
        
        .time-filter button.active {
          background-color: #e2e8f0;
          color: #1e293b;
          font-weight: 500;
        }
        
        [data-theme="dark"] .time-filter button.active {
          background-color: rgba(126, 87, 194, 0.3);
          color: #E1D5F5;
        }
        
        .graphiques-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          width: 100%;
        }
        
        @media (max-width: 1024px) {
          .stats-summary {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .main-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          
          .stats-summary {
            grid-template-columns: 1fr;
          }
          
          .graphiques-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default MainContent;