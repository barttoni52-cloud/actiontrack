import React, { useMemo } from 'react';
import { ProgressBar, Avatar } from '../UI';
import { formatDate, CATEGORIES } from '../../data/initial';

const STATUT_COLORS = {
  'OUVERT': '#2563eb', 'EN COURS': '#16a34a', 'EN ATTENTE': '#d97706',
  'SOUMIS': '#7c3aed', 'VALIDÉ': '#059669', 'REJETÉ': '#dc2626', 'ARCHIVÉ': '#6b7280'
};

function KPICard({ label, value, sub, color = '#1a1a18', bg = '#fff' }) {
  return (
    <div style={{ background: bg, border: '1px solid #d4cfc8', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
      <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: 'monospace', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#7a7672', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#a09c98', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round(value / max * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#4a4844', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>{label}</span>
        <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color, flexShrink: 0 }}>{value} <span style={{ color: '#a09c98', fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 6, background: '#f0ede8', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width .3s' }} />
      </div>
    </div>
  );
}

function DonutChart({ data, size = 120 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, borderRadius: '50%', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#a09c98' }}>Aucune</div>;
  let offset = 0;
  const r = 40, cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const segments = data.filter(d => d.value > 0).map(d => {
    const pct = d.value / total;
    const seg = { ...d, pct, offset, dash: pct * circumference };
    offset += pct;
    return seg;
  });
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0ede8" strokeWidth={12} />
      {segments.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={12}
          strokeDasharray={`${s.dash} ${circumference - s.dash}`}
          strokeDashoffset={-s.offset * circumference} />
      ))}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 14, fontWeight: 900, fill: '#1a1a18', transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px`, fontFamily: 'monospace' }}>
        {total}
      </text>
    </svg>
  );
}

export default function Dashboard({ actions, users, projets, currentUser, onSelectAction }) {
  const stats = useMemo(() => {
    const total = actions.length;
    const validees = actions.filter(a => a.statut === 'VALIDÉ').length;
    const rejetees = actions.filter(a => a.statut === 'REJETÉ').length;
    const enCours = actions.filter(a => a.statut === 'EN COURS').length;
    const enRetard = actions.filter(a => a.dateLimite && new Date(a.dateLimite) < new Date() && !['VALIDÉ','ARCHIVÉ','REJETÉ'].includes(a.statut)).length;
    const taux = total > 0 ? Math.round(validees / total * 100) : 0;
    const parStatut = ['OUVERT','EN COURS','EN ATTENTE','SOUMIS','VALIDÉ','REJETÉ'].map(s => ({
      label: s, value: actions.filter(a => a.statut === s).length, color: STATUT_COLORS[s]
    })).filter(s => s.value > 0);
    const parCategorie = CATEGORIES.map(c => ({
      label: c, value: actions.filter(a => a.categorie === c).length,
    })).filter(c => c.value > 0).sort((a, b) => b.value - a.value).slice(0, 6);
    const parAgent = users.filter(u => u.actif && u.role === 'agent').map(u => {
      const myActions = actions.filter(a => a.assigneA === u.id || (a.assignes || []).some(x => x.userId === u.id));
      const myValidees = myActions.filter(a => a.statut === 'VALIDÉ').length;
      const myRetard = myActions.filter(a => a.dateLimite && new Date(a.dateLimite) < new Date() && !['VALIDÉ','ARCHIVÉ','REJETÉ'].includes(a.statut)).length;
      return { ...u, total: myActions.length, validees: myValidees, retard: myRetard, taux: myActions.length > 0 ? Math.round(myValidees / myActions.length * 100) : 0 };
    }).sort((a, b) => b.total - a.total);
    const alertes = actions.filter(a => a.dateLimite && new Date(a.dateLimite) < new Date() && !['VALIDÉ','ARCHIVÉ','REJETÉ'].includes(a.statut))
      .sort((a, b) => new Date(a.dateLimite) - new Date(b.dateLimite)).slice(0, 5);
    const sansActivite = actions.filter(a => {
      if (['VALIDÉ','ARCHIVÉ','REJETÉ'].includes(a.statut)) return false;
      const lastActivity = [...(a.journal || [])].pop()?.date || a.dateCreation;
      return lastActivity && new Date() - new Date(lastActivity) > 7 * 24 * 36e5;
    }).slice(0, 5);
    return { total, validees, rejetees, enCours, enRetard, taux, parStatut, parCategorie, parAgent, alertes, sansActivite };
  }, [actions, users]);

  const card = { background: '#fff', border: '1px solid #d4cfc8', borderRadius: 12, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,.06)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12 }}>
        <KPICard label="Total missions" value={stats.total} color="#2563eb" />
        <KPICard label="Validées" value={stats.validees} color="#16a34a" sub={`Taux : ${stats.taux}%`} />
        <KPICard label="En cours" value={stats.enCours} color="#d97706" />
        <KPICard label="En retard" value={stats.enRetard} color="#dc2626" bg={stats.enRetard > 0 ? '#fef2f2' : '#fff'} />
        <KPICard label="Rejetées" value={stats.rejetees} color="#7c3aed" />
        <KPICard label="Projets actifs" value={projets.filter(p => p.actif).length} color="#0891b2" />
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#1a1a18' }}>Progression globale</div>
          <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'monospace', color: stats.taux >= 70 ? '#16a34a' : stats.taux >= 40 ? '#d97706' : '#dc2626' }}>{stats.taux}%</div>
        </div>
        <ProgressBar value={stats.taux} height={10} color={stats.taux >= 70 ? '#16a34a' : stats.taux >= 40 ? '#d97706' : '#dc2626'} />
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          {stats.parStatut.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
              <span style={{ fontSize: 10, color: '#7a7672' }}>{s.label} <strong style={{ color: '#1a1a18' }}>{s.value}</strong></span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={card}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#1a1a18', marginBottom: 14 }}>Par statut</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <DonutChart data={stats.parStatut} size={100} />
            <div style={{ flex: 1 }}>
              {stats.parStatut.map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: '#4a4844' }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={card}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#1a1a18', marginBottom: 14 }}>Par catégorie</div>
          {stats.parCategorie.length === 0
            ? <div style={{ textAlign: 'center', color: '#a09c98', padding: 20, fontSize: 12 }}>Aucune donnée</div>
            : stats.parCategorie.map(c => <MiniBar key={c.label} label={c.label} value={c.value} max={stats.total} color="#2563eb" />)
          }
        </div>
      </div>

      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: 13, color: '#1a1a18', marginBottom: 14 }}>Performance par agent</div>
        {stats.parAgent.length === 0
          ? <div style={{ textAlign: 'center', color: '#a09c98', padding: 20, fontSize: 12 }}>Aucun agent</div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
              {stats.parAgent.map(u => (
                <div key={u.id} style={{ background: '#f5f4f0', borderRadius: 10, padding: '12px 14px', border: '1px solid #e8e4de' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <Avatar initials={u.avatar} size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: '#1a1a18' }}>{u.nom}</div>
                      <div style={{ fontSize: 10, color: '#7a7672' }}>{u.poste || u.role}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'monospace', color: u.taux >= 70 ? '#16a34a' : u.taux >= 40 ? '#d97706' : '#dc2626' }}>{u.taux}%</div>
                      <div style={{ fontSize: 9, color: '#a09c98' }}>{u.validees}/{u.total}</div>
                    </div>
                  </div>
                  <ProgressBar value={u.taux} height={5} color={u.taux >= 70 ? '#16a34a' : u.taux >= 40 ? '#d97706' : '#dc2626'} showPct={false} />
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    {u.retard > 0 && <span style={{ fontSize: 10, color: '#dc2626' }}>⚠ {u.retard} en retard</span>}
                    {u.taux === 0 && u.total > 0 && <span style={{ fontSize: 10, color: '#d97706' }}>⚡ Aucune validée</span>}
                    {u.total === 0 && <span style={{ fontSize: 10, color: '#a09c98' }}>Pas de mission</span>}
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      {stats.alertes.length > 0 && (
        <div style={{ ...card, border: '1px solid #fca5a5', background: '#fef2f2' }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#dc2626', marginBottom: 12 }}>⚠ Missions en retard ({stats.alertes.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.alertes.map(a => {
              const assigne = users.find(u => u.id === a.assigneA);
              const jours = Math.floor((new Date() - new Date(a.dateLimite)) / (24 * 36e5));
              return (
                <div key={a.id} onClick={() => onSelectAction(a.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', border: '1px solid #fca5a5' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#dc2626'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='#fca5a5'}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: '#1a1a18' }}>{a.titre}</div>
                    <div style={{ fontSize: 10, color: '#7a7672', marginTop: 2 }}>{assigne?.nom || '—'} · {formatDate(a.dateLimite)}</div>
                  </div>
                  <div style={{ background: '#dc2626', color: '#fff', borderRadius: 99, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>+{jours}j</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stats.sansActivite.length > 0 && (
        <div style={{ ...card, border: '1px solid #fde68a', background: '#fffbeb' }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#92400e', marginBottom: 12 }}>⏳ Sans activité depuis 7 jours ({stats.sansActivite.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.sansActivite.map(a => {
              const assigne = users.find(u => u.id === a.assigneA);
              const lastActivity = [...(a.journal || [])].pop()?.date || a.dateCreation;
              return (
                <div key={a.id} onClick={() => onSelectAction(a.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', border: '1px solid #fde68a' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#d97706'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='#fde68a'}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: '#1a1a18' }}>{a.titre}</div>
                    <div style={{ fontSize: 10, color: '#7a7672', marginTop: 2 }}>{assigne?.nom || '—'} · {formatDate(lastActivity)}</div>
                  </div>
                  <div style={{ background: '#d97706', color: '#fff', borderRadius: 99, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>{a.statut}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
