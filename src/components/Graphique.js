import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Enregistrer les composants nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Graphique = () => {
  // État pour le type de graphique sélectionné
  const [chartType, setChartType] = useState('bar');
  
  // Données exemple
  const [chartData, setChartData] = useState({
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Ventes 2023',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: [
          'rgba(97, 15, 205, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: [
          'rgba(97, 15, 205, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }
      
    ]
  });

  // Options de configuration du graphique
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Désactive le maintien du ratio d'aspect
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Visualisation des Données',
        font: {
          size: 16
        }
      },
    },
  };

  // Fonction pour afficher le bon type de graphique
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      options: chartOptions
    };

    switch(chartType) {
      case 'bar':
        return <Bar {...commonProps} />;
      case 'pie':
        return <Pie {...commonProps} />;
      case 'line':
        return <Line {...commonProps} />;
      default:
        return <Bar {...commonProps} />;
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-controls">
        <h2>Visualisation des Données</h2>
        
        <div className="chart-type-selector">
          <label>Sélectionnez le type de graphique : </label>
          <select 
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="bar">Barres</option>
            <option value="pie">Camembert</option>
            <option value="line">Lignes</option>
          </select>
        </div>
      </div>

      <div className="chart-wrapper">
        {renderChart()}
      </div>

      <style jsx>{`
        .chart-container {
          width: 100%;
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .chart-controls {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .chart-type-selector {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .chart-type-selector select {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #ddd;
          background: white;
        }
        
        .chart-wrapper {
          height: 400px;
          position: relative;
          width: 100%;
        }
        
        .chart-wrapper canvas {
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default Graphique;