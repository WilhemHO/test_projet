import React from "react";
import "../CSS/EventAnomaly.css";

const EventAnomaly = () => {
  // Données du rapport
  const anomalyData = [
    { date: "Jun 15, 2025", plan: "Normal", eventCount: 467641, anomalyInfo: "-" },
    { date: "Jun 14, 2025", plan: "Normal", eventCount: 589626, anomalyInfo: "-" },
    { date: "Jun 13, 2025", plan: "Normal", eventCount: 547968, anomalyInfo: "-" },
    { date: "Jun 12, 2025", plan: "Normal", eventCount: 283529, anomalyInfo: "-" },
    { date: "Jun 11, 2025", plan: "Normal", eventCount: 352169, anomalyInfo: "-" },
    { date: "Jun 10, 2025", plan: "Normal", eventCount: 344232, anomalyInfo: "-" },
    { date: "Jun 9, 2025", plan: "Normal", eventCount: 339742, anomalyInfo: "-" },
    { date: "Jun 8, 2025", plan: "Normal", eventCount: 362449, anomalyInfo: "-" },
    { date: "Jun 7, 2025", plan: "Anomaly", eventCount: 2485, anomalyInfo: "2,485" },
    { date: "Jun 7, 2025", plan: "Normal", eventCount: 367439, anomalyInfo: "-" },
    { date: "Jun 6, 2025", plan: "Anomaly", eventCount: 6, anomalyInfo: "6" },
    { date: "Jun 6, 2025", plan: "Normal", eventCount: 255065, anomalyInfo: "-" },
    { date: "Jun 5, 2025", plan: "Anomaly", eventCount: 18141, anomalyInfo: "18,141" },
    { date: "Jun 5, 2025", plan: "Normal", eventCount: 184603, anomalyInfo: "-" },
    { date: "Jun 4, 2025", plan: "Normal", eventCount: 206792, anomalyInfo: "-" },
    { date: "Jun 3, 2025", plan: "Normal", eventCount: 190964, anomalyInfo: "-" }
  ];

  return (
    <div className="dashboard-container">
      <h1>Rapport / Event Anomaly</h1>
      
      {/* Section Description */}
      <div className="section">
        <h2>Détection d'anomalies par le score MAD</h2>
        <p>
          Le score MAD (Médiane des Écarts Absolus) est une méthode statistique robuste pour identifier les anomalies dans les données, 
          calculée en trouvant d'abord la médiane de l'ensemble de données, puis en déterminant la médiane des écarts absolus entre 
          chaque point et cette médiane centrale. Ce qui permet d'utiliser de calculer un score 2 modifié (0,6745 * valeur - médiane / MAD) 
          pour chaque observation, où les valeurs dépassent un seuil prédéfini (généralement 3,0 ou 3,5) sont considérées comme des anomalies; 
          cette approche présente l'avantage majeur d'être moins sensible aux valeurs extrêmes que les méthodes basées sur la moyenne et 
          l'écart-type, le rendant particulièrement efficace pour des distributions non normales ou des ensembles de données contenant déjà 
          des valeurs aberrantes.
        </p>
      </div>
      
      {/* Section Anomaly Detection */}
      <div className="section">
        <h2>Anomaly Detection</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Event Count</h3>
            <p>16 jours analysés</p>
          </div>
          <div className="metric-card">
            <h3>Anomaly Info</h3>
            <p>3 anomalies détectées</p>
          </div>
        </div>
      </div>
      
      {/* Section Tableau des anomalies */}
      <div className="section">
        <h2>Détails des anomalies</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Anomaly Plan</th>
              <th>Event Count</th>
              <th>Anomaly Info</th>
            </tr>
          </thead>
          <tbody>
            {anomalyData.map((row, index) => (
              <tr key={index}>
                <td>{row.date}</td>
                <td className={`quality-${row.plan.toLowerCase()}`}>
                  {row.plan}
                </td>
                <td>{row.eventCount.toLocaleString()}</td>
                <td>{row.anomalyInfo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventAnomaly;