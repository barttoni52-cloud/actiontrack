import React, { useMemo } from 'react';

// --- Helpers dates ---
function getWeekKey(date) {
  const d = new Date(date);
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `S${week} ${d.getFullYear()}`;
}
function getMonthKey(date) {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
}

// Mini graphique en barres/lignes en SVG pur (pas de dépendance recharts à installer)
function MiniLineChart({ data, dataKey, labelKey, color = '#2563eb', height = 140, unit = '' }) {
  if (!data.length) return <div style={{ textAlign: 'center', color: '#a09c98', padding: 20, fontSize: 12 }}>Aucune donnée</div>;
  const w = 600, h = height, pad = 30;
  const max = Math.max(...data.map(d => d[dataKey]), 1);
  const stepX = (w - pad * 2) / Math.max(data.length - 1, 1);
  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (d[dataKey] / max) * (h - pad * 2);
    return { x, y, v: d[dataKey], label: d[labelKey] };
  });
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e8e4de" />
      <path d={path} fill="none" stroke={color} strokeWidth={2} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill={color} />
          <text x={p.x} y={h - pad + 14} textAnchor="middle" fontSize="9" fill="#a09c98">{p.label}</text>
          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1a1a18">{p.v}{unit}</text>
        </g>
      ))}
    </svg>
  );
}

function MiniBarChart({ data, labelKey, series, height = 160 }) {
  if (!data.length) return <div style={{ textAlign: 'center', color: '#a09c98', padding: 20, fontSize: 12 }}>Aucune donnée</div>;
  const max = Math.max(...data.flatMap(d => series.map(s => d[s.key])), 1);
  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
        {series.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span style={{ fontSize: 10, color: '#7a7672' }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-end', height, borderBottom: '1px solid #e8e4de', paddingBottom: 4 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: height - 20 }}>
              {series.map(s => (
                <div key={s.key} style={{
                  width: 14,
                  height: `${Math.max((d[s.key] / max) * (height - 20), 2)}px`,
                  background: s.color, borderRadius: '3px 3px 0 0',
                  position: 'relative',
                }} title={`${s.label}: ${d[s.key]}`}>
                  <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 700, color: '#1a1a18' }}>{d[s.key]}</span>
                </div>
              ))}
            </div>
            <span style={{ fontSize: 9, color: '#a09c98' }}>{d[labelKey]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PerformanceHistory({ actions }) {
  const { weekly, monthly } = useMemo(() => {
    const since = new Date();
    since.setMonth(since.getMonth() - 6);
    const recentActions = actions.filter(a => a.dateCreation && new Date(a.dateCreation) >= since);

    // --- Hebdomadaire : taux de complétion ---
    const weekMap = {};
    recentActions.forEach(a => {
      const key = getWeekKey(a.dateCreation);
      if (!weekMap[key]) weekMap[key] = { semaine: key, total: 0, validees: 0, order: new Date(a.dateCreation) };
      weekMap[key].total += 1;
      if (a.statut === 'VALIDÉ') weekMap[key].validees += 1;
    });
    const weekly = Object.values(weekMap)
      .sort((a, b) => a.order - b.order)
      .map(w => ({ semaine: w.semaine, taux: w.total > 0 ? Math.round((w.validees / w.total) * 100) : 0 }))
      .slice(-12);

    // --- Mensuel : créées vs validées ---
    const monthMap = {};
    const ensure = (key, date) => {
      if (!monthMap[key]) monthMap[key] = { mois: key, creees: 0, validees: 0, order: new Date(date) };
      return monthMap[key];
    };
    recentActions.forEach(a => {
      ensure(getMonthKey(a.dateCreation), a.dateCreation).creees += 1;
      if (a.statut === 'VALIDÉ' && a.dateFin) {
        ensure(getMonthKey(a.dateFin), a.dateFin).validees += 1;
      }
    });
    const monthly = Object.values(monthMap).sort((a, b) => a.order - b.order).slice(-6);

    return { weekly, monthly };
  }, [actions]);

  const card = { background: '#fff', border: '1px solid #d4cfc8', borderRadius: 12, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,.06)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: 13, color: '#1a1a18', marginBottom: 14 }}>Taux de complétion — semaine par semaine</div>
        <MiniLineChart data={weekly} dataKey="taux" labelKey="semaine" color="#16a34a" unit="%" />
      </div>
      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: 13, color: '#1a1a18', marginBottom: 14 }}>Missions créées vs validées — par mois</div>
        <MiniBarChart
          data={monthly}
          labelKey="mois"
          series={[
            { key: 'creees', label: 'Créées', color: '#2563eb' },
            { key: 'validees', label: 'Validées', color: '#16a34a' },
          ]}
        />
      </div>
    </div>
  );
}
