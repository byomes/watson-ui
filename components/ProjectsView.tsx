'use client'
import { PROJECTS } from '@/lib/data'

const statusStyles: Record<string, { bg: string; color: string }> = {
  active:  { bg: 'rgba(63,185,80,0.12)',  color: 'var(--success)' },
  planned: { bg: 'rgba(139,148,158,0.12)', color: 'var(--text2)' },
  hold:    { bg: 'rgba(210,153,34,0.12)', color: 'var(--warning)' },
}

export default function ProjectsView() {
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '14px 16px 6px', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>
        Projects
      </div>
      <div style={{ padding: '0 12px 16px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {PROJECTS.map(p => (
          <div key={p.name} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 11, padding: '11px 13px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
              <div style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.04em', textTransform: 'uppercase', ...statusStyles[p.status] }}>
                {p.status}
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>{p.desc}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{p.url}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
