import React, { useEffect, useState } from "react";
import "../CSS/RealtimeMonitoring.css";
import { useCache } from "./CacheContext";
import Loader from './Loader';

const RealtimeMonitoring = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showLastUpdated, setShowLastUpdated] = useState(false);
  const { getCacheData, setCacheData } = useCache();

  useEffect(() => {
    const cacheKey = `realtimeData`;
    const cached = getCacheData(cacheKey);
    if (cached) {
      setData(cached.data);
      setLastUpdated(cached.lastUpdated ? new Date(cached.lastUpdated) : new Date());
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/realtime");
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Erreur API");
        setData(json.data);
        setLastUpdated(new Date());
        setCacheData(cacheKey, { data: json.data, lastUpdated: new Date().toISOString() });
      } catch (err) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getQuality = (percent) => {
    if (percent === 0) return "Good";
    if (percent < 10) return "Warning";
    return "Need Attention";
  };

  if (loading) return <Loader text="Chargement des données..." />;
  if (error) return <div className="error">Erreur : {error}</div>;
  if (!data) return null;

  const overview = {
    total: data.metrics?.total_hits || 0,
    good: data.metrics?.good_hits || 0,
    error: data.metrics?.error_hits || 0,
    userParams: data.userParamsStats?.length || 0,
  };

  const renderTable = (title, headers, rows) => (
    <div className="section">
      <h2 className="section-title">{title}</h2>
      <table className="styled-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, i) => (
                <td
                  key={i}
                  className={
                    typeof cell === "string" && cell.includes("Attention")
                      ? "attention"
                      : ""
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="dashboard" style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h1 className="dashboard-title" style={{ margin: 0 }}>Realtime Monitoring</h1>
          <button
            className="icon-btn"
            onClick={() => setShowLastUpdated((v) => !v)}
            title="Voir la dernière mise à jour"
          >
            {/* Horloge SVG */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
        </div>
        <button
          className="refresh-btn"
          style={{ background: "#f5f5f5", border: "1px solid #ccc", borderRadius: 4, cursor: "pointer", padding: "6px 16px", fontWeight: 500, fontSize: 15 }}
          onClick={() => window.location.reload()}
          title="Actualiser la page"
        >
          Actualisation
        </button>
      </div>
      {showLastUpdated && lastUpdated && (
        <div className="last-updated" style={{ marginTop: 4, color: '#555', fontSize: 14 }}>
          Dernière actualisation : {lastUpdated.toLocaleString()}
          <br />
          Si il est avant 12h alors on récupère les données de J-1 et J. Si il est après 12h alors on récupère uniquement les données de J.
        </div>
      )}
      <br />
      <div className="overview-box">
        <h2 className="section-subtitle">Overview</h2>
        <p>
          During this period you had <strong>{overview.total.toLocaleString()}</strong> events, of which <strong>{overview.error.toLocaleString()}</strong> were missing parameters.
        </p>
        <div className="overview-grid">
          <div className="overview-card">
            <span>Number of Hits</span>
            <strong>{overview.total.toLocaleString()}</strong>
          </div>
          <div className="overview-card">
            <span>Total Good Hits</span>
            <strong>{overview.good.toLocaleString()}</strong>
          </div>
          <div className="overview-card">
            <span>Error Hits</span>
            <strong>{overview.error.toLocaleString()}</strong>
          </div>
          <div className="overview-card">
            <span>User Parameters</span>
            <strong>{overview.userParams}</strong>
          </div>
        </div>
      </div>

      {renderTable(
        "Events",
        ["Event", "Hits", "Hits With Errors", "%Errors", "Data Quality"],
        (data.eventStats || []).map((e) => [
          e.event_name,
          e.hits.toLocaleString(),
          e.errors.toLocaleString(),
          `${e.error_percentage.toFixed(1)}%`,
          getQuality(e.error_percentage),
        ])
      )}

      <div style={{ overflowX: 'auto' }}>
        {renderTable(
          "Page Location",
          ["URL", "%Errors", "Data Quality"],
          (data.pageStats || []).map((p) => [
            <a 
              href={p.page_location_value} 
              target="_blank" 
              rel="noreferrer"
              className="page-location-url"
            >
              {p.page_location_value}
            </a>,
            `${p.error_percentage.toFixed(1)}%`,
            getQuality(p.error_percentage),
          ])
        )}
      </div>

      {renderTable(
        "Events Parameters",
        ["Event Parameter Missing", "%Errors", "Data Quality", "Count"],
        (data.eventParamsStats || []).map((param) => [
          param.param_key,
          `${param.missing_percentage.toFixed(1)}%`,
          getQuality(param.missing_percentage),
          param.total_occurrences.toLocaleString(),
        ])
      )}

      {renderTable(
        "User Parameters",
        ["Event User Missing", "%Errors", "Data Quality", "Count"],
        (data.userParamsStats || []).map((param) => [
          param.param_key,
          `${param.missing_percentage.toFixed(1)}%`,
          getQuality(param.missing_percentage),
          param.total_occurrences.toLocaleString(),
        ])
      )}

      {renderTable(
        "Item Parameters",
        ["Item Param", "%Errors", "Data Quality", "Count"],
        (data.itemParamsStats || []).map((param) => [
          param.param_key,
          `${param.missing_percentage.toFixed(1)}%`,
          getQuality(param.missing_percentage),
          param.total_occurrences.toLocaleString(),
        ])
      )}
    </div>
  );
};

export default RealtimeMonitoring;
