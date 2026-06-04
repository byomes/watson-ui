'use client'
import PeopleView from '@/components/PeopleView'
import { useState } from 'react'

interface Props {
  isDark: boolean
  onToggleTheme: () => void
  onLogout: () => void
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

export default function SettingsView({ isDark, onToggleTheme, onLogout }: Props) {
  const [showPeople, setShowPeople] = useState(false)

  if (showPeople) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <PeopleView onBack={() => setShowPeople(false)} />
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '14px 16px 6px', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>
        Settings
      </div>
      <div style={{ padding: '0 12px 16px' }}>
        <GroupLabel>Appearance</GroupLabel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 13px', marginBottom: 4 }}>
          <div style={{ fontSize: 13, color: 'var(--text)' }}>Dark mode</div>
          <div onClick={onToggleTheme} style={{ width: 34, height: 19, background: isDark ? 'var(--accent)' : 'var(--bg3)', borderRadius: 10, position: 'relative', cursor: 'pointer', border: `1px solid ${isDark ? 'var(--accent)' : 'var(--border)'}`, transition: 'background 0.2s' }}>
            <div style={{ position: 'absolute', width: 13, height: 13, background: 'white', borderRadius: '50%', top: 2, left: isDark ? 17 : 2, transition: 'left 0.2s' }} />
          </div>
        </div>

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
