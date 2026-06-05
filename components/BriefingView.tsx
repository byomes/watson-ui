'use client'
import { useState, useEffect, CSSProperties } from 'react'

const WATSON = process.env.NEXT_PUBLIC_WATSON_API_URL || ''

interface Article {
  id: number
  title: string
  source: string
  summary: string
  url?: string
}

const MOCK: Article[] = [
  { id: 1, title: 'The Rise of AI in Ministry', source: 'Christianity Today', summary: 'How churches are leveraging AI tools for sermon prep, outreach, and pastoral care across denominations.' },
  { id: 2, title: 'Biblical Theology in Postmodern Culture', source: 'First Things', summary: 'A deep examination of how Reformed theology engages with contemporary skepticism about absolute truth.' },
  { id: 3, title: 'Church Growth Metrics vs. Discipleship Depth', source: 'The Gospel Coalition', summary: 'Why attendance numbers can mislead pastors about actual spiritual formation in their congregations.' },
  { id: 4, title: 'Preaching to a Distracted Generation', source: 'Preaching Today', summary: 'Practical techniques for delivering sermons that cut through digital noise and land with lasting effect.' },
]

function Skeleton() {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 10 }}>
      {[70, 40, 100, 80].map((w, i) => (
        <div key={i} className="skeleton" style={{ height: i === 0 ? 14 : 10, background: 'var(--bg3)', borderRadius: 4, marginBottom: i < 3 ? 8 : 0, width: `${w}%` }} />
      ))}
    </div>
  )
}

function btn(color: 'green' | 'red' | 'blue'): CSSProperties {
  const map = {
    green: { bg: 'rgba(63,185,80,0.1)',  border: 'rgba(63,185,80,0.3)',   fg: 'var(--success)' },
    red:   { bg: 'rgba(218,54,51,0.1)',  border: 'rgba(218,54,51,0.25)', fg: 'var(--mic-active)' },
    blue:  { bg: 'rgba(56,139,253,0.1)', border: 'rgba(56,139,253,0.25)',fg: 'var(--accent)' },
  }
  const c = map[color]
  return { flex: 1, padding: '7px 0', fontSize: 11, fontFamily: "'DM Mono', monospace", background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, color: c.fg, cursor: 'pointer' }
}

export default function BriefingView() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [actioned, setActioned] = useState<Record<number, string>>({})

  function load() {
    setLoading(true)
    setOffline(false)
    fetch(`${WATSON}/briefing`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setArticles(Array.isArray(data) ? data : MOCK); setOffline(false) })
      .catch(() => { setArticles(MOCK); setOffline(true) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function action(id: number, type: string) {
    setActioned(p => ({ ...p, [id]: type }))
    fetch(`${WATSON}/briefing/${id}/action`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: type }) }).catch(() => {})
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 2px' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Today's Briefing</div>
        {offline && <div style={{ fontSize: 10, color: 'var(--warning)' }}>· showing cached</div>}
      </div>

      {loading && [1, 2, 3].map(i => <Skeleton key={i} />)}

      {!loading && articles.map(a => {
        const act = actioned[a.id]
        return (
          <div key={a.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 10, opacity: act ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, marginBottom: 4 }}>{a.title}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>{a.source}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55, marginBottom: 12 }}>{a.summary}</div>
            {act ? (
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                {act === 'approve' ? '👍 Approved' : act === 'reject' ? '👎 Rejected' : '📘 Queued for Facebook'}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={btn('green')} onClick={() => action(a.id, 'approve')}>👍 Approve</button>
                <button style={btn('red')}   onClick={() => action(a.id, 'reject')}>👎 Reject</button>
                <button style={btn('blue')}  onClick={() => action(a.id, 'facebook')}>📘 FB</button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
