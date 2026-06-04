'use client'
import { HISTORY } from '@/lib/data'

interface Props {
  onSelectChat: (title: string) => void
}

export default function HistoryView({ onSelectChat }: Props) {
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '14px 16px 6px', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>
        Recent chats
      </div>
      <div style={{ padding: '0 12px 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {HISTORY.map(h => (
          <div
            key={h.id}
            onClick={() => onSelectChat(h.title)}
            style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 13px', cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {h.title}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>{h.meta}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
