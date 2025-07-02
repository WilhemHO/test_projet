const express = require('express');
const router = express.Router();
const { runQuery } = require('../services/bigquery');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const DATASET = process.env.BIGQUERY_DATASET || 'tracking_health';

// GET /tracking
router.get('/', async (req, res) => {
  try {
    const startDate = req.query.start;
    const endDate = req.query.end;
    const eventName = req.query.event;
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '10');
    const offset = (page - 1) * pageSize;

    // Date range par défaut : 30 derniers jours
    const dateFilter = startDate && endDate
      ? `WHERE date BETWEEN '${startDate}' AND '${endDate}'`
      : `WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)`;

    // Filtre optionnel par événement
    const eventFilter = eventName && eventName !== 'all'
      ? `AND expected_event_name = '${eventName}'`
      : '';

    // Requête pour obtenir les événements attendus avec leur statut
    const trackingPlanQuery = `
      WITH deduplicated_events AS (
        SELECT DISTINCT
          primary_key,
          expected_event_name,
          event_name,
          date,
          CAST(is_event_with_missing_params AS STRING) as has_missing_params,
          CAST(is_missing_event_in_ga4 AS STRING) as missing_in_ga4
        FROM \
          \`${PROJECT_ID}.${DATASET}.rep__ga4_history_events_params\`
        ${dateFilter}
        ${eventFilter}
      ),
      event_summary AS (
        SELECT 
          expected_event_name,
          COUNT(DISTINCT primary_key) as total_events,
          COUNT(DISTINCT CASE WHEN has_missing_params = 'true' THEN primary_key END) as events_with_errors,
          COUNT(DISTINCT CASE WHEN missing_in_ga4 = 'true' THEN primary_key END) as missing_events_in_ga4,
          FORMAT_DATE('%Y-%m-%d', MIN(date)) as first_date,
          FORMAT_DATE('%Y-%m-%d', MAX(date)) as last_date,
          FORMAT_DATE('%Y-%m-%d', MIN(CASE WHEN has_missing_params = 'true' THEN date END)) as first_error_date,
          FORMAT_DATE('%Y-%m-%d', MAX(CASE WHEN has_missing_params = 'true' THEN date END)) as last_error_date,
          SAFE_DIVIDE(
            COUNT(DISTINCT CASE WHEN has_missing_params = 'true' THEN primary_key END),
            COUNT(DISTINCT primary_key)
          ) * 100 as error_percentage
        FROM deduplicated_events
        GROUP BY expected_event_name
      )
      SELECT 
        expected_event_name,
        CAST(total_events AS STRING) as total_events,
        CAST(events_with_errors AS STRING) as events_with_errors,
        CAST(missing_events_in_ga4 AS STRING) as missing_events_in_ga4,
        error_percentage,
        IFNULL(first_date, 'null') as first_date,
        IFNULL(last_date, 'null') as last_date,
        IFNULL(first_error_date, 'null') as first_error_date,
        IFNULL(last_error_date, 'null') as last_error_date,
        CASE 
          WHEN error_percentage = 0 THEN 'OK'
          WHEN error_percentage < 10 THEN 'WARNING'
          ELSE 'ERROR'
        END as status
      FROM event_summary
      ORDER BY 
        CASE 
          WHEN error_percentage >= 10 THEN 1 
          WHEN error_percentage > 0 THEN 2 
          ELSE 3 
        END,
        total_events DESC;
    `;

    // Requête pour les données du graphique temporel (pourcentage d'erreur par jour)
    const chartDataQuery = `
      WITH deduplicated_events AS (
        SELECT DISTINCT
          primary_key,
          date,
          CAST(is_event_with_missing_params AS STRING) as has_missing_params
        FROM \
          \`${PROJECT_ID}.${DATASET}.rep__ga4_history_events_params\`
        ${dateFilter}
        ${eventFilter}
      )
      SELECT 
        date,
        COUNT(DISTINCT primary_key) as total_events,
        COUNT(DISTINCT CASE WHEN has_missing_params = 'true' THEN primary_key END) as events_with_missing_params,
        SAFE_DIVIDE(
          COUNT(DISTINCT CASE WHEN has_missing_params = 'true' THEN primary_key END),
          COUNT(DISTINCT primary_key)
        ) * 100 as pct_events_with_missing_params
      FROM deduplicated_events
      GROUP BY date
      ORDER BY date;
    `;

    // Count total des événements avec erreurs
    const totalErrorsCountQuery = `
      SELECT 
        COUNT(DISTINCT primary_key) as total_errors_count
      FROM \
        \`${PROJECT_ID}.${DATASET}.rep__ga4_history_events_params\`
      ${dateFilter}
      ${eventFilter}
      AND CAST(is_event_with_missing_params AS STRING) = 'true'
    `;

    // Événements détaillés paginés
    const eventsDetailQuery = `
      SELECT 
        date,
        FORMAT_TIMESTAMP('%Y-%m-%dT%H:%M:%S', event_timestamp) as event_timestamp,
        expected_event_name,
        event_name,
        device_category,
        device_operating_system,
        device_browser,
        page_location_value,
        CAST(is_event_with_missing_params AS STRING) as is_event_with_missing_params,
        missing_event_params,
        missing_user_params,
        missing_item_params,
        missing_ecommerce_params,
        all_missing_params,
        ga_session_id as session_id
      FROM \
        \`${PROJECT_ID}.${DATASET}.rep__ga4_history_events_params\`
      ${dateFilter}
      ${eventFilter}
      ORDER BY 
        CASE WHEN CAST(is_event_with_missing_params AS STRING) = 'true' THEN 0 ELSE 1 END,
        event_timestamp DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    // Exécuter les requêtes en parallèle
    const [trackingPlanResult, chartDataResult, totalErrorsResult, eventsDetailResult] = await Promise.all([
      runQuery(trackingPlanQuery),
      runQuery(chartDataQuery),
      runQuery(totalErrorsCountQuery),
      runQuery(eventsDetailQuery)
    ]);

    // Calculer les statistiques globales
    const totalEvents = trackingPlanResult.reduce((sum, event) => sum + parseInt(event.total_events || 0), 0);
    const totalErrors = trackingPlanResult.reduce((sum, event) => sum + parseInt(event.events_with_errors || 0), 0);
    const errorRate = totalEvents > 0 ? (totalErrors / totalEvents) * 100 : 0;
    const totalErrorsCount = totalErrorsResult[0]?.total_errors_count || 0;

    const stats = {
      totalEvents,
      totalErrors,
      errorRate,
      eventsWithErrors: trackingPlanResult.filter(e => parseInt(e.events_with_errors || 0) > 0).length,
      totalEventTypes: trackingPlanResult.length,
      totalErrorsCount: parseInt(totalErrorsCount)
    };

    // Pagination
    const totalPages = Math.ceil(totalErrorsCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        trackingPlan: trackingPlanResult,
        chartData: chartDataResult,
        eventsDetail: eventsDetailResult,
        stats,
        pagination: {
          currentPage: page,
          pageSize,
          totalItems: totalErrorsCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          dateRange: { start: startDate, end: endDate },
          eventName: eventName || 'all'
        }
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Tracking API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tracking data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

module.exports = router;
