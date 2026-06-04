'use client'
import { useState } from 'react'

interface Props {
  onLogin: () => void
}

export default function LoginScreen({ onLogin }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!password) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        onLogin()
      } else {
        setError('Incorrect password')
        setTimeout(() => setError(''), 2000)
      }
    } catch {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 32px', zIndex: 100,
    }}>
      <div style={{
        width: 64, height: 64, background: '#111827',
        borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 40, color: 'white',
        marginBottom: 16, border: '1px solid rgba(255,255,255,0.1)',
      }}>W</div>

      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
        Watson
      </div>
      <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 32 }}>
        AI-powered digital assistant
      </div>

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleLogin()}
        style={{
          width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 11, padding: '12px 15px', color: 'var(--text)',
          fontFamily: "'DM Mono', monospace", fontSize: 13, outline: 'none', marginBottom: 10,
        }}
      />
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: '100%', background: '#111827', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 11, padding: 12, color: 'white',
          fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500,
          letterSpacing: '0.04em', cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      <div style={{ fontSize: 11, color: '#da3633', marginTop: 10, minHeight: 16 }}>{error}</div>
    </div>
  )
}
