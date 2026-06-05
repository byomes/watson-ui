import { NextRequest, NextResponse } from 'next/server'

const BASE = process.env.WATSON_API_URL || ''

async function proxy(req: NextRequest, pathParts: string[], method: string) {
  if (!BASE) return NextResponse.json({ error: 'WATSON_API_URL not configured' }, { status: 503 })
  const path = pathParts.join('/')
  const url = new URL(req.url)
  const target = `${BASE}/${path}${url.search}`
  try {
    const options: RequestInit = { method }
    if (['POST', 'PATCH', 'PUT'].includes(method)) {
      const body = await req.text()
      options.body = body
      options.headers = { 'Content-Type': 'application/json' }
    }
    const res = await fetch(target, options)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Watson offline' }, { status: 503 })
  }
}

type Ctx = { params: Promise<{ path: string[] }> }

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return proxy(req, path, 'GET')
}
export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return proxy(req, path, 'POST')
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return proxy(req, path, 'PATCH')
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return proxy(req, path, 'PUT')
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return proxy(req, path, 'DELETE')
}
