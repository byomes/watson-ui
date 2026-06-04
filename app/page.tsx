'use client'
import React, { useState, useEffect } from 'react'
import LoginScreen from '@/components/LoginScreen'
import ChatView from '@/components/ChatView'
import HistoryView from '@/components/HistoryView'
import TasksView from '@/components/TasksView'
import ProjectsView from '@/components/ProjectsView'
import BriefingView from '@/components/BriefingView'
import SettingsView from '@/components/SettingsView'

type Tab = 'chat' | 'history' | 'tasks' | 'projects' | 'briefing'

/* ── Two-colour flat SVG nav icons ─────────────────────────── */

function IconChat({ active }: { active: boolean }) {
  const c1 = active ? 'var(--accent)' : 'var(--text2)'
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
      <rect fill={c1} x="2" y="2" width="20" height="14" rx="3.5" />
      <polygon fill={c1} points="5,16 3,21.5 9.5,16" />
      <circle fill="var(--bg)" cx="7" cy="9" r="1.6" />
      <circle fill="var(--bg)" cx="12" cy="9" r="1.6" />
      <circle fill="var(--bg)" cx="17" cy="9" r="1.6" />
    </svg>
  )
}

function IconHistory({ active }: { active: boolean }) {
  const c1 = active ? 'var(--accent)' : 'var(--text2)'
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
      <circle fill={c1} cx="12" cy="12" r="10" />
      <circle fill="var(--bg)" cx="12" cy="12" r="6.5" />
      <rect fill={c1} x="11.3" y="7" width="1.4" height="5.3" rx="0.7" />
      <rect fill={c1} x="11.3" y="11.3" width="4.2" height="1.4" rx="0.7" />
      <circle fill={c1} cx="12" cy="12" r="1.25" />
    </svg>
  )
}

function IconTasks({ active }: { active: boolean }) {
  const c1 = active ? 'var(--accent)' : 'var(--text2)'
  const c2 = active ? 'var(--success)' : 'var(--text3)'
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
      <rect fill={c1} x="3" y="3" width="18" height="18" rx="3.5" />
      <path fill="none" stroke={c2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 9l2 2 4-4" />
      <path fill="none" stroke={c2} strokeWidth="1.8" strokeLinecap="round" d="M7 14h10" />
      <path fill="none" stroke={c2} strokeWidth="1.8" strokeLinecap="round" d="M7 17.5h7" />
    </svg>
  )
}

function IconProjects({ active }: { active: boolean }) {
  const c1 = active ? 'var(--accent)' : 'var(--text2)'
  const c2 = active ? 'var(--accent2)' : 'var(--text3)'
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
      <rect fill={c1} x="3" y="3" width="8" height="8" rx="2" />
      <rect fill={c1} x="13" y="3" width="8" height="8" rx="2" />
      <rect fill={c2} x="3" y="13" width="8" height="8" rx="2" />
      <rect fill={c2} x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  )
}

function IconBriefing({ active }: { active: boolean }) {
  const c1 = active ? 'var(--accent)' : 'var(--text2)'
  const c2 = active ? 'var(--warning)' : 'var(--text3)'
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
      <rect fill={c1} x="2" y="5" width="20" height="16" rx="3" />
      <circle fill={c2} cx="12" cy="11" r="4" />
      <rect fill="var(--bg)" x="5" y="16" width="14" height="1.5" rx="0.75" />
      <rect fill="var(--bg)" x="5" y="18.5" width="9" height="1.5" rx="0.75" />
    </svg>
  )
}

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

const NAV: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: 'chat',     label: 'Chat',     Icon: IconChat },
  { id: 'history',  label: 'History',  Icon: IconHistory },
  { id: 'tasks',    label: 'Tasks',    Icon: IconTasks },
  { id: 'projects', label: 'Projects', Icon: IconProjects },
  { id: 'briefing', label: 'Briefing', Icon: IconBriefing },
]

export default function Home() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<Tab>('chat')
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
          onClick={() => setShowSettings(s => !s)}
          aria-label="Settings"
          style={{
            width: 34, height: 34,
            background: showSettings ? 'var(--accent)' : 'var(--bg3)',
            border: '1px solid var(--border)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
        >
          <GearIcon active={showSettings} />
        </button>
      </div>

      {/* Views */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {showSettings ? (
          <SettingsView
            isDark={isDark}
            onToggleTheme={() => setIsDark(d => !d)}
            onLogout={handleLogout}
            onClose={() => setShowSettings(false)}
          />
        ) : (
          <>
            {tab === 'chat'     && <ChatView />}
            {tab === 'history'  && <HistoryView onSelectChat={() => {}} />}
            {tab === 'tasks'    && <TasksView />}
            {tab === 'projects' && <ProjectsView />}
            {tab === 'briefing' && <BriefingView />}
          </>
        )}
      </div>

      {/* Bottom nav — 5 tabs, 25 % larger button area */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.map(n => {
          const isActive = !showSettings && tab === n.id
          return (
            <button
              key={n.id}
              onClick={() => { setTab(n.id); setShowSettings(false) }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '10px 2px 10px', cursor: 'pointer', border: 'none', background: 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text3)',
                fontSize: 10, letterSpacing: '0.03em', textTransform: 'uppercase', gap: 4,
                transition: 'color 0.15s',
              }}
            >
              <n.Icon active={isActive} />
              <span>{n.label}</span>
            </button>
          )
        })}
      </div>

    </div>
  )
}
