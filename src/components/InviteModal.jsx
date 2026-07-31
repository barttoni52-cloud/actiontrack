import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Modal, Btn, Field, Input, Select } from './UI';

const ROLES = ['agent', 'manager', 'direction'];

const supabaseSignup = createClient(
  'https://fmgwvmvzufxoabtxtcls.supabase.co',
  'sb_publishable_TK0IPcl9hYoWoZ-wZxBfkQ_6ppBmvox',
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const genPassword = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyz';
  const nums = '23456789';
  const special = '!@#$';
  const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  let pwd = '';
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += special[Math.floor(Math.random() * special.length)];
  for (let i = 0; i < 6; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  for (let i = 0; i < 2; i++) pwd += nums[Math.floor(Math.random() * nums.length)];
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
};

export default function InviteModal({ onClose }) {
  const [form, setForm] = useState({ email: '', nom: '', poste: '', service: '', role: 'agent' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const invite = async () => {
    if (!form.email || !form.nom) { setError('Email et nom requis.'); return; }
    setLoading(true); setError(null);
    try {
      const avatar = form.nom.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const password = genPassword();
      const { error: signErr } = await supabaseSignup.auth.signUp({
        email: form.email,
        password,
        options: {
          data: { nom: form.nom, role: form.role, poste: form.poste, service: form.service, avatar },
          emailRedirectTo: window.location.origin,
        }
      });
      if (signErr) throw signErr;
      setResult({ nom: form.nom, email: form.email, password });
    } catch (e) {
      setError(e.message === 'User already registered' ? 'Cet email est déjà enregistré.' : e.message);
    }
    setLoading(false);
  };

  const copyAll = () => {
    const text = `ActionTrack — Identifiants\nURL : ${window.location.origin}\nEmail : ${result.email}\nMot de passe : ${result.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (result) return (
    <Modal onClose={onClose} maxWidth={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1a18' }}>Compte créé !</div>
          <div style={{ fontSize: 11, color: '#7a7672', marginTop: 4 }}>Transmettez ces identifiants à <strong>{result.nom}</strong></div>
        </div>
        <div style={{ background: '#f5f4f0', border: '1px solid #d4cfc8', borderRadius: 10, padding: 16 }}>
          {[
            { l: 'URL de connexion', v: window.location.origin },
            { l: 'Email', v: result.email },
            { l: 'Mot de passe', v: result.password },
          ].map(({ l, v }) => (
            <div key={l} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: '#7a7672', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a18', fontFamily: 'monospace', background: '#fff', padding: '8px 10px', borderRadius: 6, border: '1px solid #d4cfc8' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#92400e' }}>
          ⚠ Notez ce mot de passe maintenant — il ne sera plus affiché.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="primary" onClick={copyAll} style={{ flex: 1 }}>{copied ? '✓ Copié !' : '📋 Copier les identifiants'}</Btn>
          <Btn onClick={onClose} style={{ flex: 1 }}>Fermer</Btn>
        </div>
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
        🔐 Un mot de passe sécurisé sera généré et affiché pour que vous puissiez le transmettre à l'agent.
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" onClick={invite} disabled={loading}>{loading ? 'Création...' : '🔐 Créer le compte'}</Btn>
      </div>
    </Modal>
  );
}
