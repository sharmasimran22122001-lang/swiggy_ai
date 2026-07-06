import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import path from 'path'
import fs from 'fs'

const DATA_DIR = path.join(process.cwd(), 'src', 'data')

function loadJSON(name: string) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8'))
}

async function seedRestaurants() {
  const restaurants: any[] = loadJSON('restaurants_with_menus.json')
  const BATCH = 100

  let inserted = 0
  for (let i = 0; i < restaurants.length; i += BATCH) {
    const batch = restaurants.slice(i, i + BATCH)

    const restRows = batch.map((r: any) => ({
      id: r.id,
      name: r.name,
      area: r.area,
      city: r.city,
      price_for_two: r.price_for_two,
      avg_rating: r.avg_rating,
      total_ratings: r.total_ratings,
      delivery_time_min: r.delivery_time_min,
    }))
    const { error: rErr } = await supabaseAdmin
      .from('restaurants')
      .upsert(restRows, { onConflict: 'id' })
    if (rErr) throw new Error(`restaurants batch ${i}: ${rErr.message}`)

    const cuisineRows = batch.flatMap((r: any) =>
      (r.cuisines || []).map((c: string) => ({ restaurant_id: r.id, cuisine: c }))
    )
    if (cuisineRows.length) {
      const { error: cErr } = await supabaseAdmin
        .from('restaurant_cuisines')
        .upsert(cuisineRows, { onConflict: 'restaurant_id,cuisine' })
      if (cErr) throw new Error(`cuisines batch ${i}: ${cErr.message}`)
    }

    const menuRows = batch.flatMap((r: any) =>
      (r.menu || []).map((d: any) => ({
        restaurant_id: r.id,
        dish: d.dish,
        veg: d.veg,
        price: d.price,
      }))
    )
    if (menuRows.length) {
      const { error: mErr } = await supabaseAdmin
        .from('menu_items')
        .insert(menuRows)
      if (mErr && !mErr.message.includes('duplicate')) {
        throw new Error(`menu batch ${i}: ${mErr.message}`)
      }
    }

    inserted += batch.length
  }
  return inserted
}

async function seedUsers() {
  const usersMap: Record<string, any> = loadJSON('synthetic_users.json')
  const userIds = Object.keys(usersMap)
  const userRows = Object.entries(usersMap).map(([id, u]: [string, any]) => ({
    id,
    name: u.name,
    city: u.city,
    area: u.area,
    declared_diet: u.declared_diet || 'none',
  }))
  const { error: uErr } = await supabaseAdmin
    .from('users')
    .upsert(userRows, { onConflict: 'id' })
  if (uErr) throw new Error(`users: ${uErr.message}`)

  // Delete-then-insert so reseeding never duplicates orders
  const { error: dErr } = await supabaseAdmin.from('orders').delete().in('user_id', userIds)
  if (dErr) throw new Error(`orders delete: ${dErr.message}`)

  const orderRows = Object.entries(usersMap).flatMap(([id, u]: [string, any]) =>
    u.orders.map((o: any) => ({
      user_id: id,
      restaurant_id: o.restaurant_id,
      restaurant_name: o.restaurant,
      dish: o.dish,
      veg: o.veg,
      price: o.price,
      cuisine: o.cuisine,
      days_ago: o.days_ago,
    }))
  )
  const { error: oErr } = await supabaseAdmin.from('orders').insert(orderRows)
  if (oErr) throw new Error(`orders insert: ${oErr.message}`)

  // Flush stale cached homepages built from the corrupted order history
  await supabaseAdmin.from('homepage_cache').delete().in('user_id', userIds)

  return userRows.length
}

export async function POST(req: NextRequest) {
  // Simple auth guard — only allow with the service key header
  const authHeader = req.headers.get('x-seed-secret')
  if (authHeader !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // ?only=users skips restaurant seeding (safe to re-run for order-history repairs)
    const onlyUsers = req.nextUrl.searchParams.get('only') === 'users'
    if (onlyUsers) {
      const userCount = await seedUsers()
      return NextResponse.json({ ok: true, users_seeded: userCount })
    }

    const [restaurantCount, userCount] = await Promise.all([
      seedRestaurants(),
      seedUsers(),
    ])
    return NextResponse.json({
      ok: true,
      restaurants_seeded: restaurantCount,
      users_seeded: userCount,
    })
  } catch (err: any) {
    console.error('[seed]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
