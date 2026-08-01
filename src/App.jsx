import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import Auth from './components/Auth';
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
import { gid, nowISO, INITIAL_PROJETS, INITIAL_ACTIONS, INITIAL_USERS } from './data/initial';

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', Courier, monospace; background: #f5f4f0; color: #1a1a18; }
  input:focus, select:focus, textarea:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f0ede8; } ::-webkit-scrollbar-thumb { background: #c4bfb8; border-radius: 99px; }
`;

// Convertit un profil Supabase en format utilisateur app
const profileToUser = (p) => ({
  id: p.id, nom: p.nom, role: p.role,
  poste: p.poste || '', service: p.service || '',
  avatar: p.avatar || p.nom?.slice(0, 2).toUpperCase() || '??',
  actif: p.actif !== false,
});

// Convertit une action Supabase en format app
const dbToAction = (a) => ({
  id: a.id, titre: a.titre, description: a.description || '',
  projetId: a.projet_id, categorie: a.categorie, priorite: a.priorite,
  statut: a.statut, assigneA: a.assigne_a, creeePar: a.cree_par,
  dateCreation: a.date_creation, dateLimite: a.date_limite,
  dureeAttendue: a.duree_attendue, dateDebut: a.date_debut, dateFin: a.date_fin,
  etapes: a.etapes || [], journal: a.journal || [],
  commentaires: a.commentaires || [],
  retardMotif: a.retard_motif, retardDetails: a.retard_details,
  echecMotif: a.echec_motif, echecDetails: a.echec_details,
 qrToken: a.qr_token, assignes: a.assignes || [],
});

const actionToDB = (a) => ({
  id: a.id, titre: a.titre, description: a.description,
  projet_id: a.projetId || null, categorie: a.categorie, priorite: a.priorite,
  statut: a.statut, assigne_a: a.assigneA, cree_par: a.creeePar,
  date_creation: a.dateCreation, date_limite: a.dateLimite,
  duree_attendue: a.dureeAttendue, date_debut: a.dateDebut, date_fin: a.dateFin,
  etapes: a.etapes, journal: a.journal, commentaires: a.commentaires,
  retard_motif: a.retardMotif, retard_details: a.retardDetails,
  echec_motif: a.echecMotif, echec_details: a.echecDetails,
 qr_token: a.qrToken, assignes: a.assignes || [],
});

const dbToProjet = (p) => ({
  id: p.id, titre: p.titre, description: p.description || '',
  managerId: p.manager_id, dateDebut: p.date_debut, dateFin: p.date_fin,
  couleur: p.couleur || '#2563eb', actif: p.actif !== false,
  agents: p.agents || [],
  derniereModif: p.derniere_modif || null,
  modifPar: p.modif_par || null,
});

const projetToDB = (p) => ({
  id: p.id, titre: p.titre, description: p.description,
  manager_id: p.managerId || null, date_debut: p.dateDebut, date_fin: p.dateFin,
  couleur: p.couleur, actif: p.actif, agents: p.agents || [],
  derniere_modif: p.derniereModif || null,
  modif_par: p.modifPar || null,
});

export default function App() {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsersState] = useState([]);
  const [actions, setActions] = useState([]);
  const [projets, setProjetsState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [qrActionId, setQrActionId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [notifs, setNotifs] = useState([]);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Load data when session changes
  useEffect(() => {
    if (!session) { setLoading(false); return; }
    loadAll();
  }, [session]);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Load profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profile) setCurrentUser(profileToUser(profile));

      // Load all profiles
      const { data: profiles } = await supabase.from('profiles').select('*').order('nom');
      if (profiles) setUsersState(profiles.map(profileToUser));

      // Load projets
const { data: projetsData } = await supabase.from('projets').select('*').order('created_at', { ascending: false });
      if (projetsData && projetsData.length > 0) {
        if (profile && profile.role === 'agent') {
          const agentProjets = projetsData.filter(p => (p.agents || []).includes(profile.id));
          setProjetsState(agentProjets.map(dbToProjet));
        } else {
          setProjetsState(projetsData.map(dbToProjet));
        }
      } else {
        // Seed initial projets if empty
        await seedInitialData(profile);
      }

      // Load actions
     let actionsQuery = supabase.from('actions').select('*').order('date_creation', { ascending: false });
if (profile && profile.role === 'agent') {
  actionsQuery = actionsQuery.eq('assigne_a', profile.id);
}
const { data: actionsData } = await actionsQuery;
      if (actionsData) setActions(actionsData.map(dbToAction));

    } catch (e) {
      console.error('Load error:', e);
    }
    setLoading(false);
  };

  const seedInitialData = async (profile) => {
    // Only seed if this is the first/only user and has direction role
    if (!profile || profile.role !== 'direction') return;
    // Insert sample projets
    const projetsToInsert = INITIAL_PROJETS.map(p => ({
      id: p.id, titre: p.titre, description: p.description,
      manager_id: profile.id, date_debut: p.dateDebut, date_fin: p.dateFin,
      couleur: p.couleur, actif: true,
    }));
    const { data } = await supabase.from('projets').insert(projetsToInsert).select();
    if (data) setProjetsState(data.map(dbToProjet));
  };

  // NOTIFS
  const pushNotif = useCallback((titre, message, type = 'info') => {
    const id = gid('N');
    setNotifs(p => [...p, { id, titre, message, type }]);
    setTimeout(() => setNotifs(p => p.filter(n => n.id !== id)), 6000);
  }, []);
  const dismissNotif = (id) => setNotifs(p => p.filter(n => n.id !== id));

  // CRUD ACTIONS
  const updateAction = useCallback(async (id, patch) => {
    setActions(p => p.map(a => a.id === id ? { ...a, ...patch } : a));
    const action = actions.find(a => a.id === id);
    if (!action) return;
    const updated = { ...action, ...patch };
    await supabase.from('actions').update(actionToDB(updated)).eq('id', id);
  }, [actions]);

  const addJournal = useCallback(async (actionId, texte, type = 'mise_a_jour') => {
    const action = actions.find(a => a.id === actionId);
    if (!action || !currentUser) return;
    const newEntry = { id: gid('J'), auteurId: currentUser.id, action: texte, date: nowISO(), type };
    const updatedJournal = [...(action.journal || []), newEntry];
    setActions(p => p.map(a => a.id === actionId ? { ...a, journal: updatedJournal } : a));
    await supabase.from('actions').update({ journal: updatedJournal }).eq('id', actionId);
  }, [actions, currentUser]);

  const createAction = useCallback(async (newAction) => {
    setActions(p => [newAction, ...p]);
    await supabase.from('actions').insert([actionToDB(newAction)]);
  }, []);

  // CRUD PROJETS
  const setProjets = useCallback(async (updater) => {
    const newProjets = typeof updater === 'function' ? updater(projets) : updater;
    setProjetsState(newProjets);
    // Find new projets to insert
    const existingIds = projets.map(p => p.id);
    const toInsert = newProjets.filter(p => !existingIds.includes(p.id));
    if (toInsert.length > 0) {
      await supabase.from('projets').insert(toInsert.map(projetToDB));
    }
  }, [projets]);

  // USERS
  const setUsers = useCallback(async (updater) => {
    const newUsers = typeof updater === 'function' ? updater(users) : updater;
    setUsersState(newUsers);
    // Sync changes
    for (const u of newUsers) {
      const orig = users.find(x => x.id === u.id);
      if (orig && orig.actif !== u.actif) {
        await supabase.from('profiles').update({ actif: u.actif }).eq('id', u.id);
      }
    }
  }, [users]);

  // QR VALIDATE
  const handleQRValidate = useCallback(async (actionId, { comment, retardMotif, retardDetails, echecMotif, echecDetails, statut }) => {
    const action = actions.find(a => a.id === actionId);
    const newStatut = statut || 'VALIDÉ';
    const patch = { statut: newStatut };
    if (newStatut === 'VALIDÉ') patch.dateFin = nowISO();
    if (retardMotif) { patch.retardMotif = retardMotif; patch.retardDetails = retardDetails || ''; }
    if (echecMotif) { patch.echecMotif = echecMotif; patch.echecDetails = echecDetails || ''; }
    if (comment) {
      patch.commentaires = [...(action?.commentaires || []), {
        id: gid('C'), auteurId: currentUser.id, texte: comment, date: nowISO(),
        type: retardMotif ? 'retard' : echecMotif ? 'echec' : 'normal', photos: [],
      }];
    }
    const journalEntry = {
      id: gid('J'), auteurId: currentUser.id,
      action: newStatut === 'VALIDÉ' ? `✅ Validée via QR Code.${retardMotif ? ' Retard : ' + retardMotif : ''}` : `❌ Non réalisée : ${echecMotif}`,
      date: nowISO(), type: newStatut === 'VALIDÉ' ? 'validation' : 'rejet',
    };
    const updatedJournal = [...(action?.journal || []), journalEntry];
    const fullPatch = { ...patch, journal: updatedJournal };
    setActions(p => p.map(a => a.id === actionId ? { ...a, ...fullPatch } : a));
    const updated = { ...action, ...fullPatch };
    await supabase.from('actions').update(actionToDB(updated)).eq('id', actionId);
   const agentProfile = users.find(u => u.id === currentUser.id);
    const managerPrincipal = agentProfile?.managerId ? users.find(u => u.id === agentProfile.managerId) : null;
    const managerInfo = managerPrincipal ? ` — Manager ${managerPrincipal.nom} notifié.` : '';
    if (newStatut === 'VALIDÉ') {
      pushNotif('✅ Action validée !', `"${action?.titre}" validée par ${currentUser.nom}.${managerInfo}`, 'success');
    } else {
      pushNotif('❌ Échec signalé', `"${action?.titre}" : ${echecMotif}.${managerInfo}`, 'warning');
    }
    setQrActionId(null);
  }, [actions, currentUser, pushNotif]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActions([]);
    setProjetsState([]);
    setUsersState([]);
  };

  // LOADING / AUTH
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#1a1a18', marginBottom: 12 }}>ACTION<span style={{ color: '#2563eb' }}>TRACK</span></div>
        <div style={{ fontSize: 12, color: '#7a7672' }}>Chargement...</div>
      </div>
    </div>
  );

  if (!session) return <><style>{CSS}</style><Auth /></>;
  if (!currentUser) return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: '#7a7672', marginBottom: 12 }}>Chargement du profil...</div>
        <Btn onClick={handleLogout} style={{ fontSize: 10 }}>Se déconnecter</Btn>
      </div>
    </div>
  );

  const NAV = [
    ...(currentUser.role !== 'agent' ? [{ id: 'dashboard', label: 'Dashboard', icon: '◈' }] : []),
    { id: 'actions', label: 'Actions', icon: '◆' },
    { id: 'projets', label: 'Projets', icon: '⬡' },
    ...(currentUser.role !== 'agent' ? [
      { id: 'vue_manager', label: 'Vue Manager', icon: '▦' },
      { id: 'journal', label: 'Journal', icon: '≡' },
    ] : []),
    ...(currentUser.role === 'direction' || currentUser.role === 'manager' ? [{ id: 'equipe', label: 'Équipe', icon: '◉' }] : []),
  ];

  const viewProps = { actions, users, projets, currentUser, onSelect: setSelectedActionId };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <div style={{ width: 200, background: '#fff', borderRight: '1px solid #d4cfc8', display: 'flex', flexDirection: 'column', flexShrink: 0, boxShadow: '1px 0 4px rgba(0,0,0,.04)' }}>
          <div style={{ padding: '16px 14px', borderBottom: '1px solid #e8e4de' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1a1a18' }}>ACTION<span style={{ color: '#2563eb' }}>TRACK</span></div>
            <div style={{ fontSize: 8, color: '#a09c98', marginTop: 2, letterSpacing: '.1em' }}>v2 · GESTION · PROJETS</div>
          </div>
          <nav style={{ padding: '10px 8px', flex: 1 }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setView(n.id)} style={{
                width: '100%', background: view === n.id ? '#eff6ff' : 'transparent',
                border: 'none', borderRadius: 8, padding: '9px 10px', textAlign: 'left',
                color: view === n.id ? '#2563eb' : '#7a7672', cursor: 'pointer',
                fontSize: 12, fontFamily: 'inherit', marginBottom: 2,
                display: 'flex', alignItems: 'center', gap: 10,
                fontWeight: view === n.id ? 700 : 400, transition: 'all .1s',
              }}
              onMouseEnter={e => { if (view !== n.id) { e.currentTarget.style.background = '#f5f4f0'; e.currentTarget.style.color = '#1a1a18'; }}}
              onMouseLeave={e => { if (view !== n.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7a7672'; }}}>
                <span style={{ fontSize: 9 }}>{n.icon}</span>{n.label}
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
            <Btn onClick={handleLogout} style={{ width: '100%', fontSize: 10 }}>Se déconnecter</Btn>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '12px 22px', borderBottom: '1px solid #d4cfc8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#1a1a18' }}>{NAV.find(n => n.id === view)?.label || '—'}</div>
            {currentUser.role !== 'agent' && <Btn variant="primary" onClick={() => setShowNew(true)}>+ Nouvelle action</Btn>}
          </div>
          <div style={{ flex: 1, padding: 22, overflowY: 'auto' }}>
            {view === 'dashboard'   && <Dashboard   {...viewProps} onSelectAction={setSelectedActionId} />}
            {view === 'actions'     && <Actions     {...viewProps} onQRScan={setQrActionId} />}
            {view === 'projets'     && <Projets     {...viewProps} onSelectAction={setSelectedActionId} setProjets={setProjets} />}
            {view === 'vue_manager' && <Manager     {...viewProps} />}
            {view === 'journal'     && <Journal     {...viewProps} />}
            {view === 'equipe'      && <Equipe      users={users} actions={actions} setUsers={setUsers} currentUser={currentUser} />}
          </div>
        </div>
      </div>

      {selectedActionId && <ActionDetail actionId={selectedActionId} actions={actions} users={users} currentUser={currentUser} onClose={() => setSelectedActionId(null)} onUpdate={updateAction} onAddJournal={addJournal} onQRScan={(id) => { setSelectedActionId(null); setQrActionId(id); }} />}
      {qrActionId && <QRModal actionId={qrActionId} actions={actions} currentUser={currentUser} onClose={() => setQrActionId(null)} onValidate={handleQRValidate} />}
      {showNew && <NewActionModal users={users} projets={projets} currentUser={currentUser} onClose={() => setShowNew(false)} onCreate={createAction} />}
      <NotifStack notifs={notifs} dismiss={dismissNotif} />
    </>
  );
}
