const express = require('express');
const router = express.Router();
const { runQuery } = require('../services/bigquery');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const DATASET = process.env.BIGQUERY_DATASET;

// Endpoint pour récupérer les métriques temps réel
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();

    let dateFilter;
    let dataSource;

    if (currentHour < 12) {
      // MATIN : J-1 + J (Cumulé)
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const todayStr = now.toISOString().split('T')[0];
      dateFilter = `DATE(event_timestamp, 'Europe/Paris') IN ('${yesterdayStr}', '${todayStr}')`;
      dataSource = 'J-1 + J (Cumulé)';
    } else {
      // APRÈS-MIDI : J uniquement
      const todayStr = now.toISOString().split('T')[0];
      dateFilter = `DATE(event_timestamp, 'Europe/Paris') = '${todayStr}'`;
      dataSource = "J (Aujourd'hui)";
    }

    // Requête pour les métriques principales
    const metricsQuery = `
      WITH deduplicated_events AS (
        SELECT DISTINCT
          primary_key,
          event_name,
          CAST(is_event_with_missing_params AS STRING) as status,
          page_location_value
        FROM 
          \
${PROJECT_ID}.${DATASET}.rep__ga4_realtime_events_params_health
        WHERE ${dateFilter}
      )
      SELECT 
        COUNT(DISTINCT primary_key) as total_hits,
        COUNT(DISTINCT CASE WHEN status = 'false' THEN primary_key END) as good_hits,
        COUNT(DISTINCT CASE WHEN status = 'true' THEN primary_key END) as error_hits
      FROM deduplicated_events
    `;

    // Requête pour les statistiques par événement
    const eventStatsQuery = `
      WITH deduplicated_events AS (
        SELECT DISTINCT
          primary_key,
          event_name,
          CAST(is_event_with_missing_params AS STRING) as status
        FROM 
${PROJECT_ID}.${DATASET}.rep__ga4_realtime_events_params_health
        WHERE ${dateFilter}
      )
      SELECT 
        event_name,
        COUNT(DISTINCT primary_key) as hits,
        COUNT(DISTINCT CASE WHEN status = 'true' THEN primary_key END) as errors,
        SAFE_DIVIDE(COUNT(DISTINCT CASE WHEN status = 'true' THEN primary_key END), COUNT(DISTINCT primary_key)) * 100 as error_percentage
      FROM deduplicated_events
      GROUP BY event_name
      ORDER BY hits DESC
      LIMIT 10
    `;

    // Requête pour les statistiques par page
    const pageStatsQuery = `
      WITH deduplicated_events AS (
        SELECT DISTINCT
          primary_key,
          page_location_value,
          CAST(is_event_with_missing_params AS STRING) as status
        FROM 
${PROJECT_ID}.${DATASET}.rep__ga4_realtime_events_params_health
        WHERE ${dateFilter}
      )
      SELECT 
        page_location_value,
        COUNT(DISTINCT primary_key) as hits,
        COUNT(DISTINCT CASE WHEN status = 'true' THEN primary_key END) as errors,
        SAFE_DIVIDE(COUNT(DISTINCT CASE WHEN status = 'true' THEN primary_key END), COUNT(DISTINCT primary_key)) * 100 as error_percentage
      FROM deduplicated_events
      GROUP BY page_location_value
      HAVING COUNT(DISTINCT CASE WHEN status = 'true' THEN primary_key END) > 0
      ORDER BY error_percentage DESC
      LIMIT 10
    `;

    // Event Params
    const eventParamsQuery = `
      WITH deduplicated_events AS (
        SELECT DISTINCT
          primary_key,
          event_params_list_expected
        FROM 
${PROJECT_ID}.${DATASET}.rep__ga4_realtime_events_params_health
        WHERE ${dateFilter}
          AND event_params_list_expected IS NOT NULL
          AND ARRAY_LENGTH(event_params_list_expected) > 0
      ),
      flattened_params AS (
        SELECT 
          primary_key,
          param.event_param_key as param_key,
          CAST(param.is_missing AS INT64) as is_missing
        FROM deduplicated_events,
        UNNEST(event_params_list_expected) as param
        WHERE param.event_param_key IS NOT NULL
      )
      SELECT 
        param_key,
        COUNT(DISTINCT primary_key) as total_occurrences,
        COUNT(DISTINCT CASE WHEN is_missing = 1 THEN primary_key END) as missing_count,
        SAFE_DIVIDE(COUNT(DISTINCT CASE WHEN is_missing = 1 THEN primary_key END), COUNT(DISTINCT primary_key)) * 100 as missing_percentage
      FROM flattened_params
      GROUP BY param_key
      ORDER BY missing_percentage DESC, total_occurrences DESC
      LIMIT 10
    `;

    // User Params
    const userParamsQuery = `
      WITH deduplicated_events AS (
        SELECT DISTINCT
          primary_key,
          missing_user_params
        FROM 
${PROJECT_ID}.${DATASET}.rep__ga4_realtime_events_params_health
        WHERE ${dateFilter}
          AND missing_user_params IS NOT NULL
          AND ARRAY_LENGTH(missing_user_params) > 0
      ),
      flattened_missing AS (
        SELECT 
          primary_key,
          param as param_key
        FROM deduplicated_events,
        UNNEST(missing_user_params) as param
        WHERE param IS NOT NULL AND param != ''
      )
      SELECT 
        param_key,
        COUNT(DISTINCT primary_key) as total_occurrences,
        COUNT(DISTINCT primary_key) as missing_count,
        100.0 as missing_percentage
      FROM flattened_missing
      GROUP BY param_key
      ORDER BY total_occurrences DESC
      LIMIT 10
    `;

    // Item Params
    const itemParamsQuery = `
      WITH deduplicated_events AS (
        SELECT DISTINCT
          primary_key,
          item_params_list_expected
        FROM 
${PROJECT_ID}.${DATASET}.rep__ga4_realtime_events_params_health
        WHERE ${dateFilter}
          AND item_params_list_expected IS NOT NULL
          AND ARRAY_LENGTH(item_params_list_expected) > 0
      ),
      flattened_params AS (
        SELECT 
          primary_key,
          param.item_param_key as param_key,
          CAST(param.is_missing AS INT64) as is_missing
        FROM deduplicated_events,
        UNNEST(item_params_list_expected) as param
        WHERE param.item_param_key IS NOT NULL
      )
      SELECT 
        param_key,
        COUNT(DISTINCT primary_key) as total_occurrences,
        COUNT(DISTINCT CASE WHEN is_missing = 1 THEN primary_key END) as missing_count,
        SAFE_DIVIDE(COUNT(DISTINCT CASE WHEN is_missing = 1 THEN primary_key END), COUNT(DISTINCT primary_key)) * 100 as missing_percentage
      FROM flattened_params
      GROUP BY param_key
      ORDER BY missing_percentage DESC, total_occurrences DESC
      LIMIT 10
    `;

    // Exécuter toutes les requêtes en parallèle
    const [metrics, eventStats, pageStats, eventParamsStats, userParamsStats, itemParamsStats] = await Promise.all([
      runQuery(metricsQuery),
      runQuery(eventStatsQuery),
      runQuery(pageStatsQuery),
      runQuery(eventParamsQuery),
      runQuery(userParamsQuery),
      runQuery(itemParamsQuery)
    ]);

    res.json({
      success: true,
      data: {
        metrics: metrics[0] || { total_hits: 0, good_hits: 0, error_hits: 0 },
        eventStats: eventStats || [],
        pageStats: pageStats || [],
        eventParamsStats: eventParamsStats || [],
        userParamsStats: userParamsStats || [],
        itemParamsStats: itemParamsStats || []
      },
      lastUpdated: new Date().toISOString(),
      dataSource,
      currentHour
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données temps réel', details: error.message });
  }
});

module.exports = router; 