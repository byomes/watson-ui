import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = req.cookies.get('watson_session')
  if (session?.value === 'authenticated') {
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
}
