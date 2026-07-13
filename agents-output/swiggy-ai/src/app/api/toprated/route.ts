import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/toprated?city=<city>
// Real top-rated restaurants from the DB — used to top up the homepage's
// Top Rated row to 8 items when the AI page doesn't contain enough unique
// restaurants (the row must never repeat the hero's restaurants).
export async function GET(req: NextRequest) {
  const city = (req.nextUrl.searchParams.get('city') ?? '').trim()
  if (!city) return NextResponse.json({ restaurants: [] })

  try {
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select('name, avg_rating, delivery_time_min')
      .eq('city', city)
      .gte('avg_rating', 4.0) // upfront quality gate
      .order('avg_rating', { ascending: false })
      .limit(24)
    if (error) throw new Error(error.message)

    return NextResponse.json({ restaurants: data ?? [] })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'failed' }, { status: 500 })
  }
}
