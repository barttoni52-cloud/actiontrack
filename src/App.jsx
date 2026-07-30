import React, { useState, useCallback } from 'react';
import { Avatar, Btn, NotifStack } from './components/UI';
import Dashboard from './components/views/Dashboard';
import Actions from './components/views/Actions';
import Manager from './components/views/Manager';
import Journal from './components/views/Journal';
import Projets from './components/views/Projets';
import Equipe from './components/views/Equipe';
import ActionDetail from './components/ActionDetail';
import QRModal from './components/QRModal';
import NewActionModal from './components/NewActionModal';
import { INITIAL_USERS, INITIAL_PROJETS, INITIAL_ACTIONS, gid, nowISO } from './data/initial';

// ─── STYLES GLOBAUX ───────────────────────────────────────────────────────────
const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', Courier, monospace; background: #f5f4f0; color: #1a1a18; }
  button:hover { filter: brightness(0.96); }
  input:focus, select:focus, textarea:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #f0ede8; }
  ::-webkit-scrollbar-thumb { background: #c4bfb8; border-radius: 99px; }
`;

export default function App() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [actions, setActions] = useState(INITIAL_ACTIONS);
  const [projets, setProjets] = useState(INITIAL_PROJETS);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [qrActionId, setQrActionId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [notifs, setNotifs] = useState([]);

  // ─── NOTIFS ───────────────────────────────────────────────────────────────
  const pushNotif = useCallback((titre, message, type = 'info') => {
    const id = gid('N');
    setNotifs(p => [...p, { id, titre, message, type }]);
    setTimeout(() => setNotifs(p => p.filter(n => n.id !== id)), 6000);
  }, []);
  const dismissNotif = (id) => setNotifs(p => p.filter(n => n.id !== id));

  // ─── ACTIONS CRUD ─────────────────────────────────────────────────────────
  const updateAction = useCallback((id, patch) => {
    setActions(p => p.map(a => a.id === id ? { ...a, ...patch } : a));
  }, []);

  const addJournal = useCallback((actionId, texte, type = 'mise_a_jour') => {
    setActions(p => p.map(a =>
      a.id === actionId
        ? { ...a, journal: [...a.journal, { id: gid('J'), auteurId: currentUser.id, action: texte, date: nowISO(), type }] }
        : a
    ));
  }, [currentUser]);

  const createAction = useCallback((newAction) => {
    setActions(p => [newAction, ...p]);
  }, []);

  // ─── QR VALIDATE ──────────────────────────────────────────────────────────
  const handleQRValidate = useCallback((actionId, { comment, retardMotif, retardDetails, echecMotif, echecDetails, statut }) => {
    const action = actions.find(a => a.id === actionId);
    const newStatut = statut || 'VALIDÉ';
    const patch = { statut: newStatut };
    if (newStatut === 'VALIDÉ') patch.dateFin = nowISO();
    if (retardMotif) { patch.retardMotif = retardMotif; patch.retardDetails = retardDetails || ''; }
    if (echecMotif) { patch.echecMotif = echecMotif; patch.echecDetails = echecDetails || ''; }
    if (comment) {
      const curr = actions.find(a => a.id === actionId);
      patch.commentaires = [...(curr?.commentaires || []), {
        id: gid('C'), auteurId: currentUser.id, texte: comment, date: nowISO(),
        type: retardMotif ? 'retard' : echecMotif ? 'echec' : 'normal', photos: [],
      }];
    }
    const journalEntry = {
      id: gid('J'), auteurId: currentUser.id,
      action: newStatut === 'VALIDÉ'
        ? `✅ Validée via QR Code.${retardMotif ? ' Retard : ' + retardMotif : ''}`
        : `❌ Non réalisée : ${echecMotif}`,
      date: nowISO(),
      type: newStatut === 'VALIDÉ' ? 'validation' : 'rejet',
    };
    setActions(p => p.map(a => a.id === actionId ? { ...a, ...patch, journal: [...a.journal, journalEntry] } : a));
    if (newStatut === 'VALIDÉ') {
      pushNotif('✅ Action validée !', `"${action?.titre}" validée par ${currentUser.nom}.`, 'success');
    } else {
      pushNotif('❌ Échec signalé', `"${action?.titre}" : ${echecMotif}.`, 'warning');
    }
    setQrActionId(null);
  }, [actions, currentUser, pushNotif]);

  // ─── NAV ──────────────────────────────────────────────────────────────────
  const NAV = [
    ...(currentUser?.role !== 'agent' ? [{ id: 'dashboard', label: 'Dashboard', icon: '◈' }] : []),
    { id: 'actions', label: 'Actions', icon: '◆' },
    { id: 'projets', label: 'Projets', icon: '⬡' },
    ...(currentUser?.role !== 'agent' ? [
      { id: 'vue_manager', label: 'Vue Manager', icon: '▦' },
      { id: 'journal', label: 'Journal', icon: '≡' },
    ] : []),
    ...(currentUser?.role === 'direction' ? [{ id: 'equipe', label: 'Équipe', icon: '◉' }] : []),
  ];

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 420, width: '100%', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontSize: 9, letterSpacing: '.3em', color: '#a09c98', marginBottom: 10 }}>SYSTÈME DE GESTION</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#1a1a18', letterSpacing: '-.02em' }}>
                ACTION<span style={{ color: '#2563eb' }}>TRACK</span>
              </div>
              <div style={{ fontSize: 11, color: '#7a7672', marginTop: 8 }}>Traçabilité · Projets · Performance</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {INITIAL_USERS.filter(u => u.actif).map(u => (
                <button
                  key={u.id}
                  onClick={() => { setCurrentUser(u); setView(u.role === 'agent' ? 'actions' : 'dashboard'); }}
                  style={{
                    background: '#fff', border: '1px solid #d4cfc8', borderRadius: 10,
                    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14,
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    boxShadow: '0 1px 3px rgba(0,0,0,.06)', transition: 'all .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#d4cfc8'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; }}
                >
                  <Avatar initials={u.avatar} size={42} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a18' }}>{u.nom}</div>
                    <div style={{ fontSize: 10, color: '#7a7672', marginTop: 2 }}>
                      {u.poste} · <span style={{ color: '#2563eb', textTransform: 'uppercase', fontSize: 9, fontWeight: 700 }}>{u.role}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── APP ──────────────────────────────────────────────────────────────────
  const viewProps = { actions, users, projets, currentUser, onSelect: setSelectedActionId };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* Sidebar */}
        <div style={{ width: 200, background: '#fff', borderRight: '1px solid #d4cfc8', display: 'flex', flexDirection: 'column', flexShrink: 0, boxShadow: '1px 0 4px rgba(0,0,0,.04)' }}>
          <div style={{ padding: '16px 14px', borderBottom: '1px solid #e8e4de' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1a1a18' }}>
              ACTION<span style={{ color: '#2563eb' }}>TRACK</span>
            </div>
            <div style={{ fontSize: 8, color: '#a09c98', marginTop: 2, letterSpacing: '.1em' }}>v2 · GESTION · PROJETS</div>
          </div>
          <nav style={{ padding: '10px 8px', flex: 1 }}>
            {NAV.map(n => (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                style={{
                  width: '100%', background: view === n.id ? '#eff6ff' : 'transparent',
                  border: 'none', borderRadius: 8, padding: '9px 10px',
                  textAlign: 'left', color: view === n.id ? '#2563eb' : '#7a7672',
                  cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', marginBottom: 2,
                  display: 'flex', alignItems: 'center', gap: 10, fontWeight: view === n.id ? 700 : 400,
                  transition: 'all .1s',
                }}
                onMouseEnter={e => { if (view !== n.id) { e.currentTarget.style.background = '#f5f4f0'; e.currentTarget.style.color = '#1a1a18'; } }}
                onMouseLeave={e => { if (view !== n.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7a7672'; } }}
              >
                <span style={{ fontSize: 9 }}>{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: '12px 14px', borderTop: '1px solid #e8e4de' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Avatar initials={currentUser.avatar} size={28} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a18' }}>{currentUser.nom.split(' ')[0]}</div>
                <div style={{ fontSize: 9, color: '#a09c98', textTransform: 'uppercase' }}>{currentUser.role}</div>
              </div>
            </div>
            <Btn onClick={() => setCurrentUser(null)} style={{ width: '100%', fontSize: 10 }}>Changer de compte</Btn>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '12px 22px', borderBottom: '1px solid #d4cfc8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#1a1a18' }}>{NAV.find(n => n.id === view)?.label || '—'}</div>
            {currentUser.role !== 'agent' && <Btn variant="primary" onClick={() => setShowNew(true)}>+ Nouvelle action</Btn>}
          </div>
          <div style={{ flex: 1, padding: 22, overflowY: 'auto' }}>
            {view === 'dashboard'    && <Dashboard   {...viewProps} onSelectAction={setSelectedActionId} />}
            {view === 'actions'      && <Actions     {...viewProps} onQRScan={setQrActionId} />}
            {view === 'projets'      && <Projets     {...viewProps} onSelectAction={setSelectedActionId} setProjets={setProjets} />}
            {view === 'vue_manager'  && <Manager     {...viewProps} />}
            {view === 'journal'      && <Journal     {...viewProps} />}
            {view === 'equipe'       && <Equipe      users={users} actions={actions} setUsers={setUsers} />}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedActionId && (
        <ActionDetail
          actionId={selectedActionId} actions={actions} users={users} currentUser={currentUser}
          onClose={() => setSelectedActionId(null)} onUpdate={updateAction} onAddJournal={addJournal}
          onQRScan={(id) => { setSelectedActionId(null); setQrActionId(id); }}
        />
      )}
      {qrActionId && (
        <QRModal actionId={qrActionId} actions={actions} currentUser={currentUser} onClose={() => setQrActionId(null)} onValidate={handleQRValidate} />
      )}
      {showNew && (
        <NewActionModal users={users} projets={projets} currentUser={currentUser} onClose={() => setShowNew(false)} onCreate={createAction} />
      )}

      <NotifStack notifs={notifs} dismiss={dismissNotif} />
    </>
  );
}
