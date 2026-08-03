import React, { useState, useMemo } from 'react';
import { supabase } from '../supabase';
import { Avatar, Btn } from './UI';

export default function ProfileModal({ currentUser, actions, onClose, onUserUpdated }) {
  const [nom, setNom] = useState(currentUser.nom);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingNom, setSavingNom] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'error', text }

  const stats = useMemo(() => {
    const mine = actions.filter(a => a.assigneA === currentUser.id || (a.assignes || []).some(x => x.userId === currentUser.id));
    const validees = mine.filter(a => a.statut === 'VALIDÉ').length;
    const rejetees = mine.filter(a => a.statut === 'REJETÉ').length;
    const enRetard = mine.filter(a => a.dateLimite && new Date(a.dateLimite) < new Date() && !['VALIDÉ','ARCHIVÉ','REJETÉ'].includes(a.statut)).length;
    const taux = mine.length > 0 ? Math.round((validees / mine.length) * 100) : 0;
    return { total: mine.length, validees, rejetees, enRetard, taux };
  }, [actions, currentUser.id]);

  const saveNom = async () => {
    if (!nom.trim() || nom.trim() === currentUser.nom) return;
    setSavingNom(true);
    setMsg(null);
    const { error } = await supabase.from('profiles').update({ nom: nom.trim() }).eq('id', currentUser.id);
    setSavingNom(false);
    if (error) { setMsg({ type: 'error', text: 'Erreur : ' + error.message }); return; }
    setMsg({ type: 'success', text: 'Nom mis à jour.' });
    onUserUpdated && onUserUpdated({ ...currentUser, nom: nom.trim() });
  };

  const savePassword = async () => {
    setMsg(null);
    if (newPassword.length < 6) { setMsg({ type: 'error', text: 'Le mot de passe doit faire au moins 6 caractères.' }); return; }
    if (newPassword !== confirmPassword) { setMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' }); return; }
    setSavingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPwd(false);
    if (error) { setMsg({ type: 'error', text: 'Erreur : ' + error.message }); return; }
    setMsg({ type: 'success', text: 'Mot de passe mis à jour.' });
    setNewPassword(''); setConfirmPassword('');
  };

  const S = {
    overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
    modal: { background:'#fff', borderRadius:14, padding:24, width:420, maxHeight:'90vh', overflowY:'auto', fontFamily:"'Courier New', monospace" },
    label: { fontSize:10, color:'#7a7672', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4, display:'block' },
    input: { background:'#f5f4f0', border:'1px solid #c4bfb8', borderRadius:8, color:'#1a1a18', padding:'10px 14px', fontSize:13, fontFamily:'inherit', width:'100%', outline:'none', marginBottom:10, boxSizing:'border-box' },
    section: { borderTop:'1px solid #e8e4de', paddingTop:16, marginTop:16 },
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <Avatar initials={currentUser.avatar} size={40} />
          <div>
            <div style={{ fontWeight:800, fontSize:15, color:'#1a1a18' }}>{currentUser.nom}</div>
            <div style={{ fontSize:10, color:'#a09c98', textTransform:'uppercase' }}>{currentUser.role} {currentUser.poste ? '· ' + currentUser.poste : ''}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#7a7672' }}>✕</button>
        </div>

        {msg && (
          <div style={{ background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${msg.type === 'success' ? '#86efac' : '#fca5a5'}`, color: msg.type === 'success' ? '#16a34a' : '#dc2626', borderRadius:8, padding:'8px 12px', fontSize:11, marginBottom:14 }}>
            {msg.text}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:6 }}>
          <StatBox label="Total" value={stats.total} />
          <StatBox label="Validées" value={stats.validees} color="#16a34a" />
          <StatBox label="Retard" value={stats.enRetard} color="#dc2626" />
          <StatBox label="Taux" value={`${stats.taux}%`} color="#2563eb" />
        </div>

        <div style={S.section}>
          <label style={S.label}>Nom</label>
          <input style={S.input} value={nom} onChange={e => setNom(e.target.value)} />
          <Btn variant="primary" onClick={saveNom} disabled={savingNom || !nom.trim() || nom.trim() === currentUser.nom}>
            {savingNom ? 'Enregistrement...' : 'Enregistrer le nom'}
          </Btn>
        </div>

        <div style={S.section}>
          <label style={S.label}>Nouveau mot de passe</label>
          <input style={S.input} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 caractères" />
          <label style={S.label}>Confirmer</label>
          <input style={S.input} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          <Btn variant="primary" onClick={savePassword} disabled={savingPwd || !newPassword || !confirmPassword}>
            {savingPwd ? 'Enregistrement...' : 'Changer le mot de passe'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color = '#1a1a18' }) {
  return (
    <div style={{ background:'#f5f4f0', borderRadius:8, padding:'10px 8px', textAlign:'center' }}>
      <div style={{ fontSize:16, fontWeight:900, color, fontFamily:'monospace' }}>{value}</div>
      <div style={{ fontSize:8, color:'#a09c98', textTransform:'uppercase', letterSpacing:'.05em', marginTop:2 }}>{label}</div>
    </div>
  );
}
