'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  time: string
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Good to see you, Dr. Yomes. Ready when you are.', time: getTime() }
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
      textRef.current.style.height = Math.min(textRef.current.scrollHeight, 90) + 'px'
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
      const res = await fetch('http://192.168.1.153:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'phi3:mini',
          messages: historyRef.current,
          stream: false,
        }),
      })
      const data = await res.json()
      const reply = data.message?.content || 'No response.'
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
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
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
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 13px 6px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 0' }}>
          Today
        </div>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', maxWidth: '84%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              padding: '9px 13px', borderRadius: 16, fontSize: 13, lineHeight: 1.55,
              ...(msg.role === 'assistant'
                ? { background: 'var(--watson-bubble)', border: '1px solid var(--border)', borderBottomLeftRadius: 3, color: 'var(--text)' }
                : { background: 'var(--user-bubble)', border: '1px solid rgba(56,139,253,0.2)', borderBottomRightRadius: 3, color: '#e6edf3' }
              )
            }}>
              {msg.content}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, padding: '0 2px' }}>{msg.time}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '84%', alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '10px 13px', background: 'var(--watson-bubble)', border: '1px solid var(--border)', borderRadius: 16, borderBottomLeftRadius: 3, width: 'fit-content' }}>
              {[0, 200, 400].map(delay => (
                <div key={delay} style={{ width: 5, height: 5, background: 'var(--text2)', borderRadius: '50%', animation: 'bounce 1.2s ease infinite', animationDelay: `${delay}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '7px 10px 18px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 22, padding: '5px 5px 5px 12px' }}>
          <textarea
            ref={textRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize() }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Message Watson…"
            rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: 13, lineHeight: 1.5, resize: 'none', maxHeight: 90, padding: '4px 0' }}
          />
          <button onClick={toggleMic} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, flexShrink: 0, background: listening ? 'var(--mic-active)' : 'var(--bg3)', color: listening ? 'white' : 'var(--text2)' }}>🎤</button>
          <button onClick={sendMessage} style={{ width: 30, height: 30, background: 'var(--accent)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 15, flexShrink: 0 }}>↑</button>
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,60%,100% { transform:translateY(0);opacity:.4 } 30% { transform:translateY(-4px);opacity:1 } }`}</style>
    </div>
  )
}
