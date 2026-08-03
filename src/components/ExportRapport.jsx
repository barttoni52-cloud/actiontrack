import React, { useRef, useState } from 'react';
import { formatDate, CATEGORIES } from '../data/initial';

const STATUT_COLORS = {
  'OUVERT': '#2563eb', 'EN COURS': '#16a34a', 'EN ATTENTE': '#d97706',
  'SOUMIS': '#7c3aed', 'VALIDÉ': '#059669', 'REJETÉ': '#dc2626', 'ARCHIVÉ': '#6b7280'
};

function buildStats(actions, users, now) {
  const total = actions.length;
  const validees = actions.filter(a => a.statut === 'VALIDÉ').length;
  const rejetees = actions.filter(a => a.statut === 'REJETÉ').length;
  const enCours = actions.filter(a => a.statut === 'EN COURS').length;
  const enRetard = actions.filter(a => a.dateLimite && new Date(a.dateLimite) < now && !['VALIDÉ','ARCHIVÉ','REJETÉ'].includes(a.statut)).length;
  const taux = total > 0 ? Math.round(validees / total * 100) : 0;
  const parCategorie = CATEGORIES.map(c => ({ label: c, value: actions.filter(a => a.categorie === c).length })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);
  const alertes = actions.filter(a => a.dateLimite && new Date(a.dateLimite) < now && !['VALIDÉ','ARCHIVÉ','REJETÉ'].includes(a.statut)).sort((a, b) => new Date(a.dateLimite) - new Date(b.dateLimite));
  return { total, validees, rejetees, enCours, enRetard, taux, parCategorie, alertes };
}

function ReportContent({ title, subtitle, actions, users, projets, currentUser, showAgentPerf = true }) {
  const now = new Date();
  const dateRapport = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const { total, validees, rejetees, enCours, enRetard, taux, parCategorie, alertes } = buildStats(actions, users, now);

  const parAgent = showAgentPerf ? users.filter(u => u.actif && u.role === 'agent').map(u => {
    const myActions = actions.filter(a => a.assigneA === u.id || (a.assignes || []).some(x => x.userId === u.id));
    const myValidees = myActions.filter(a => a.statut === 'VALIDÉ').length;
    const myRetard = myActions.filter(a => a.dateLimite && new Date(a.dateLimite) < now && !['VALIDÉ','ARCHIVÉ','REJETÉ'].includes(a.statut)).length;
    return { ...u, total: myActions.length, validees: myValidees, retard: myRetard, taux: myActions.length > 0 ? Math.round(myValidees / myActions.length * 100) : 0 };
  }).sort((a, b) => b.total - a.total) : [];

  return (
    <div>
      <h1>ACTIONTRACK — {title.toUpperCase()}</h1>
      <p className="subtitle">{subtitle} · Généré le {dateRapport} par {currentUser.nom}</p>

      <h2>Synthèse</h2>
      <div className="kpi-grid">
        {[
          { label:'Total missions', val:total, color:'#2563eb' },
          { label:'Validées', val:validees, color:'#16a34a' },
          { label:'En cours', val:enCours, color:'#d97706' },
          { label:'En retard', val:enRetard, color:'#dc2626' },
          { label:'Rejetées', val:rejetees, color:'#7c3aed' },
          { label:'Taux de réussite', val:`${taux}%`, color:taux>=70?'#16a34a':taux>=40?'#d97706':'#dc2626' },
        ].map(({ label, val, color }) => (
          <div key={label} className="kpi" style={{ borderTop:`3px solid ${color}` }}>
            <div className="kpi-val" style={{ color }}>{val}</div>
            <div className="kpi-label">{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:'10px 14px', border:'1px solid #d4cfc8', borderRadius:8, marginBottom:8 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:12 }}>
          <strong>Progression globale</strong>
          <strong style={{ color:taux>=70?'#16a34a':taux>=40?'#d97706':'#dc2626' }}>{taux}%</strong>
        </div>
        <div className="bar-wrap"><div className="bar-fill" style={{ width:`${taux}%`, background:taux>=70?'#16a34a':taux>=40?'#d97706':'#dc2626' }} /></div>
      </div>

      {parCategorie.length > 0 && (
        <>
          <h2>Par catégorie</h2>
          <table>
            <thead><tr><th>Catégorie</th><th>Missions</th><th>%</th><th style={{ width:'40%' }}>Progression</th></tr></thead>
            <tbody>
              {parCategorie.map(c => (
                <tr key={c.label}>
                  <td><strong>{c.label}</strong></td>
                  <td>{c.value}</td>
                  <td>{total>0?Math.round(c.value/total*100):0}%</td>
                  <td><div className="bar-wrap" style={{ margin:'3px 0' }}><div className="bar-fill" style={{ width:`${total>0?c.value/total*100:0}%`, background:'#2563eb' }} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {parAgent.length > 0 && (
        <>
          <h2>Performance par agent</h2>
          <table>
            <thead><tr><th>Agent</th><th>Poste</th><th>Total</th><th>Validées</th><th>En retard</th><th>Taux</th></tr></thead>
            <tbody>
              {parAgent.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.nom}</strong></td>
                  <td style={{ color:'#7a7672' }}>{u.poste||u.role}</td>
                  <td>{u.total}</td>
                  <td style={{ color:'#16a34a', fontWeight:700 }}>{u.validees}</td>
                  <td style={{ color:u.retard>0?'#dc2626':'#a09c98', fontWeight:u.retard>0?700:400 }}>{u.retard}</td>
                  <td><span className="badge" style={{ background:u.taux>=70?'#dcfce7':u.taux>=40?'#fef3c7':'#fee2e2', color:u.taux>=70?'#16a34a':u.taux>=40?'#d97706':'#dc2626' }}>{u.taux}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {alertes.length > 0 && (
        <>
          <h2>⚠ Missions en retard ({alertes.length})</h2>
          <table>
            <thead><tr><th>Mission</th><th>Agent</th><th>Statut</th><th>Échéance</th><th>Retard</th></tr></thead>
            <tbody>
              {alertes.map(a => {
                const assigne = users.find(u => u.id === a.assigneA);
                const jours = Math.floor((now - new Date(a.dateLimite)) / (24*36e5));
                return (
                  <tr key={a.id} style={{ background:'#fef9f9' }}>
                    <td><strong>{a.titre}</strong></td>
                    <td>{assigne?.nom||'—'}</td>
                    <td><span className="badge" style={{ background:'#fee2e2', color:'#dc2626' }}>{a.statut}</span></td>
                    <td>{formatDate(a.dateLimite)}</td>
                    <td style={{ color:'#dc2626', fontWeight:700 }}>+{jours}j</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      <h2>Liste des missions</h2>
      <table>
        <thead><tr><th>Mission</th><th>Agent</th><th>Catégorie</th><th>Statut</th><th>Échéance</th><th>Validation</th></tr></thead>
        <tbody>
          {actions.sort((a,b) => new Date(b.dateCreation)-new Date(a.dateCreation)).map(a => {
            const assigne = users.find(u => u.id === a.assigneA);
            const validEntry = [...(a.journal||[])].reverse().find(j => j.type==='validation');
            return (
              <tr key={a.id}>
                <td><strong>{a.titre}</strong></td>
                <td>{assigne?.nom||'—'}</td>
                <td>{a.categorie}</td>
                <td><span className="badge" style={{ background:`${STATUT_COLORS[a.statut]}22`, color:STATUT_COLORS[a.statut] }}>{a.statut}</span></td>
                <td>{a.dateLimite?formatDate(a.dateLimite):'—'}</td>
                <td>{validEntry?formatDate(validEntry.date):'—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="footer">
        <span>ActionTrack v2 — Rapport confidentiel</span>
        <span>Généré le {now.toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })} par {currentUser.nom}</span>
      </div>
    </div>
  );
}

const CSS_PRINT = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', monospace; color: #1a1a18; background: #fff; font-size: 11px; }
  .page { padding: 30px 40px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 20px; font-weight: 900; margin-bottom: 4px; }
  h2 { font-size: 12px; font-weight: 800; margin: 20px 0 10px; border-bottom: 2px solid #1a1a18; padding-bottom: 4px; text-transform: uppercase; letter-spacing: .05em; }
  .subtitle { color: #7a7672; font-size: 10px; margin-bottom: 16px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 14px; }
  .kpi { border: 1px solid #d4cfc8; border-radius: 7px; padding: 10px; text-align: center; }
  .kpi-val { font-size: 24px; font-weight: 900; }
  .kpi-label { font-size: 9px; color: #7a7672; text-transform: uppercase; letter-spacing: .08em; margin-top: 3px; }
  .bar-wrap { height: 6px; background: #f0ede8; border-radius: 99px; overflow: hidden; margin: 4px 0; }
  .bar-fill { height: 100%; border-radius: 99px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 10px; }
  th { background: #f5f4f0; padding: 6px 8px; text-align: left; font-weight: 700; font-size: 9px; text-transform: uppercase; letter-spacing: .06em; border-bottom: 2px solid #d4cfc8; }
  td { padding: 6px 8px; border-bottom: 1px solid #f0ede8; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .badge { display: inline-block; padding: 2px 7px; border-radius: 99px; font-size: 9px; font-weight: 700; }
  .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #d4cfc8; color: #a09c98; font-size: 9px; display: flex; justify-content: space-between; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .page { padding: 15px 20px; } }
`;

export default function ExportRapport({ actions, users, projets, currentUser, groupes = [], onClose }) {
  const [mode, setMode] = useState('collectif');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedGroupe, setSelectedGroupe] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const printRef = useRef(null);

  const agents = users.filter(u => u.actif && u.role === 'agent');

  const filterByDate = (acts) => acts.filter(a => {
    const d = new Date(a.dateCreation);
    if (dateDebut && d < new Date(dateDebut)) return false;
    if (dateFin && d > new Date(dateFin + 'T23:59:59')) return false;
    return true;
  });

  const getFilteredData = () => {
    if (mode === 'agent' && selectedAgent) {
      const agent = users.find(u => u.id === selectedAgent);
      const filteredActions = filterByDate(actions.filter(a => a.assigneA === selectedAgent || (a.assignes || []).some(x => x.userId === selectedAgent)));
      return { filteredActions, filteredUsers: [agent], title: `Rapport Agent — ${agent?.nom}`, subtitle: `${agent?.poste || agent?.role} · ${filteredActions.length} mission(s)`, showAgentPerf: false };
    }
    if (mode === 'groupe' && selectedGroupe) {
      const groupe = groupes.find(g => g.id === selectedGroupe);
      const membres = (groupe?.membres || []).map(uid => users.find(u => u.id === uid)).filter(Boolean);
      const membresIds = membres.map(u => u.id);
      const filteredActions = filterByDate(actions.filter(a => membresIds.includes(a.assigneA) || (a.assignes || []).some(x => membresIds.includes(x.userId))));
      return { filteredActions, filteredUsers: membres, title: `Rapport Groupe — ${groupe?.nom}`, subtitle: `${membres.length} membre(s) · ${filteredActions.length} mission(s)`, showAgentPerf: true };
    }
    return { filteredActions: filterByDate(actions), filteredUsers: users, title: 'Rapport Collectif', subtitle: `${users.filter(u=>u.actif).length} membre(s) · ${projets.length} projet(s)`, showAgentPerf: true };
  };

  const { filteredActions, filteredUsers, title, subtitle, showAgentPerf } = getFilteredData();

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>ActionTrack — ${title}</title><style>${CSS_PRINT}</style></head><body><div class="page">${printRef.current.innerHTML}</div></body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const MODES = [
    { id:'collectif', label:'🏢 Collectif' },
    { id:'agent', label:'👤 Par agent' },
    { id:'groupe', label:'👥 Par groupe' },
  ];

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'monospace' }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:14, width:'92vw', maxWidth:960, maxHeight:'92vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 8px 40px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>

        <div style={{ padding:'14px 20px', borderBottom:'1px solid #d4cfc8', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontWeight:800, fontSize:15, color:'#1a1a18' }}>📊 Exports & Rapports</div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={handlePrint} style={{ background:'#2563eb', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>🖨️ Imprimer / PDF</button>
            <button onClick={onClose} style={{ background:'#f5f4f0', color:'#4a4844', border:'none', borderRadius:8, padding:'8px 14px', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Fermer</button>
          </div>
        </div>

        <div style={{ padding:'12px 20px', borderBottom:'1px solid #e8e4de', background:'#f5f4f0', display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:6 }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                padding:'7px 14px', borderRadius:8, border:`2px solid ${mode===m.id?'#2563eb':'#d4cfc8'}`,
                background:mode===m.id?'#eff6ff':'#fff', color:mode===m.id?'#2563eb':'#7a7672',
                fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:mode===m.id?700:400,
              }}>{m.label}</button>
            ))}
          </div>
          {mode === 'agent' && (
            <select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}
              style={{ background:'#fff', border:'1px solid #d4cfc8', borderRadius:8, padding:'7px 12px', fontSize:12, fontFamily:'inherit', minWidth:200 }}>
              <option value="">— Sélectionner un agent —</option>
              {agents.map(u => <option key={u.id} value={u.id}>{u.nom} — {u.poste || u.role}</option>)}
            </select>
          )}
          {mode === 'groupe' && (
            <select value={selectedGroupe} onChange={e => setSelectedGroupe(e.target.value)}
              style={{ background:'#fff', border:'1px solid #d4cfc8', borderRadius:8, padding:'7px 12px', fontSize:12, fontFamily:'inherit', minWidth:200 }}>
              <option value="">— Sélectionner un groupe —</option>
              {groupes.map(g => <option key={g.id} value={g.id}>{g.nom} ({(g.membres||[]).length} membres)</option>)}
            </select>
          )}
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ fontSize:10, color:'#7a7672' }}>Du</span>
            <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
              style={{ background:'#fff', border:'1px solid #d4cfc8', borderRadius:6, padding:'5px 8px', fontSize:11, fontFamily:'inherit' }} />
            <span style={{ fontSize:10, color:'#7a7672' }}>au</span>
            <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
              style={{ background:'#fff', border:'1px solid #d4cfc8', borderRadius:6, padding:'5px 8px', fontSize:11, fontFamily:'inherit' }} />
            {(dateDebut || dateFin) && (
              <button onClick={() => { setDateDebut(''); setDateFin(''); }}
                style={{ background:'none', border:'none', color:'#dc2626', cursor:'pointer', fontSize:11, fontFamily:'inherit' }}>✕ Effacer</button>
            )}
          </div>
          <div style={{ fontSize:11, color:'#7a7672', marginLeft:'auto' }}>
            {filteredActions.length} mission(s) · {filteredUsers.filter(u=>u.actif).length} membre(s)
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:24 }}>
          {(mode === 'agent' && !selectedAgent) ? (
            <div style={{ textAlign:'center', padding:60, color:'#a09c98' }}>
              <div style={{ fontSize:32, marginBottom:12 }}>👤</div>
              <div style={{ fontSize:13 }}>Sélectionnez un agent pour voir son rapport</div>
            </div>
          ) : (mode === 'groupe' && !selectedGroupe) ? (
            <div style={{ textAlign:'center', padding:60, color:'#a09c98' }}>
              <div style={{ fontSize:32, marginBottom:12 }}>👥</div>
              <div style={{ fontSize:13 }}>Sélectionnez un groupe pour voir son rapport</div>
            </div>
          ) : (
            <div ref={printRef}>
              <ReportContent title={title} subtitle={subtitle} actions={filteredActions} users={filteredUsers} projets={projets} currentUser={currentUser} showAgentPerf={showAgentPerf} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
