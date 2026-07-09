import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/search?q=<text>&city=<city>
// Searches restaurant names AND menu dishes in the given city.
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim()
  const city = (req.nextUrl.searchParams.get('city') ?? '').trim()

  if (q.length < 2) return NextResponse.json({ results: [] })

  try {
    // 1) Restaurants whose name matches
    let nameQuery = supabaseAdmin
      .from('restaurants')
      .select('id, name, area, city, avg_rating, delivery_time_min, restaurant_cuisines(cuisine)')
      .ilike('name', `%${q}%`)
      .order('avg_rating', { ascending: false })
      .limit(10)
    if (city) nameQuery = nameQuery.eq('city', city)
    const { data: byName, error: nameErr } = await nameQuery
    if (nameErr) throw new Error(nameErr.message)

    // 2) Restaurants serving a matching dish
    let dishQuery = supabaseAdmin
      .from('menu_items')
      .select('dish, price, veg, restaurants!inner(id, name, area, city, avg_rating, delivery_time_min, restaurant_cuisines(cuisine))')
      .ilike('dish', `%${q}%`)
      .limit(15)
    if (city) dishQuery = dishQuery.eq('restaurants.city', city)
    const { data: byDish, error: dishErr } = await dishQuery
    if (dishErr) throw new Error(dishErr.message)

    // Merge + dedupe by restaurant name; keep the matched dish for context
    const seen = new Map<string, any>()
    for (const r of byName ?? []) {
      seen.set(r.name, {
        name: r.name,
        area: r.area,
        city: r.city,
        rating: r.avg_rating,
        delivery_min: r.delivery_time_min,
        cuisines: (r.restaurant_cuisines ?? []).map((c: any) => c.cuisine).slice(0, 2),
        matched_dish: null,
      })
    }
    for (const row of (byDish ?? []) as any[]) {
      const r = row.restaurants
      if (!r) continue
      if (!seen.has(r.name)) {
        seen.set(r.name, {
          name: r.name,
          area: r.area,
          city: r.city,
          rating: r.avg_rating,
          delivery_min: r.delivery_time_min,
          cuisines: (r.restaurant_cuisines ?? []).map((c: any) => c.cuisine).slice(0, 2),
          matched_dish: row.dish,
        })
      } else if (!seen.get(r.name).matched_dish) {
        seen.get(r.name).matched_dish = row.dish
      }
    }

    const results = [...seen.values()]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 15)

    return NextResponse.json({ results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
