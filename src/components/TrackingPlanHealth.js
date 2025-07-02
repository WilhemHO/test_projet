import React, { useEffect, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import '../CSS/TrackingPlanHealth.css';
import DateRangeDropdown from './DateRangeDropdown';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

// Fonction utilitaire pour formater les dates à la française
function formatDate(dateStr) {
  if (!dateStr || dateStr === 'null' || dateStr === 'undefined' || dateStr === '') return '-';
  try {
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

// Génère un tableau de dates (YYYY-MM-DD) entre start et end inclus
function getDateRangeArray(start, end) {
  const arr = [];
  let current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    arr.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return arr;
}

const TrackingPlanHealth = () => {
  const [eventErrors, setEventErrors] = useState([]);
  const [errorDetails, setErrorDetails] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!dateRange.start || !dateRange.end) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:4000/api/tracking?start=${dateRange.start}&end=${dateRange.end}`)
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des données');
        return res.json();
      })
      .then(data => {
        setEventErrors((data.data && data.data.trackingPlan) || []);
        setErrorDetails((data.data && data.data.eventsDetail) || []);
        setChartData((data.data && data.data.chartData) || []);
        setStats(data.data && data.data.stats);
        setPagination(data.data && data.data.pagination);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [dateRange, currentPage]);

  useEffect(() => {
    // Initialisation de la période par défaut (30 derniers jours)
    if (!dateRange.start || !dateRange.end) {
      const today = new Date();
      const end = today.toISOString().split('T')[0];
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
      const start = startDate.toISOString().split('T')[0];
      setDateRange({ start, end });
    }
  }, []);

  // Générer la liste complète des dates de la période sélectionnée
  const allDates = (dateRange.start && dateRange.end)
    ? getDateRangeArray(dateRange.start, dateRange.end)
    : [];
  // Fusionner avec les données chartData pour garantir chaque jour
  const chartDataByDate = Object.fromEntries(chartData.map(d => [d.date?.value, d]));
  const filledChartData = allDates.map(date =>
    chartDataByDate[date] || { date: { value: date }, total_events: 0, events_with_missing_params: 0, pct_events_with_missing_params: 0 }
  );

  // Calcul dynamique du maximum pour l'axe Y
  const maxTotalEvents = Math.max(...filledChartData.map(d => d.total_events));
  console.log('maxTotalEvents:', maxTotalEvents);

  const temporalChartData = {
    labels: filledChartData.map(d => d.date?.value),
    datasets: [
      {
        type: 'bar',
        label: 'Total events',
        data: filledChartData.map(d => d.total_events),
        backgroundColor: 'rgba(80, 70, 200, 0.6)',
        borderRadius: 6,
        yAxisID: 'y',
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
      {
        type: 'line',
        label: '% Events With missing Parameters',
        data: filledChartData.map(d => d.pct_events_with_missing_params),
        borderColor: '#b97be6',
        backgroundColor: '#b97be6',
        yAxisID: 'y1',
        tension: 0.3,
        fill: false,
        pointRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#b97be6',
        pointHoverRadius: 8,
        pointStyle: 'circle',
      }
    ]
  };

  const temporalChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#2d225a',
          font: { size: 18, family: 'inherit', weight: 'bold' }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            if (context.dataset.label === 'Total events') {
              return `Total events: ${context.parsed.y}`;
            } else {
              return `% Events With missing Parameters: ${context.parsed.y.toFixed(1)}%`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: false },
        ticks: {
          color: '#2d225a',
          font: { size: 14 },
          maxRotation: 45,
          minRotation: 45,
          callback: function(value, index, values) {
            const dateStr = filledChartData[index]?.date?.value;
            if (!dateStr || typeof dateStr !== 'string') return '';
            const parts = dateStr.split('-');
            if (parts.length === 3) {
              return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return String(dateStr);
          }
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: false },
        ticks: {
          color: '#2d225a',
          font: { size: 14 },
          callback: value => value >= 1000 ? `${value/1000}k` : value
        },
        grid: { color: '#eee' },
        suggestedMax: maxTotalEvents > 200000 ? Math.ceil(maxTotalEvents * 1.1 / 10000) * 10000 : undefined,
        max: maxTotalEvents > 200000 ? Math.ceil(maxTotalEvents * 1.1 / 10000) * 10000 : undefined,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: 100,
        title: { display: false },
        ticks: {
          color: '#b97be6',
          font: { size: 14 },
          callback: value => `${value}%`
        },
        grid: { drawOnChartArea: false }
      }
    }
  };

  if (loading) return <div>Chargement des données...</div>;
  if (error) return <div style={{color: 'red'}}>Erreur : {error}</div>;

  return (
    <div className="tracking-root">
      <header className="tracking-header">
        <h1>Tracking Plan Health</h1>
        <div className="tracking-date-dropdown">
          <DateRangeDropdown value={dateRange} onChange={setDateRange} />
        </div>
      </header>
      <div className="tracking-period">Période sélectionnée : {dateRange.start && dateRange.end ? `${dateRange.start} au ${dateRange.end}` : 'Aucune'}</div>
      {stats && (
        <div className="tracking-global-stats">
          <div>Types d'événements : <span>{stats.totalEventTypes}</span></div>
          <div>Taux d'erreur global : <span>{(stats.errorRate || 0).toLocaleString('fr-FR', {maximumFractionDigits: 1})}%</span></div>
        </div>
      )}
      <div className="tracking-row" style={{flexDirection: 'column', gap: '24px'}}>
        <div className="tracking-card tracking-status">
          <h2>Statut des événements</h2>
          <table className="tracking-table">
            <thead>
              <tr>
                <th>Nom de l'événement</th>
                <th>Statut</th>
                <th>Total événements</th>
                <th>Événements avec erreurs</th>
                <th>% Erreur</th>
                <th>Première erreur</th>
                <th>Dernière erreur</th>
              </tr>
            </thead>
            <tbody>
              {eventErrors.map((event, i) => (
                <tr key={i}>
                  <td>{event.expected_event_name}</td>
                  <td>
                    {event.status === 'OK' && <span className="status-ok">✔</span>}
                    {event.status === 'WARNING' && <span className="status-warning">⚠</span>}
                    {event.status === 'ERROR' && <span className="status-error">✖</span>}
                    <span className="status-label">{event.status}</span>
                  </td>
                  <td>{Number(event.total_events).toLocaleString('fr-FR')}</td>
                  <td>{Number(event.events_with_errors).toLocaleString('fr-FR')}</td>
                  <td>{Number(event.error_percentage).toLocaleString('fr-FR', {minimumFractionDigits: 1, maximumFractionDigits: 1})}%</td>
                  <td>{formatDate(event.first_error_date)}</td>
                  <td>{formatDate(event.last_error_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tracking-card tracking-analysis">
          <h2>Analyse des erreurs</h2>
          <div className="tracking-graph" style={{ height: '500px', maxHeight: '500px' }}>
            <Chart type='bar' data={temporalChartData} options={temporalChartOptions} />
          </div>
        </div>
      </div>
      <div className="tracking-card tracking-details">
        <h2>Détails des erreurs</h2>
        <div className="tracking-details-table-wrapper">
          <table className="tracking-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Événement</th>
                <th>Catégorie appareil</th>
                <th>OS</th>
                <th>Navigateur</th>
                <th>Session</th>
                <th>Missing user params</th>
                <th>Missing Item params</th>
                <th>Missing e-commerce params</th>
                <th>Missing event params</th>
                <th>Status</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              {errorDetails.map((err, i) => (
                <tr key={i}>
                  <td>{err.date && err.date.value}</td>
                  <td>{err.event_name}</td>
                  <td>{err.device_category}</td>
                  <td>{err.device_operating_system}</td>
                  <td>{err.device_browser}</td>
                  <td>{err.session_id}</td>
                  <td>{err.missing_user_params && err.missing_user_params.join(", ")}</td>
                  <td>{err.missing_item_params && err.missing_item_params.join(", ")}</td>
                  <td>{err.missing_ecommerce_params && err.missing_ecommerce_params.join(", ")}</td>
                  <td>{err.missing_event_params && err.missing_event_params.map(param => param.replace(/^Event:\s*/i, '')).join(", ")}</td>
                  <td className={`status-indicator ${err.is_event_with_missing_params === 'true' ? 'status-error' : 'status-ok'}`}>{err.is_event_with_missing_params === 'true' ? '✖ Erreur' : '✓ Valide'}</td>
                  <td><a href={err.page_location_value} target="_blank" rel="noreferrer">Voir</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination && (
          <div className="tracking-pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage}
            >
              Précédent
            </button>
            <span>
              Page {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!pagination.hasNextPage}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPlanHealth;