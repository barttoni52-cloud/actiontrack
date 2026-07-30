import React from 'react';
import { Avatar, Badge, PrioBadge, ProgressBar, Card, Lbl } from '../UI';
import { avatarColor, formatDate } from '../../data/initial';

function KpiCard({ label, value, color, sub }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #d4cfc8', borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
      <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: 'monospace' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#7a7672', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 9, color: '#a09c98', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ProjetMiniCard({ projet, actions }) {
  const pa = actions.filter(a => a.projetId === projet.id);
  const done = pa.filter(a => a.statut === 'VALIDÉ').length;
  const pct = pa.length ? Math.round(done / pa.length * 100) : 0;
  return (
    <div style={{ background: '#fff', border: `1px solid ${projet.couleur}44`, borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: projet.couleur, marginRight: 6 }} />
          <span style={{ fontWeight: 800, fontSize: 12, color: '#1a1a18' }}>{projet.titre}</span>
        </div>
        <span style={{ fontSize: 22, fontWeight: 900, color: projet.couleur, fontFamily: 'monospace' }}>{pct}%</span>
      </div>
      <ProgressBar value={pct} color={projet.couleur} height={5} showPct={false} />
      <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
        {[{ l: 'Tâches', v: pa.length, c: '#7a7672' }, { l: 'Validées', v: done, c: '#16a34a' }].map(({ l, v, c }) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ color: c, fontWeight: 800, fontSize: 14, fontFamily: 'monospace' }}>{v}</div>
            <div style={{ color: '#a09c98', fontSize: 9 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ actions, users, projets, onSelectAction }) {
  const total = actions.length;
  const valides = actions.filter(a => a.statut === 'VALIDÉ').length;
  const pct = total ? Math.round(valides / total * 100) : 0;
  const retard = actions.filter(a => a.dateLimite && new Date(a.dateLimite) < new Date() && !['VALIDÉ', 'ARCHIVÉ'].includes(a.statut)).length;

  const agentPerf = users.filter(u => u.actif && u.role === 'agent').map(u => {
    const my = actions.filter(a => a.assigneA === u.id);
    const mv = my.filter(a => a.statut === 'VALIDÉ').length;
    const mp = my.length ? Math.round(mv / my.length * 100) : 0;
    const durées = my.filter(a => a.dateDebut && a.dateFin).map(a => Math.round(Math.abs(new Date(a.dateFin) - new Date(a.dateDebut)) / 36e5));
    const avgH = durées.length ? Math.round(durées.reduce((s, x) => s + x, 0) / durées.length) : null;
    return { u, total: my.length, valides: mv, pct: mp, avgH };
  }).sort((a, b) => b.pct - a.pct);

  const byCategorie = [...new Set(actions.map(a => a.categorie))]
    .map(c => ({ c, n: actions.filter(a => a.categorie === c).length }))
    .sort((a, b) => b.n - a.n).slice(0, 5);
  const maxCat = Math.max(...byCategorie.map(x => x.n), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10 }}>
        <KpiCard label="Progression globale" value={`${pct}%`} color="#2563eb" sub={`${valides}/${total} validées`} />
        <KpiCard label="En cours" value={actions.filter(a => a.statut === 'EN COURS').length} color="#16a34a" />
        <KpiCard label="En retard" value={retard} color={retard > 0 ? '#dc2626' : '#a09c98'} />
        <KpiCard label="Projets actifs" value={projets.filter(p => p.actif).length} color="#7c3aed" />
      </div>

      {/* Progression globale */}
      <Card>
        <Lbl>Avancement global</Lbl>
        <div style={{ marginTop: 8 }}><ProgressBar value={pct} height={10} /></div>
      </Card>

      {/* Projets */}
      {projets.length > 0 && (
        <div>
          <Lbl>Projets en cours</Lbl>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10, marginTop: 8 }}>
            {projets.filter(p => p.actif).map(p => <ProjetMiniCard key={p.id} projet={p} actions={actions} />)}
          </div>
        </div>
      )}

      {/* Performance agents */}
      <Card>
        <Lbl>Performance des agents</Lbl>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          {agentPerf.map(({ u, total: t, valides: v, pct: p, avgH }) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar initials={u.avatar} size={28} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#1a1a18' }}>{u.nom}</span>
                  <span style={{ fontSize: 10, color: '#7a7672', fontFamily: 'monospace' }}>
                    {v}/{t}{avgH !== null ? ` · moy. ${avgH}h` : ''}
                  </span>
                </div>
                <ProgressBar value={p} color={p >= 80 ? '#16a34a' : p >= 50 ? '#d97706' : '#dc2626'} height={4} showPct={false} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, fontFamily: 'monospace', color: p >= 80 ? '#16a34a' : p >= 50 ? '#d97706' : '#dc2626', minWidth: 34, textAlign: 'right' }}>
                {p}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Répartition catégories */}
      <Card>
        <Lbl>Répartition par catégorie</Lbl>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {byCategorie.map(({ c, n }) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ minWidth: 120, fontSize: 11, color: '#4a4844' }}>{c}</div>
              <div style={{ flex: 1, background: '#e8e4de', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                <div style={{ width: `${n / maxCat * 100}%`, height: '100%', background: '#2563eb', borderRadius: 99 }} />
              </div>
              <span style={{ fontSize: 10, color: '#7a7672', fontFamily: 'monospace', minWidth: 20, textAlign: 'right' }}>{n}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions récentes */}
      <div>
        <Lbl>Actions récentes</Lbl>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {[...actions].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation)).slice(0, 5).map(a => {
            const assigne = users.find(u => u.id === a.assigneA);
            const overdue = a.dateLimite && new Date(a.dateLimite) < new Date() && !['VALIDÉ', 'ARCHIVÉ'].includes(a.statut);
            return (
              <div
                key={a.id} onClick={() => onSelectAction(a.id)}
                style={{ background: '#fff', border: `1px solid ${overdue ? '#fca5a5' : '#d4cfc8'}`, borderRadius: 10, padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06)', transition: 'box-shadow .15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'}
              >
                <Avatar initials={assigne?.avatar || '?'} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#1a1a18', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.titre}</div>
                  <div style={{ fontSize: 10, color: '#7a7672', marginTop: 2 }}>{assigne?.nom} · {formatDate(a.dateCreation)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <PrioBadge priorite={a.priorite} />
                  <Badge statut={a.statut} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
