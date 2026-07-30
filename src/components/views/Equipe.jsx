import React, { useState } from 'react';
import { Avatar, Btn, ProgressBar, Field, Input, Select } from '../UI';
import { ROLES, gid } from '../../data/initial';

export default function Equipe({ users, actions, setUsers }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', poste: '', service: '', role: 'agent' });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const add = () => {
    if (!form.nom) return;
    const initials = form.nom.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    setUsers(p => [...p, { ...form, id: gid('U'), avatar: initials, actif: true }]);
    setForm({ nom: '', poste: '', service: '', role: 'agent' });
    setShowForm(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 9, color: '#7a7672', textTransform: 'uppercase', letterSpacing: '.1em' }}>{users.filter(u => u.actif).length} actif(s)</div>
        <Btn variant="primary" onClick={() => setShowForm(p => !p)}>+ Ajouter</Btn>
      </div>
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #d4cfc8', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Nom *"><Input value={form.nom} onChange={e => f('nom', e.target.value)} placeholder="Prénom Nom" /></Field>
            <Field label="Poste"><Input value={form.poste} onChange={e => f('poste', e.target.value)} /></Field>
            <Field label="Service"><Input value={form.service} onChange={e => f('service', e.target.value)} /></Field>
            <Field label="Rôle">
              <Select value={form.role} onChange={e => f('role', e.target.value)}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </Select>
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn onClick={() => setShowForm(false)}>Annuler</Btn>
            <Btn variant="primary" onClick={add}>Créer</Btn>
          </div>
        </div>
      )}
      {users.map(u => {
        const my = actions.filter(a => a.assigneA === u.id);
        const mv = my.filter(a => a.statut === 'VALIDÉ').length;
        const mp = my.length ? Math.round(mv / my.length * 100) : 0;
        return (
          <div key={u.id} style={{ background: '#fff', border: '1px solid #d4cfc8', borderRadius: 10, padding: '12px 16px', opacity: u.actif ? 1 : .4, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: my.length > 0 ? 10 : 0 }}>
              <Avatar initials={u.avatar} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a18' }}>{u.nom}</div>
                <div style={{ fontSize: 10, color: '#7a7672' }}>
                  {u.poste} · {u.service} · <span style={{ color: '#2563eb', textTransform: 'uppercase', fontSize: 9, fontWeight: 700 }}>{u.role}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', marginRight: 12 }}>
                <div style={{ fontSize: 10, color: '#7a7672' }}>{my.length} action(s)</div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: mp >= 70 ? '#16a34a' : mp >= 40 ? '#d97706' : '#dc2626' }}>{mp}%</div>
              </div>
              <Btn onClick={() => setUsers(p => p.map(x => x.id === u.id ? { ...x, actif: !x.actif } : x))} style={{ fontSize: 10, padding: '4px 10px' }}>
                {u.actif ? 'Désactiver' : 'Réactiver'}
              </Btn>
            </div>
            {my.length > 0 && <ProgressBar value={mp} color={mp >= 70 ? '#16a34a' : mp >= 40 ? '#d97706' : '#dc2626'} height={4} showPct={false} />}
          </div>
        );
      })}
    </div>
  );
}
