import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Auth check
  const session = req.cookies.get('watson_session')
  if (!session || session.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { messages } = await req.json()

  // When Beelink Watson API is live, swap this URL for:
  // const watsonUrl = process.env.WATSON_API_URL + '/chat'
  // For now, proxy to Anthropic directly
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are Watson, Dr. Bill Yomes' AI-powered digital assistant. 
Terse, efficient, direct. You handle research, scheduling, content, and logistics on his behalf. 
Never pastor or speak theologically without permission. 
Never guess — ask for clarity. Keep responses concise.`,
      messages,
    }),
  })

  const data = await res.json()
  const reply = data.content?.[0]?.text || 'No response.'
  return NextResponse.json({ reply })
}
