import React, { useState, useMemo } from 'react';
import { Avatar, Badge, PrioBadge, ProgressBar, Btn, Input, Select } from '../UI';
import { STATUTS, PRIORITES, CATEGORIES, formatDate } from '../../data/initial';

export default function Actions({ actions, users, projets, currentUser, onSelect, onQRScan }) {
  const [filters, setFilters] = useState({ statut: '', priorite: '', categorie: '', assigneA: '', projetId: '' });
  const [q, setQ] = useState('');
  const ff = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  const filtered = useMemo(() => {
    return actions.filter(a => {
      if (filters.statut && a.statut !== filters.statut) return false;
      if (filters.priorite && a.priorite !== filters.priorite) return false;
      if (filters.categorie && a.categorie !== filters.categorie) return false;
      if (filters.assigneA && a.assigneA !== filters.assigneA) return false;
      if (filters.projetId === 'none' && a.projetId) return false;
      if (filters.projetId && filters.projetId !== 'none' && a.projetId !== filters.projetId) return false;
      if (currentUser.role === 'agent' && a.assigneA !== currentUser.id) return false;
      if (q && !a.titre.toLowerCase().includes(q.toLowerCase()) && !a.description.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    }).sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
  }, [actions, filters, q, currentUser]);

  const reset = () => { setFilters({ statut: '', priorite: '', categorie: '', assigneA: '', projetId: '' }); setQ(''); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 Rechercher..." style={{ flex: 1, minWidth: 160 }} />
        <Select value={filters.statut} onChange={e => ff('statut', e.target.value)} style={{ minWidth: 110 }}>
          <option value="">Statut</option>
          {STATUTS.map(s => <option key={s}>{s}</option>)}
        </Select>
        <Select value={filters.priorite} onChange={e => ff('priorite', e.target.value)} style={{ minWidth: 110 }}>
          <option value="">Priorité</option>
          {PRIORITES.map(s => <option key={s}>{s}</option>)}
        </Select>
        {currentUser.role !== 'agent' && (
          <>
            <Select value={filters.assigneA} onChange={e => ff('assigneA', e.target.value)} style={{ minWidth: 130 }}>
              <option value="">Tous les agents</option>
              {users.filter(u => u.actif).map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
            </Select>
            <Select value={filters.projetId} onChange={e => ff('projetId', e.target.value)} style={{ minWidth: 120 }}>
              <option value="">Tous projets</option>
              {projets.map(p => <option key={p.id} value={p.id}>{p.titre}</option>)}
              <option value="none">Sans projet</option>
            </Select>
          </>
        )}
        <Btn onClick={reset} style={{ fontSize: 10, padding: '6px 10px' }}>✕ Réinitialiser</Btn>
      </div>
      <div style={{ fontSize: 10, color: '#7a7672' }}>{filtered.length} action(s)</div>

      {/* Liste */}
      {filtered.map(a => {
        const assigne = users.find(u => u.id === a.assigneA);
        const createur = users.find(u => u.id === a.creeePar);
        const projet = projets.find(p => p.id === a.projetId);
        const overdue = a.dateLimite && new Date(a.dateLimite) < new Date() && !['VALIDÉ', 'ARCHIVÉ'].includes(a.statut);
        const ep = a.etapes.length ? Math.round(a.etapes.filter(e => e.fait).length / a.etapes.length * 100) : null;
        return (
          <div
            key={a.id}
            style={{ background: '#fff', border: `1px solid ${overdue ? '#fca5a5' : '#d4cfc8'}`, borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', transition: 'box-shadow .15s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.1)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Avatar initials={assigne?.avatar || '?'} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span
                    onClick={() => onSelect(a.id)}
                    style={{ fontWeight: 700, fontSize: 13, color: '#1a1a18', cursor: 'pointer' }}
                  >
                    {a.titre}
                  </span>
                  {overdue && <span style={{ fontSize: 9, color: '#dc2626', background: '#fef2f2', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>⚠ RETARD</span>}
                  {projet && (
                    <span style={{ fontSize: 9, background: `${projet.couleur}18`, color: projet.couleur, padding: '1px 8px', borderRadius: 99, fontWeight: 700 }}>
                      {projet.titre}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: '#7a7672', marginBottom: 8 }}>
                  → <span style={{ color: '#4a4844' }}>{assigne?.nom}</span>
                  {' · par '}
                  <span style={{ color: '#4a4844' }}>{createur?.nom}</span>
                  {a.dateLimite && <> · Éch. <span style={{ color: overdue ? '#dc2626' : '#4a4844' }}>{formatDate(a.dateLimite)}</span></>}
                  {a.dureeAttendue && <> · {a.dureeAttendue}h prévues</>}
                </div>
                {ep !== null && <div style={{ marginBottom: 8 }}><ProgressBar value={ep} height={4} /></div>}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, background: '#f5f4f0', color: '#4a4844', padding: '2px 8px', borderRadius: 99 }}>{a.categorie}</span>
                  <PrioBadge priorite={a.priorite} />
                  <Badge statut={a.statut} />
                  <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                    {!['VALIDÉ', 'ARCHIVÉ', 'REJETÉ'].includes(a.statut) && (
                      <Btn onClick={() => onQRScan(a.id)} style={{ padding: '3px 8px', fontSize: 10 }}>📱 QR</Btn>
                    )}
                    <Btn onClick={() => onSelect(a.id)} style={{ padding: '3px 8px', fontSize: 10 }}>Détail →</Btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: '#a09c98', padding: 40, fontSize: 12 }}>Aucune action trouvée</div>
      )}
    </div>
  );
}
