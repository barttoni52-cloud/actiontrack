import React from 'react';
import { STATUT_COLORS, PRIO_COLORS, avatarColor } from '../data/initial';

// ─── AVATAR ──────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 32 }) {
  const color = avatarColor(initials);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ─── BADGE STATUT ─────────────────────────────────────────────────────────────
export function Badge({ statut }) {
  const c = STATUT_COLORS[statut] || { text: '#374151', bg: '#f3f4f6' };
  return (
    <span style={{
      background: c.bg, color: c.text,
      padding: '2px 8px', borderRadius: 99,
      fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      {statut}
    </span>
  );
}

// ─── BADGE PRIORITÉ ───────────────────────────────────────────────────────────
export function PrioBadge({ priorite }) {
  const color = PRIO_COLORS[priorite] || '#6b7280';
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color, fontSize: 10, fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {priorite}
    </span>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = '#2563eb', height = 6, showPct = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, background: '#e8e4de', borderRadius: 99, height, overflow: 'hidden' }}>
        <div style={{
          width: `${Math.min(100, Math.max(0, value))}%`, height: '100%',
          background: color, borderRadius: 99, transition: 'width .4s ease',
        }} />
      </div>
      {showPct && (
        <span style={{ fontSize: 10, color: '#7a7672', fontFamily: 'monospace', minWidth: 30, textAlign: 'right' }}>
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}

// ─── LABEL ────────────────────────────────────────────────────────────────────
export function Lbl({ children }) {
  return (
    <div style={{ fontSize: 9, color: '#7a7672', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
      {children}
    </div>
  );
}

// ─── FIELD ────────────────────────────────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <Lbl>{label}</Lbl>
      {children}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
export function Modal({ children, onClose, maxWidth = 560 }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 14, padding: 24,
        width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,.15)',
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────
const BTN_STYLES = {
  primary:  { background: '#2563eb', color: '#fff', border: 'none', fontWeight: 700 },
  secondary:{ background: '#fff', color: '#4a4844', border: '1px solid #c4bfb8' },
  green:    { background: '#065f46', color: '#6ee7b7', border: '1px solid #059669', fontWeight: 700 },
  danger:   { background: '#7f1d1d', color: '#fca5a5', border: '1px solid #dc2626' },
};

export function Btn({ children, variant = 'secondary', onClick, style = {}, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...BTN_STYLES[variant],
        borderRadius: 6, padding: '6px 14px', fontSize: 11,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', transition: 'all .15s', opacity: disabled ? .5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── INPUT / SELECT / TEXTAREA ────────────────────────────────────────────────
const INPUT_BASE = {
  background: '#fff', border: '1px solid #c4bfb8', borderRadius: 6,
  color: '#1a1a18', padding: '7px 10px', fontSize: 11,
  fontFamily: 'inherit', width: '100%', outline: 'none',
};

export function Input(props) {
  return <input style={INPUT_BASE} {...props} />;
}

export function Select({ children, ...props }) {
  return <select style={INPUT_BASE} {...props}>{children}</select>;
}

export function Textarea(props) {
  return <textarea style={{ ...INPUT_BASE, resize: 'vertical' }} {...props} />;
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #d4cfc8',
      borderRadius: 10, padding: '14px 16px',
      boxShadow: '0 1px 3px rgba(0,0,0,.08)', ...style,
    }}>
      {children}
    </div>
  );
}

// ─── QR CODE (vraie librairie qrcode) ────────────────────────────────────────
export function QRCode({ token, size = 130 }) {
  const [dataUrl, setDataUrl] = React.useState(null);
  const url = `${window.location.origin}/validate/${token}`;

  React.useEffect(() => {
    import('qrcode').then(QR => {
      QR.toDataURL(url, { width: size, margin: 1, color: { dark: '#1a1a18', light: '#ffffff' } })
        .then(setDataUrl)
        .catch(console.error);
    });
  }, [url, size]);

  if (!dataUrl) return <div style={{ width: size, height: size, background: '#f5f4f0', borderRadius: 4 }} />;
  return <img src={dataUrl} alt="QR Code" style={{ width: size, height: size, display: 'block', borderRadius: 4 }} />;
}

// ─── NOTIF TOAST ─────────────────────────────────────────────────────────────
export function NotifStack({ notifs, dismiss }) {
  if (!notifs.length) return null;
  const colors = {
    success: { bg: '#f0fdf4', border: '#86efac', icon: '✅' },
    warning: { bg: '#fffbeb', border: '#fde68a', icon: '⚠️' },
    info:    { bg: '#eff6ff', border: '#93c5fd', icon: '🔔' },
  };
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 3000, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
      {notifs.map(n => {
        const c = colors[n.type] || colors.info;
        return (
          <div key={n.id} style={{
            background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10,
            padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start',
            boxShadow: '0 4px 16px rgba(0,0,0,.1)',
          }}>
            <span style={{ fontSize: 16 }}>{c.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#1a1a18', fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{n.titre}</div>
              <div style={{ color: '#4a4844', fontSize: 11 }}>{n.message}</div>
            </div>
            <button onClick={() => dismiss(n.id)} style={{ background: 'none', border: 'none', color: '#a09c98', cursor: 'pointer', fontSize: 14, padding: 0 }}>✕</button>
          </div>
        );
      })}
    </div>
  );
}
