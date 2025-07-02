const express = require('express');
const router = express.Router();
const { runQuery } = require('../services/bigquery');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const DATASET = process.env.BIGQUERY_DATASET;

// Endpoint pour dashboard : métriques globales + stats par événement
router.get('/', async (req, res) => {
  try {
    // Récupérer les paramètres de date depuis la requête, ou valeurs par défaut
    const { start, end } = req.query;
    // Sécurité : fallback sur 30 derniers jours si non fourni
    let dateFilter;
    if (start && end) {
      dateFilter = `date >= '${start}' AND date <= '${end}'`;
    } else {
      dateFilter = `date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)`;
    }

    // Requête pour les métriques globales
    const metricsQuery = `
      WITH deduplicated_events AS (
        SELECT DISTINCT
          primary_key,
          CAST(is_event_with_missing_params AS STRING) as status,
          user_pseudo_id,
          date
        FROM \
          \`${PROJECT_ID}.${DATASET}.rep__ga4_history_events_params\`
        WHERE ${dateFilter}
      ),
      event_stats AS (
        SELECT 
          COUNT(DISTINCT primary_key) as total_events,
          COUNT(DISTINCT CASE WHEN status = 'false' THEN primary_key END) as good_events,
          COUNT(DISTINCT CASE WHEN status = 'true' THEN primary_key END) as error_events,
          COUNT(DISTINCT user_pseudo_id) as unique_users,
          MIN(date) as min_date,
          MAX(date) as max_date
        FROM deduplicated_events
      )
      SELECT 
        total_events,
        good_events,
        error_events,
        unique_users,
        min_date,
        max_date,
        SAFE_DIVIDE(error_events, total_events) * 100 as error_rate
      FROM event_stats
    `;

    // Requête pour les stats par événement
    const eventStatsQuery = `
      WITH deduplicated_events AS (
        SELECT DISTINCT
          primary_key,
          event_name,
          CAST(is_event_with_missing_params AS STRING) as status
        FROM \
          \`${PROJECT_ID}.${DATASET}.rep__ga4_history_events_params\`
        WHERE ${dateFilter}
      )
      SELECT 
        event_name,
        COUNT(DISTINCT primary_key) as hits,
        COUNT(DISTINCT CASE WHEN status = 'true' THEN primary_key END) as hits_with_errors,
        SAFE_DIVIDE(COUNT(DISTINCT CASE WHEN status = 'true' THEN primary_key END), COUNT(DISTINCT primary_key)) * 100 as error_percentage,
        CASE 
          WHEN SAFE_DIVIDE(COUNT(DISTINCT CASE WHEN status = 'true' THEN primary_key END), COUNT(DISTINCT primary_key)) = 0 THEN 'Good'
          WHEN SAFE_DIVIDE(COUNT(DISTINCT CASE WHEN status = 'true' THEN primary_key END), COUNT(DISTINCT primary_key)) < 0.1 THEN 'Warning'
          ELSE 'Need Attention'
        END as data_quality
      FROM deduplicated_events
      GROUP BY event_name
      ORDER BY hits DESC
      LIMIT 50
    `;

    // Ajout de l'analyse des paramètres
    const parametersAnalysisQuery = `
      WITH all_missing_params AS (
        SELECT 
          param as param_name,
          'event' as param_type,
          COUNT(DISTINCT primary_key) as missing_occurrences
        FROM \`${PROJECT_ID}.${DATASET}.rep__ga4_history_events_params\`,
        UNNEST(missing_event_params) as param
        WHERE ${dateFilter}
          AND param IS NOT NULL 
          AND param != ''
        GROUP BY param
        UNION ALL
        SELECT 
          param as param_name,
          'user' as param_type,
          COUNT(DISTINCT primary_key) as missing_occurrences
        FROM \`${PROJECT_ID}.${DATASET}.rep__ga4_history_events_params\`,
        UNNEST(missing_user_params) as param
        WHERE ${dateFilter}
          AND param IS NOT NULL 
          AND param != ''
        GROUP BY param
        UNION ALL
        SELECT 
          param as param_name,
          'item' as param_type,
          COUNT(DISTINCT primary_key) as missing_occurrences
        FROM \`${PROJECT_ID}.${DATASET}.rep__ga4_history_events_params\`,
        UNNEST(missing_item_params) as param
        WHERE ${dateFilter}
          AND param IS NOT NULL 
          AND param != ''
        GROUP BY param
      ),
      total_events AS (
        SELECT COUNT(DISTINCT primary_key) as total_count
        FROM \`${PROJECT_ID}.${DATASET}.rep__ga4_history_events_params\`
        WHERE ${dateFilter}
      )
      SELECT 
        param_name,
        param_type,
        missing_occurrences as events_with_missing_param,
        total_count as total_events,
        SAFE_DIVIDE(missing_occurrences, total_count) * 100 as missing_percentage,
        CASE 
          WHEN SAFE_DIVIDE(missing_occurrences, total_count) * 100 >= 50 THEN 'Critique'
          WHEN SAFE_DIVIDE(missing_occurrences, total_count) * 100 >= 10 THEN 'Attention' 
          WHEN SAFE_DIVIDE(missing_occurrences, total_count) * 100 > 0 THEN 'Warning'
          ELSE 'Bon'
        END as status
      FROM all_missing_params
      CROSS JOIN total_events
      ORDER BY missing_occurrences DESC
      LIMIT 5;
    `;

    const [metrics, eventStats, parametersAnalysis] = await Promise.all([
      runQuery(metricsQuery),
      runQuery(eventStatsQuery),
      runQuery(parametersAnalysisQuery)
    ]);

    res.json({
      metrics: metrics[0] || {},
      eventStats: eventStats || [],
      parametersAnalysis: parametersAnalysis || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données du dashboard' });
  }
});

module.exports = router; 