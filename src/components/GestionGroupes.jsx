import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Modal, Btn, Field, Input, Textarea, Select } from './UI';
import { gid } from '../data/initial';

const COLORS = ['#2563eb','#16a34a','#7c3aed','#d97706','#dc2626','#0891b2','#db2777'];

export default function GestionGroupes({ groupes, users, currentUser, onUpdate }) {
  const [showNew, setShowNew] = useState(false);
  const [editGroupe, setEditGroupe] = useState(null);
  const [form, setForm] = useState({ nom: '', description: '', couleur: '#2563eb', membres: [] });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const membresDisponibles = users.filter(u => u.actif && !form.membres.includes(u.id));
  const addMembre = (uid) => { if (uid) f('membres', [...form.membres, uid]); };
  const removeMembre = (uid) => f('membres', form.membres.filter(id => id !== uid));

  const create = async () => {
    if (!form.nom) return;
    const newGroupe = {
      id: gid('GRP'), nom: form.nom, description: form.description,
      couleur: form.couleur, manager_id: currentUser.id, membres: form.membres,
    };
    const { data } = await supabase.from('groupes').insert([newGroupe]).select().single();
    if (data) onUpdate([...groupes, { id:data.id, nom:data.nom, description:data.description||'', couleur:data.couleur, managerId:data.manager_id, membres:data.membres||[] }]);
    setForm({ nom:'', description:'', couleur:'#2563eb', membres:[] });
    setShowNew(false);
  };

  const saveEdit = async (id, patch) => {
    await supabase.from('groupes').update({ nom:patch.nom, description:patch.description, couleur:patch.couleur, membres:patch.membres }).eq('id', id);
    onUpdate(groupes.map(g => g.id === id ? { ...g, ...patch } : g));
    setEditGroupe(null);
  };

  const deleteGroupe = async (id) => {
    await supabase.from('groupes').delete().eq('id', id);
    onUpdate(groupes.filter(g => g.id !== id));
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontSize:9, color:'#7a7672', textTransform:'uppercase', letterSpacing:'.1em' }}>{groupes.length} groupe(s)</div>
        <Btn variant="primary" onClick={() => { setForm({ nom:'', description:'', couleur:'#2563eb', membres:[] }); setShowNew(true); }}>+ Nouveau groupe</Btn>
      </div>

      <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'10px 14px', fontSize:11, color:'#1d4ed8' }}>
        💡 Les groupes permettent d'assigner une mission à plusieurs personnes en une seule fois depuis "Nouvelle mission".
      </div>

      {showNew && (
        <GroupeForm form={form} f={f} users={users}
          membresDisponibles={users.filter(u => u.actif && !form.membres.includes(u.id))}
          addMembre={addMembre} removeMembre={removeMembre}
          onCancel={() => setShowNew(false)} onSave={create} title="Nouveau groupe" />
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
        {groupes.map(g => {
          const membres = (g.membres || []).map(uid => users.find(u => u.id === uid)).filter(Boolean);
          return (
            <div key={g.id} style={{ background:'#fff', border:`1px solid ${g.couleur}44`, borderRadius:12, padding:16, boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:g.couleur, marginRight:6 }} />
                  <span style={{ fontWeight:800, fontSize:14, color:'#1a1a18' }}>{g.nom}</span>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => { setEditGroupe(g); setForm({ nom:g.nom, description:g.description||'', couleur:g.couleur, membres:g.membres||[] }); }}
                    style={{ background:'#f5f4f0', border:'1px solid #d4cfc8', borderRadius:6, padding:'2px 8px', fontSize:10, cursor:'pointer' }}>✏️</button>
                  <button onClick={() => deleteGroupe(g.id)}
                    style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:6, padding:'2px 8px', fontSize:10, cursor:'pointer', color:'#dc2626' }}>🗑</button>
                </div>
              </div>
              {g.description && <div style={{ fontSize:11, color:'#7a7672', marginBottom:10 }}>{g.description}</div>}
              <div style={{ fontSize:9, color:'#7a7672', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>{membres.length} membre(s)</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {membres.map(u => (
                  <span key={u.id} style={{ fontSize:10, background:`${g.couleur}15`, color:g.couleur, padding:'2px 8px', borderRadius:99, fontWeight:600 }}>{u.nom.split(' ')[0]}</span>
                ))}
                {membres.length === 0 && <span style={{ fontSize:10, color:'#a09c98' }}>Aucun membre</span>}
              </div>
            </div>
          );
        })}
        {groupes.length === 0 && <div style={{ textAlign:'center', color:'#a09c98', padding:40, gridColumn:'1/-1' }}>Aucun groupe — créez votre premier groupe ci-dessus.</div>}
      </div>

      {editGroupe && (
        <Modal onClose={() => setEditGroupe(null)} maxWidth={520}>
          <GroupeForm form={form} f={f} users={users}
            membresDisponibles={users.filter(u => u.actif && !form.membres.includes(u.id))}
            addMembre={addMembre} removeMembre={removeMembre}
            onCancel={() => setEditGroupe(null)}
            onSave={() => saveEdit(editGroupe.id, form)}
            title="Modifier le groupe" />
        </Modal>
      )}
    </div>
  );
}

function GroupeForm({ form, f, users, membresDisponibles, addMembre, removeMembre, onCancel, onSave, title }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #d4cfc8', borderRadius:12, padding:18, boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
      <div style={{ fontSize:14, fontWeight:800, color:'#1a1a18', marginBottom:14 }}>{title}</div>
      <Field label="Nom du groupe *"><Input value={form.nom} onChange={e => f('nom', e.target.value)} placeholder="Ex: Équipe Terrain" /></Field>
      <Field label="Description"><Textarea value={form.description} onChange={e => f('description', e.target.value)} style={{ height:60 }} /></Field>
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:9, color:'#7a7672', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Membres ({form.membres.length})</div>
        {membresDisponibles.length > 0 && (
          <Select value="" onChange={e => addMembre(e.target.value)} style={{ marginBottom:8 }}>
            <option value="">+ Ajouter un membre...</option>
            {membresDisponibles.map(u => <option key={u.id} value={u.id}>{u.nom} — {u.poste || u.role}</option>)}
          </Select>
        )}
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {form.membres.map(uid => {
            const u = users.find(x => x.id === uid);
            return (
              <div key={uid} style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:99, padding:'3px 10px', display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
                <span style={{ color:'#1d4ed8', fontWeight:600 }}>{u?.nom}</span>
                <button onClick={() => removeMembre(uid)} style={{ background:'none', border:'none', color:'#dc2626', cursor:'pointer', fontSize:12 }}>✕</button>
              </div>
            );
          })}
        </div>
      </div>
      <Field label="Couleur">
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          {COLORS.map(c => <div key={c} onClick={() => f('couleur', c)} style={{ width:24, height:24, borderRadius:'50%', background:c, cursor:'pointer', border:`3px solid ${form.couleur===c?'#1a1a18':'transparent'}` }} />)}
        </div>
      </Field>
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:12 }}>
        <Btn onClick={onCancel}>Annuler</Btn>
        <Btn variant="primary" onClick={onSave} disabled={!form.nom}>Enregistrer</Btn>
      </div>
    </div>
  );
}
