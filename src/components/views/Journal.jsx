import React, { useMemo } from 'react';
import { Avatar } from '../UI';
import { formatDate } from '../../data/initial';

const JTYPE_COLORS = { creation:'#2563eb', validation:'#16a34a', rejet:'#dc2626', soumission:'#7c3aed', mise_a_jour:'#a09c98' };

export default function Journal({ actions, users, onSelect }) {
  const entries = useMemo(() =>
    actions.flatMap(a => a.journal.map(j => ({ ...j, actionId: a.id, actionTitre: a.titre })))
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [actions]
  );
  return (
    <div>
      <div style={{ fontSize: 9, color: '#7a7672', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>{entries.length} entrée(s)</div>
      {entries.map((j, i) => {
        const auteur = users.find(u => u.id === j.auteurId);
        return (
          <div key={j.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f0ede8' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar initials={auteur?.avatar || '?'} size={26} />
              {i < entries.length - 1 && <div style={{ width: 1, flex: 1, background: '#e8e4de', minHeight: 12, margin: '4px 0' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a18' }}>{auteur?.nom || '?'}</span>
                <span style={{ fontSize: 9, color: JTYPE_COLORS[j.type] || '#a09c98', background: '#f0ede8', padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>{j.type.replace('_', ' ')}</span>
                <span onClick={() => onSelect(j.actionId)} style={{ fontSize: 9, color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>{j.actionTitre}</span>
                <span style={{ fontSize: 9, color: '#a09c98', marginLeft: 'auto' }}>{formatDate(j.date)}</span>
              </div>
              <div style={{ fontSize: 11, color: '#4a4844' }}>{j.action}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
