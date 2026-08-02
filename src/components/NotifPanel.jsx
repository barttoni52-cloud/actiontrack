import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { formatDate } from '../data/initial';

export default function NotifPanel({ currentUser, onClose }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifs();
    const channel = supabase
      .channel('notifs-panel-' + currentUser.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUser.id}` }, (payload) => {
        setNotifs(p => [payload.new, ...p]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [currentUser.id]);

  const loadNotifs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setNotifs(data);
    setLoading(false);
  };

  const markAllRead = async () => {
    await supabase.from('notifications').update({ lu: true }).eq('user_id', currentUser.id).eq('lu', false);
    setNotifs(p => p.map(n => ({ ...n, lu: true })));
  };

  const markRead = async (id) => {
    await supabase.from('notifications').update({ lu: true }).eq('id', id);
    setNotifs(p => p.map(n => n.id === id ? { ...n, lu: true } : n));
  };

  const unread = notifs.filter(n => !n.lu).length;

  const typeColors = {
    success: { icon: '✅' },
    warning: { icon: '❌' },
    info: { icon: '📋' },
    new: { icon: '🆕' },
  };

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.2)', zIndex:999 }} />

      {/* Panel */}
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:360, background:'#fff', borderLeft:'1px solid #d4cfc8', zIndex:1000, display:'flex', flexDirection:'column', boxShadow:'-4px 0 24px rgba(0,0,0,.1)', fontFamily:'monospace' }}>
        <div style={{ padding:'16px 18px', borderBottom:'1px solid #e8e4de', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:800, fontSize:14, color:'#1a1a18' }}>Notifications</div>
            {unread > 0 && <div style={{ fontSize:10, color:'#7c3aed', marginTop:2 }}>{unread} non lue(s)</div>}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background:'#f5f4f0', border:'1px solid #d4cfc8', borderRadius:6, padding:'4px 10px', fontSize:10, cursor:'pointer', fontFamily:'inherit' }}>
                Tout lire
              </button>
            )}
            <button onClick={onClose} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#a09c98' }}>✕</button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto' }}>
          {loading && <div style={{ textAlign:'center', padding:30, color:'#a09c98', fontSize:12 }}>Chargement...</div>}
          {!loading && notifs.length === 0 && (
            <div style={{ textAlign:'center', padding:40, color:'#a09c98' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>🔔</div>
              <div style={{ fontSize:12 }}>Aucune notification</div>
            </div>
          )}
          {notifs.map(n => {
            const icon = (typeColors[n.type] || typeColors.info).icon;
            return (
              <div key={n.id} onClick={() => markRead(n.id)} style={{
                padding:'12px 18px', borderBottom:'1px solid #f0ede8', cursor:'pointer',
                background: n.lu ? '#fff' : '#fafaf8',
              }}
              onMouseEnter={e => e.currentTarget.style.background='#f5f4f0'}
              onMouseLeave={e => e.currentTarget.style.background=n.lu?'#fff':'#fafaf8'}>
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                      <div style={{ fontWeight:n.lu?600:800, fontSize:12, color:'#1a1a18' }}>{n.titre}</div>
                      {!n.lu && <div style={{ width:7, height:7, borderRadius:'50%', background:'#7c3aed', flexShrink:0 }} />}
                    </div>
                    {n.message && <div style={{ fontSize:11, color:'#7a7672', lineHeight:1.5 }}>{n.message}</div>}
                    <div style={{ fontSize:9, color:'#a09c98', marginTop:4 }}>{formatDate(n.created_at)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
