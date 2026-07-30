import React, { useState } from 'react';
import { Modal, Btn, Field, Select, Textarea } from './UI';
import { MOTIFS_RETARD, MOTIFS_ECHEC } from '../data/initial';

export default function QRModal({ actionId, actions, currentUser, onClose, onValidate }) {
  const action = actions.find(a => a.id === actionId);
  const [step, setStep] = useState('scan');
  const [comment, setComment] = useState('');
  const [retardMotif, setRetardMotif] = useState('');
  const [retardDetails, setRetardDetails] = useState('');
  const [echecMotif, setEchecMotif] = useState('');
  const [echecDetails, setEchecDetails] = useState('');

  if (!action) return null;
  const isOverdue = action.dateLimite && new Date(action.dateLimite) < new Date();

  const doValidate = () => onValidate(actionId, { comment, retardMotif, retardDetails });
  const doEchec = () => onValidate(actionId, { comment, echecMotif, echecDetails, statut: 'REJETÉ' });

  return (
    <Modal onClose={onClose} maxWidth={420}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>

        {step === 'scan' && (
          <>
            <div style={{ fontSize: 40 }}>📱</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1a18' }}>{action.titre}</div>
            <div style={{ fontSize: 11, color: '#7a7672', maxWidth: 260 }}>
              Simulez la validation par QR Code. En production, l'agent scanne depuis son téléphone.
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Btn variant="green" onClick={() => setStep(isOverdue ? 'retard' : 'confirm')}>✓ Valider</Btn>
              <Btn variant="danger" onClick={() => setStep('echec')}>✗ Non réalisé</Btn>
            </div>
            <Btn onClick={onClose}>Fermer</Btn>
          </>
        )}

        {step === 'retard' && (
          <div style={{ width: '100%', textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 28 }}>⚠️</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#d97706', marginTop: 6 }}>Action en retard — motif requis</div>
            </div>
            <Field label="Motif du retard *">
              <Select value={retardMotif} onChange={e => setRetardMotif(e.target.value)}>
                <option value="">— Sélectionner —</option>
                {MOTIFS_RETARD.map(m => <option key={m}>{m}</option>)}
              </Select>
            </Field>
            <Field label="Détails">
              <Textarea value={retardDetails} onChange={e => setRetardDetails(e.target.value)} placeholder="Expliquez ce qui s'est passé..." style={{ height: 70 }} />
            </Field>
            <Field label="Commentaire sur le travail réalisé">
              <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Ce qui a été fait..." style={{ height: 60 }} />
            </Field>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Btn onClick={() => setStep('scan')}>Retour</Btn>
              <Btn variant="green" onClick={doValidate} disabled={!retardMotif}>Valider quand même</Btn>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div style={{ width: '100%', textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 32 }}>✅</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#16a34a', marginTop: 6 }}>Confirmer la validation</div>
              <div style={{ fontSize: 11, color: '#7a7672', marginTop: 4 }}>{action.titre}</div>
            </div>
            <Field label="Commentaire (optionnel)">
              <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Ce qui a été fait, résultats..." style={{ height: 80 }} />
            </Field>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Btn onClick={() => setStep('scan')}>Retour</Btn>
              <Btn variant="green" onClick={doValidate}>✓ Confirmer</Btn>
            </div>
          </div>
        )}

        {step === 'echec' && (
          <div style={{ width: '100%', textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 32 }}>❌</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#dc2626', marginTop: 6 }}>Signaler non réalisé</div>
            </div>
            <Field label="Motif *">
              <Select value={echecMotif} onChange={e => setEchecMotif(e.target.value)}>
                <option value="">— Sélectionner —</option>
                {MOTIFS_ECHEC.map(m => <option key={m}>{m}</option>)}
              </Select>
            </Field>
            <Field label="Détails *">
              <Textarea value={echecDetails} onChange={e => setEchecDetails(e.target.value)} placeholder="Expliquez en détail..." style={{ height: 70 }} />
            </Field>
            <Field label="Commentaire">
              <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Ce qui a été tenté..." style={{ height: 60 }} />
            </Field>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Btn onClick={() => setStep('scan')}>Retour</Btn>
              <Btn variant="danger" onClick={doEchec} disabled={!echecMotif || !echecDetails}>Soumettre</Btn>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
