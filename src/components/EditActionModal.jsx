import React, { useState } from 'react';
import { Modal, Btn, Field, Input, Select, Textarea } from './UI';
import { CATEGORIES, PRIORITES, STATUTS, gid, nowISO, formatDate } from '../data/initial';

export default function EditActionModal({ action, users, currentUser, onClose, onSave }) {
  const [form, setForm] = useState({
    titre: action.titre || '',
    description: action.description || '',
    categorie: action.categorie || 'Administratif',
    priorite: action.priorite || 'NORMALE',
    statut: action.statut || 'OUVERT',
    dateLimite: action.dateLimite ? new Date(action.dateLimite).toISOString().slice(0, 16) : '',
    dureeAttendue: action.dureeAttendue || '',
    assigneA: action.assigneA || '',
  });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = () => {
    const patch = {
      titre: form.titre,
      description: form.description,
      categorie: form.categorie,
      priorite: form.priorite,
      statut: form.statut,
      assigneA: form.assigneA,
      dateLimite: form.dateLimite ? new Date(form.dateLimite).toISOString() : null,
      dureeAttendue: form.dureeAttendue ? parseInt(form.dureeAttendue) : null,
    };
    if (form.statut === 'VALIDÉ' && action.statut !== 'VALIDÉ') patch.dateFin = nowISO();
    const journalEntry = {
      id: gid('J'),
      auteurId: currentUser.id,
      action: `✏️ Mission modifiée par ${currentUser.nom} le ${formatDate(nowISO())}.`,
      date: nowISO(),
      type: 'mise_a_jour',
    };
    onSave(action.id, patch, journalEntry);
    onClose();
  };

  return (
    <Modal onClose={onClose} maxWidth={560}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ fontSize:16, fontWeight:800, color:'#1a1a18' }}>Modifier la mission</div>
        <div style={{ fontSize:10, color:'#a09c98', fontFamily:'monospace' }}>{action.id}</div>
      </div>

      <Field label="Titre *">
        <Input value={form.titre} onChange={e => f('titre', e.target.value)} />
      </Field>
      <Field label="Description">
        <Textarea value={form.description} onChange={e => f('description', e.target.value)} style={{ height:80 }} />
      </Field>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
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
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Field label="Statut">
          <Select value={form.statut} onChange={e => f('statut', e.target.value)}>
            {STATUTS.map(s => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Assigné à">
          <Select value={form.assigneA} onChange={e => f('assigneA', e.target.value)}>
            <option value="">— Sélectionner —</option>
            {users.filter(u => u.actif).map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
          </Select>
        </Field>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Field label="Date limite">
          <Input type="datetime-local" value={form.dateLimite} onChange={e => f('dateLimite', e.target.value)} />
        </Field>
        <Field label="Durée attendue (h)">
          <Input type="number" value={form.dureeAttendue} onChange={e => f('dureeAttendue', e.target.value)} placeholder="Ex: 8" />
        </Field>
      </div>

      <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'10px 14px', fontSize:11, color:'#1d4ed8', marginBottom:16 }}>
        ℹ️ La date et l'heure de modification seront visibles par l'agent dans le journal de la mission.
      </div>

      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" onClick={save} disabled={!form.titre}>Enregistrer les modifications</Btn>
      </div>
    </Modal>
  );
}
