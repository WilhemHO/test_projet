// components/MainContent.js
import React, { useEffect, useState } from 'react';
import DateRangePicker from './DateRangePicker';
import DateRangeDropdown from './DateRangeDropdown';
import { useCache } from "./CacheContext";
import Loader from './Loader';

function MainContent() {
  const [metrics, setMetrics] = useState(null);
  const [eventStats, setEventStats] = useState([]);
  const [parametersAnalysis, setParametersAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const start = startDate.toISOString().split('T')[0];
    return { start, end };
  });
  const [selectedMood, setSelectedMood] = useState(null);
  const { getCacheData, setCacheData } = useCache();

  useEffect(() => {
    const cacheKey = `dashboardData_${dateRange.start}_${dateRange.end}`;
    const cached = getCacheData(cacheKey);
    if (cached) {
      setMetrics(cached.metrics);
      setEventStats(cached.eventStats);
      setParametersAnalysis(cached.parametersAnalysis);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`http://localhost:4000/api/dashboard?start=${dateRange.start}&end=${dateRange.end}`)
      .then(res => res.json())
      .then(data => {
        setMetrics(data.metrics);
        setEventStats(data.eventStats);
        setParametersAnalysis(data.parametersAnalysis || []);
        setCacheData(cacheKey, data);
        setLoading(false);
      })
      .catch(err => {
        setError('Erreur lors du chargement des données');
        setLoading(false);
      });
  }, [dateRange]);

  if (loading) return <Loader text="Chargement des données..." />;
  if (error) return <div>{error}</div>;
  if (!metrics) return <div>Aucune donnée à afficher.</div>;

  return (
    <div className="main-content" style={{ position: 'relative', minHeight: '100vh', paddingBottom: 40 }}>
      {/* Header + Date Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '32px 0 0 0' }}>
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '2.2rem', fontWeight: 700, color: '#4c2885', marginBottom: 2 }}>Bienvenue !</h1>
          <div style={{ color: '#b197d2', fontSize: '1.05rem', fontWeight: 400, marginBottom: 0 }}>Tableau de bord des événements</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          
          <DateRangeDropdown value={dateRange} onChange={setDateRange} />
          
        </div>
      </div>

      {/* Cartes résumé */}
      <div className="stats-summary-cards" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginTop: 24, gap: 24 }}>
        <div className="stat-card success">
          <div className="stat-card-title">ÉVÉNEMENTS TRAITÉS AVEC SUCCÈS</div>
          <div className="stat-card-value">{metrics?.good_events?.toLocaleString() ?? '-'}</div>
          <div className="stat-card-sub">{metrics?.total_events ? ((metrics.good_events / metrics.total_events) * 100).toFixed(1) + '% du total' : '-'}</div>
        </div>
        <div className="stat-card error">
          <div className="stat-card-title">ÉVÉNEMENTS EN ÉCHEC</div>
          <div className="stat-card-value">{metrics?.error_events?.toLocaleString() ?? '-'}</div>
          <div className="stat-card-sub">{metrics?.total_events ? ((metrics.error_events / metrics.total_events) * 100).toFixed(1) + '% du total' : '-'}</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-card-title">TAUX D'ÉCHEC</div>
          <div className="stat-card-value">{metrics?.error_rate !== undefined ? metrics.error_rate.toFixed(1) + '%' : '-'}</div>
          <div className="stat-card-sub">
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-card-title">TOTAL EVENTS</div>
          <div className="stat-card-value">{metrics?.total_events?.toLocaleString() ?? '-'}</div>
          <div className="stat-card-sub">Sur la période</div>
        </div>
        <div className="stat-card info">
          <div className="stat-card-title">UNIQUE USERS</div>
          <div className="stat-card-value">{metrics?.unique_users?.toLocaleString() ?? '-'}</div>
          <div className="stat-card-sub">Sur la période</div>
        </div>
      </div>

      {/* Statistiques par événements */}
      <div className="content-section" style={{ marginTop: 36 }}>
        
        <div className="event-stats-table-wrapper">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '1.18rem', fontWeight: 700, color: '#2d204a', margin: 0 }}>Statistiques par événements</h2>
        </div>
          <table className="event-stats-table">
            <thead>
              <tr>
                <th className="align-left">EVENT</th>
                <th className="align-right">HITS</th>
                <th className="align-right">HITS WITH ERRORS</th>
                <th className="align-right">%ERRORS</th>
                <th className="align-left">DATA QUALITY</th>
              </tr>
            </thead>
            <tbody>
              {eventStats.map((ev, idx) => (
                <tr key={ev.event_name} className={idx % 2 === 0 ? 'even-row' : ''}>
                  <td className="event-name">{ev.event_name}</td>
                  <td className="number">{ev.hits.toLocaleString()}</td>
                  <td className="number">{ev.hits_with_errors.toLocaleString()}</td>
                  <td className={`number ${ev.error_percentage > 50 ? 'danger' : ev.error_percentage > 10 ? 'warning' : 'success'}`}>{ev.error_percentage.toFixed(1)}%</td>
                  <td>
                    <span className={`quality-badge ${ev.data_quality.replace(/ /g, '-').toLowerCase()}`}>{ev.data_quality}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analyse des paramètres */}
      <div className="content-section" style={{ marginTop: 36 }}>
      <div className="event-stats-table-wrapper">
        <div className="section-header" style={{ marginBottom: 8 }}>
          <h2 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '1.18rem', fontWeight: 700, color: '#2d204a', margin: 0 }}>Analyse des paramètres</h2>
        </div>
        <div className="parameters-analysis-list">
          {parametersAnalysis.map(param => (
            <div key={param.param_name} className={`param-row ${param.status.toLowerCase()}`}
              style={{ borderLeft: `6px solid ${param.status === 'Critique' ? '#ef4444' : param.status === 'Attention' ? '#f59e42' : param.status === 'Warning' ? '#fbbf24' : '#10b981'}` }}>
              <div className="param-main">
                <span className={`param-name ${param.status.toLowerCase()}`}>{param.param_name}</span>
                <span className={`param-type-badge ${param.param_name === 'user_id' ? 'User' : (param.param_type === 'User' ? 'User' : 'Event')}`}>
                  {param.param_name === 'user_id' ? 'User' : (param.param_type === 'User' ? 'User' : 'Event')}
                </span>
              </div>
              <div className="param-bar-container">
                <div className="param-bar-bg">
                  <div
                    className={`param-bar-fill ${param.status.toLowerCase()}`}
                    style={{ width: `${param.missing_percentage}%` }}
                  />
                </div>
                <span className="param-bar-label">
                  {param.missing_percentage.toFixed(1)}% ({param.events_with_missing_param} / {param.total_events})
                </span>
              </div>
              <div className={`param-status-badge ${param.status.toLowerCase()}`}>{param.status}</div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Styles supplémentaires pour la maquette */}
      <style>{`
        .main-content { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; }
        .period-btn {
          border: none;
          border-radius: 8px;
          padding: 6px 16px;
          font-weight: 600;
          font-size: 1rem;
          background: #f3f0fa;
          color: #7c3aed;
          cursor: pointer;
          transition: background 0.15s;
        }
        .period-btn.selected, .period-btn:hover {
          background: #ede9fe;
          color: #7c3aed;
        }
        .period-btn:not(.selected) {
          color: #a78bfa;
          background: #f6f3fa;
        }
        .stats-summary-cards {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 24px;
          margin: 32px 0;
        }
        .stat-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 2px 12px rgba(30, 60, 90, 0.06);
          padding: 32px 24px 24px 24px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          border-top: 5px solid #e5e7eb;
          min-width: 0;
          min-height: 160px;
        }
        .stat-card-title {
          font-size: 13px;
          font-weight: 600;
          color: #b197d2;
          text-transform: uppercase;
          margin-bottom: 16px;
          letter-spacing: 1px;
          min-height: 50px;
        }
        .stat-card-value {
          font-size: 1.7rem;
          font-weight: 700;
          color: #4c2885;
          margin-bottom: 8px;
          font-variant-numeric: tabular-nums;
        }
        .stat-card-sub {
          font-size: 1rem;
          color: #bdb6d5;
          font-weight: 500;
        }
        .stat-card.success { border-top: 5px solid #817EE1; }
        .stat-card.error { border-top: 5px solid #817EE1; }
        .stat-card.highlight { border-top: 5px solid #817EE1; }
        .stat-card.info { border-top: 5px solid #817EE1; }
        .trend-indicator.negative {
          background:rgb(184, 12, 12);
          color: #ef4444;
          border-radius: 12px;
          padding: 2px 10px;
          font-size: 0.95rem;
          font-weight: 600;
          margin-top: 4px;
          display: inline-block;
        }
        .date-display-top {
          position: absolute;
          right: 32px;
          top: 32px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(30, 60, 90, 0.06);
          padding: 12px 24px;
          font-size: 1.15rem;
          color: #475569;
          font-weight: 600;
        }
        .main-header {
          position: relative;
          margin-bottom: 24px;
        }
        .welcome-container h1 {
          font-size: 2.2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }
        .welcome-message {
          color: #64748b;
          font-size: 1.1rem;
          margin: 0;
        }
        .event-stats-table-wrapper {
          background: rgb(243, 241, 247);
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(30, 60, 90, 0.06);
          padding: 24px;
          margin-top: 24px;
          overflow-x: auto;
        }
        .event-stats-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 1.05rem;
          border-radius: 16px;
          overflow: hidden;
        }
        .event-stats-table th, .event-stats-table td {
          padding: 12px 16px;
          text-align: left;
        }
        .event-stats-table th {
          background: #f3f0fa;
          color: #7c3aed;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e5e7eb;
        }
        .event-stats-table tbody tr {
          border-bottom: 1px solid #e5e7eb;
          transition: background 0.15s;
        }
        .event-stats-table tbody tr.even-row {
          background: #faf7fd;
        }
        .event-stats-table tbody tr:hover {
          background: #f6f3fa;
        }
        .event-stats-table .event-name {
          font-weight: 600;
          color: #6366f1;
        }
        .event-stats-table .number {
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .event-stats-table .danger {
          color: #ef4444;
          font-weight: 700;
        }
        .event-stats-table .warning {
          color: #f59e42;
          font-weight: 700;
        }
        .event-stats-table .success {
          color: #10b981;
          font-weight: 700;
        }
        .quality-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          background: #f1f5f9;
          color: #64748b;
        }
        .quality-badge.good {
          background: #dcfce7;
          color: #15803d;
        }
        .quality-badge.warning {
          background: #fef9c3;
          color: #b45309;
        }
        .quality-badge.need-attention {
          background: #fee2e2;
          color: #b91c1c;
        }
        .parameters-analysis-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-top: 18px;
        }
        .param-row {
          display: flex;
          align-items: center;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 8px rgba(30, 60, 90, 0.06);
          padding: 18px 24px;
          gap: 24px;
          border-left: 6px solid #e5e7eb;
          transition: border-color 0.2s, background 0.2s;
        }
        .param-main {
          flex: 1 1 200px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .param-name {
          font-size: 1.1rem;
          font-weight: 700;
          margin-right: 8px;
        }
        .param-type-badge {
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: 8px;
          padding: 2px 10px;
          background: #f1f5f9;
          color: #64748b;
          text-transform: capitalize;
        }
        .param-type-badge.event { background: #e0e7ff; color: #3730a3; }
        .param-type-badge.user { background: #fef9c3; color: #92400e; }
        .param-type-badge.item { background: #dcfce7; color: #065f46; }
        .param-bar-container {
          flex: 2 1 300px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .param-bar-bg {
          background: #e5e7eb;
          border-radius: 8px;
          width: 120px;
          height: 12px;
          overflow: hidden;
          margin-right: 8px;
        }
        .param-bar-fill {
          height: 100%;
          border-radius: 8px;
          transition: width 0.3s;
        }
        .param-bar-fill.critique { background: #ef4444; }
        .param-bar-fill.attention { background: #f59e42; }
        .param-bar-fill.warning { background: #fbbf24; }
        .param-bar-fill.bon { background: #10b981; }
        .param-bar-label {
          font-size: 0.98rem;
          color: #64748b;
          min-width: 90px;
        }
        .param-status-badge {
          font-size: 1rem;
          font-weight: 700;
          border-radius: 8px;
          padding: 4px 16px;
          text-transform: uppercase;
          margin-left: auto;
          color: #fff;
        }
        .param-status-badge.critique { background: #ef4444; }
        .param-status-badge.attention { background: #f59e42; color: #92400e; }
        .param-status-badge.warning { background: #fbbf24; color: #92400e; }
        .param-status-badge.bon { background: #10b981; }
        [data-theme="dark"] .main-content {
          background: #1d0a41;
          color: #E1D5F5;
        }
        [data-theme="dark"] .stat-card {
          background: #675191;
          color: #E1D5F5;
          box-shadow: 0 2px 12px rgba(30, 60, 90, 0.12);
          border-top-color: #7c3aed;
        }
        [data-theme="dark"] .stat-card.success { border-top-color: #22d3ee; }
        [data-theme="dark"] .stat-card.error { border-top-color: #f87171; }
        [data-theme="dark"] .stat-card.highlight { border-top-color: #818cf8; }
        [data-theme="dark"] .stat-card.info { border-top-color: #38bdf8; }
        [data-theme="dark"] .stat-card-title {
          color: #B39DDB;
          min-height: 50px;
        }
        [data-theme="dark"] .stat-card-value {
          color:rgb(255, 255, 255);
          font-size: 1.7rem;
          font-variant-numeric: tabular-nums;
        }
        [data-theme="dark"] .stat-card-sub {
          color: #a3a3c2;
        }
        [data-theme="dark"] .date-display-top {
          background: #231a3a;
          color: #E1D5F5;
          box-shadow: 0 2px 8px rgba(103, 58, 183, 0.15);
        }
        [data-theme="dark"] .section-header h2 {
          color: #fff !important;
          font-size: 1.35rem;
        }
        [data-theme="dark"] .event-stats-table-wrapper {
          background: #4c386f !important;
        }
        [data-theme="dark"] .event-stats-table {
          background: #634e8b;
        }
        [data-theme="dark"] .event-stats-table th {
          background: #634e8b;
          color: #fff;
          border-bottom: 2px solid #b09ed2;
        }
        [data-theme="dark"] .event-stats-table td {
          color: #fff;
        }
        [data-theme="dark"] .event-stats-table tbody tr.even-row {
          background: #b09ed2;
          color: #181028;
        }
        [data-theme="dark"] .event-stats-table tbody tr:hover {
          background: #b09ed2;
          color: #181028;
        }
        [data-theme="dark"] .event-stats-table .event-name {
          color: #fff;
        }
        [data-theme="dark"] .event-stats-table .number {
          color: #fff;
        }
        [data-theme="dark"] .quality-badge {
          background: #b09ed2;
          color: #181028;
        }
        [data-theme="dark"] .quality-badge.good {
          background: #134e4a;
          color: #5eead4;
        }
        [data-theme="dark"] .quality-badge.warning {
          background: #78350f;
          color: #fde68a;
        }
        [data-theme="dark"] .quality-badge.need-attention {
          background: #7f1d1d;
          color: #fecaca;
        }
        [data-theme="dark"] .parameters-analysis-list .param-row {
          background: #231a3a;
          color: #E1D5F5;
          box-shadow: 0 2px 8px rgba(103, 58, 183, 0.12);
          border-left-color: #7c3aed;
        }
        [data-theme="dark"] .param-type-badge {
          background: #2d204a;
          color: #B39DDB;
        }
        [data-theme="dark"] .param-bar-bg {
          background: #3b2c5a;
        }
        [data-theme="dark"] .param-bar-label {
          color: #B39DDB;
        }
        .mood-emoji.selected {
          background: #ede9fe !important;
          box-shadow: 0 2px 8px #b197d2 !important;
          transform: scale(1.18) !important;
        }
        .mood-emoji {
          transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .event-stats-table th.align-left {
          text-align: left;
        }
        .event-stats-table th.align-right {
          text-align: right;
        }
        [data-theme="dark"] .main-content h1 {
          color: #fff !important;
        }
        [data-theme="dark"] .main-content > div > div {
          color: #fff !important;
        }
        [data-theme="dark"] .main-content h2 {
          color: #fff !important;
        }
      `}</style>
    </div>
  );
}

export default MainContent;