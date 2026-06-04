import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Auth check
  const session = req.cookies.get('watson_session')
  if (!session || session.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { messages } = await req.json()

  const res = await fetch('http://192.168.1.153:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'phi3:mini',
      messages,
      stream: false,
    }),
  })
  const data = await res.json()
  const reply = data.message?.content || 'No response.'
  return NextResponse.json({ reply })
}
