import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Lightweight visit logging: which persona entered the prototype, and visits
// to the case study (which beacons here from GitHub Pages).
// Anonymous by design — no names/emails, just event, persona, referrer, device.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    // sendBeacon posts text/plain — parse manually so no preflight is needed
    const raw = await req.text()
    let body: Record<string, unknown> = {}
    try { body = JSON.parse(raw) } catch { /* ignore malformed */ }

    const source = String(body.source ?? 'unknown').slice(0, 40)
    const event = String(body.event ?? 'visit').slice(0, 40)
    const persona = body.persona ? String(body.persona).slice(0, 40) : null
    const path = body.path ? String(body.path).slice(0, 200) : null
    const referrer = body.referrer ? String(body.referrer).slice(0, 300) : null
    const ua = (req.headers.get('user-agent') ?? '').slice(0, 300)

    await supabaseAdmin.from('visit_logs').insert({ source, event, persona, path, referrer, ua })
    return new NextResponse(null, { status: 204, headers: CORS })
  } catch {
    // Logging must never break the product
    return new NextResponse(null, { status: 204, headers: CORS })
  }
}
