import React, { useState } from 'react';

const quickRanges = [
  { label: '7 derniers jours', days: 7 },
  { label: '30 derniers jours', days: 30 },
  { label: '90 derniers jours', days: 90 },
  { label: 'Ce mois-ci', type: 'month' },
  { label: 'Mois précédent', type: 'lastMonth' },
  { label: '6 derniers mois', days: 180 },
];

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getRange(option) {
  const today = new Date();
  let start, end;
  if (option.days) {
    end = new Date(today);
    start = new Date(today);
    start.setDate(end.getDate() - option.days);
  } else if (option.type === 'month') {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
    end = today;
  } else if (option.type === 'lastMonth') {
    const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const last = new Date(today.getFullYear(), today.getMonth(), 0);
    start = first;
    end = last;
  }
  return { start: formatDate(start), end: formatDate(end) };
}

export default function DateRangePicker({ value, onChange }) {
  const [custom, setCustom] = useState({ start: '', end: '' });

  return (
    <div className="date-range-picker">
      <div className="quick-ranges">
        {quickRanges.map((opt, idx) => {
          const range = getRange(opt);
          const isActive = value.start === range.start && value.end === range.end;
          return (
            <div
              key={opt.label}
              className={`quick-range-option${isActive ? ' active' : ''}`}
              onClick={() => onChange(range)}
            >
              <div>{opt.label}</div>
              <div className="quick-range-dates">{range.start} – {range.end}</div>
            </div>
          );
        })}
      </div>
      <div className="custom-range">
        <div>Période personnalisée</div>
        <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
          <input
            type="date"
            value={custom.start}
            onChange={e => setCustom(c => ({ ...c, start: e.target.value }))}
          />
          <input
            type="date"
            value={custom.end}
            onChange={e => setCustom(c => ({ ...c, end: e.target.value }))}
          />
        </div>
        <button
          onClick={() => custom.start && custom.end && onChange({ start: custom.start, end: custom.end })}
          disabled={!custom.start || !custom.end}
        >
          Appliquer
        </button>
      </div>
      <style>{`
        .date-range-picker { padding: 16px; }
        .quick-ranges { display: flex; flex-direction: column; gap: 8px; }
        .quick-range-option { cursor: pointer; padding: 8px 12px; border-radius: 8px; }
        .quick-range-option.active { background: #ede9fe; color: #6d28d9; font-weight: 700; }
        .quick-range-dates { font-size: 0.95em; color: #64748b; }
        .custom-range { margin-top: 16px; }
        .custom-range input { border-radius: 6px; border: 1px solid #e5e7eb; padding: 4px 8px; }
        .custom-range button { background: linear-gradient(90deg, #a78bfa, #818cf8); color: #fff; border: none; border-radius: 8px; padding: 6px 18px; font-weight: 600; cursor: pointer; }
        .custom-range button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
} 