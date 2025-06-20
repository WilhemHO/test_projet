import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../CSS/TrackingPlanHealth.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TrackingPlanHealth = () => {
  // Données des événements
  const eventErrors = [
    { name: "view_item_list", from: "Jun 10, 2025", to: "Jun 15, 2025", errorCount: 45 },
    { name: "page_view", from: "Jun 10, 2025", to: "Jun 15, 2025", errorCount: 32 },
    { name: "view_item", from: "Jun 10, 2025", to: "Jun 15, 2025", errorCount: 28 },
    { name: "purchase", from: "Jun 10, 2025", to: "Jun 15, 2025", errorCount: 12 },
    { name: "add_to_cart", from: "Jun 10, 2025", to: "Jun 15, 2025", errorCount: 18 },
    { name: "begin_checkout", from: "Jun 10, 2025", to: "Jun 15, 2025", errorCount: 8 },
    { name: "login", from: "Jun 10, 2025", to: "Jun 15, 2025", errorCount: 5 },
  ];

  // Données des erreurs
  const errorDetails = [
    {
      timestamp: "Jun 13, 2025, 11:17",
      device: "mobile",
      os: "iOS",
      browser: "Safari",
      session: "1347720020.1749",
      event: "add_to_cart",
      missingParams: ["page_type_level2"],
      status: false,
      url: "https://www.example.com"
    },
    {
      timestamp: "Jun 12, 2025, 14:22",
      device: "desktop",
      os: "Windows",
      browser: "Chrome",
      session: "1347715023.9821",
      event: "purchase",
      missingParams: ["customer_id"],
      status: false,
      url: "https://www.example.com/checkout"
    }
  ];

  // Configuration du graphique
  const chartData = {
    labels: eventErrors.map(event => event.name),
    datasets: [{
      label: 'Erreurs de tracking',
      data: eventErrors.map(event => event.errorCount),
      backgroundColor: '#e74c3c',
      borderColor: '#c0392b',
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Erreurs par événement (10-15 Jun 2025)',
        font: { size: 14 }
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Nombre d\'erreurs' } },
      x: { title: { display: true, text: 'Événements' } }
    }
  };

  return (
    <div className="tracking-container">
      <header className="tracking-header">
        <h1>Tracking Plan Health</h1>
      </header>

      <section className="tracking-overview">
        <div className="tracking-section">
          <h2>Statut des événements</h2>
          <table className="tracking-table">
            <thead>
              <tr>
                <th>Événement</th>
                <th>Statut</th>
                <th>Première erreur</th>
                <th>Dernière erreur</th>
              </tr>
            </thead>
            <tbody>
              {eventErrors.map((event, i) => (
                <tr key={i}>
                  <td>{event.name}</td>
                  <td className="status-indicator status-error">✖ Erreurs</td>
                  <td>{event.from}</td>
                  <td>{event.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tracking-section">
          <h2>Analyse des erreurs</h2>
          <div className="tracking-graph">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </section>

      <section className="tracking-section">
        <h2>Détails des erreurs</h2>
        <table className="tracking-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Appareil</th>
              <th>OS</th>
              <th>Navigateur</th>
              <th>Session</th>
              <th>Événement</th>
              <th>Paramètres manquants</th>
              <th>Statut</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            {errorDetails.map((err, i) => (
              <tr key={i}>
                <td>{err.timestamp}</td>
                <td>{err.device}</td>
                <td>{err.os}</td>
                <td>{err.browser}</td>
                <td>{err.session}</td>
                <td>{err.event}</td>
                <td>{err.missingParams.join(", ")}</td>
                <td className={`status-indicator ${err.status ? "status-ok" : "status-error"}`}>
                  {err.status ? "✓ Valide" : "✖ Erreur"}
                </td>
                <td><a href={err.url} target="_blank" rel="noreferrer">Voir</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default TrackingPlanHealth;