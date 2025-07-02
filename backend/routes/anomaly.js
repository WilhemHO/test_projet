const express = require('express');
const router = express.Router();
const { runQuery } = require('../services/bigquery');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const DATASET = process.env.BIGQUERY_DATASET;
const TABLE = 'rep__ga4_events_anomaly_reporting';

// Helper pour obtenir la plage de dates dynamiques
async function getAnomalyDateRange() {
  const query = `
    SELECT 
      MIN(event_date) as earliest_date,
      MAX(event_date) as latest_date
    FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
  `;
  const rows = await runQuery(query);
  return rows[0] || null;
}

router.get('/', async (req, res) => {
  try {
    // Paramètres de requête
    const startDate = req.query.start;
    const endDate = req.query.end;
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '20');
    const eventName = req.query.event;
    const offset = (page - 1) * pageSize;

    // Détermination du filtre de date
    let dateFilter;
    if (startDate && endDate) {
      dateFilter = `WHERE event_date BETWEEN '${startDate}' AND '${endDate}'`;
    } else {
      const anomalyDateRange = await getAnomalyDateRange();
      if (
        anomalyDateRange &&
        anomalyDateRange.earliest_date &&
        anomalyDateRange.latest_date
      ) {
        const earliest = typeof anomalyDateRange.earliest_date === 'object'
          ? anomalyDateRange.earliest_date.value || anomalyDateRange.earliest_date.toString()
          : anomalyDateRange.earliest_date;
        const latest = typeof anomalyDateRange.latest_date === 'object'
          ? anomalyDateRange.latest_date.value || anomalyDateRange.latest_date.toString()
          : anomalyDateRange.latest_date;
        dateFilter = `WHERE event_date BETWEEN '${earliest}' AND '${latest}'`;
      } else {
        dateFilter = `WHERE event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)`;
      }
    }

    // Filtre optionnel par event
    const eventFilter = eventName && eventName !== 'all'
      ? `AND event_name = '${eventName}'`
      : '';

    // Requête pour le count total
    const countQuery = `
      SELECT COUNT(*) as total_count
      FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
      ${dateFilter}
      ${eventFilter}
    `;

    // Requête pour les données paginées
    const dataQuery = `
      SELECT 
        FORMAT_DATE('%Y-%m-%d', event_date) as event_date,
        event_name,
        events_count,
        COALESCE(mad_score, 0.00) as mad_score,
        anomaly_flag,
        anomaly_info
      FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
      ${dateFilter}
      ${eventFilter}
      ORDER BY event_date DESC, event_name
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    // Requête pour les données du graphique (AGGREGATION)
    const chartQuery = `
      SELECT 
        FORMAT_DATE('%Y-%m-%d', event_date) as event_date,
        SUM(CAST(events_count AS INT64)) as total_events,
        SUM(CASE WHEN anomaly_flag = 'Anomaly' THEN CAST(events_count AS INT64) ELSE 0 END) as anomaly_events
      FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
      ${dateFilter}
      ${eventFilter}
      GROUP BY event_date
      ORDER BY event_date
    `;

    // Requête pour la liste des événements uniques
    const eventsListQuery = `
      SELECT DISTINCT event_name
      FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
      ${dateFilter}
      ORDER BY event_name
    `;

    // Requête pour les statistiques
    const statsQuery = `
      SELECT 
        COUNT(*) as total_events,
        SUM(CASE WHEN anomaly_flag = 'Normal' THEN 1 ELSE 0 END) as normal_events,
        SUM(CASE WHEN anomaly_flag = 'Anomaly' THEN 1 ELSE 0 END) as anomaly_events,
        SUM(CASE WHEN anomaly_flag = 'Warning' THEN 1 ELSE 0 END) as warning_events,
        COUNT(DISTINCT event_name) as unique_event_types
      FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
      ${dateFilter}
      ${eventFilter}
    `;

    // Si pagination demandée
    if (req.query.page || req.query.pageSize) {
      // Exécuter toutes les requêtes en parallèle
      const [countResult, dataResult, chartResult, eventsResult, statsResult] = await Promise.all([
        runQuery(countQuery),
        runQuery(dataQuery),
        runQuery(chartQuery),
        runQuery(eventsListQuery),
        runQuery(statsQuery)
      ]);

      const totalCount = countResult[0]?.total_count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      // Statistiques
      const statsData = statsResult[0] || {};
      const stats = {
        totalEvents: statsData.total_events || 0,
        normalEvents: statsData.normal_events || 0,
        totalAnomalies: statsData.anomaly_events || 0,
        warningEvents: statsData.warning_events || 0,
        uniqueEventTypes: statsData.unique_event_types || 0
      };

      res.json({
        success: true,
        data: {
          events: dataResult,
          chartData: chartResult,
          availableEvents: eventsResult.map(e => e.event_name),
          stats,
          pagination: {
            currentPage: page,
            pageSize,
            totalItems: parseInt(totalCount),
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        },
        lastUpdated: new Date().toISOString()
      });
    } else {
      // Mode compatibilité : retourne tous les événements (jusqu'à 1000) + stats
      const allQuery = `
        SELECT 
          FORMAT_DATE('%Y-%m-%d', event_date) as event_date,
          event_name,
          events_count,
          median_value,
          mad_value,
          COALESCE(mad_score, 0.00) as mad_score,
          anomaly_flag,
          anomaly_info
        FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
        ${dateFilter}
        ${eventFilter}
        ORDER BY event_date DESC, event_name
        LIMIT 1000
      `;
      const statsQuery = `
        SELECT 
          COUNT(*) as total_events,
          SUM(CASE WHEN anomaly_flag = 'Normal' THEN 1 ELSE 0 END) as normal_events,
          SUM(CASE WHEN anomaly_flag = 'Anomaly' THEN 1 ELSE 0 END) as anomaly_events,
          SUM(CASE WHEN anomaly_flag = 'Warning' THEN 1 ELSE 0 END) as warning_events,
          COUNT(DISTINCT event_name) as unique_event_types
        FROM \`${PROJECT_ID}.${DATASET}.${TABLE}\`
        ${dateFilter}
        ${eventFilter}
      `;
      const [allEvents, statsResult] = await Promise.all([
        runQuery(allQuery),
        runQuery(statsQuery)
      ]);
      const statsData = statsResult[0] || {};
      const stats = {
        totalEvents: statsData.total_events || 0,
        normalEvents: statsData.normal_events || 0,
        totalAnomalies: statsData.anomaly_events || 0,
        warningEvents: statsData.warning_events || 0,
        uniqueEventTypes: statsData.unique_event_types || 0
      };
      res.json({
        success: true,
        data: {
          events: allEvents,
          stats,
          lastUpdated: new Date().toISOString()
        }
      });
      return;
    }
  } catch (error) {
    console.error('Anomaly API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch anomaly data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

module.exports = router; 