import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BASE = (process.env.WATSON_API_URL ?? '').replace(/\/$/, '')

async function authed() {
  const c = (await cookies()).get('watson_session')
  return c?.value === 'authenticated'
}

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Ctx) {
  if (!await authed()) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  if (!BASE) return NextResponse.json({ error: 'WATSON_API_URL not configured' }, { status: 503 })
  const { id } = await params
  try {
    const res = await fetch(`${BASE}/congregation/${id}`)
    return NextResponse.json(await res.json(), { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Watson unreachable' }, { status: 502 })
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await authed()) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  if (!BASE) return NextResponse.json({ error: 'WATSON_API_URL not configured' }, { status: 503 })
  const { id } = await params
  try {
    const res = await fetch(`${BASE}/congregation/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(await req.json()),
    })
    return NextResponse.json(await res.json(), { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Watson unreachable' }, { status: 502 })
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  if (!await authed()) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  if (!BASE) return NextResponse.json({ error: 'WATSON_API_URL not configured' }, { status: 503 })
  const { id } = await params
  try {
    const res = await fetch(`${BASE}/congregation/${id}`, { method: 'DELETE' })
    return NextResponse.json(await res.json(), { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Watson unreachable' }, { status: 502 })
  }
}
