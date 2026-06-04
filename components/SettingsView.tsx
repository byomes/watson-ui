'use client'
import { useState, useEffect } from 'react'
import PeopleView from '@/components/PeopleView'

interface Props {
  isDark: boolean
  onToggleTheme: () => void
  onLogout: () => void
  onClose: () => void
}

interface Approval {
  id: string
  title: string
  type: 'spec' | 'code diff'
  dateQueued: string
  preview: string
}

function Row({ label, value, onClick, danger, chevron }: { label: string; value?: string; onClick?: () => void; danger?: boolean; chevron?: boolean }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 13px', marginBottom: 4, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ fontSize: 13, color: danger ? '#da3633' : 'var(--text)' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {value && <div style={{ fontSize: 11, color: 'var(--text2)' }}>{value}</div>}
        {chevron && <span style={{ fontSize: 14, color: 'var(--text3)' }}>›</span>}
      </div>
    </div>
  )
}

function GroupLabel({ children }: { children: string }) {
  return <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 4px 5px' }}>{children}</div>
}

export default function SettingsView({ isDark, onToggleTheme, onLogout, onClose }: Props) {
  const [showPeople, setShowPeople] = useState(false)
  const [approvals, setApprovals] = useState<Approval[]>([])

  useEffect(() => {
    fetch('/api/approvals')
      .then(r => r.ok ? r.json() : [])
      .then(data => setApprovals(Array.isArray(data) ? data : []))
      .catch(() => setApprovals([]))
  }, [])

  function handleApproval(id: string, action: 'approve' | 'reject') {
    fetch('/api/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    }).catch(() => {})
    setApprovals(prev => prev.filter(a => a.id !== id))
  }

  if (showPeople) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <PeopleView onBack={() => setShowPeople(false)} />
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>

      {/* Settings header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 6px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>Settings</div>
        <button
          onClick={onClose}
          style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontFamily: "'DM Mono', monospace" }}
        >
          Done
        </button>
      </div>

      <div style={{ padding: '0 12px 16px' }}>

        <GroupLabel>Appearance</GroupLabel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 13px', marginBottom: 4 }}>
          <div style={{ fontSize: 13, color: 'var(--text)' }}>Dark mode</div>
          <div
            onClick={onToggleTheme}
            style={{ width: 34, height: 19, background: isDark ? 'var(--accent)' : 'var(--bg3)', borderRadius: 10, position: 'relative', cursor: 'pointer', border: `1px solid ${isDark ? 'var(--accent)' : 'var(--border)'}`, transition: 'background 0.2s' }}
          >
            <div style={{ position: 'absolute', width: 13, height: 13, background: 'white', borderRadius: '50%', top: 2, left: isDark ? 17 : 2, transition: 'left 0.2s' }} />
          </div>
        </div>

        <GroupLabel>Approvals</GroupLabel>
        {approvals.length === 0 ? (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 13px', marginBottom: 4, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>No pending approvals</div>
          </div>
        ) : (
          approvals.map(a => (
            <div key={a.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 13px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', flex: 1, marginRight: 8, lineHeight: 1.4 }}>{a.title}</div>
                <div style={{
                  fontSize: 9, padding: '2px 7px', borderRadius: 4, flexShrink: 0,
                  background: a.type === 'spec' ? 'rgba(56,139,253,0.15)' : 'rgba(210,153,34,0.15)',
                  color: a.type === 'spec' ? 'var(--accent)' : 'var(--warning)',
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  {a.type}
                </div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>{a.dateQueued}</div>
              <pre style={{
                fontSize: 10, fontFamily: "'DM Mono', monospace", color: 'var(--text2)',
                background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6,
                padding: '8px 10px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                marginBottom: 10, lineHeight: 1.6,
              }}>
                {a.preview}
              </pre>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleApproval(a.id, 'approve')}
                  style={{ flex: 1, padding: '8px', background: 'rgba(63,185,80,0.13)', border: '1px solid rgba(63,185,80,0.3)', borderRadius: 8, fontSize: 12, color: 'var(--success)', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(a.id, 'reject')}
                  style={{ flex: 1, padding: '8px', background: 'rgba(218,54,51,0.1)', border: '1px solid rgba(218,54,51,0.25)', borderRadius: 8, fontSize: 12, color: 'var(--mic-active)', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}

        <GroupLabel>People</GroupLabel>
        <Row label="Contacts" value="People directory" onClick={() => setShowPeople(true)} chevron />

        <GroupLabel>Notifications</GroupLabel>
        <Row label="Telegram alerts" value="watson-bot" />
        <Row label="Briefing push" value="6:00 AM" />

        <GroupLabel>System</GroupLabel>
        <Row label="Watson server" value="Beelink · pending" />
        <Row label="Model" value="phi3:mini" />
        <Row label="Version" value="0.1.0" />

        <GroupLabel>Account</GroupLabel>
        <Row label="Sign out" onClick={onLogout} danger />

      </div>
    </div>
  )
}
