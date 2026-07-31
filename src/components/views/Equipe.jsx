import React, { useState } from 'react';
import { Avatar, Btn, ProgressBar, Field, Input, Select } from '../UI';
import InviteModal from '../InviteModal';

export default function Equipe({ users, actions, setUsers, currentUser }) {
  const [showInvite, setShowInvite] = useState(false);
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 9, color: '#7a7672', textTransform: 'uppercase', letterSpacing: '.1em' }}>{users.filter(u => u.actif).length} actif(s)</div>
        {(currentUser.role === 'direction' || currentUser.role === 'manager') && (
          <Btn variant="primary" onClick={() => setShowInvite(true)}>📧 Inviter un membre</Btn>
        )}
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}

      {/* Info invitation */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#1d4ed8' }}>
        💡 Pour inviter un nouveau membre, cliquez sur "Inviter un membre". Il recevra un email avec un lien pour créer son mot de passe et accéder à l'application.
      </div>

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
                  {u.poste}{u.service ? ` · ${u.service}` : ''} ·{' '}
                  <span style={{ color: '#2563eb', textTransform: 'uppercase', fontSize: 9, fontWeight: 700 }}>{u.role}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', marginRight: 12 }}>
                <div style={{ fontSize: 10, color: '#7a7672' }}>{my.length} action(s)</div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: mp >= 70 ? '#16a34a' : mp >= 40 ? '#d97706' : '#dc2626' }}>{mp}%</div>
              </div>
              {currentUser.role === 'direction' && (
                <Btn onClick={() => setUsers(p => p.map(x => x.id === u.id ? { ...x, actif: !x.actif } : x))} style={{ fontSize: 10, padding: '4px 10px' }}>
                  {u.actif ? 'Désactiver' : 'Réactiver'}
                </Btn>
              )}
            </div>
            {my.length > 0 && <ProgressBar value={mp} color={mp >= 70 ? '#16a34a' : mp >= 40 ? '#d97706' : '#dc2626'} height={4} showPct={false} />}
          </div>
        );
      })}
    </div>
  );
}
