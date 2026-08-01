import React, { useState } from 'react';
import { Badge, PrioBadge } from '../UI';
import { formatDate, CATEGORIES } from '../../data/initial';

export default function Archives({ actions, users, currentUser, onSelect }) {
  const [filterCat, setFilterCat] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  const archived = actions.filter(a => ['VALIDÉ','REJETÉ','ARCHIVÉ'].includes(a.statut));
  const filtered = archived.filter(a => {
    if (filterCat && a.categorie !== filterCat) return false;
    if (filterStatut && a.statut !== filterStatut) return false;
    return true;
  });

  const byCategorie = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter(a => a.categorie === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  const total = archived.length;
  const validees = archived.filter(a => a.statut === 'VALIDÉ').length;
  const rejetees = archived.filter(a => a.statut === 'REJETÉ').length;
  const archivees = archived.filter(a => a.statut === 'ARCHIVÉ').length;
  const taux = total > 0 ? Math.round(validees / total * 100) : 0;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
        {[
          { l:'Total', v:total, c:'#7a7672' },
          { l:'Validées', v:validees, c:'#16a34a' },
          { l:'Rejetées', v:rejetees, c:'#dc2626' },
          { l:'Taux succès', v:`${taux}%`, c:taux>=70?'#16a34a':taux>=40?'#d97706':'#dc2626' },
        ].map(({l,v,c}) => (
          <div key={l} style={{ background:'#fff', border:'1px solid #d4cfc8', borderRadius:10, padding:'12px 14px', textAlign:'center', boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
            <div style={{ fontSize:22, fontWeight:900, color:c, fontFamily:'monospace' }}>{v}</div>
            <div style={{ fontSize:9, color:'#7a7672', textTransform:'uppercase', letterSpacing:'.08em', marginTop:3 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display:'flex', gap:10 }}>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ background:'#fff', border:'1px solid #d4cfc8', borderRadius:8, padding:'7px 12px', fontSize:11, fontFamily:'inherit', flex:1, outline:'none' }}>
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          style={{ background:'#fff', border:'1px solid #d4cfc8', borderRadius:8, padding:'7px 12px', fontSize:11, fontFamily:'inherit', flex:1, outline:'none' }}>
          <option value="">Tous les statuts</option>
          <option value="VALIDÉ">✅ Validées</option>
          <option value="REJETÉ">❌ Rejetées</option>
          <option value="ARCHIVÉ">🗄 Archivées</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign:'center', color:'#a09c98', padding:40, background:'#fff', borderRadius:12, border:'1px solid #d4cfc8' }}>
          {total === 0 ? 'Aucune mission archivée pour le moment.' : 'Aucun résultat pour ces filtres.'}
        </div>
      )}

      {/* Par catégorie */}
      {Object.entries(byCategorie).map(([cat, items]) => (
        <div key={cat}>
          <div style={{ fontSize:10, color:'#7a7672', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
            <span>{cat}</span>
            <span style={{ background:'#f0ede8', color:'#7a7672', padding:'1px 8px', borderRadius:99, fontSize:9 }}>{items.length}</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {items.sort((a,b) => new Date(b.dateFin||b.dateCreation) - new Date(a.dateFin||a.dateCreation)).map(a => {
              const assigne = users.find(u => u.id === a.assigneA);
              const validationEntry = [...(a.journal||[])].reverse().find(j => j.type === 'validation' || j.type === 'rejet');
              return (
                <div key={a.id} onClick={() => onSelect(a.id)}
                  style={{ background:'#fff', border:'1px solid #d4cfc8', borderRadius:10, padding:'12px 16px', cursor:'pointer', transition:'all .15s', display:'flex', alignItems:'center', gap:12 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='#2563eb'; e.currentTarget.style.background='#fafafa'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='#d4cfc8'; e.currentTarget.style.background='#fff'; }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:12, color:'#1a1a18', marginBottom:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.titre}</div>
                    <div style={{ fontSize:10, color:'#7a7672' }}>
                      {assigne?.nom || '—'}
                      {validationEntry && (
                        <span style={{ marginLeft:8, color:'#a09c98' }}>• {formatDate(validationEntry.date)}</span>
                      )}
                      {a.retardMotif && <span style={{ marginLeft:8, color:'#d97706' }}>⚠ {a.retardMotif}</span>}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
                    <PrioBadge priorite={a.priorite} />
                    <Badge statut={a.statut} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
