'use client'

interface Props {
  isDark: boolean
  onToggleTheme: () => void
  onLogout: () => void
  onClose: () => void
}

function GroupLabel({ children }: { children: string }) {
  return <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 4px 5px' }}>{children}</div>
}

function Row({ label, value, onClick, danger }: { label: string; value?: string; onClick?: () => void; danger?: boolean }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 13px', marginBottom: 4, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ fontSize: 13, color: danger ? '#da3633' : 'var(--text)' }}>{label}</div>
      {value && <div style={{ fontSize: 11, color: 'var(--text2)' }}>{value}</div>}
    </div>
  )
}

export default function SettingsView({ isDark, onToggleTheme, onLogout, onClose }: Props) {
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 6px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>Settings</div>
        <button onClick={onClose} style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontFamily: "'DM Mono', monospace" }}>Done</button>
      </div>

      <div style={{ padding: '0 12px 16px' }}>

        <GroupLabel>Appearance</GroupLabel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 13px', marginBottom: 4 }}>
          <div style={{ fontSize: 13, color: 'var(--text)' }}>Dark mode</div>
          <div onClick={onToggleTheme} style={{ width: 34, height: 19, background: isDark ? 'var(--accent)' : 'var(--bg3)', borderRadius: 10, position: 'relative', cursor: 'pointer', border: `1px solid ${isDark ? 'var(--accent)' : 'var(--border)'}`, transition: 'background 0.2s' }}>
            <div style={{ position: 'absolute', width: 13, height: 13, background: 'white', borderRadius: '50%', top: 2, left: isDark ? 17 : 2, transition: 'left 0.2s' }} />
          </div>
        </div>

        <GroupLabel>System</GroupLabel>
        <Row label="Watson API" value="Beelink · 5100" />
        <Row label="Version" value="0.2.0" />

        <GroupLabel>Account</GroupLabel>
        <Row label="Sign out" onClick={onLogout} danger />

      </div>
    </div>
  )
}
