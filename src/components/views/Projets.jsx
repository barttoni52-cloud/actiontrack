import React, { useState } from 'react';
import { Btn, Card, ProgressBar, Field, Input, Textarea } from '../UI';
import { gid, nowISO } from '../../data/initial';

const COLORS = ['#2563eb','#16a34a','#7c3aed','#d97706','#dc2626','#0891b2','#db2777'];

export default function Projets({ projets, actions, users, currentUser, onSelectAction, setProjets }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ titre: '', description: '', couleur: '#2563eb', dateFin: '' });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const create = () => {
    if (!form.titre) return;
    setProjets(p => [...p, { id: gid('PRJ'), titre: form.titre, description: form.description, managerId: currentUser.id, dateDebut: nowISO(), dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : null, couleur: form.couleur, actif: true }]);
    setForm({ titre: '', description: '', couleur: '#2563eb', dateFin: '' });
    setShowNew(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 9, color: '#7a7672', textTransform: 'uppercase', letterSpacing: '.1em' }}>{projets.length} projet(s)</div>
        {currentUser.role !== 'agent' && <Btn variant="primary" onClick={() => setShowNew(p => !p)}>+ Nouveau projet</Btn>}
      </div>

      {showNew && (
        <Card>
          <Field label="Titre *"><Input value={form.titre} onChange={e => f('titre', e.target.value)} placeholder="Nom du projet" /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={e => f('description', e.target.value)} style={{ height: 60 }} /></Field>
          <Field label="Date de fin"><Input type="datetime-local" value={form.dateFin} onChange={e => f('dateFin', e.target.value)} /></Field>
          <Field label="Couleur">
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => f('couleur', c)} style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: `2px solid ${form.couleur === c ? '#1a1a18' : 'transparent'}`, transition: 'border .1s' }} />
              ))}
            </div>
          </Field>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn onClick={() => setShowNew(false)}>Annuler</Btn>
            <Btn variant="primary" onClick={create}>Créer</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
        {projets.map(p => {
          const pa = actions.filter(a => a.projetId === p.id);
          const done = pa.filter(a => a.statut === 'VALIDÉ').length;
          const pct = pa.length ? Math.round(done / pa.length * 100) : 0;
          const overdue = pa.filter(a => a.dateLimite && new Date(a.dateLimite) < new Date() && !['VALIDÉ','ARCHIVÉ'].includes(a.statut)).length;
          const durées = pa.filter(a => a.dateDebut && a.dateFin).map(a => Math.round(Math.abs(new Date(a.dateFin) - new Date(a.dateDebut)) / 36e5));
          const avgH = durées.length ? Math.round(durées.reduce((s, x) => s + x, 0) / durées.length) : null;
          return (
            <div key={p.id} style={{ background: '#fff', border: `1px solid ${p.couleur}44`, borderRadius: 12, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,.06)', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = p.couleur; e.currentTarget.style.boxShadow = `0 4px 16px ${p.couleur}22`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${p.couleur}44`; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: p.couleur, marginRight: 6 }} />
                  <span style={{ fontWeight: 800, fontSize: 14, color: '#1a1a18' }}>{p.titre}</span>
                </div>
                <span style={{ fontSize: 24, fontWeight: 900, color: p.couleur, fontFamily: 'monospace' }}>{pct}%</span>
              </div>
              <ProgressBar value={pct} color={p.couleur} height={7} showPct={false} />
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                {[{l:'Tâches',v:pa.length,c:'#7a7672'},{l:'Validées',v:done,c:'#16a34a'},{l:'Retard',v:overdue,c:overdue>0?'#dc2626':'#a09c98'},{l:'Moy.',v:avgH!==null?avgH+'h':'—',c:'#7c3aed'}].map(({l,v,c}) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ color: c, fontWeight: 800, fontSize: 15, fontFamily: 'monospace' }}>{v}</div>
                    <div style={{ color: '#a09c98', fontSize: 9 }}>{l}</div>
                  </div>
                ))}
              </div>
              {p.description && <div style={{ fontSize: 11, color: '#7a7672', marginTop: 10, lineHeight: 1.5 }}>{p.description}</div>}
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {pa.slice(0, 3).map(a => (
                  <div key={a.id} onClick={() => onSelectAction(a.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderTop: '1px solid #f0ede8', cursor: 'pointer', transition: 'opacity .15s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '.6'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    <span style={{ flex: 1, fontSize: 11, color: '#4a4844', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titre}</span>
                    <span style={{ fontSize: 9, color: '#7a7672' }}>{a.statut === 'VALIDÉ' ? '✓' : '○'}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {projets.length === 0 && <div style={{ textAlign: 'center', color: '#a09c98', padding: 40 }}>Aucun projet</div>}
    </div>
  );
}
