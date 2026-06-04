'use client'
import { useState, useEffect } from 'react'

// ── Types ──────────────────────────────────────────────────────

export interface Person {
  id: number
  name: string
  email: string
  phone: string
  relationship: string
  notes: string
  created_at: string
}

export interface Congregant {
  id: number
  name: string
  email: string
  phone: string
  status: string
  campus: string
  notes: string
  prayer_requests: string
  follow_up: string
  first_seen: string
  last_seen: string
  created_at: string
}

type Registry = 'personal' | 'catalyst'
type View = 'list' | 'detail' | 'add' | 'edit'

// ── API helpers ────────────────────────────────────────────────

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, options)
  return res.json()
}

const api = {
  people: {
    list: () => apiFetch('/api/people'),
    create: (d: Record<string, string>) => apiFetch('/api/people', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }),
    update: (id: number, d: Record<string, string>) => apiFetch(`/api/people/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }),
    del: (id: number) => apiFetch(`/api/people/${id}`, { method: 'DELETE' }),
  },
  congregation: {
    list: () => apiFetch('/api/congregation'),
    create: (d: Record<string, string>) => apiFetch('/api/congregation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }),
    update: (id: number, d: Record<string, string>) => apiFetch(`/api/congregation/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }),
    del: (id: number) => apiFetch(`/api/congregation/${id}`, { method: 'DELETE' }),
  },
}

// ── Empty form states ──────────────────────────────────────────

const EMPTY_PERSON: Record<string, string> = { name: '', email: '', phone: '', relationship: '', notes: '' }
const EMPTY_CONGREGANT: Record<string, string> = { name: '', email: '', phone: '', status: '', campus: '', notes: '', prayer_requests: '', follow_up: '', first_seen: '', last_seen: '' }

// ── Sub-components ─────────────────────────────────────────────

function SectionHeader({ title, onBack, action }: { title: string; onBack: () => void; action?: React.ReactNode }) {
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

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
  padding: '9px 11px', fontSize: 13, color: 'var(--text)', outline: 'none', fontFamily: "'DM Mono', monospace",
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
      <option value="">—</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
  )
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--accent2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 600, color: 'white', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
      {initials || '?'}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '9px 13px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingTop: 1, flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text)', textAlign: 'right', maxWidth: '65%', lineHeight: 1.5 }}>{value}</div>
    </div>
  )
}

// ── Registry toggle ────────────────────────────────────────────

function RegistryToggle({ registry, onChange }: { registry: Registry; onChange: (r: Registry) => void }) {
  const btn = (r: Registry, label: string) => (
    <button
      onClick={() => onChange(r)}
      style={{
        flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer',
        background: registry === r ? 'var(--accent)' : 'var(--bg2)',
        color: registry === r ? 'white' : 'var(--text2)',
        fontSize: 11, fontFamily: "'DM Mono', monospace", transition: 'background 0.15s, color 0.15s',
      }}
    >
      {label}
    </button>
  )
  return (
    <div style={{ display: 'flex', gap: 6, padding: '0 12px 10px' }}>
      {btn('personal', 'Personal')}
      {btn('catalyst', 'Catalyst')}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────

interface Props { onBack: () => void }

export default function PeopleView({ onBack }: Props) {
  const [registry, setRegistry] = useState<Registry>('personal')
  const [people, setPeople] = useState<Person[]>([])
  const [congregation, setCongregation] = useState<Congregant[]>([])
  const [selected, setSelected] = useState<Person | Congregant | null>(null)
  const [view, setView] = useState<View>('list')
  const [form, setForm] = useState<Record<string, string>>(EMPTY_PERSON)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  // Load list when registry changes
  useEffect(() => {
    setView('list')
    setSelected(null)
    setSearch('')
    if (registry === 'personal') {
      api.people.list().then(d => Array.isArray(d) ? setPeople(d) : null).catch(() => {})
    } else {
      api.congregation.list().then(d => Array.isArray(d) ? setCongregation(d) : null).catch(() => {})
    }
  }, [registry])

  const isPersonal = registry === 'personal'
  const items: (Person | Congregant)[] = isPersonal ? people : congregation
  const q = search.toLowerCase()
  const filtered = items.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (isPersonal ? (p as Person).relationship : (p as Congregant).status ?? '').toLowerCase().includes(q) ||
    (p.email ?? '').toLowerCase().includes(q)
  )

  function f(key: string) { return form[key] ?? '' }
  function setF(key: string, val: string) { setForm(prev => ({ ...prev, [key]: val })); setError('') }

  function openAdd() {
    setForm(isPersonal ? { ...EMPTY_PERSON } : { ...EMPTY_CONGREGANT })
    setError('')
    setView('add')
  }

  function openEdit(item: Person | Congregant) {
    setSelected(item)
    const d: Record<string, string> = {}
    Object.entries(item).forEach(([k, v]) => { if (typeof v === 'string' || typeof v === 'number') d[k] = String(v ?? '') })
    setForm(d)
    setView('edit')
  }

  function openDetail(item: Person | Congregant) {
    setSelected(item)
    setView('detail')
  }

  async function handleSave() {
    if (!f('name').trim()) { setError('Name is required.'); return }
    setSaving(true)
    try {
      const isEdit = view === 'edit' && selected
      if (isPersonal) {
        const result = isEdit
          ? await api.people.update((selected as Person).id, form)
          : await api.people.create(form)
        if (result.error) { setError(result.error); return }
        isEdit
          ? setPeople(prev => prev.map(p => p.id === result.id ? result : p))
          : setPeople(prev => [...prev, result])
        setSelected(result)
      } else {
        const result = isEdit
          ? await api.congregation.update((selected as Congregant).id, form)
          : await api.congregation.create(form)
        if (result.error) { setError(result.error); return }
        isEdit
          ? setCongregation(prev => prev.map(c => c.id === result.id ? result : c))
          : setCongregation(prev => [...prev, result])
        setSelected(result)
      }
      setView('detail')
    } catch {
      setError('Save failed — check connection.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Person | Congregant) {
    if (!confirm(`Remove ${item.name}?`)) return
    if (isPersonal) {
      await api.people.del((item as Person).id).catch(() => {})
      setPeople(prev => prev.filter(p => p.id !== (item as Person).id))
    } else {
      await api.congregation.del((item as Congregant).id).catch(() => {})
      setCongregation(prev => prev.filter(c => c.id !== (item as Congregant).id))
    }
    setView('list')
    setSelected(null)
  }

  // ── List view ──────────────────────────────────────────────

  if (view === 'list') return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <SectionHeader
        title={`People · ${items.length}`}
        onBack={onBack}
        action={
          <button onClick={openAdd} style={{ background: 'var(--accent)', border: 'none', borderRadius: 7, padding: '5px 11px', fontSize: 11, color: 'white', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}>
            + Add
          </button>
        }
      />

      <RegistryToggle registry={registry} onChange={setRegistry} />

      <div style={{ padding: '0 12px 10px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 12 }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${isPersonal ? 'contacts' : 'congregation'}…`}
            style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 11px 8px 28px', fontSize: 12, color: 'var(--text)', outline: 'none', fontFamily: "'DM Mono', monospace" }} />
        </div>
      </div>

      <div style={{ padding: '0 12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '24px 0' }}>
            {search ? 'No results.' : `No ${isPersonal ? 'contacts' : 'congregation members'} yet.`}
          </div>
        )}
        {filtered.map(item => {
          const sub = isPersonal
            ? [(item as Person).relationship, item.email].filter(Boolean).join(' · ')
            : [(item as Congregant).status, (item as Congregant).campus].filter(Boolean).join(' · ')
          return (
            <div key={item.id} onClick={() => openDetail(item)}
              style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>
              <Avatar name={item.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                {sub && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
              </div>
              <span style={{ color: 'var(--text3)', fontSize: 14 }}>›</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── Detail view ────────────────────────────────────────────

  if (view === 'detail' && selected) {
    const p = selected as Person
    const c = selected as Congregant
    return (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SectionHeader
          title={isPersonal ? 'Contact' : 'Member'}
          onBack={() => setView('list')}
          action={
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => openEdit(selected)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 11px', fontSize: 11, color: 'var(--text)', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}>Edit</button>
              <button onClick={() => handleDelete(selected)} style={{ background: 'transparent', border: '1px solid rgba(218,54,51,0.3)', borderRadius: 7, padding: '5px 11px', fontSize: 11, color: '#da3633', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}>Remove</button>
            </div>
          }
        />
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px', marginBottom: 12 }}>
            <Avatar name={selected.name} size={48} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{selected.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                {isPersonal ? p.relationship : [c.status, c.campus].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
            <DetailRow label="Email" value={selected.email} />
            <DetailRow label="Phone" value={selected.phone} />
            {isPersonal && <DetailRow label="Relationship" value={p.relationship} />}
            {!isPersonal && <>
              <DetailRow label="Status" value={c.status} />
              <DetailRow label="Campus" value={c.campus} />
              <DetailRow label="First seen" value={c.first_seen} />
              <DetailRow label="Last seen" value={c.last_seen} />
            </>}
          </div>

          {(selected.notes || (!isPersonal && (c.prayer_requests || c.follow_up))) && (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
              {selected.notes && (
                <div style={{ padding: '10px 13px', borderBottom: (!isPersonal && (c.prayer_requests || c.follow_up)) ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>Notes</div>
                  <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selected.notes}</div>
                </div>
              )}
              {!isPersonal && c.prayer_requests && (
                <div style={{ padding: '10px 13px', borderBottom: c.follow_up ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>Prayer requests</div>
                  <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.prayer_requests}</div>
                </div>
              )}
              {!isPersonal && c.follow_up && (
                <div style={{ padding: '10px 13px' }}>
                  <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>Follow-up</div>
                  <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.follow_up}</div>
                </div>
              )}
            </div>
          )}

          <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center', paddingTop: 4 }}>Added {selected.created_at?.slice(0, 10)}</div>
        </div>
      </div>
    )
  }

  // ── Add / Edit form ────────────────────────────────────────

  if (view === 'add' || view === 'edit') {
    const isEdit = view === 'edit'
    return (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SectionHeader title={isEdit ? 'Edit contact' : `New ${isPersonal ? 'contact' : 'member'}`} onBack={() => { setView(isEdit ? 'detail' : 'list'); setError('') }} />
        <div style={{ padding: '0 12px 24px', display: 'flex', flexDirection: 'column', gap: 2 }}>

          <Field label="Name *">
            <Input value={f('name')} onChange={v => setF('name', v)} placeholder="Full name" />
          </Field>

          {isPersonal ? (
            <Field label="Relationship">
              <Input value={f('relationship')} onChange={v => setF('relationship', v)} placeholder="e.g. author, beta reader, family" />
            </Field>
          ) : (
            <>
              <Field label="Status">
                <Select value={f('status')} onChange={v => setF('status', v)} options={['member', 'regular', 'first-time visitor', 'online']} />
              </Field>
              <Field label="Campus">
                <Select value={f('campus')} onChange={v => setF('campus', v)} options={['Wilmington', 'Online']} />
              </Field>
            </>
          )}

          <Field label="Email">
            <Input value={f('email')} onChange={v => setF('email', v)} placeholder="email@example.com" type="email" />
          </Field>
          <Field label="Phone">
            <Input value={f('phone')} onChange={v => setF('phone', v)} placeholder="555-000-0000" type="tel" />
          </Field>
          <Field label="Notes">
            <Textarea value={f('notes')} onChange={v => setF('notes', v)} placeholder="Context, background…" />
          </Field>

          {!isPersonal && (
            <>
              <Field label="Prayer requests">
                <Textarea value={f('prayer_requests')} onChange={v => setF('prayer_requests', v)} placeholder="Prayer requests…" />
              </Field>
              <Field label="Follow-up">
                <Textarea value={f('follow_up')} onChange={v => setF('follow_up', v)} placeholder="Follow-up notes…" rows={2} />
              </Field>
              <Field label="First seen">
                <Input value={f('first_seen')} onChange={v => setF('first_seen', v)} type="date" />
              </Field>
              <Field label="Last seen">
                <Input value={f('last_seen')} onChange={v => setF('last_seen', v)} type="date" />
              </Field>
            </>
          )}

          {error && <div style={{ fontSize: 11, color: '#da3633', padding: '4px 2px' }}>{error}</div>}

          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button onClick={() => { setView(isEdit ? 'detail' : 'list'); setError('') }}
              style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 9, padding: '11px', fontSize: 12, color: 'var(--text)', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 2, background: saving ? 'var(--bg3)' : 'var(--accent)', border: 'none', borderRadius: 9, padding: '11px', fontSize: 12, color: saving ? 'var(--text3)' : 'white', cursor: saving ? 'default' : 'pointer', fontFamily: "'DM Mono', monospace" }}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : `Add ${isPersonal ? 'contact' : 'member'}`}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
