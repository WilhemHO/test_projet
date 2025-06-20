import React from "react";
import "../CSS/RealtimeMonitoring.css";


const RealtimeMonitoring = () => {
  // Données principales
  const overviewData = {
    totalEvents: 200707,
    missingParams: 200707,
    hits: 200707,
    goodHits: 0,
    errorHits: 200707,
    userParams: 1
  };

  // Données des événements
  const eventsData = [
    { event: 'view_item_list', hits: 132067, hitsWithErrors: 132067, percentErrors: '100%', quality: 'Need Attention' },
    { event: 'page_view', hits: 47041, hitsWithErrors: 47041, percentErrors: '100%', quality: 'Need Attention' },
    { event: 'view_item', hits: 19687, hitsWithErrors: 19687, percentErrors: '100%', quality: 'Need Attention' },
    { event: 'add_to_cart', hits: 1316, hitsWithErrors: 1316, percentErrors: '100%', quality: 'Need Attention' },
    { event: 'purchase', hits: 275, hitsWithErrors: 275, percentErrors: '100%', quality: 'Need Attention' },
    { event: 'begin_checkout', hits: 209, hitsWithErrors: 209, percentErrors: '100%', quality: 'Need Attention' }
  ];

  // Pages fréquentes
  const pageLocations = [
    { url: 'https://www.mesdemoisellesparis.com/collections/soldes?page=1', percentErrors: '100%', quality: 'Need Attention' },
    { url: 'http://www.mesdemoisellesparis.com/collections/soldes?page=2', percentErrors: '100%', quality: 'Need Attention' },
    { url: 'https://www.mesdemoisellesparis.com/collections/soldes?page=3', percentErrors: '100%', quality: 'Need Attention' },
    { url: 'https://www.mesdemoisellesparis.com/collections/soldes?page=4', percentErrors: '100%', quality: 'Need Attention' },
    { url: 'https://www.mesdemoisellesparis.com/collections/soldes?page=5', percentErrors: '100%', quality: 'Need Attention' },
    { url: 'https://www.mesdemoisellesparis.com/collections/soldes?page=6', percentErrors: '100%', quality: 'Need Attention' }
  ];

  // Paramètres d'événements manquants
  const eventParamsData = [
    { param: 'page_type', occurrences: 200707, percentMissing: '1%', quality: 'Need Attention' },
    { param: 'page_type_level_1', occurrences: 200432, percentMissing: '1%', quality: 'Need Attention' },
    { param: 'page_type_level_2', occurrences: 47041, percentMissing: '1%', quality: 'Need Attention' },
    { param: 'page_type_level_3', occurrences: 19687, percentMissing: '1%', quality: 'Need Attention' },
    { param: 'customer_id', occurrences: 275, percentMissing: '1%', quality: 'Need Attention' }
  ];

  // Paramètres utilisateurs
  const userParamsData = [
    { param: 'user_id', percentMissing: '5%', quality: 'Need Attention' }
  ];

  // Paramètres d'items
  const itemParamsData = [
    { param: 'item_category', missing: 0, percentMissing: '0%', quality: 'Good', occurrences: 153554 },
    { param: 'item_id', missing: 0, percentMissing: '0%', quality: 'Good', occurrences: 153554 },
    { param: 'item_brand', missing: 0, percentMissing: '0%', quality: 'Good', occurrences: 153554 },
    { param: 'item_name', missing: 0, percentMissing: '0%', quality: 'Good', occurrences: 153554 }
  ];

  return (
    <div className="dashboard-container">
      <h1>Realtime Monitoring</h1>
      
      {/* Section Overview */}
      <div className="section">
        <h2>Overview</h2>
        <p>During this period you had {overviewData.totalEvents.toLocaleString()} events, of which {overviewData.missingParams.toLocaleString()} were missing parameters.</p>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Numbers of Hits</h3>
            <p>{overviewData.hits.toLocaleString()}</p>
          </div>
          <div className="metric-card">
            <h3>Total Good Hits</h3>
            <p>{overviewData.goodHits}</p>
          </div>
          <div className="metric-card">
            <h3>Errors Hits</h3>
            <p>{overviewData.errorHits.toLocaleString()}</p>
          </div>
          <div className="metric-card">
            <h3>User Parameters</h3>
            <p>{overviewData.userParams}</p>
          </div>
        </div>
      </div>
      
      {/* Section Events */}
      <div className="section">
        <h2>Events</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Hits</th>
              <th>Hits With Errors</th>
              <th>%Errors</th>
              <th>Data Quality</th>
            </tr>
          </thead>
          <tbody>
            {eventsData.map((event, index) => (
              <tr key={index}>
                <td>{event.event}</td>
                <td>{event.hits.toLocaleString()}</td>
                <td>{event.hitsWithErrors.toLocaleString()}</td>
                <td>{event.percentErrors}</td>
                <td className={`quality-${event.quality.toLowerCase().replace(' ', '-')}`}>
                  {event.quality}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Section Page Location - Version tableau */}
      <div className="section">
        <h2>Page Location</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>URL</th>
              <th>%Errors</th>
              <th>Data Quality</th>
            </tr>
          </thead>
          <tbody>
            {pageLocations.map((page, index) => (
              <tr key={index}>
                <td>
                  <a href={page.url} target="_blank" rel="noopener noreferrer">
                    {page.url}
                  </a>
                </td>
                <td>{page.percentErrors}</td>
                <td className={`quality-${page.quality.toLowerCase().replace(' ', '-')}`}>
                  {page.quality}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Section Event Parameters */}
      <div className="section">
        <h2>Event Parameters</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Event Parameters Missing</th>
              <th>% Event Parameters Missing</th>
              <th>Data Quality Parameters</th>
              <th>Occurrences</th>
            </tr>
          </thead>
          <tbody>
            {eventParamsData.map((param, index) => (
              <tr key={index}>
                <td>{param.param}</td>
                <td>{param.percentMissing}</td>
                <td className={`quality-${param.quality.toLowerCase().replace(' ', '-')}`}>
                  {param.quality}
                </td>
                <td>{param.occurrences.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Section User Parameters */}
      <div className="section">
        <h2>User Parameters</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Event User Missing</th>
              <th>% Event User Missing</th>
              <th>Data Quality User</th>
              <th>Occurrences</th>
            </tr>
          </thead>
          <tbody>
            {userParamsData.map((param, index) => (
              <tr key={index}>
                <td>{param.param}</td>
                <td>{param.percentMissing}</td>
                <td className={`quality-${param.quality.toLowerCase().replace(' ', '-')}`}>
                  {param.quality}
                </td>
                <td>{param.percentMissing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Section Item Parameters */}
      <div className="section">
        <h2>Item Parameters</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Item Params</th>
              <th>Event Items Missing</th>
              <th>% Items Params Missing</th>
              <th>Data Quality Items</th>
              <th>Occurrences</th>
            </tr>
          </thead>
          <tbody>
            {itemParamsData.map((param, index) => (
              <tr key={index}>
                <td>{param.param}</td>
                <td>{param.missing}</td>
                <td>{param.percentMissing}</td>
                <td className={`quality-${param.quality.toLowerCase()}`}>
                  {param.quality}
                </td>
                <td>{param.occurrences.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RealtimeMonitoring;