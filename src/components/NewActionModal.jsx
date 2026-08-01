import React, { useState } from 'react';
import { Modal, Btn, Field, Input, Select, Textarea } from './UI';
import { CATEGORIES, PRIORITES, gid, nowISO } from '../data/initial';

export default function NewActionModal({ users, projets, groupes, currentUser, onClose, onCreate }) {
  const [form, setForm] = useState({
    titre: '', description: '', categorie: 'Administratif', priorite: 'NORMALE',
    dateLimite: '', dureeAttendue: '', projetId: '', etapes: '',
  });
  const [assignMode, setAssignMode] = useState('individuel');
  const [assignes, setAssignes] = useState([]);
  const [selectedGroupe, setSelectedGroupe] = useState('');
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const agentsDisponibles = users.filter(u => u.actif && !assignes.find(a => a.userId === u.id));

  const addAssigne = (userId) => {
    if (!userId || assignes.find(a => a.userId === userId)) return;
    setAssignes(p => [...p, { userId, taches: '' }]);
  };
  const removeAssigne = (userId) => setAssignes(p => p.filter(a => a.userId !== userId));
  const updateTaches = (userId, taches) => setAssignes(p => p.map(a => a.userId === userId ? { ...a, taches } : a));

  const applyGroupe = (groupeId) => {
    setSelectedGroupe(groupeId);
    if (!groupeId) return;
    const g = groupes.find(x => x.id === groupeId);
    if (!g) return;
    const newAssignes = (g.membres || []).filter(uid => !assignes.find(a => a.userId === uid)).map(uid => ({ userId: uid, taches: '' }));
    setAssignes(p => [...p, ...newAssignes]);
  };

  const getAssignes = () => {
    if (assignMode === 'tous') return users.filter(u => u.actif).map(u => ({ userId: u.id, taches: '' }));
    return assignes;
  };

  const submit = () => {
    const finalAssignes = getAssignes();
    if (!form.titre || finalAssignes.length === 0) return;
    const etapesArr = form.etapes ? form.etapes.split('\n').filter(Boolean).map((t, i) => ({ id:`E${i+1}`, titre:t.trim(), fait:false, dateFait:null })) : [];
    const assignesData = finalAssignes.map(a => ({
      userId: a.userId,
      nom: users.find(u => u.id === a.userId)?.nom || '',
      taches: (a.taches || '').split('\n').filter(Boolean).map((t, i) => ({ id:`T${i+1}`, titre:t.trim(), fait:false, dateFait:null })),
    }));
    onCreate({
      id: gid('ACT'), titre: form.titre, description: form.description,
      categorie: form.categorie, priorite: form.priorite, statut: 'OUVERT',
      assigneA: finalAssignes[0]?.userId,
      assignes: assignesData,
      creeePar: currentUser.id,
      projetId: form.projetId || null,
      dateCreation: nowISO(),
      dateLimite: form.dateLimite ? new Date(form.dateLimite).toISOString() : null,
      dureeAttendue: form.dureeAttendue ? parseInt(form.dureeAttendue) : null,
      dateDebut: null, dateFin: null,
      etapes: etapesArr,
      journal: [{ id:gid('J'), auteurId:currentUser.id, action:`Créée, assignée à : ${assignesData.map(a=>a.nom).join(', ')}.`, date:nowISO(), type:'creation' }],
      commentaires: [], retardMotif: null, retardDetails: '', echecMotif: null, echecDetails: '',
      qrToken: gid('QR'),
    });
    onClose();
  };

  const currentAssignes = getAssignes();

  return (
    <Modal onClose={onClose} maxWidth={580}>
      <div style={{ fontSize:15, fontWeight:800, color:'#1a1a18', marginBottom:16 }}>Nouvelle mission</div>

      <Field label="Titre *"><Input value={form.titre} onChange={e => f('titre', e.target.value)} placeholder="Intitulé de la mission" /></Field>
      <Field label="Description"><Textarea value={form.description} onChange={e => f('description', e.target.value)} placeholder="Contexte, objectif..." style={{ height:60 }} /></Field>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Field label="Catégorie"><Select value={form.categorie} onChange={e => f('categorie', e.target.value)}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</Select></Field>
        <Field label="Priorité"><Select value={form.priorite} onChange={e => f('priorite', e.target.value)}>{PRIORITES.map(p=><option key={p}>{p}</option>)}</Select></Field>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Field label="Projet"><Select value={form.projetId} onChange={e => f('projetId', e.target.value)}><option value="">Sans projet</option>{projets.map(p=><option key={p.id} value={p.id}>{p.titre}</option>)}</Select></Field>
        <Field label="Durée attendue (h)"><Input type="number" value={form.dureeAttendue} onChange={e => f('dureeAttendue', e.target.value)} placeholder="Ex: 8" /></Field>
      </div>
      <Field label="Date limite"><Input type="datetime-local" value={form.dateLimite} onChange={e => f('dateLimite', e.target.value)} /></Field>

      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:9, color:'#7a7672', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>Assignation *</div>
        <div style={{ display:'flex', gap:6, marginBottom:12 }}>
          {[
            { id:'individuel', label:'👤 Individuel' },
            { id:'groupe', label:'👥 Groupe' },
            { id:'tous', label:'🏢 Tout le monde' },
          ].map(m => (
            <button key={m.id} onClick={() => setAssignMode(m.id)} style={{
              flex:1, padding:'7px 0', borderRadius:8, border:`2px solid ${assignMode===m.id?'#2563eb':'#d4cfc8'}`,
              background:assignMode===m.id?'#eff6ff':'#fff', color:assignMode===m.id?'#2563eb':'#7a7672',
              fontSize:11, cursor:'pointer', fontFamily:'inherit', fontWeight:assignMode===m.id?700:400,
            }}>{m.label}</button>
          ))}
        </div>

        {assignMode === 'individuel' && (
          <>
            <Select value="" onChange={e => addAssigne(e.target.value)} style={{ marginBottom:10 }}>
              <option value="">+ Ajouter une personne...</option>
              {agentsDisponibles.map(u => <option key={u.id} value={u.id}>{u.nom} — {u.poste || u.role}</option>)}
            </Select>
            {assignes.map(a => {
              const user = users.find(u => u.id === a.userId);
              return (
                <div key={a.userId} style={{ background:'#f5f4f0', border:'1px solid #d4cfc8', borderRadius:10, padding:12, marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <div>
                      <span style={{ fontWeight:700, fontSize:12 }}>{user?.nom}</span>
                      <span style={{ fontSize:10, color:'#7a7672', marginLeft:8 }}>{user?.poste || user?.role}</span>
                      {assignes[0]?.userId === a.userId && <span style={{ fontSize:9, background:'#dbeafe', color:'#1d4ed8', padding:'1px 6px', borderRadius:99, marginLeft:8, fontWeight:700 }}>Principal</span>}
                    </div>
                    <button onClick={() => removeAssigne(a.userId)} style={{ background:'none', border:'none', color:'#dc2626', cursor:'pointer', fontSize:14 }}>✕</button>
                  </div>
                  <div style={{ fontSize:9, color:'#7a7672', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Tâches (une par ligne)</div>
                  <Textarea value={a.taches} onChange={e => updateTaches(a.userId, e.target.value)} placeholder="Tâche 1&#10;Tâche 2" style={{ height:60 }} />
                </div>
              );
            })}
          </>
        )}

        {assignMode === 'groupe' && (
          <>
            <Select value={selectedGroupe} onChange={e => applyGroupe(e.target.value)} style={{ marginBottom:10 }}>
              <option value="">— Sélectionner un groupe —</option>
              {(groupes||[]).map(g => <option key={g.id} value={g.id}>{g.nom} ({(g.membres||[]).length} membres)</option>)}
            </Select>
            {assignes.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                {assignes.map(a => {
                  const u = users.find(x => x.id === a.userId);
                  return <span key={a.userId} style={{ fontSize:10, background:'#eff6ff', color:'#1d4ed8', padding:'3px 10px', borderRadius:99, fontWeight:600 }}>{u?.nom}</span>;
                })}
              </div>
            )}
            {groupes?.length === 0 && <div style={{ fontSize:11, color:'#a09c98', padding:10, textAlign:'center' }}>Aucun groupe créé — allez dans "Groupes" pour en créer un.</div>}
          </>
        )}

        {assignMode === 'tous' && (
          <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:8, padding:'10px 14px', fontSize:11, color:'#16a34a' }}>
            ✓ Mission assignée à tous les {users.filter(u=>u.actif).length} membres actifs
          </div>
        )}

        {currentAssignes.length === 0 && assignMode !== 'tous' && (
          <div style={{ textAlign:'center', color:'#a09c98', fontSize:11, padding:'10px', background:'#f5f4f0', borderRadius:8, border:'1px dashed #d4cfc8' }}>
            Sélectionnez des personnes ci-dessus
          </div>
        )}
      </div>

      <Field label="Étapes jalons (une par ligne)">
        <Textarea value={form.etapes} onChange={e => f('etapes', e.target.value)} placeholder={'Étape 1\nÉtape 2\nÉtape 3'} style={{ height:60 }} />
      </Field>

      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" onClick={submit} disabled={!form.titre || currentAssignes.length === 0}>Créer la mission</Btn>
      </div>
    </Modal>
  );
}
