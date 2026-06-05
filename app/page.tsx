'use client'
import React, { useState, useEffect } from 'react'
import LoginScreen from '@/components/LoginScreen'
import BriefingView from '@/components/BriefingView'
import TasksView from '@/components/TasksView'
import ContactsView from '@/components/ContactsView'
import ReadingView from '@/components/ReadingView'
import SettingsView from '@/components/SettingsView'

type Tab = 'briefing' | 'tasks' | 'contacts' | 'reading'

function GearIcon({ active }: { active: boolean }) {
  const c = active ? 'white' : 'var(--text2)'
  const hole = active ? 'var(--accent)' : 'var(--bg3)'
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      <path fill={c} d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.63a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.07 7.07 0 0 0-1.7-1l-.38-2.65A.49.49 0 0 0 14 2h-4a.49.49 0 0 0-.49.42l-.38 2.65a7.07 7.07 0 0 0-1.7 1l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.49.49 0 0 0 .12.64l2.11 1.63c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.63a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .61.22l2.49-1c.52.4 1.08.73 1.7.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65a7.07 7.07 0 0 0 1.7-.98l2.49 1a.5.5 0 0 0 .61-.22l2-3.46a.49.49 0 0 0-.12-.64l-2.11-1.63z" />
      <circle fill={hole} cx="12" cy="12" r="3.5" />
    </svg>
  )
}

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: 'briefing', label: 'Briefing', icon: '📰' },
  { id: 'tasks',    label: 'Tasks',    icon: '✅' },
  { id: 'contacts', label: 'Contacts', icon: '👥' },
  { id: 'reading',  label: 'Reading',  icon: '📚' },
]

export default function Home() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<Tab>('briefing')
  const [isDark, setIsDark] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

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
          <div style={{ width: 30, height: 30, background: '#111827', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 18, color: 'white', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>W</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Watson</div>
            <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }} />
              dashboard
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(s => !s)}
          aria-label="Settings"
          style={{ width: 34, height: 34, background: showSettings ? 'var(--accent)' : 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
        >
          <GearIcon active={showSettings} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {showSettings ? (
          <SettingsView isDark={isDark} onToggleTheme={() => setIsDark(d => !d)} onLogout={handleLogout} onClose={() => setShowSettings(false)} />
        ) : (
          <>
            {tab === 'briefing' && <BriefingView />}
            {tab === 'tasks'    && <TasksView />}
            {tab === 'contacts' && <ContactsView />}
            {tab === 'reading'  && <ReadingView />}
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.map(n => {
          const isActive = !showSettings && tab === n.id
          return (
            <button
              key={n.id}
              onClick={() => { setTab(n.id); setShowSettings(false) }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 2px 10px', cursor: 'pointer', border: 'none', background: 'transparent', color: isActive ? 'var(--accent)' : 'var(--text3)', gap: 3, transition: 'color 0.15s' }}
            >
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              <span style={{ fontSize: 10, letterSpacing: '0.03em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>{n.label}</span>
            </button>
          )
        })}
      </div>

    </div>
  )
}
