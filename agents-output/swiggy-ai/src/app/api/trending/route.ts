import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { fetchTrendingFoods } from '@/lib/trend-agent'

const CACHE_HOURS = 24

// Admin/cron only — the app itself uses /api/trending/available.
// Left open this route would let anyone trigger paid Gemini search calls.
function unauthorized(req: NextRequest) {
  return req.headers.get('x-seed-secret') !== process.env.SUPABASE_SERVICE_ROLE_KEY
}

export async function GET(req: NextRequest) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const city = req.nextUrl.searchParams.get('city') ?? 'Bangalore'

  // Return cached results if < 24 hours old
  const since = new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000).toISOString()
  const { data: cached } = await supabaseAdmin
    .from('trending_foods')
    .select('item_name, cuisine, why_trending, search_signal, fetched_at')
    .eq('city', city)
    .gte('fetched_at', since)
    .order('fetched_at', { ascending: false })
    .limit(10)

  if (cached && cached.length >= 5) {
    return NextResponse.json({ trending: cached, source: 'cache' })
  }

  // Cache miss — fetch fresh from Gemini + Google Search
  try {
    const trending = await fetchTrendingFoods()

    await supabaseAdmin.from('trending_foods').insert(
      trending.map(t => ({
        city: 'India',
        item_name: t.name,
        cuisine: t.cuisine,
        why_trending: t.why_trending,
        search_signal: t.search_signal,
      }))
    )

    return NextResponse.json({ trending, source: 'fresh' })
  } catch (err: any) {
    console.error('[trending]', err)
    return NextResponse.json({ error: err.message ?? 'Failed to fetch trends' }, { status: 500 })
  }
}

// POST — force refresh (daily cron or admin trigger)
export async function POST(req: NextRequest) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const trending = await fetchTrendingFoods()

    await supabaseAdmin.from('trending_foods').insert(
      trending.map(t => ({
        city: 'India',
        item_name: t.name,
        cuisine: t.cuisine,
        why_trending: t.why_trending,
        search_signal: t.search_signal,
      }))
    )

    return NextResponse.json({ ok: true, count: trending.length, source: 'fresh' })
  } catch (err: any) {
    console.error('[trending POST]', err)
    return NextResponse.json({ error: err.message ?? 'Failed to refresh trends' }, { status: 500 })
  }
}
