import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BASE = (process.env.WATSON_API_URL ?? '').replace(/\/$/, '')

async function authed() {
  const c = (await cookies()).get('watson_session')
  return c?.value === 'authenticated'
}

export async function GET() {
  if (!await authed()) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  if (!BASE) return NextResponse.json({ error: 'WATSON_API_URL not configured' }, { status: 503 })
  try {
    const res = await fetch(`${BASE}/congregation`)
    return NextResponse.json(await res.json(), { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Watson unreachable' }, { status: 502 })
  }
}

export async function POST(req: NextRequest) {
  if (!await authed()) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  if (!BASE) return NextResponse.json({ error: 'WATSON_API_URL not configured' }, { status: 503 })
  try {
    const res = await fetch(`${BASE}/congregation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(await req.json()),
    })
    return NextResponse.json(await res.json(), { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Watson unreachable' }, { status: 502 })
  }
}
