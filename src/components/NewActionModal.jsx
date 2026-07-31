import React, { useState } from 'react';
import { Modal, Btn, Field, Input, Select, Textarea } from './UI';
import { CATEGORIES, PRIORITES, gid, nowISO } from '../data/initial';

export default function NewActionModal({ users, projets, currentUser, onClose, onCreate }) {
  const [form, setForm] = useState({
    titre: '', description: '', categorie: 'Administratif', priorite: 'NORMALE',
    dateLimite: '', dureeAttendue: '', projetId: '', etapes: '',
  });
  const [assignes, setAssignes] = useState([]);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const agentsDisponibles = users.filter(u => u.actif && !assignes.find(a => a.userId === u.id));

  const addAssigne = (userId) => {
    if (!userId || assignes.find(a => a.userId === userId)) return;
    setAssignes(p => [...p, { userId, taches: '' }]);
  };

  const removeAssigne = (userId) => setAssignes(p => p.filter(a => a.userId !== userId));

  const updateTaches = (userId, taches) => setAssignes(p => p.map(a => a.userId === userId ? { ...a, taches } : a));

  const submit = () => {
    if (!form.titre || assignes.length === 0) return;
    const etapesArr = form.etapes
      ? form.etapes.split('\n').filter(Boolean).map((t, i) => ({ id: `E${i + 1}`, titre: t.trim(), fait: false, dateFait: null }))
      : [];
    const assignesData = assignes.map(a => ({
      userId: a.userId,
      nom: users.find(u => u.id === a.userId)?.nom || '',
      taches: a.taches.split('\n').filter(Boolean).map((t, i) => ({ id: `T${i + 1}`, titre: t.trim(), fait: false, dateFait: null })),
    }));
    const assignePrincipal = assignes[0]?.userId;
    onCreate({
      id: gid('ACT'), titre: form.titre, description: form.description,
      categorie: form.categorie, priorite: form.priorite, statut: 'OUVERT',
      assigneA: assignePrincipal,
      assignes: assignesData,
      creeePar: currentUser.id,
      projetId: form.projetId || null,
      dateCreation: nowISO(),
      dateLimite: form.dateLimite ? new Date(form.dateLimite).toISOString() : null,
      dureeAttendue: form.dureeAttendue ? parseInt(form.dureeAttendue) : null,
      dateDebut: null, dateFin: null,
      etapes: etapesArr,
      journal: [{ id: gid('J'), auteurId: currentUser.id, action: `Créée, assignée à : ${assignesData.map(a => a.nom).join(', ')}.`, date: nowISO(), type: 'creation' }],
      commentaires: [], retardMotif: null, retardDetails: '', echecMotif: null, echecDetails: '',
      qrToken: gid('QR'),
    });
    onClose();
  };

  return (
    <Modal onClose={onClose} maxWidth={560}>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1a18', marginBottom: 16 }}>Nouvelle action</div>

      <Field label="Titre *">
        <Input value={form.titre} onChange={e => f('titre', e.target.value)} placeholder="Intitulé de l'action" />
      </Field>
      <Field label="Description">
        <Textarea value={form.description} onChange={e => f('description', e.target.value)} placeholder="Contexte, objectif..." style={{ height: 60 }} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Catégorie">
          <Select value={form.categorie} onChange={e => f('categorie', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Priorité">
          <Select value={form.priorite} onChange={e => f('priorite', e.target.value)}>
            {PRIORITES.map(p => <option key={p}>{p}</option>)}
          </Select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Projet">
          <Select value={form.projetId} onChange={e => f('projetId', e.target.value)}>
            <option value="">Sans projet</option>
            {projets.map(p => <option key={p.id} value={p.id}>{p.titre}</option>)}
          </Select>
        </Field>
        <Field label="Durée attendue (h)">
          <Input type="number" value={form.dureeAttendue} onChange={e => f('dureeAttendue', e.target.value)} placeholder="Ex: 8" />
        </Field>
      </div>
      <Field label="Date limite">
        <Input type="datetime-local" value={form.dateLimite} onChange={e => f('dateLimite', e.target.value)} />
      </Field>

      {/* Multi-assignation */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: '#7a7672', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
          Personnes assignées * ({assignes.length} sélectionnée{assignes.length > 1 ? 's' : ''})
        </div>
        {agentsDisponibles.length > 0 && (
          <Select value="" onChange={e => addAssigne(e.target.value)} style={{ marginBottom: 10 }}>
            <option value="">+ Ajouter une personne...</option>
            {agentsDisponibles.map(u => (
              <option key={u.id} value={u.id}>{u.nom} — {u.poste || u.role}</option>
            ))}
          </Select>
        )}
        {assignes.map(a => {
          const user = users.find(u => u.id === a.userId);
          return (
            <div key={a.userId} style={{ background: '#f5f4f0', border: '1px solid #d4cfc8', borderRadius: 10, padding: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 12, color: '#1a1a18' }}>{user?.nom}</span>
                  <span style={{ fontSize: 10, color: '#7a7672', marginLeft: 8 }}>{user?.poste || user?.role}</span>
                  {assignes[0]?.userId === a.userId && (
                    <span style={{ fontSize: 9, background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: 99, marginLeft: 8, fontWeight: 700 }}>Responsable principal</span>
                  )}
                </div>
                <button onClick={() => removeAssigne(a.userId)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 14 }}>✕</button>
              </div>
              <div style={{ fontSize: 9, color: '#7a7672', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
                Tâches de {user?.nom?.split(' ')[0]} (une par ligne)
              </div>
              <Textarea value={a.taches} onChange={e => updateTaches(a.userId, e.target.value)} placeholder={`Ex:\nVérifier les documents\nRédiger le rapport`} style={{ height: 70 }} />
            </div>
          );
        })}
        {assignes.length === 0 && (
          <div style={{ textAlign: 'center', color: '#a09c98', fontSize: 11, padding: '12px 0', background: '#f5f4f0', borderRadius: 8, border: '1px dashed #d4cfc8' }}>
            Sélectionnez les personnes dans la liste ci-dessus
          </div>
        )}
      </div>

      <Field label="Étapes jalons globaux (une par ligne)">
        <Textarea value={form.etapes} onChange={e => f('etapes', e.target.value)} placeholder={'Collecter les données\nAnalyser\nRédiger'} style={{ height: 60 }} />
      </Field>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" onClick={submit} disabled={!form.titre || assignes.length === 0}>Créer l'action</Btn>
      </div>
    </Modal>
  );
}
