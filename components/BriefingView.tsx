'use client'

export default function BriefingView() {
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '14px 16px 6px', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>
        Morning briefing
      </div>
      <div style={{ padding: '0 12px 16px' }}>
        <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '40px 20px', lineHeight: 1.8 }}>
          Briefing loads daily at 6:00 AM.<br />
          Connect Watson server to enable live feed.
        </div>
      </div>
    </div>
  )
}
