'use client'
import { useState, useRef, useEffect } from 'react'
import { PROJECTS } from '@/lib/data'

type Project = (typeof PROJECTS)[0]

interface Message {
  role: 'user' | 'assistant'
  content: string
  time: string
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const statusStyles: Record<string, { bg: string; color: string }> = {
  active:  { bg: 'rgba(63,185,80,0.12)',   color: 'var(--success)' },
  planned: { bg: 'rgba(139,148,158,0.12)', color: 'var(--text2)' },
  hold:    { bg: 'rgba(210,153,34,0.12)',  color: 'var(--warning)' },
}

function ProjectChat({ project }: { project: Project }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Ask me anything about ${project.name}.`, time: getTime() },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [listening, setListening] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const historyRef = useRef<{ role: string; content: string }[]>([])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, typing])

  function autoResize() {
    if (textRef.current) {
      textRef.current.style.height = 'auto'
      textRef.current.style.height = Math.min(textRef.current.scrollHeight, 80) + 'px'
    }
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text) return
    setInput('')
    if (textRef.current) textRef.current.style.height = 'auto'

    const userMsg: Message = { role: 'user', content: text, time: getTime() }
    setMessages(prev => [...prev, userMsg])
    historyRef.current.push({ role: 'user', content: text })
    setTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyRef.current,
          projectContext: { id: project.name, name: project.name },
        }),
      })
      const data = await res.json()
      const reply = data.reply || 'No response.'
      historyRef.current.push({ role: 'assistant', content: reply })
      setMessages(prev => [...prev, { role: 'assistant', content: reply, time: getTime() }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error.', time: getTime() }])
    } finally {
      setTyping(false)
    }
  }

  function toggleMic() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SR) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Use Safari on iOS for voice input.', time: getTime() }])
      return
    }
    if (listening) { recognitionRef.current?.stop(); return }
    const recognition = new SR()
    recognitionRef.current = recognition
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.onstart = () => setListening(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => setInput(e.results[0][0].transcript)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognition.start()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', borderTop: '1px solid var(--border)' }}>
      <div style={{ padding: '7px 16px 4px', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
        Project Chat
      </div>
      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '4px 13px 6px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', maxWidth: '84%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              padding: '8px 11px', borderRadius: 14, fontSize: 12, lineHeight: 1.55,
              ...(msg.role === 'assistant'
                ? { background: 'var(--watson-bubble)', border: '1px solid var(--border)', borderBottomLeftRadius: 3, color: 'var(--text)' }
                : { background: 'var(--user-bubble)', border: '1px solid rgba(56,139,253,0.2)', borderBottomRightRadius: 3, color: '#e6edf3' }
              ),
            }}>
              {msg.content}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2, padding: '0 2px' }}>{msg.time}</div>
          </div>
        ))}
        {typing && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '8px 11px', background: 'var(--watson-bubble)', border: '1px solid var(--border)', borderRadius: 14, borderBottomLeftRadius: 3 }}>
              {[0, 200, 400].map(d => (
                <div key={d} style={{ width: 4, height: 4, background: 'var(--text2)', borderRadius: '50%', animation: 'bounce 1.2s ease infinite', animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '6px 10px 14px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 22, padding: '4px 4px 4px 11px' }}>
          <textarea
            ref={textRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize() }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder={`Ask about ${project.name}…`}
            rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: 12, lineHeight: 1.5, resize: 'none', maxHeight: 80, padding: '4px 0' }}
          />
          <button
            onClick={toggleMic}
            style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, flexShrink: 0, background: listening ? 'var(--mic-active)' : 'var(--bg3)', color: listening ? 'white' : 'var(--text2)' }}
          >🎤</button>
          <button
            onClick={sendMessage}
            style={{ width: 28, height: 28, background: 'var(--accent)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 14, flexShrink: 0 }}
          >↑</button>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1} }`}</style>
    </div>
  )
}

export default function ProjectsView() {
  const [selected, setSelected] = useState<Project | null>(null)

  if (selected) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Project detail header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <button
            onClick={() => setSelected(null)}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: 'var(--text2)', cursor: 'pointer' }}
          >
            ← Projects
          </button>
          <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selected.name}
          </div>
          <div style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0, ...statusStyles[selected.status] }}>
            {selected.status}
          </div>
        </div>

        {/* Project info */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg2)' }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 3 }}>{selected.desc}</div>
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>{selected.url}</div>
        </div>

        {/* Inline project chat */}
        <ProjectChat project={selected} />

      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '14px 16px 6px', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>
        Projects
      </div>
      <div style={{ padding: '0 12px 16px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {PROJECTS.map(p => (
          <div
            key={p.name}
            onClick={() => setSelected(p)}
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 11, padding: '11px 13px', cursor: 'pointer' }}
          >
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
