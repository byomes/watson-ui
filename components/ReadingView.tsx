'use client'
import { useState, useEffect } from 'react'

const WATSON = process.env.NEXT_PUBLIC_WATSON_API_URL || ''

type Status = 'reading' | 'queued' | 'finished'

interface Book {
  id: number
  title: string
  author?: string
  status: Status
  link?: string
}

const STATUS_LABEL: Record<Status, string> = { reading: '📖 Reading', queued: '📋 Queued', finished: '✅ Finished' }
const STATUS_ORDER: Status[] = ['reading', 'queued', 'finished']

function Skeleton() {
  return (
    <div style={{ padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
      <div className="skeleton" style={{ height: 13, background: 'var(--bg3)', borderRadius: 4, marginBottom: 6, width: '60%' }} />
      <div className="skeleton" style={{ height: 10, background: 'var(--bg3)', borderRadius: 4, width: '40%' }} />
    </div>
  )
}

export default function ReadingView() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  function load() {
    setLoading(true)
    setOffline(false)
    fetch(`${WATSON}/reading_list`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setBooks(Array.isArray(data) ? data : []))
      .catch(() => { setOffline(true); setBooks([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function setStatus(id: number, status: Status) {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    fetch(`${WATSON}/reading_list/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {})
  }

  const grouped = STATUS_ORDER.map(s => ({ status: s, items: books.filter(b => b.status === s) })).filter(g => g.items.length > 0)

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 80px' }}>

      {offline && (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>Watson offline</div>
          <button onClick={load} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: '1px solid var(--accent)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}>Retry</button>
        </div>
      )}

      {loading && [1,2,3,4].map(i => <Skeleton key={i} />)}

      {!loading && !offline && books.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--text3)' }}>Reading list is empty</div>
      )}

      {!loading && grouped.map(group => (
        <div key={group.status} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, padding: '0 2px' }}>
            {STATUS_LABEL[group.status]}
          </div>
          {group.items.map(b => (
            <div key={b.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 12px', marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 3, lineHeight: 1.4 }}>{b.title}</div>
              {b.author && <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>{b.author}</div>}
              <div style={{ display: 'flex', gap: 5 }}>
                {STATUS_ORDER.filter(s => s !== b.status).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(b.id, s)}
                    style={{ fontSize: 10, padding: '4px 9px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}
                  >
                    → {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
