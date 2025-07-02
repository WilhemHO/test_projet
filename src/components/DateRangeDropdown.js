import React, { useState, useRef, useEffect } from 'react';
import DateRangePicker from './DateRangePicker';

function formatLabel(range) {
  const options = [
    { label: '7 derniers jours', days: 7 },
    { label: '30 derniers jours', days: 30 },
    { label: '90 derniers jours', days: 90 },
    { label: 'Ce mois-ci', type: 'month' },
    { label: 'Mois précédent', type: 'lastMonth' },
    { label: '6 derniers mois', days: 180 },
  ];
  const today = new Date();
  for (const opt of options) {
    let start, end;
    if (opt.days) {
      end = new Date(today);
      start = new Date(today);
      start.setDate(end.getDate() - opt.days );
    } else if (opt.type === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = today;
    } else if (opt.type === 'lastMonth') {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
    }
    const s = start?.toISOString().split('T')[0];
    const e = end?.toISOString().split('T')[0];
    if (range.start === s && range.end === e) return opt.label;
  }
  return 'Période personnalisée';
}

export default function DateRangeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="date-range-dropdown" ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="date-range-btn"
        onClick={() => setOpen(o => !o)}
        type="button"
        aria-label="Sélectionner une période"
      >
        <span className="date-range-icon" role="img" aria-label="calendar">📅</span>
        <span className="date-range-label">{formatLabel(value)}</span>
        <span className="date-range-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="date-range-popover">
          <DateRangePicker
            value={value}
            onChange={r => { onChange(r); setOpen(false); }}
          />
        </div>
      )}
      <style>{`
        .date-range-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          padding: 10px 18px;
          font-size: 1.08rem;
          font-weight: 600;
          color: #3b2562;
          box-shadow: 0 1px 4px rgba(30, 60, 90, 0.04);
          cursor: pointer;
          transition: border 0.15s, background 0.15s;
          min-width: 180px;
        }
        .date-range-btn:hover, .date-range-btn:focus {
          border-color: #a78bfa;
          background: #ede9fe;
        }
        .date-range-icon {
          font-size: 1.2em;
          color: #a78bfa;
        }
        .date-range-label {
          color: #4c1d95;
          font-weight: 700;
          margin-right: 6px;
        }
        .date-range-chevron {
          margin-left: auto;
          font-size: 1.1em;
          color: #a78bfa;
        }
        .date-range-popover {
          position: absolute;
          top: 110%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(30, 60, 90, 0.13);
          min-width: 320px;
        }
        @media (max-width: 600px) {
          .date-range-popover { min-width: 90vw; }
        }
        [data-theme="dark"] .date-range-btn {
          background: #231a3a;
          color: #E1D5F5;
          border-color: #3b2c5a;
        }
        [data-theme="dark"] .date-range-btn:hover, [data-theme="dark"] .date-range-btn:focus {
          border-color: #a78bfa;
          background: #2d204a;
        }
        [data-theme="dark"] .date-range-label { color: #a78bfa; }
        [data-theme="dark"] .date-range-chevron { color: #a78bfa; }
        [data-theme="dark"] .date-range-popover {
          background: #231a3a;
          box-shadow: 0 4px 24px rgba(103, 58, 183, 0.18);
        }
      `}</style>
    </div>
  );
} 