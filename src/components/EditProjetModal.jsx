import React, { useState } from 'react';
import { Modal, Btn, Field, Input, Textarea, Select } from './UI';
import { nowISO, formatDate } from '../data/initial';

const COLORS = ['#2563eb','#16a34a','#7c3aed','#d97706','#dc2626','#0891b2','#db2777'];

export default function EditProjetModal({ projet, users, currentUser, onClose, onSave }) {
  const [form, setForm] = useState({
    titre: projet.titre || '',
    description: projet.description || '',
    couleur: projet.couleur || '#2563eb',
    dateFin: projet.dateFin ? new Date(projet.dateFin).toISOString().slice(0, 16) : '',
    agents: projet.agents || [],
  });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const agentsDisponibles = users.filter(u => u.actif && !form.agents.includes(u.id));
  const addAgent = (uid) => { if (uid) f('agents', [...form.agents, uid]); };
  const removeAgent = (uid) => f('agents', form.agents.filter(id => id !== uid));

  const save = () => {
    const now = nowISO();
    onSave(projet.id, {
      titre: form.titre,
      description: form.description,
      couleur: form.couleur,
      dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : null,
      agents: form.agents,
      derniereModif: now,
      modifPar: currentUser.nom,
    });
    onClose();
  };

  return (
    <Modal onClose={onClose} maxWidth={520}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ fontSize:16, fontWeight:800, color:'#1a1a18' }}>Modifier le projet</div>
        <Btn onClick={onClose} style={{ background:'none', border:'none', color:'#a09c98', fontSize:16, padding:0 }}>✕</Btn>
      </div>

      <Field label="Titre *">
        <Input value={form.titre} onChange={e => f('titre', e.target.value)} />
      </Field>
      <Field label="Description">
        <Textarea value={form.description} onChange={e => f('description', e.target.value)} style={{ height:70 }} />
      </Field>
      <Field label="Date de fin">
        <Input type="datetime-local" value={form.dateFin} onChange={e => f('dateFin', e.target.value)} />
      </Field>

      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:9, color:'#7a7672', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>
          Agents assignés ({form.agents.length})
        </div>
        {agentsDisponibles.length > 0 && (
          <Select value="" onChange={e => addAgent(e.target.value)} style={{ marginBottom:8 }}>
            <option value="">+ Ajouter un agent...</option>
            {agentsDisponibles.map(u => <option key={u.id} value={u.id}>{u.nom} — {u.poste || u.role}</option>)}
          </Select>
        )}
        {form.agents.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {form.agents.map(uid => {
              const u = users.find(x => x.id === uid);
              return (
                <div key={uid} style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:99, padding:'3px 10px', display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
                  <span style={{ color:'#1d4ed8', fontWeight:600 }}>{u?.nom}</span>
                  <button onClick={() => removeAgent(uid)} style={{ background:'none', border:'none', color:'#dc2626', cursor:'pointer', fontSize:12, lineHeight:1 }}>✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Field label="Couleur">
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          {COLORS.map(c => (
            <div key={c} onClick={() => f('couleur', c)} style={{ width:24, height:24, borderRadius:'50%', background:c, cursor:'pointer', border:`3px solid ${form.couleur===c?'#1a1a18':'transparent'}` }} />
          ))}
        </div>
      </Field>

      <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'10px 14px', fontSize:11, color:'#1d4ed8', marginBottom:16 }}>
        ℹ️ La date de modification sera visible par tous les membres du projet.
      </div>

      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" onClick={save} disabled={!form.titre}>Enregistrer</Btn>
      </div>
    </Modal>
  );
}
