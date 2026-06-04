'use client'
import { useState, useEffect } from 'react'

export interface Person {
  id: string
  name: string
  email: string
  phone: string
  role: string       // relationship/role label e.g. "Elder", "Staff", "Author"
  notes: string
  createdAt: string
}

// ── Stub API calls ──────────────────────────────────────────────────────────
// Swap these for real fetch() calls once Watson's People API is live.
// Endpoint pattern: /api/people (GET, POST), /api/people/:id (PUT, DELETE)

let _store: Person[] = [
  { id: '1', name: 'Mel Yomes', email: 'mel@example.com', phone: '', role: 'Family', notes: 'Primary book co-editor for TWJ.', createdAt: '2025-01-01' },
  { id: '2', name: 'Example Elder', email: 'elder@example.com', phone: '', role: 'Elder', notes: '', createdAt: '2025-01-01' },
]

async function apiListPeople(): Promise<Person[]> {
  // TODO: return fetch('/api/people').then(r => r.json())
  return structuredClone(_store)
}

async function apiAddPerson(data: Omit<Person, 'id' | 'createdAt'>): Promise<Person> {
  // TODO: return fetch('/api/people', { method:'POST', body: JSON.stringify(data), headers:{'Content-Type':'application/json'} }).then(r=>r.json())
  const p: Person = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString().slice(0, 10) }
  _store = [..._store, p]
  return p
}

async function apiUpdatePerson(id: string, data: Partial<Person>): Promise<Person> {
  // TODO: return fetch(`/api/people/${id}`, { method:'PUT', body: JSON.stringify(data), headers:{'Content-Type':'application/json'} }).then(r=>r.json())
  _store = _store.map(p => p.id === id ? { ...p, ...data } : p)
  return _store.find(p => p.id === id)!
}

async function apiDeletePerson(id: string): Promise<void> {
  // TODO: return fetch(`/api/people/${id}`, { method:'DELETE' }).then(r=>r.json())
  _store = _store.filter(p => p.id !== id)
}
// ───────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = { name: '', email: '', phone: '', role: '', notes: '' }

type View = 'list' | 'detail' | 'add' | 'edit'

function SectionHeader({ title, action, onBack }: { title: string; action?: React.ReactNode; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', fontSize: 16, padding: '0 4px 0 0', display: 'flex', alignItems: 'center' }}>‹</button>
        <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>{title}</div>
      </div>
      {action}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 4, paddingLeft: 2 }}>{label}</div>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', setError }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; setError: (v: string) => void }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => { onChange(e.target.value); setError('') }}
      placeholder={placeholder}
      style={{
        width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
        padding: '9px 11px', fontSize: 13, color: 'var(--text)', outline: 'none', fontFamily: "'DM Mono', monospace",
      }}
    />
  )
}

function Textarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      style={{
        width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
        padding: '9px 11px', fontSize: 13, color: 'var(--text)', outline: 'none', fontFamily: "'DM Mono', monospace",
        resize: 'none', lineHeight: 1.5,
      }}
    />
  )
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: 'var(--accent2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 600, color: 'white', flexShrink: 0,
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      {initials}
    </div>
  )
}

interface Props {
  onBack: () => void
}

export default function PeopleView({ onBack }: Props) {
  const [view, setView] = useState<View>('list')
  const [people, setPeople] = useState<Person[]>([])
  const [selected, setSelected] = useState<Person | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    apiListPeople().then(setPeople)
  }, [])

  const filtered = people.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  function openDetail(p: Person) {
    setSelected(p)
    setView('detail')
  }

  function openEdit(p: Person) {
    setSelected(p)
    setForm({ name: p.name, email: p.email, phone: p.phone, role: p.role, notes: p.notes })
    setView('edit')
  }

  function openAdd() {
    setForm(EMPTY_FORM)
    setError('')
    setView('add')
  }

  async function handleSaveNew() {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true)
    try {
      const p = await apiAddPerson(form)
      setPeople(prev => [...prev, p])
      setSelected(p)
      setView('detail')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEdit() {
    if (!selected) return
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true)
    try {
      const p = await apiUpdatePerson(selected.id, form)
      setPeople(prev => prev.map(x => x.id === p.id ? p : x))
      setSelected(p)
      setView('detail')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await apiDeletePerson(id)
    setPeople(prev => prev.filter(p => p.id !== id))
    setView('list')
    setSelected(null)
  }

  // ── Views ───────────────────────────────────────────────────────────────

  if (view === 'list') return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <SectionHeader
        title={`People · ${people.length}`}
        onBack={onBack}
        action={
          <button
            onClick={openAdd}
            style={{ background: 'var(--accent)', border: 'none', borderRadius: 7, padding: '5px 11px', fontSize: 11, color: 'white', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}
          >
            + Add
          </button>
        }
      />

      {/* Search */}
      <div style={{ padding: '0 12px 10px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 12 }}>⌕</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search people…"
            style={{
              width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '8px 11px 8px 28px', fontSize: 12, color: 'var(--text)', outline: 'none', fontFamily: "'DM Mono', monospace",
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ padding: '0 12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '24px 0' }}>
            {search ? 'No results.' : 'No people yet. Add one.'}
          </div>
        )}
        {filtered.map(p => (
          <div
            key={p.id}
            onClick={() => openDetail(p)}
            style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}
          >
            <Avatar name={p.name} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {[p.role, p.email].filter(Boolean).join(' · ')}
              </div>
            </div>
            <span style={{ color: 'var(--text3)', fontSize: 14 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  )

  if (view === 'detail' && selected) return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <SectionHeader
        title="Contact"
        onBack={onBack}
        action={
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => openEdit(selected)}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 11px', fontSize: 11, color: 'var(--text)', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}
            >
              Edit
            </button>
            <button
              onClick={() => { if (confirm(`Remove ${selected.name}?`)) handleDelete(selected.id) }}
              style={{ background: 'transparent', border: '1px solid rgba(218,54,51,0.3)', borderRadius: 7, padding: '5px 11px', fontSize: 11, color: '#da3633', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}
            >
              Remove
            </button>
          </div>
        }
      />
      <div style={{ padding: '0 16px 16px' }}>
        {/* Avatar + name block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px', marginBottom: 12 }}>
          <Avatar name={selected.name} size={48} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{selected.name}</div>
            {selected.role && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{selected.role}</div>}
          </div>
        </div>

        {/* Contact info */}
        {(selected.email || selected.phone) && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
            {selected.email && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', borderBottom: selected.phone ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</div>
                <div style={{ fontSize: 12, color: 'var(--text)' }}>{selected.email}</div>
              </div>
            )}
            {selected.phone && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phone</div>
                <div style={{ fontSize: 12, color: 'var(--text)' }}>{selected.phone}</div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {selected.notes && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 13px', marginBottom: 12 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Notes</div>
            <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selected.notes}</div>
          </div>
        )}

        <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center', paddingTop: 4 }}>Added {selected.createdAt}</div>
      </div>
    </div>
  )

  if (view === 'add' || view === 'edit') {
    const isEdit = view === 'edit'
    return (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SectionHeader title={isEdit ? 'Edit contact' : 'New contact'} onBack={onBack} />
        <div style={{ padding: '0 12px 24px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Field label="Name *">
            <Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Full name" setError={setError} />
          </Field>
          <Field label="Role / Relationship">
            <Input value={form.role} onChange={v => setForm(f => ({ ...f, role: v }))} placeholder="e.g. Elder, Staff, Author" setError={setError} />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="email@example.com" type="email" setError={setError} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="555-000-0000" type="tel" setError={setError} />
          </Field>
          <Field label="Notes">
            <Textarea value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Relationship context, info…" />
          </Field>

          {error && <div style={{ fontSize: 11, color: '#da3633', padding: '4px 2px' }}>{error}</div>}

          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button
              onClick={() => { setView(isEdit && selected ? 'detail' : 'list'); setError('') }}
              style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 9, padding: '11px', fontSize: 12, color: 'var(--text)', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}
            >
              Cancel
            </button>
            <button
              onClick={isEdit ? handleSaveEdit : handleSaveNew}
              disabled={saving}
              style={{ flex: 2, background: saving ? 'var(--bg3)' : 'var(--accent)', border: 'none', borderRadius: 9, padding: '11px', fontSize: 12, color: saving ? 'var(--text3)' : 'white', cursor: saving ? 'default' : 'pointer', fontFamily: "'DM Mono', monospace" }}
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add contact'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
