import React, { useState } from 'react';
import { Modal, Btn, Field, Input, Select, Textarea } from './UI';
import { CATEGORIES, PRIORITES, gid, nowISO } from '../data/initial';

export default function NewActionModal({ users, projets, currentUser, onClose, onCreate }) {
  const [form, setForm] = useState({
    titre: '', description: '', categorie: 'Administratif', priorite: 'NORMALE',
    assigneA: '', dateLimite: '', dureeAttendue: '', projetId: '', etapes: '',
  });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.titre || !form.assigneA) return;
    const assigneName = users.find(u => u.id === form.assigneA)?.nom || '';
    const etapesArr = form.etapes
      ? form.etapes.split('\n').filter(Boolean).map((t, i) => ({ id: `E${i + 1}`, titre: t.trim(), fait: false, dateFait: null }))
      : [];
    onCreate({
      id: gid('ACT'), titre: form.titre, description: form.description,
      categorie: form.categorie, priorite: form.priorite, statut: 'OUVERT',
      assigneA: form.assigneA, creeePar: currentUser.id,
      projetId: form.projetId || null,
      dateCreation: nowISO(),
      dateLimite: form.dateLimite ? new Date(form.dateLimite).toISOString() : null,
      dureeAttendue: form.dureeAttendue ? parseInt(form.dureeAttendue) : null,
      dateDebut: null, dateFin: null,
      etapes: etapesArr,
      journal: [{ id: gid('J'), auteurId: currentUser.id, action: `Créée, assignée à ${assigneName}.`, date: nowISO(), type: 'creation' }],
      commentaires: [], retardMotif: null, retardDetails: '', echecMotif: null, echecDetails: '',
      qrToken: gid('QR'),
    });
    onClose();
  };

  return (
    <Modal onClose={onClose} maxWidth={520}>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1a18', marginBottom: 16 }}>Nouvelle action</div>
      <Field label="Titre *">
        <Input value={form.titre} onChange={e => f('titre', e.target.value)} placeholder="Intitulé de l'action" />
      </Field>
      <Field label="Description">
        <Textarea value={form.description} onChange={e => f('description', e.target.value)} placeholder="Contexte, objectif..." style={{ height: 70 }} />
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
      <Field label="Assigné à *">
        <Select value={form.assigneA} onChange={e => f('assigneA', e.target.value)}>
          <option value="">— Sélectionner —</option>
          {users.filter(u => u.actif).map(u => (
            <option key={u.id} value={u.id}>{u.nom} ({u.poste})</option>
          ))}
        </Select>
      </Field>
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
      <Field label="Étapes jalons (une par ligne)">
        <Textarea
          value={form.etapes} onChange={e => f('etapes', e.target.value)}
          placeholder={'Collecter les données\nAnalyser\nRédiger le rapport'}
          style={{ height: 80 }}
        />
      </Field>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" onClick={submit}>Créer l'action</Btn>
      </div>
    </Modal>
  );
}
