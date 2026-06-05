'use client'
import { useState, useEffect, CSSProperties } from 'react'

type Priority = 'high' | 'medium' | 'low'
type Filter = 'all' | 'active' | 'done'
type Status = 'active' | 'done'

interface Task {
  id: number
  title: string
  due_date?: string
  priority: Priority
  status: Status
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 5, background: 'var(--bg3)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 12, background: 'var(--bg3)', borderRadius: 4, marginBottom: 6, width: '65%' }} />
        <div className="skeleton" style={{ height: 9, background: 'var(--bg3)', borderRadius: 4, width: '35%' }} />
      </div>
    </div>
  )
}

const PRIORITY_COLOR: Record<Priority, string> = {
  high: 'rgba(218,54,51,0.75)',
  medium: 'rgba(210,153,34,0.75)',
  low: 'rgba(63,185,80,0.75)',
}

const PRIORITY_BG: Record<Priority, string> = {
  high: 'rgba(218,54,51,0.1)',
  medium: 'rgba(210,153,34,0.1)',
  low: 'rgba(63,185,80,0.1)',
}

export default function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [newTitle, setNewTitle] = useState('')
  const [newDue, setNewDue] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [adding, setAdding] = useState(false)

  function load() {
    setLoading(true)
    setOffline(false)
    fetch('/api/watson/tasks')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .catch(() => { setOffline(true); setTasks([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function addTask() {
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/watson/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), due_date: newDue || undefined, priority: newPriority, status: 'active' }),
      })
      if (res.ok) {
        const t = await res.json()
        setTasks(prev => [t, ...prev])
        setNewTitle('')
        setNewDue('')
        setNewPriority('medium')
      }
    } catch { /* offline */ } finally { setAdding(false) }
  }

  async function toggleDone(task: Task) {
    const newStatus: Status = task.status === 'done' ? 'active' : 'done'
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    fetch(`/api/watson/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => {})
  }

  async function deleteTask(id: number) {
    setTasks(prev => prev.filter(t => t.id !== id))
    fetch(`/api/watson/tasks/${id}`, { method: 'DELETE' }).catch(() => {})
  }

  const visible = tasks.filter(t =>
    filter === 'all' ? true : filter === 'active' ? t.status === 'active' : t.status === 'done'
  )

  const inputStyle: CSSProperties = {
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
    padding: '9px 11px', color: 'var(--text)', fontFamily: "'DM Mono', monospace",
    fontSize: 12, outline: 'none',
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 80px' }}>

      {/* Add form */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Add Task</div>
        <input
          value={newTitle} onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Task title..."
          style={{ ...inputStyle, width: '100%', marginBottom: 8 }}
        />
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input
            type="date" value={newDue} onChange={e => setNewDue(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <select
            value={newPriority} onChange={e => setNewPriority(e.target.value as Priority)}
            style={{ ...inputStyle, flex: 1 }}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button
          onClick={addTask} disabled={adding || !newTitle.trim()}
          style={{ width: '100%', padding: '9px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: 'white', fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: 'pointer', opacity: (!newTitle.trim() || adding) ? 0.5 : 1 }}
        >
          {adding ? 'Adding…' : '+ Add Task'}
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {(['all', 'active', 'done'] as Filter[]).map(f => (
          <button
            key={f} onClick={() => setFilter(f)}
            style={{ flex: 1, padding: '6px 0', fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', background: filter === f ? 'var(--accent)' : 'var(--bg2)', color: filter === f ? 'white' : 'var(--text2)' }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Offline */}
      {offline && (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>Watson offline</div>
          <button onClick={load} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: '1px solid var(--accent)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}>Retry</button>
        </div>
      )}

      {/* Skeleton */}
      {loading && [1,2,3,4].map(i => <Skeleton key={i} />)}

      {/* List */}
      {!loading && !offline && visible.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--text3)' }}>No tasks</div>
      )}

      {!loading && visible.map(t => (
        <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => toggleDone(t)}
            style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${t.status === 'done' ? 'var(--success)' : 'var(--border)'}`, background: t.status === 'done' ? 'var(--success)' : 'transparent', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}
          >
            {t.status === 'done' && <span style={{ color: 'white', fontSize: 11, lineHeight: 1 }}>✓</span>}
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: 'var(--text)', textDecoration: t.status === 'done' ? 'line-through' : 'none', color: t.status === 'done' ? 'var(--text3)' : 'var(--text)', marginBottom: 4, lineHeight: 1.4 }}>{t.title}</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: PRIORITY_BG[t.priority], color: PRIORITY_COLOR[t.priority], letterSpacing: '0.04em', textTransform: 'uppercase' }}>{t.priority}</span>
              {t.due_date && <span style={{ fontSize: 10, color: 'var(--text3)' }}>{t.due_date}</span>}
            </div>
          </div>

          <button
            onClick={() => deleteTask(t.id)}
            style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '2px 4px', fontSize: 14, flexShrink: 0 }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
