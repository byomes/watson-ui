'use client'
import { useState, useEffect } from 'react'
import LoginScreen from '@/components/LoginScreen'
import ChatView from '@/components/ChatView'
import TasksView from '@/components/TasksView'
import ProjectsView from '@/components/ProjectsView'
import BriefingView from '@/components/BriefingView'
import SettingsView from '@/components/SettingsView'

type Tab = 'chat' | 'tasks' | 'projects' | 'briefing' | 'settings'

const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: 'chat',     icon: '💬', label: 'Chat' },
  { id: 'tasks',    icon: '✓',  label: 'Tasks' },
  { id: 'projects', icon: '◫',  label: 'Projects' },
  { id: 'briefing', icon: '☀',  label: 'Briefing' },
  { id: 'settings', icon: '⚙',  label: 'Settings' },
]

export default function Home() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<Tab>('chat')
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    fetch('/api/auth/check')
      .then(r => { if (r.ok) setAuthed(true) })
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    document.body.classList.toggle('light', !isDark)
  }, [isDark])

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    setAuthed(false)
  }

  if (checking) return null
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  return (
    <div style={{ width: '100%', maxWidth: 420, height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px 11px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: '#111827', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 18, color: 'white', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            W
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Watson</div>
            <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }} />
              online
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsDark(!isDark)}
          style={{ width: 28, height: 28, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text2)', fontSize: 13 }}
        >
          {isDark ? '☀' : '☾'}
        </button>
      </div>

      {/* Views */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'chat'     && <ChatView />}
        {tab === 'tasks'    && <TasksView />}
        {tab === 'projects' && <ProjectsView />}
        {tab === 'briefing' && <BriefingView />}
        {tab === 'settings' && <SettingsView isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} onLogout={handleLogout} />}
      </div>

      {/* Bottom nav */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setTab(n.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '8px 2px 8px', cursor: 'pointer', border: 'none', background: 'transparent',
              color: tab === n.id ? 'var(--accent)' : 'var(--text3)',
              fontSize: 9, letterSpacing: '0.03em', textTransform: 'uppercase', gap: 3,
              transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </div>

    </div>
  )
}
