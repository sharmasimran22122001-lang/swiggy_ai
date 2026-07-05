import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { fetchTrendingFoods } from '@/lib/trend-agent'
import { matchTrendingToMenus } from '@/lib/availability'

const CACHE_HOURS = 24

// Trending is fetched India-wide and cached under the key "India".
// City is only used for the local availability match step.
const INDIA_CACHE_KEY = 'India'

// Minimum number of distinct trending items that must be confirmed available
// nearby before we show the section at all.
const MIN_AVAILABLE_TRENDS = 4

async function getCachedTrending() {
  const since = new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000).toISOString()
  const { data } = await supabaseAdmin
    .from('trending_foods')
    .select('item_name, cuisine, why_trending, search_signal')
    .eq('city', INDIA_CACHE_KEY)
    .gte('fetched_at', since)
    .order('fetched_at', { ascending: false })
    .limit(10)
  return data ?? []
}

// GET /api/trending/available?city=Mumbai
export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city') ?? 'Bangalore'

  try {
    // Step 1: Get India-wide trending items (cache-first, Gemini on miss)
    let cached = await getCachedTrending()

    let trendingItems = cached.map((r: any) => ({
      name: r.item_name,
      cuisine: r.cuisine ?? '',
      why_trending: r.why_trending ?? '',
      search_signal: r.search_signal ?? 'medium',
    }))

    if (trendingItems.length < 5) {
      // Fetch India-wide trends from Gemini and cache them
      trendingItems = await fetchTrendingFoods()
      await supabaseAdmin.from('trending_foods').insert(
        trendingItems.map(t => ({
          city: INDIA_CACHE_KEY,
          item_name: t.name,
          cuisine: t.cuisine,
          why_trending: t.why_trending,
          search_signal: t.search_signal,
        }))
      )
    }

    // Step 2: Match India-wide trending items against restaurants in the user's city.
    const available = await matchTrendingToMenus(trendingItems, city)

    // Step 3: Count how many DISTINCT trending items have a confirmed match.
    const uniqueMatchedTrends = new Set(available.map(m => m.trending_name)).size

    // Step 4: Threshold rule — hide the section if fewer than 4 trending items
    // are confirmed available near the user.
    if (uniqueMatchedTrends < MIN_AVAILABLE_TRENDS) {
      return NextResponse.json({
        city,
        show: false,
        reason: 'below_threshold',
        total_trending: trendingItems.length,
        confirmed_available: uniqueMatchedTrends,
        required: MIN_AVAILABLE_TRENDS,
        items: [],
      })
    }

    return NextResponse.json({
      city,
      show: true,
      total_trending: trendingItems.length,
      confirmed_available: uniqueMatchedTrends,
      items: available,
    })
  } catch (err: any) {
    console.error('[trending/available]', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
