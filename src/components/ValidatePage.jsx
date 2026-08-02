import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MOTIFS_RETARD, MOTIFS_ECHEC, gid, nowISO } from '../data/initial';

const supabaseAnon = createClient(
  'https://fmgwvmvzufxoabtxtcls.supabase.co',
  'sb_publishable_TK0IPcl9hYoWoZ-wZxBfkQ_6ppBmvox'
);

export default function ValidatePage({ token }) {
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('form');
  const [comment, setComment] = useState('');
  const [retardMotif, setRetardMotif] = useState('');
  const [retardDetails, setRetardDetails] = useState('');
  const [echecMotif, setEchecMotif] = useState('');
  const [echecDetails, setEchecDetails] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState('valider');
  const fileRef = useRef(null);

  useEffect(() => { loadAction(); }, [token]);

  const loadAction = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseAnon
        .from('actions')
        .select('*')
        .eq('qr_token', token)
        .single();
      if (data && !error) {
        setAction(data);
        if (['VALIDÉ', 'ARCHIVÉ', 'REJETÉ'].includes(data.statut)) setStep('already');
      } else {
        setStep('error');
      }
    } catch (e) { setStep('error'); }
    setLoading(false);
  };

  const handlePhoto = (e) => {
    const files = Array.from(e.target.files);
    files.slice(0, 3 - photos.length).forEach(f => {
      const r = new FileReader();
      r.onload = ev => setPhotos(p => [...p, ev.target.result].slice(0, 3));
      r.readAsDataURL(f);
    });
    e.target.value = '';
  };

  const isOverdue = action?.date_limite && new Date(action.date_limite) < new Date();

  const submit = async () => {
    if (mode === 'valider' && isOverdue && !retardMotif) return;
    if (mode === 'echec' && (!echecMotif || !echecDetails)) return;
    setSubmitting(true);
    const newStatut = mode === 'valider' ? 'VALIDÉ' : 'REJETÉ';
    const now = nowISO();
    const newComment = (comment.trim() || photos.length > 0) ? {
      id: gid('C'), auteurId: action.assigne_a, texte: comment.trim(),
      date: now, type: retardMotif ? 'retard' : mode === 'echec' ? 'echec' : 'normal', photos,
    } : null;
    const journalEntry = {
      id: gid('J'), auteurId: action.assigne_a,
      action: newStatut === 'VALIDÉ'
        ? `✅ Validée via QR Code le ${new Date().toLocaleString('fr-FR')}.${retardMotif ? ' Retard : ' + retardMotif : ''}`
        : `❌ Non réalisée : ${echecMotif}`,
      date: now, type: newStatut === 'VALIDÉ' ? 'validation' : 'rejet',
    };
    await supabaseAnon.from('actions').update({
      statut: newStatut,
      date_fin: newStatut === 'VALIDÉ' ? now : null,
      retard_motif: retardMotif || null,
      retard_details: retardDetails || null,
      echec_motif: echecMotif || null,
      echec_details: echecDetails || null,
      journal: [...(action.journal || []), journalEntry],
      commentaires: newComment ? [...(action.commentaires || []), newComment] : (action.commentaires || []),
    }).eq('qr_token', token);
    setStep('success');
    setSubmitting(false);
  };

  const S = {
    wrap: { minHeight:'100vh', background:'#f5f4f0', fontFamily:"'Courier New', monospace", padding:'20px 16px' },
    card: { background:'#fff', borderRadius:14, padding:20, boxShadow:'0 4px 24px rgba(0,0,0,.08)', border:'1px solid #d4cfc8', maxWidth:480, margin:'0 auto' },
    input: { background:'#f5f4f0', border:'1px solid #c4bfb8', borderRadius:8, color:'#1a1a18', padding:'10px 14px', fontSize:13, fontFamily:'inherit', width:'100%', outline:'none', marginBottom:12, boxSizing:'border-box' },
    label: { fontSize:10, color:'#7a7672', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4, display:'block' },
    btnGreen: { background:'#065f46', color:'#6ee7b7', border:'1px solid #059669', borderRadius:10, padding:'14px 0', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', width:'100%', marginBottom:10 },
    btnDanger: { background:'#7f1d1d', color:'#fca5a5', border:'1px solid #dc2626', borderRadius:10, padding:'14px 0', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', width:'100%', marginBottom:10 },
    btnSec: { background:'#fff', color:'#4a4844', border:'1px solid #c4bfb8', borderRadius:10, padding:'12px 0', fontSize:13, cursor:'pointer', fontFamily:'inherit', width:'100%' },
  };

  if (loading) return (
    <div style={{ ...S.wrap, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:22, fontWeight:900, color:'#1a1a18', marginBottom:8 }}>ACTION<span style={{ color:'#2563eb' }}>TRACK</span></div>
        <div style={{ fontSize:12, color:'#7a7672' }}>Chargement...</div>
      </div>
    </div>
  );

  if (step === 'error') return (
    <div style={S.wrap}><div style={S.card}>
      <div style={{ textAlign:'center', padding:'20px 0' }}>
        <div style={{ fontSize:40, marginBottom:12 }}>❌</div>
        <div style={{ fontSize:16, fontWeight:800, color:'#1a1a18', marginBottom:8 }}>QR Code invalide</div>
        <div style={{ fontSize:12, color:'#7a7672' }}>Ce QR code ne correspond à aucune action active.</div>
      </div>
    </div></div>
  );

  if (step === 'already') return (
    <div style={S.wrap}><div style={S.card}>
      <div style={{ textAlign:'center', padding:'20px 0' }}>
        <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
        <div style={{ fontSize:16, fontWeight:800, color:'#16a34a', marginBottom:8 }}>Action déjà traitée</div>
        <div style={{ fontSize:13, color:'#1a1a18', fontWeight:600, marginBottom:4 }}>{action?.titre}</div>
        <div style={{ fontSize:12, color:'#7a7672' }}>Statut : {action?.statut}</div>
      </div>
    </div></div>
  );

  if (step === 'success') return (
    <div style={S.wrap}><div style={S.card}>
      <div style={{ textAlign:'center', padding:'20px 0' }}>
        <div style={{ fontSize:50, marginBottom:12 }}>{mode === 'valider' ? '✅' : '❌'}</div>
        <div style={{ fontSize:16, fontWeight:800, color:mode==='valider'?'#16a34a':'#dc2626', marginBottom:8 }}>
          {mode === 'valider' ? 'Mission validée !' : 'Signalement envoyé'}
        </div>
        <div style={{ fontSize:13, color:'#1a1a18', fontWeight:600, marginBottom:4 }}>{action?.titre}</div>
        <div style={{ fontSize:12, color:'#7a7672', marginTop:8 }}>Le manager a été notifié.</div>
      </div>
    </div></div>
  );

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:14, fontWeight:900, color:'#1a1a18', marginBottom:4 }}>ACTION<span style={{ color:'#2563eb' }}>TRACK</span></div>
          <div style={{ fontSize:9, color:'#a09c98', letterSpacing:'.2em', marginBottom:16 }}>VALIDATION DE MISSION</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#1a1a18', lineHeight:1.3 }}>{action?.titre}</div>
          {action?.description && <div style={{ fontSize:12, color:'#7a7672', marginTop:6, lineHeight:1.5 }}>{action.description}</div>}
          {isOverdue && (
            <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'8px 12px', color:'#dc2626', fontSize:11, marginTop:10 }}>
              ⚠ Cette mission est en retard
            </div>
          )}
        </div>

        <label style={S.label}>Commentaire <span style={{ color:'#a09c98', fontWeight:400 }}>(optionnel)</span></label>
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Décrivez ce qui a été fait..."
          style={{ ...S.input, height:90, resize:'vertical' }} />

        <div style={{ marginBottom:14 }}>
          <label style={S.label}>Photos <span style={{ color:'#a09c98', fontWeight:400 }}>(optionnel, max 3)</span></label>
          {photos.length < 3 && (
            <div onClick={() => fileRef.current?.click()}
              style={{ border:'2px dashed #c4bfb8', borderRadius:8, padding:'12px', textAlign:'center', cursor:'pointer', background:'#f5f4f0', marginBottom:8 }}>
              <div style={{ fontSize:20, marginBottom:4 }}>📷</div>
              <div style={{ fontSize:11, color:'#7a7672' }}>Appuyer pour ajouter ({photos.length}/3)</div>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handlePhoto} />
            </div>
          )}
          {photos.length > 0 && (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {photos.map((src, i) => (
                <div key={i} style={{ position:'relative' }}>
                  <img src={src} alt="" style={{ width:80, height:80, objectFit:'cover', borderRadius:8, border:'1px solid #d4cfc8' }} />
                  <button onClick={() => setPhotos(p => p.filter((_,j) => j!==i))}
                    style={{ position:'absolute', top:-6, right:-6, background:'#dc2626', border:'none', borderRadius:'50%', width:20, height:20, color:'#fff', fontSize:11, cursor:'pointer' }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {isOverdue && mode !== 'echec' && (
          <div style={{ marginBottom:14 }}>
            <label style={{ ...S.label, color:'#d97706' }}>Motif du retard *</label>
            <select value={retardMotif} onChange={e => setRetardMotif(e.target.value)} style={S.input}>
              <option value="">— Sélectionner —</option>
              {MOTIFS_RETARD.map(m => <option key={m}>{m}</option>)}
            </select>
            {retardMotif && (
              <textarea value={retardDetails} onChange={e => setRetardDetails(e.target.value)}
                placeholder="Détails..." style={{ ...S.input, height:60, resize:'vertical' }} />
            )}
          </div>
        )}

        {mode === 'echec' && (
          <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:10, padding:14, marginBottom:14 }}>
            <label style={{ ...S.label, color:'#dc2626' }}>Motif *</label>
            <select value={echecMotif} onChange={e => setEchecMotif(e.target.value)} style={S.input}>
              <option value="">— Sélectionner —</option>
              {MOTIFS_ECHEC.map(m => <option key={m}>{m}</option>)}
            </select>
            <label style={{ ...S.label, color:'#dc2626' }}>Détails *</label>
            <textarea value={echecDetails} onChange={e => setEchecDetails(e.target.value)}
              placeholder="Expliquez en détail..." style={{ ...S.input, height:70, resize:'vertical' }} />
          </div>
        )}

        {mode !== 'echec' ? (
          <>
            <button style={S.btnGreen} onClick={submit} disabled={submitting || (isOverdue && !retardMotif)}>
              {submitting ? 'Envoi...' : '✓ Valider la mission'}
            </button>
            <button style={S.btnDanger} onClick={() => setMode('echec')}>✗ Mission non réalisée</button>
          </>
        ) : (
          <div style={{ display:'flex', gap:8 }}>
            <button style={{ ...S.btnSec, flex:1 }} onClick={() => setMode('valider')}>Retour</button>
            <button style={{ ...S.btnDanger, flex:2, marginBottom:0 }} onClick={submit} disabled={submitting || !echecMotif || !echecDetails}>
              {submitting ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
