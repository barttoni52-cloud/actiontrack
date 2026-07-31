import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Modal, Btn, Field, Input, Select } from './UI';

const ROLES = ['agent', 'manager', 'direction'];

export default function InviteModal({ onClose }) {
  const [form, setForm] = useState({ email: '', nom: '', poste: '', service: '', role: 'agent' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const invite = async () => {
    if (!form.email || !form.nom) { setError('Email et nom requis.'); return; }
    setLoading(true); setError(null);
    try {
      const avatar = form.nom.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const { error: signErr } = await supabase.auth.signUp({
        email: form.email,
        password: 'ActionTrack2024!',
        options: {
          data: { nom: form.nom, role: form.role, poste: form.poste, service: form.service, avatar },
          emailRedirectTo: window.location.origin,
        }
      });
      if (signErr) throw signErr;
      await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: window.location.origin });
      setSuccess(true);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  if (success) return (
    <Modal onClose={onClose} maxWidth={420}>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>✅</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1a18', marginBottom: 8 }}>Invitation envoyée !</div>
        <div style={{ fontSize: 12, color: '#7a7672', marginBottom: 6, lineHeight: 1.6 }}>
          <strong>{form.nom}</strong> va recevoir un email à <strong>{form.email}</strong> avec un lien pour créer son mot de passe.
        </div>
        <Btn variant="primary" onClick={onClose}>Fermer</Btn>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose} maxWidth={480}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a18' }}>Inviter un membre</div>
        <Btn onClick={onClose} style={{ background: 'none', border: 'none', color: '#a09c98', fontSize: 16, padding: 0 }}>✕</Btn>
      </div>
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 12, marginBottom: 14 }}>{error}</div>}
      <Field label="Email *"><Input type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="prenom.nom@entreprise.com" /></Field>
      <Field label="Nom complet *"><Input value={form.nom} onChange={e => f('nom', e.target.value)} placeholder="Prénom Nom" /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Poste"><Input value={form.poste} onChange={e => f('poste', e.target.value)} placeholder="Ex: Chargé de mission" /></Field>
        <Field label="Service"><Input value={form.service} onChange={e => f('service', e.target.value)} placeholder="Ex: Opérations" /></Field>
      </div>
      <Field label="Rôle">
        <Select value={form.role} onChange={e => f('role', e.target.value)}>
          {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </Select>
      </Field>
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#1d4ed8', marginBottom: 16 }}>
        📧 <strong>{form.email || 'La personne'}</strong> recevra un email avec un lien pour confirmer son compte et choisir son mot de passe.
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" onClick={invite} disabled={loading}>{loading ? 'Envoi...' : '📧 Envoyer l\'invitation'}</Btn>
      </div>
    </Modal>
  );
}
