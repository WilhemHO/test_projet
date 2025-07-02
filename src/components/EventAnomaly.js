import React, { useEffect, useState } from "react";
import "../CSS/EventAnomaly.css";
import DateRangeDropdown from "./DateRangeDropdown";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PAGE_SIZE = 10;

function getDefaultRange() {
  const today = new Date();
  const end = today.toISOString().split('T')[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const start = startDate.toISOString().split('T')[0];
  return { start, end };
}

const EventAnomaly = () => {
  const [anomalyData, setAnomalyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ totalEvents: 0, normalEvents: 0, totalAnomalies: 0, uniqueEventTypes: 0 });
  const [range, setRange] = useState(getDefaultRange());
  const [madOpen, setMadOpen] = useState(false);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: PAGE_SIZE.toString(),
      start: range.start,
      end: range.end,
      event: selectedEvent
    });
    fetch(`http://localhost:4000/api/anomaly?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        setAnomalyData(json.data?.events || []);
        setTotalPages(json.data?.pagination?.totalPages || 1);
        setStats(json.data?.stats || { totalEvents: 0, normalEvents: 0, totalAnomalies: 0, uniqueEventTypes: 0 });
        setAvailableEvents(json.data?.availableEvents || []);
        setChartData(json.data?.chartData || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des anomalies");
        setLoading(false);
      });
  }, [page, range, selectedEvent]);

  if (loading) return <div>Chargement des anomalies...</div>;
  if (error) return <div>{error}</div>;

  // Calcul pourcentage
  const normalPercent = stats.totalEvents ? ((stats.normalEvents / stats.totalEvents) * 100).toFixed(2) : 0;
  const anomalyPercent = stats.totalEvents ? ((stats.totalAnomalies / stats.totalEvents) * 100).toFixed(2) : 0;

  return (
    <div className="dashboard-container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24
      }}>
        <h1 style={{ margin: 0 }}>Rapport / Event Anomaly</h1>
        <DateRangeDropdown value={range} onChange={r => { setRange(r); setPage(1); }} />
      </div>
      
      {/* Section Description */}
      <div className="section" style={{ padding: 0, background: '#f4f0fc' }}>
        <div
          onClick={() => setMadOpen(o => !o)}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '24px',
            userSelect: 'none',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0, color: '#311b92' }}>Détection d'anomalies par le score MAD</h2>
          <span
            style={{
              display: 'inline-block',
              transition: 'transform 0.2s',
              transform: madOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              color: '#4b2996',
              fontSize: 20,
              marginLeft: 8,
            }}
          >
            ▼
          </span>
        </div>
        <div className={`mad-accordion-content${madOpen ? ' open' : ''}`}>
          <p style={{ marginTop: 0 }}>
            Le score MAD (Médiane des Écarts Absolus) est une méthode statistique robuste pour identifier les anomalies dans les données, 
            calculée en trouvant d'abord la médiane de l'ensemble de données, puis en déterminant la médiane des écarts absolus entre 
            chaque point et cette médiane centrale. Ce qui permet d'utiliser de calculer un score 2 modifié (0,6745 * valeur - médiane / MAD) 
            pour chaque observation, où les valeurs dépassent un seuil prédéfini (généralement 3,0 ou 3,5) sont considérées comme des anomalies; 
            cette approche présente l'avantage majeur d'être moins sensible aux valeurs extrêmes que les méthodes basées sur la moyenne et 
            l'écart-type, le rendant particulièrement efficace pour des distributions non normales ou des ensembles de données contenant déjà 
            des valeurs aberrantes.
          </p>
        </div>
      </div>
      
      {/* Section Anomaly Detection */}
      <div className="section">
        <h2>Anomaly Detection</h2>
        <div className="metrics-grid">
          <div className="metric-card" style={{ background: '#f4f6ff' }}>
            <div style={{ fontWeight: 'bold', color: '#4b2996', marginBottom: 8 }}>ÉVÉNEMENTS ANALYSÉS</div>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#4b2996' }}>{stats.totalEvents}</div>
          </div>
          <div className="metric-card" style={{ background: '#f4f6ff' }}>
            <div style={{ fontWeight: 'bold', color: '#4b2996', marginBottom: 8 }}>ÉVÉNEMENTS NORMAUX</div>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#4b2996' }}>{stats.normalEvents}</div>
            <div style={{ color: '#4b2996', fontSize: 14 }}>{normalPercent}% du total</div>
          </div>
          <div className="metric-card" style={{ background: '#f4f6ff' }}>
            <div style={{ fontWeight: 'bold', color: '#4b2996', marginBottom: 8 }}>ANOMALIES DÉTECTÉES</div>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#4b2996' }}>{stats.totalAnomalies}</div>
            <div style={{ color: '#4b2996', fontSize: 14 }}>{anomalyPercent}% du total</div>
          </div>
          <div className="metric-card" style={{ background: '#f8f4ff' }}>
            <div style={{ fontWeight: 'bold', color: '#4b2996', marginBottom: 8 }}>TYPES D'ÉVÉNEMENTS</div>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#4b2996' }}>{stats.uniqueEventTypes}</div>
          </div>
        </div>
      </div>

      {/* Section Graphique des anomalies */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Évolution temporelle des événements et anomalies détectées</h2>
          <div>
            <select
              value={selectedEvent}
              onChange={e => { setSelectedEvent(e.target.value); setPage(1); }}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1.5px solid #e5e7eb',
                fontWeight: 600,
                background: '#f8fafc',
                color: '#4c2885',
                minWidth: 180
              }}
            >
              <option value="all">Tous les événements</option>
              {availableEvents.map(ev => (
                <option key={ev} value={ev}>{ev}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ height: 400, width: '100%' }}>
          <Line
            data={{
              labels: chartData.map(row => row.event_date),
              datasets: [
                {
                  label: "Event Count",
                  data: chartData.map(row => row.total_events),
                  borderColor: '#a78bfa',
                  backgroundColor: 'rgba(167, 139, 250, 0.15)',
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: '#a78bfa',
                  pointRadius: 5,
                },
                {
                  label: 'Anomaly Info',
                  data: chartData.map(row => row.anomaly_events),
                  borderColor: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.10)',
                  borderDash: [6, 6],
                  pointBackgroundColor: '#ef4444',
                  pointRadius: 6,
                  fill: false,
                  spanGaps: true,
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' },
                title: { display: false },
                tooltip: { mode: 'index', intersect: false }
              },
              interaction: { mode: 'nearest', axis: 'x', intersect: false },
              scales: {
                x: { title: { display: false } },
                y: { title: { display: false }, beginAtZero: true }
              }
            }}
          />
        </div>
      </div>
      
      {/* Section Tableau des anomalies */}
      <div className="section">
        <h2>Détails des anomalies</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Event Name</th>
              <th>Nombre d'événements</th>
              <th>MAD Score</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {anomalyData.map((row, index) => (
              <tr key={index}>
                <td>{row.event_date}</td>
                <td>{row.event_name}</td>
                <td>{row.events_count}</td>
                <td>{row.mad_score}</td>
                <td>{row.anomaly_flag}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination-controls">
          <button onClick={() => setPage(page - 1)} disabled={page === 1}>
            Précédent
          </button>
          <span style={{ margin: '0 10px' }}>
            Page {page} / {totalPages}
          </span>
          <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventAnomaly;