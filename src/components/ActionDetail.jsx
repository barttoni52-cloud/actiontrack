import React, { useState, useRef } from 'react';
import { Modal, Btn, Badge, PrioBadge, ProgressBar, Avatar, Lbl, Field, Input, Select, Textarea, QRCode } from './UI';
import { formatDate, nowISO, gid, STATUTS } from '../data/initial';
import EditActionModal from './EditActionModal';

export default function ActionDetail({ actionId, actions, users, currentUser, onClose, onUpdate, onAddJournal, onQRScan }) {
  const [tab, setTab] = useState('detail');
  const [newComment, setNewComment] = useState('');
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const fileInputRef = useRef(null);

  const action = actions.find(a => a.id === actionId);
  if (!action) return null;

  const assigne = users.find(u => u.id === action.assigneA);
  const createur = users.find(u => u.id === action.creeePar);
  const etapesPct = action.etapes.length
    ? Math.round(action.etapes.filter(e => e.fait).length / action.etapes.length * 100)
    : 0;
  const isOverdue = action.dateLimite && new Date(action.dateLimite) < new Date() && !['VALIDÉ','ARCHIVÉ','REJETÉ'].includes(action.statut);
  const canEditAction = currentUser.role !== 'agent' || action.assigneA === currentUser.id;
  const canModify = currentUser.role === 'manager' || currentUser.role === 'direction';
  const dureeReelle = action.dateDebut && action.dateFin
    ? Math.round(Math.abs(new Date(action.dateFin) - new Date(action.dateDebut)) / 36e5)
    : null;

  const JTYPE_COLORS = { creation:'#2563eb', validation:'#16a34a', rejet:'#dc2626', soumission:'#7c3aed', mise_a_jour:'#a09c98' };
  const TABS = [
    { id:'detail', label:'Détail' },
    { id:'etapes', label:`Étapes ${etapesPct}%` },
    { id:'comm', label:`Commentaires ${action.commentaires.length}` },
    { id:'journal', label:`Journal ${action.journal.length}` },
    { id:'qr', label:'QR Code' },
  ];

  const addComment = () => {
    if (!newComment.trim() && pendingPhotos.length === 0) return;
    onUpdate(actionId, { commentaires: [...action.commentaires, { id:gid('C'), auteurId:currentUser.id, texte:newComment.trim(), date:nowISO(), type:'normal', photos:[...pendingPhotos] }] });
    setNewComment(''); setPendingPhotos([]);
  };

  const handlePhotoUpload = (e) => {
    Array.from(e.target.files).slice(0, 3 - pendingPhotos.length).forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPendingPhotos(p => [...p, ev.target.result].slice(0, 3));
      reader.readAsDataURL(f);
    });
    e.target.value = '';
  };

  const toggleEtape = (i) => {
    const updated = action.etapes.map((e, idx) => idx === i ? { ...e, fait: !e.fait, dateFait: !e.fait ? nowISO() : null } : e);
    onUpdate(actionId, { etapes: updated });
    onAddJournal(actionId, `Étape "${action.etapes[i].titre}" ${!action.etapes[i].fait ? 'cochée' : 'décochée'}.`, 'mise_a_jour');
  };

  const handleSaveEdit = (id, patch, journalEntry) => {
    onUpdate(id, { ...patch, journal: [...action.journal, journalEntry] });
  };

  return (
    <>
      <Modal onClose={onClose} maxWidth={680}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
          <div style={{ fontSize:9, color:'#a09c98', fontFamily:'monospace' }}>{action.id}</div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {canModify && (
              <button onClick={() => setShowEdit(true)} style={{ background:'#f5f4f0', border:'1px solid #d4cfc8', borderRadius:6, padding:'4px 10px', fontSize:11, cursor:'pointer', fontFamily:'inherit', color:'#4a4844' }}>
                ✏️ Modifier
              </button>
            )}
            <Btn onClick={onClose} style={{ background:'none', border:'none', color:'#a09c98', padding:0, fontSize:18 }}>✕</Btn>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, flexWrap:'wrap', marginBottom:12 }}>
          <div style={{ fontSize:18, fontWeight:800, color:'#1a1a18', lineHeight:1.3, flex:1 }}>{action.titre}</div>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
            <PrioBadge priorite={action.priorite} />
            <Badge statut={action.statut} />
          </div>
        </div>

        {isOverdue && (
          <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:6, padding:'6px 12px', color:'#dc2626', fontSize:11, marginBottom:12 }}>
            ⚠ Délai dépassé — {formatDate(action.dateLimite)}
          </div>
        )}
        {action.etapes.length > 0 && <div style={{ marginBottom:14 }}><ProgressBar value={etapesPct} height={6} /></div>}

        <div style={{ display:'flex', borderBottom:'1px solid #e8e4de', marginBottom:16, overflowX:'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background:'none', border:'none', borderBottom:`2px solid ${tab===t.id?'#2563eb':'transparent'}`, color:tab===t.id?'#2563eb':'#7a7672', cursor:'pointer', padding:'8px 14px', fontSize:11, fontFamily:'inherit', whiteSpace:'nowrap', fontWeight:tab===t.id?700:400 }}>{t.label}</button>
          ))}
        </div>

        {tab === 'detail' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:8 }}>
              {[
                { l:'Assigné à', v:assigne?.nom||'—' },
                { l:'Créé par', v:createur?.nom||'—' },
                { l:'Catégorie', v:action.categorie },
                { l:'Service', v:assigne?.service||'—' },
                { l:'Création', v:formatDate(action.dateCreation) },
                { l:'Échéance', v:action.dateLimite?formatDate(action.dateLimite):'—' },
                { l:'Durée attendue', v:action.dureeAttendue?`${action.dureeAttendue}h`:'—' },
                { l:'Durée réelle', v:dureeReelle!==null?`${dureeReelle}h`:'En cours' },
              ].map(({ l, v }) => (
                <div key={l} style={{ background:'#f5f4f0', borderRadius:8, padding:'8px 10px' }}>
                  <div style={{ fontSize:9, color:'#7a7672', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:11, color:'#1a1a18', fontWeight:600 }}>{v}</div>
                </div>
              ))}
            </div>
            {action.description && <div style={{ background:'#f5f4f0', borderRadius:8, padding:12, color:'#4a4844', fontSize:12, lineHeight:1.6 }}>{action.description}</div>}
            {action.retardMotif && (
              <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:12 }}>
                <div style={{ fontSize:9, color:'#92400e', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Motif du retard</div>
                <div style={{ color:'#92400e', fontSize:12, fontWeight:600 }}>{action.retardMotif}</div>
              </div>
            )}
            {action.echecMotif && (
              <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:12 }}>
                <div style={{ fontSize:9, color:'#991b1b', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Non réalisé</div>
                <div style={{ color:'#991b1b', fontSize:12, fontWeight:600 }}>{action.echecMotif}</div>
              </div>
            )}
          </div>
        )}

        {tab === 'etapes' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <Lbl>Étapes ({action.etapes.filter(e=>e.fait).length}/{action.etapes.length})</Lbl>
              <span style={{ fontSize:11, fontWeight:700, color:'#2563eb', fontFamily:'monospace' }}>{etapesPct}%</span>
            </div>
            <ProgressBar value={etapesPct} height={6} />
            <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:6 }}>
              {action.etapes.map((e, i) => (
                <div key={e.id} onClick={() => canEditAction && toggleEtape(i)} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', background:e.fait?'#f0fdf4':'#f5f4f0', border:`1px solid ${e.fait?'#86efac':'#d4cfc8'}`, borderRadius:8, cursor:canEditAction?'pointer':'default' }}>
                  <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${e.fait?'#16a34a':'#c4bfb8'}`, background:e.fait?'#16a34a':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {e.fait && <span style={{ color:'#fff', fontSize:10, fontWeight:900 }}>✓</span>}
                  </div>
                  <span style={{ fontSize:11, color:e.fait?'#16a34a':'#4a4844', flex:1, textDecoration:e.fait?'line-through':'none' }}>{e.titre}</span>
                  {e.fait && e.dateFait && <span style={{ fontSize:9, color:'#a09c98' }}>{formatDate(e.dateFait)}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'comm' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {action.commentaires.length === 0 && <div style={{ textAlign:'center', color:'#a09c98', padding:24, fontSize:12 }}>Aucun commentaire</div>}
            {action.commentaires.map(c => {
              const auteur = users.find(u => u.id === c.auteurId);
              return (
                <div key={c.id} style={{ background:'#f5f4f0', border:'1px solid #d4cfc8', borderRadius:10, padding:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <Avatar initials={auteur?.avatar||'?'} size={26} />
                    <span style={{ color:'#1a1a18', fontSize:11, fontWeight:700 }}>{auteur?.nom||'?'}</span>
                    <span style={{ fontSize:9, color:'#a09c98', marginLeft:'auto' }}>{formatDate(c.date)}</span>
                  </div>
                  {c.texte && <div style={{ color:'#4a4844', fontSize:12, lineHeight:1.5 }}>{c.texte}</div>}
                  {c.photos?.length > 0 && (
                    <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
                      {c.photos.map((src, i) => <img key={i} src={src} alt="" onClick={() => setLightbox(src)} style={{ width:80, height:80, objectFit:'cover', borderRadius:8, border:'1px solid #d4cfc8', cursor:'pointer' }} />)}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ marginTop:4 }}>
              <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Ajouter un commentaire..." style={{ height:80, marginBottom:10 }} />
              <div onClick={() => fileInputRef.current?.click()} style={{ border:'2px dashed #c4bfb8', borderRadius:8, padding:'14px', textAlign:'center', cursor:'pointer', background:'#f5f4f0', marginBottom:10 }}>
                <div style={{ fontSize:18, marginBottom:4 }}>📷</div>
                <div style={{ fontSize:11, color:'#7a7672' }}>Ajouter des photos ({pendingPhotos.length}/3)</div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handlePhotoUpload} />
              </div>
              {pendingPhotos.length > 0 && (
                <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
                  {pendingPhotos.map((src, i) => (
                    <div key={i} style={{ position:'relative' }}>
                      <img src={src} alt="" style={{ width:64, height:64, objectFit:'cover', borderRadius:8, border:'1px solid #d4cfc8' }} />
                      <button onClick={() => setPendingPhotos(p => p.filter((_,j) => j!==i))} style={{ position:'absolute', top:-6, right:-6, background:'#dc2626', border:'none', borderRadius:'50%', width:18, height:18, color:'#fff', fontSize:10, cursor:'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <Btn variant="primary" onClick={addComment}>Envoyer</Btn>
            </div>
          </div>
        )}

        {tab === 'journal' && (
          <div>
            {[...action.journal].reverse().map((j, i) => {
              const auteur = users.find(u => u.id === j.auteurId);
              return (
                <div key={j.id} style={{ display:'flex', gap:10, padding:'10px 0', borderBottom:i<action.journal.length-1?'1px solid #f0ede8':'none' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <Avatar initials={auteur?.avatar||'?'} size={24} />
                    {i<action.journal.length-1 && <div style={{ width:1, flex:1, background:'#e8e4de', margin:'4px 0', minHeight:10 }} />}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:3, flexWrap:'wrap' }}>
                      <span style={{ color:'#1a1a18', fontSize:11, fontWeight:700 }}>{auteur?.nom||'?'}</span>
                      <span style={{ fontSize:9, color:JTYPE_COLORS[j.type]||'#a09c98', background:'#f0ede8', padding:'1px 6px', borderRadius:99, fontWeight:600 }}>{j.type.replace('_',' ')}</span>
                      <span style={{ fontSize:9, color:'#a09c98', marginLeft:'auto' }}>{formatDate(j.date)}</span>
                    </div>
                    <div style={{ fontSize:11, color:'#4a4844' }}>{j.action}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'qr' && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
            <div style={{ fontSize:11, color:'#7a7672', textAlign:'center', maxWidth:280 }}>
              L'agent scanne ce QR avec son téléphone pour valider la mission directement.
            </div>
            <div style={{ background:'#f5f4f0', padding:20, borderRadius:14, border:'1px solid #d4cfc8', display:'flex', flexDirection:'column', alignItems:'center' }}>
              <QRCode token={action.qrToken} size={160} />
              <div style={{ fontSize:9, color:'#a09c98', marginTop:10, fontFamily:'monospace' }}>{action.qrToken}</div>
            </div>
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'10px 14px', fontSize:11, color:'#1d4ed8', textAlign:'center', width:'100%' }}>
              🔗 URL de validation :<br />
              <span style={{ fontFamily:'monospace', fontSize:10, wordBreak:'break-all' }}>
                {window.location.origin}/validate/{action.qrToken}
              </span>
            </div>
            {!['VALIDÉ','ARCHIVÉ','REJETÉ'].includes(action.statut) ? (
              <div style={{ display:'flex', gap:8, width:'100%' }}>
                <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/validate/${action.qrToken}`)}
                  style={{ flex:1, background:'#fff', border:'1px solid #c4bfb8', borderRadius:8, padding:'8px 0', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>
                  📋 Copier le lien
                </button>
                <button onClick={() => { onClose(); onQRScan(action.id); }}
                  style={{ flex:1, background:'#065f46', color:'#6ee7b7', border:'1px solid #059669', borderRadius:8, padding:'8px 0', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                  📱 Simuler le scan
                </button>
              </div>
            ) : (
              <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:8, padding:'10px 18px', color:'#16a34a', fontSize:11, fontWeight:700 }}>
                ✓ Action validée — {formatDate(action.dateFin)}
              </div>
            )}
          </div>
        )}
      </Modal>

      {showEdit && (
        <EditActionModal action={action} users={users} currentUser={currentUser} onClose={() => setShowEdit(false)} onSave={handleSaveEdit} />
      )}

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-out' }}>
          <img src={lightbox} alt="" style={{ maxWidth:'90vw', maxHeight:'90vh', borderRadius:10 }} />
        </div>
      )}
    </>
  );
}
