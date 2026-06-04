'use client'
import { useState } from 'react'
import { TASKS } from '@/lib/data'

type Task = typeof TASKS[number] & { done: boolean }

const tagColors: Record<string, { bg: string; color: string }> = {
  watson: { bg: 'rgba(56,139,253,0.12)', color: 'var(--accent)' },
  bill:   { bg: 'rgba(63,185,80,0.12)',  color: 'var(--success)' },
  blocked:{ bg: 'rgba(210,153,34,0.12)', color: 'var(--warning)' },
}

export default function TasksView() {
  const [tasks, setTasks] = useState<Task[]>(TASKS.map(t => ({ ...t })))

  function toggle(id: number) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '14px 16px 6px', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>
        Active tasks
      </div>
      <div style={{ padding: '0 12px 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {tasks.map(t => (
          <div key={t.id} onClick={() => toggle(t.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>
            <div style={{
              width: 15, height: 15, border: t.done ? 'none' : '1.5px solid var(--text3)',
              borderRadius: 4, flexShrink: 0, marginTop: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9,
              background: t.done ? 'var(--success)' : 'transparent',
              color: 'white',
            }}>
              {t.done ? '✓' : ''}
            </div>
            <div>
              <div style={{ fontSize: 13, color: t.done ? 'var(--text3)' : 'var(--text)', textDecoration: t.done ? 'line-through' : 'none', lineHeight: 1.4 }}>
                {t.title}
                <span style={{ display: 'inline-block', fontSize: 9, padding: '1px 5px', borderRadius: 3, letterSpacing: '0.04em', textTransform: 'uppercase', marginLeft: 5, ...tagColors[t.tag] }}>
                  {t.tag}
                </span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{t.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
