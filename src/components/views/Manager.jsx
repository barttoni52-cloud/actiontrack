import React from 'react';
import { Avatar, Badge, PrioBadge, ProgressBar } from '../UI';

export default function Manager({ actions, users, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 9, color: '#7a7672', textTransform: 'uppercase', letterSpacing: '.1em' }}>Qui fait quoi — Vue d'ensemble</div>
      {users.filter(u => u.actif && u.role === 'agent').map(u => {
        const my = actions.filter(a => a.assigneA === u.id);
        const mv = my.filter(a => a.statut === 'VALIDÉ').length;
        const mp = my.length ? Math.round(mv / my.length * 100) : 0;
        const mc = mp >= 70 ? '#16a34a' : mp >= 40 ? '#d97706' : '#dc2626';
        const retard = my.filter(a => a.dateLimite && new Date(a.dateLimite) < new Date() && !['VALIDÉ','ARCHIVÉ'].includes(a.statut)).length;
        return (
          <div key={u.id} style={{ background: '#fff', border: '1px solid #d4cfc8', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0ede8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <Avatar initials={u.avatar} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a18' }}>{u.nom}</div>
                  <div style={{ fontSize: 10, color: '#7a7672' }}>{u.poste} · {u.service}</div>
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  {[{l:'Total',v:my.length,c:'#7a7672'},{l:'Validés',v:mv,c:'#16a34a'},{l:'Retard',v:retard,c:retard>0?'#dc2626':'#a09c98'}].map(({l,v,c}) => (
                    <div key={l} style={{ textAlign: 'center' }}>
                      <div style={{ color: c, fontWeight: 800, fontSize: 18, fontFamily: 'monospace' }}>{v}</div>
                      <div style={{ color: '#a09c98', fontSize: 9 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <ProgressBar value={mp} color={mc} height={6} />
            </div>
            <div style={{ padding: '8px 16px' }}>
              {my.slice(0, 3).map(a => {
                const ep = a.etapes.length ? Math.round(a.etapes.filter(e => e.fait).length / a.etapes.length * 100) : null;
                return (
                  <div key={a.id} onClick={() => onSelect(a.id)} style={{ padding: '7px 0', borderBottom: '1px solid #f5f4f0', cursor: 'pointer', transition: 'opacity .15s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '.6'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: ep !== null ? 5 : 0 }}>
                      <span style={{ flex: 1, fontSize: 11, color: '#4a4844', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titre}</span>
                      <PrioBadge priorite={a.priorite} />
                      <Badge statut={a.statut} />
                    </div>
                    {ep !== null && <ProgressBar value={ep} height={3} showPct={false} />}
                  </div>
                );
              })}
              {my.length === 0 && <div style={{ color: '#a09c98', fontSize: 11, padding: '8px 0' }}>Aucune action assignée</div>}
              {my.length > 3 && <div style={{ color: '#a09c98', fontSize: 10, padding: '6px 0' }}>+{my.length - 3} autre(s)</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
