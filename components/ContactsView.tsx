'use client'
import { useState, useEffect, CSSProperties } from 'react'

const WATSON = process.env.NEXT_PUBLIC_WATSON_API_URL || ''

interface Contact {
  id: number
  name: string
  email?: string
  phone?: string
  relationship?: string
  notes?: string
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg3)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 12, background: 'var(--bg3)', borderRadius: 4, marginBottom: 6, width: '50%' }} />
        <div className="skeleton" style={{ height: 10, background: 'var(--bg3)', borderRadius: 4, width: '70%' }} />
      </div>
    </div>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const hue = name.charCodeAt(0) * 13 % 360
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `hsl(${hue},40%,28%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 500, color: `hsl(${hue},60%,75%)` }}>
      {initials}
    </div>
  )
}

const inputStyle: CSSProperties = {
  background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
  padding: '9px 11px', color: 'var(--text)', fontFamily: "'DM Mono', monospace",
  fontSize: 12, outline: 'none', width: '100%', marginBottom: 7,
}

export default function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [editing, setEditing] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', relationship: '', notes: '' })
  const [editForm, setEditForm] = useState<Contact | null>(null)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    setOffline(false)
    fetch(`${WATSON}/people`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setContacts(Array.isArray(data) ? data : []))
      .catch(() => { setOffline(true); setContacts([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function addContact() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`${WATSON}/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const c = await res.json()
        setContacts(prev => [...prev, c])
        setForm({ name: '', email: '', phone: '', relationship: '', notes: '' })
        setShowAdd(false)
      }
    } catch { /* offline */ } finally { setSaving(false) }
  }

  async function saveEdit(id: number) {
    if (!editForm) return
    setSaving(true)
    try {
      const res = await fetch(`${WATSON}/people/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        const c = await res.json()
        setContacts(prev => prev.map(x => x.id === id ? c : x))
        setEditing(null)
        setEditForm(null)
      }
    } catch { /* offline */ } finally { setSaving(false) }
  }

  async function deleteContact(id: number) {
    if (!confirm('Delete this contact?')) return
    setContacts(prev => prev.filter(c => c.id !== id))
    fetch(`${WATSON}/people/${id}`, { method: 'DELETE' }).catch(() => {})
    if (expanded === id) setExpanded(null)
  }

  const filtered = contacts.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 80px' }}>

      {/* Search + Add */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search contacts…"
          style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
        />
        <button
          onClick={() => setShowAdd(s => !s)}
          style={{ padding: '9px 12px', background: showAdd ? 'var(--accent)' : 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: showAdd ? 'white' : 'var(--text)', cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: 13, flexShrink: 0 }}
        >
          {showAdd ? '×' : '+'}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>New Contact</div>
          {(['name', 'email', 'phone', 'relationship', 'notes'] as const).map(f => (
            <input key={f} value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
              placeholder={f.charAt(0).toUpperCase() + f.slice(1) + (f === 'name' ? ' *' : '')}
              style={inputStyle} />
          ))}
          <button onClick={addContact} disabled={saving || !form.name.trim()}
            style={{ width: '100%', padding: 9, background: 'var(--accent)', border: 'none', borderRadius: 8, color: 'white', fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: 'pointer', opacity: (!form.name.trim() || saving) ? 0.5 : 1 }}>
            {saving ? 'Saving…' : 'Add Contact'}
          </button>
        </div>
      )}

      {/* Offline */}
      {offline && (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>Watson offline</div>
          <button onClick={load} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: '1px solid var(--accent)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}>Retry</button>
        </div>
      )}

      {loading && [1,2,3,4,5].map(i => <Skeleton key={i} />)}

      {!loading && !offline && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--text3)' }}>
          {search ? 'No contacts match' : 'No contacts yet'}
        </div>
      )}

      {!loading && filtered.map(c => (
        <div key={c.id}>
          {/* Row */}
          <div
            onClick={() => setExpanded(expanded === c.id ? null : c.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
          >
            <Avatar name={c.name} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.email || c.phone || c.relationship || ''}
              </div>
            </div>
            <span style={{ fontSize: 14, color: 'var(--text3)', transform: expanded === c.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>›</span>
          </div>

          {/* Expanded detail */}
          {expanded === c.id && (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 4 }}>
              {editing === c.id && editForm ? (
                <>
                  {(['name', 'email', 'phone', 'relationship', 'notes'] as const).map(f => (
                    <input key={f} value={(editForm as any)[f] || ''} onChange={e => setEditForm(p => p ? { ...p, [f]: e.target.value } : p)}
                      placeholder={f.charAt(0).toUpperCase() + f.slice(1)} style={inputStyle} />
                  ))}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => saveEdit(c.id)} disabled={saving} style={{ flex: 1, padding: 8, background: 'var(--accent)', border: 'none', borderRadius: 8, color: 'white', fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save'}</button>
                    <button onClick={() => { setEditing(null); setEditForm(null) }} style={{ flex: 1, padding: 8, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  {c.email && <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>✉ {c.email}</div>}
                  {c.phone && <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>📞 {c.phone}</div>}
                  {c.relationship && <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>{c.relationship}</div>}
                  {c.notes && <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 8 }}>{c.notes}</div>}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button onClick={() => { setEditing(c.id); setEditForm({ ...c }) }} style={{ flex: 1, padding: 7, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => deleteContact(c.id)} style={{ flex: 1, padding: 7, background: 'rgba(218,54,51,0.1)', border: '1px solid rgba(218,54,51,0.25)', borderRadius: 8, color: 'var(--mic-active)', fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: 'pointer' }}>Delete</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
