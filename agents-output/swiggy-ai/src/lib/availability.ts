import { supabaseAdmin } from './supabase'
import type { TrendingItem, TrendMatch } from '@/types'

function sanitize(term: string) {
  // strip SQL wildcard chars so ILIKE can't be accidentally broken
  return term.replace(/[%_\\]/g, '')
}

export async function matchTrendingToMenus(
  trendingItems: TrendingItem[],
  city: string
): Promise<TrendMatch[]> {
  if (trendingItems.length === 0) return []

  // Single query: restaurants in city, joined with menu_items that match any trending term
  const orFilter = trendingItems
    .map(t => `dish.ilike.%${sanitize(t.name)}%`)
    .join(',')

  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .select('id, name, area, avg_rating, delivery_time_min, menu_items!inner(dish, veg, price)')
    .eq('city', city)
    .or(orFilter, { referencedTable: 'menu_items' })
    .order('avg_rating', { ascending: false })
    .limit(60)

  if (error || !data) {
    console.error('[availability]', error)
    return []
  }

  // Map each matched dish back to its trending item
  const results: TrendMatch[] = []
  const seen = new Set<string>()

  for (const restaurant of data as any[]) {
    for (const menuItem of restaurant.menu_items ?? []) {
      const key = `${menuItem.dish}::${restaurant.name}`
      if (seen.has(key)) continue
      seen.add(key)

      const trend = trendingItems.find(t =>
        menuItem.dish.toLowerCase().includes(sanitize(t.name).toLowerCase())
      )
      if (!trend) continue

      results.push({
        trending_name: trend.name,
        cuisine: trend.cuisine,
        why_trending: trend.why_trending,
        search_signal: trend.search_signal,
        dish: menuItem.dish,
        veg: menuItem.veg,
        price: menuItem.price,
        restaurant: restaurant.name,
        area: restaurant.area,
        rating: restaurant.avg_rating,
        delivery_min: restaurant.delivery_time_min,
      })
    }
  }

  // Keep top 3 matches per trending item, sorted by restaurant rating
  const grouped = new Map<string, TrendMatch[]>()
  for (const m of results) {
    const arr = grouped.get(m.trending_name) ?? []
    arr.push(m)
    grouped.set(m.trending_name, arr)
  }

  const final: TrendMatch[] = []
  for (const matches of grouped.values()) {
    matches.sort((a, b) => b.rating - a.rating)
    final.push(...matches.slice(0, 3))
  }

  return final
}
