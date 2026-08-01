import React, { useState } from 'react';
import { Btn, Card, ProgressBar, Field, Input, Textarea, Select } from '../UI';
import { gid, nowISO, formatDate } from '../../data/initial';
import EditProjetModal from '../EditProjetModal';

const COLORS = ['#2563eb','#16a34a','#7c3aed','#d97706','#dc2626','#0891b2','#db2777'];

export default function Projets({ projets, actions, users, currentUser, onSelectAction, setProjets }) {
  const [showNew, setShowNew] = useState(false);
  const [editProjet, setEditProjet] = useState(null);
  const [form, setForm] = useState({ titre: '', description: '', couleur: '#2563eb', dateFin: '' });
  const [agentsProjet, setAgentsProjet] = useState([]);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const agentsDisponibles = users.filter(u => u.actif && !agentsProjet.includes(u.id));
  const addAgent = (uid) => { if (uid && !agentsProjet.includes(uid)) setAgentsProjet(p => [...p, uid]); };
  const removeAgent = (uid) => setAgentsProjet(p => p.filter(id => id !== uid));

  const create = () => {
    if (!form.titre) return;
    setProjets(p => [...p, {
      id: gid('PRJ'), titre: form.titre, description: form.description,
      managerId: currentUser.id, dateDebut: nowISO(),
      dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : null,
      couleur: form.couleur, actif: true, agents: agentsProjet,
      derniereModif: null, modifPar: null,
    }]);
    setForm({ titre: '', description: '', couleur: '#2563eb', dateFin: '' });
    setAgentsProjet([]);
    setShowNew(false);
  };

  const handleSaveEdit = (id, patch) => {
    setProjets(p => p.map(x => x.id === id ? { ...x, ...patch } : x));
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontSize:9, color:'#7a7672', textTransform:'uppercase', letterSpacing:'.1em' }}>{projets.length} projet(s)</div>
        {currentUser.role !== 'agent' && <Btn variant="primary" onClick={() => setShowNew(p => !p)}>+ Nouveau projet</Btn>}
      </div>

      {showNew && (
        <Card>
          <Field label="Titre *"><Input value={form.titre} onChange={e => f('titre', e.target.value)} placeholder="Nom du projet" /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={e => f('description', e.target.value)} style={{ height:60 }} /></Field>
          <Field label="Date de fin"><Input type="datetime-local" value={form.dateFin} onChange={e => f('dateFin', e.target.value)} /></Field>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:9, color:'#7a7672', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Agents assignés ({agentsProjet.length})</div>
            {agentsDisponibles.length > 0 && (
              <Select value="" onChange={e => addAgent(e.target.value)} style={{ marginBottom:8 }}>
                <option value="">+ Ajouter un agent...</option>
                {agentsDisponibles.map(u => <option key={u.id} value={u.id}>{u.nom} — {u.poste || u.role}</option>)}
              </Select>
            )}
            {agentsProjet.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {agentsProjet.map(uid => {
                  const u = users.find(x => x.id === uid);
                  return (
                    <div key={uid} style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:99, padding:'3px 10px', display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
                      <span style={{ color:'#1d4ed8', fontWeight:600 }}>{u?.nom}</span>
                      <button onClick={() => removeAgent(uid)} style={{ background:'none', border:'none', color:'#dc2626', cursor:'pointer', fontSize:12 }}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <Field label="Couleur">
            <div style={{ display:'flex', gap:10, marginTop:4 }}>
              {COLORS.map(c => <div key={c} onClick={() => f('couleur', c)} style={{ width:24, height:24, borderRadius:'50%', background:c, cursor:'pointer', border:`3px solid ${form.couleur===c?'#1a1a18':'transparent'}` }} />)}
            </div>
          </Field>
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
            <Btn onClick={() => setShowNew(false)}>Annuler</Btn>
            <Btn variant="primary" onClick={create}>Créer</Btn>
          </div>
        </Card>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
        {projets.map(p => {
          const pa = actions.filter(a => a.projetId === p.id);
          const done = pa.filter(a => a.statut === 'VALIDÉ').length;
          const pct = pa.length ? Math.round(done / pa.length * 100) : 0;
          const overdue = pa.filter(a => a.dateLimite && new Date(a.dateLimite) < new Date() && !['VALIDÉ','ARCHIVÉ'].includes(a.statut)).length;
          const projetAgents = (p.agents || []).map(uid => users.find(u => u.id === uid)).filter(Boolean);

          return (
            <div key={p.id} style={{ background:'#fff', border:`1px solid ${p.couleur}44`, borderRadius:12, padding:18, boxShadow:'0 1px 3px rgba(0,0,0,.06)', transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = p.couleur; e.currentTarget.style.boxShadow = `0 4px 16px ${p.couleur}22`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${p.couleur}44`; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; }}>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:p.couleur, marginRight:6 }} />
                  <span style={{ fontWeight:800, fontSize:14, color:'#1a1a18' }}>{p.titre}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:22, fontWeight:900, color:p.couleur, fontFamily:'monospace' }}>{pct}%</span>
                  {(currentUser.role === 'manager' || currentUser.role === 'direction') && (
                    <button onClick={() => setEditProjet(p)} style={{ background:'#f5f4f0', border:'1px solid #d4cfc8', borderRadius:6, padding:'3px 8px', fontSize:10, cursor:'pointer', fontFamily:'inherit', color:'#4a4844' }}>✏️</button>
                  )}
                </div>
              </div>

              <ProgressBar value={pct} color={p.couleur} height={7} showPct={false} />

              <div style={{ display:'flex', gap:16, marginTop:12 }}>
                {[{l:'Tâches',v:pa.length,c:'#7a7672'},{l:'Validées',v:done,c:'#16a34a'},{l:'Retard',v:overdue,c:overdue>0?'#dc2626':'#a09c98'}].map(({l,v,c}) => (
                  <div key={l} style={{ textAlign:'center' }}>
                    <div style={{ color:c, fontWeight:800, fontSize:15, fontFamily:'monospace' }}>{v}</div>
                    <div style={{ color:'#a09c98', fontSize:9 }}>{l}</div>
                  </div>
                ))}
              </div>

              {projetAgents.length > 0 && (
                <div style={{ marginTop:12, borderTop:'1px solid #f0ede8', paddingTop:10 }}>
                  <div style={{ fontSize:9, color:'#7a7672', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Équipe</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                    {projetAgents.map(u => (
                      <span key={u.id} style={{ fontSize:10, background:`${p.couleur}15`, color:p.couleur, padding:'2px 8px', borderRadius:99, fontWeight:600 }}>{u.nom.split(' ')[0]}</span>
                    ))}
                  </div>
                </div>
              )}

              {p.derniereModif && (
                <div style={{ marginTop:8, fontSize:9, color:'#a09c98' }}>
                  Modifié le {formatDate(p.derniereModif)} par {p.modifPar}
                </div>
              )}

              {pa.slice(0, 3).map(a => (
                <div key={a.id} onClick={() => onSelectAction(a.id)} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', borderTop:'1px solid #f0ede8', cursor:'pointer', marginTop:6 }}
                  onMouseEnter={e => e.currentTarget.style.opacity='.6'}
                  onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                  <span style={{ flex:1, fontSize:11, color:'#4a4844', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.titre}</span>
                  <span style={{ fontSize:9, color:'#7a7672' }}>{a.statut==='VALIDÉ'?'✓':'○'}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {projets.length === 0 && <div style={{ textAlign:'center', color:'#a09c98', padding:40 }}>Aucun projet</div>}

      {editProjet && (
        <EditProjetModal projet={editProjet} users={users} currentUser={currentUser} onClose={() => setEditProjet(null)} onSave={handleSaveEdit} />
      )}
    </div>
  );
}
