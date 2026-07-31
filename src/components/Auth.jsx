import React, { useState } from 'react';
import { supabase } from '../supabase';

export default function Auth() {
  const [mode, setMode] = useState('login'); // login | reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const S = {
    wrap: { minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Courier New', monospace" },
    box: { background: '#fff', borderRadius: 14, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,.08)', border: '1px solid #d4cfc8' },
    input: { background: '#f5f4f0', border: '1px solid #c4bfb8', borderRadius: 8, color: '#1a1a18', padding: '10px 14px', fontSize: 13, fontFamily: 'inherit', width: '100%', outline: 'none', marginBottom: 12 },
    btnPrimary: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: 'inherit', marginTop: 4 },
    link: { color: '#2563eb', cursor: 'pointer', fontSize: 11, textDecoration: 'underline', background: 'none', border: 'none', fontFamily: 'inherit' },
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : error.message);
    setLoading(false);
  };

  const handleReset = async () => {
    if (!email) { setError('Entrez votre email.'); return; }
    setLoading(true); setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset',
    });
    if (error) setError(error.message);
    else setMessage('Email de réinitialisation envoyé. Vérifiez votre boîte mail.');
    setLoading(false);
  };

  return (
    <div style={S.wrap}>
      <div style={S.box}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: '.3em', color: '#a09c98', marginBottom: 8 }}>SYSTÈME DE GESTION</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#1a1a18' }}>
            ACTION<span style={{ color: '#2563eb' }}>TRACK</span>
          </div>
          <div style={{ fontSize: 11, color: '#7a7672', marginTop: 6 }}>
            {mode === 'login' ? 'Connectez-vous à votre espace' : 'Réinitialiser le mot de passe'}
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 12, marginBottom: 14 }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', color: '#16a34a', fontSize: 12, marginBottom: 14 }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: 4, fontSize: 10, color: '#7a7672', textTransform: 'uppercase', letterSpacing: '.08em' }}>Email</div>
        <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" onKeyDown={e => e.key === 'Enter' && mode === 'login' && handleLogin()} />

        {mode === 'login' && (
          <>
            <div style={{ marginBottom: 4, fontSize: 10, color: '#7a7672', textTransform: 'uppercase', letterSpacing: '.08em' }}>Mot de passe</div>
            <input style={S.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </>
        )}

        <button style={S.btnPrimary} onClick={mode === 'login' ? handleLogin : handleReset} disabled={loading}>
          {loading ? '...' : mode === 'login' ? 'Se connecter' : 'Envoyer le lien'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          {mode === 'login' ? (
            <button style={S.link} onClick={() => { setMode('reset'); setError(null); setMessage(null); }}>
              Mot de passe oublié ?
            </button>
          ) : (
            <button style={S.link} onClick={() => { setMode('login'); setError(null); setMessage(null); }}>
              ← Retour à la connexion
            </button>
          )}
        </div>

        <div style={{ borderTop: '1px solid #e8e4de', marginTop: 20, paddingTop: 16, fontSize: 10, color: '#a09c98', textAlign: 'center', lineHeight: 1.6 }}>
          Vous n'avez pas encore de compte ?<br />
          Contactez votre manager pour recevoir une invitation.
        </div>
      </div>
    </div>
  );
}
