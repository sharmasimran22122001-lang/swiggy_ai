import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// ─── Dish pool by cuisine category ───────────────────────────────────────────
// Each restaurant gets 6 dishes picked from its matched category.
// These are real dish names so they match Gemini trending suggestions.

const MENUS: Record<string, { dish: string; veg: boolean; price: number }[]> = {
  northIndian: [
    { dish: 'Butter Chicken', veg: false, price: 280 },
    { dish: 'Dal Makhani', veg: true, price: 210 },
    { dish: 'Paneer Butter Masala', veg: true, price: 260 },
    { dish: 'Chole Bhature', veg: true, price: 160 },
    { dish: 'Shahi Paneer', veg: true, price: 270 },
    { dish: 'Chicken Tikka', veg: false, price: 320 },
    { dish: 'Mutton Rogan Josh', veg: false, price: 380 },
    { dish: 'Rajma Chawal', veg: true, price: 180 },
    { dish: 'Palak Paneer', veg: true, price: 230 },
    { dish: 'Tandoori Chicken', veg: false, price: 340 },
    { dish: 'Seekh Kebab', veg: false, price: 290 },
    { dish: 'Paneer Tikka', veg: true, price: 270 },
  ],
  biryani: [
    { dish: 'Chicken Biryani', veg: false, price: 250 },
    { dish: 'Mutton Biryani', veg: false, price: 340 },
    { dish: 'Veg Biryani', veg: true, price: 190 },
    { dish: 'Paneer Biryani', veg: true, price: 220 },
    { dish: 'Egg Biryani', veg: false, price: 200 },
    { dish: 'Prawn Biryani', veg: false, price: 380 },
    { dish: 'Hyderabadi Dum Biryani', veg: false, price: 290 },
    { dish: 'Chicken 65 Biryani', veg: false, price: 270 },
    { dish: 'Raita', veg: true, price: 60 },
    { dish: 'Salan', veg: true, price: 80 },
  ],
  southIndian: [
    { dish: 'Masala Dosa', veg: true, price: 130 },
    { dish: 'Idli Sambar', veg: true, price: 90 },
    { dish: 'Vada Sambar', veg: true, price: 100 },
    { dish: 'Medu Vada', veg: true, price: 110 },
    { dish: 'Mysore Masala Dosa', veg: true, price: 150 },
    { dish: 'Uttapam', veg: true, price: 120 },
    { dish: 'Pongal', veg: true, price: 100 },
    { dish: 'Curd Rice', veg: true, price: 110 },
    { dish: 'Filter Coffee', veg: true, price: 60 },
    { dish: 'Rava Dosa', veg: true, price: 140 },
    { dish: 'Fish Curry', veg: false, price: 240 },
    { dish: 'Chicken Chettinad', veg: false, price: 300 },
  ],
  chinese: [
    { dish: 'Chicken Manchurian', veg: false, price: 210 },
    { dish: 'Veg Hakka Noodles', veg: true, price: 160 },
    { dish: 'Chicken Fried Rice', veg: false, price: 180 },
    { dish: 'Veg Fried Rice', veg: true, price: 150 },
    { dish: 'Schezwan Noodles', veg: true, price: 170 },
    { dish: 'Chilli Chicken', veg: false, price: 230 },
    { dish: 'Chilli Paneer', veg: true, price: 210 },
    { dish: 'Spring Rolls', veg: true, price: 140 },
    { dish: 'Hot & Sour Soup', veg: true, price: 130 },
    { dish: 'Veg Manchurian', veg: true, price: 180 },
  ],
  pizza: [
    { dish: 'Margherita Pizza', veg: true, price: 220 },
    { dish: 'Farmhouse Pizza', veg: true, price: 280 },
    { dish: 'Chicken Pizza', veg: false, price: 320 },
    { dish: 'Veggie Supreme', veg: true, price: 260 },
    { dish: 'Garlic Bread', veg: true, price: 110 },
    { dish: 'Peri Peri Fries', veg: true, price: 140 },
    { dish: 'Caesar Salad', veg: true, price: 190 },
    { dish: 'Pasta Alfredo', veg: true, price: 220 },
    { dish: 'Penne Arrabiata', veg: true, price: 210 },
    { dish: 'Bruschetta', veg: true, price: 160 },
  ],
  burgerFast: [
    { dish: 'Chicken Burger', veg: false, price: 180 },
    { dish: 'Veg Burger', veg: true, price: 150 },
    { dish: 'French Fries', veg: true, price: 100 },
    { dish: 'Chicken Nuggets', veg: false, price: 190 },
    { dish: 'Chicken Wrap', veg: false, price: 200 },
    { dish: 'Veg Wrap', veg: true, price: 170 },
    { dish: 'Cheese Sandwich', veg: true, price: 130 },
    { dish: 'Veg Sandwich', veg: true, price: 120 },
    { dish: 'Grilled Chicken', veg: false, price: 250 },
    { dish: 'Chicken Steak', veg: false, price: 310 },
  ],
  seafood: [
    { dish: 'Fish & Chips', veg: false, price: 280 },
    { dish: 'Prawn Masala', veg: false, price: 380 },
    { dish: 'Fish Tikka', veg: false, price: 320 },
    { dish: 'Grilled Fish', veg: false, price: 350 },
    { dish: 'Crab Masala', veg: false, price: 480 },
    { dish: 'Butter Garlic Prawns', veg: false, price: 420 },
    { dish: 'Fish Fry', veg: false, price: 260 },
    { dish: 'Squid Fry', veg: false, price: 310 },
    { dish: 'Fish Thali', veg: false, price: 230 },
    { dish: 'Prawn Biryani', veg: false, price: 380 },
  ],
  dessertCafe: [
    { dish: 'Gulab Jamun', veg: true, price: 90 },
    { dish: 'Rasmalai', veg: true, price: 120 },
    { dish: 'Kulfi', veg: true, price: 100 },
    { dish: 'Falooda', veg: true, price: 150 },
    { dish: 'Ice Cream Sundae', veg: true, price: 160 },
    { dish: 'Waffle', veg: true, price: 200 },
    { dish: 'Choco Lava Cake', veg: true, price: 180 },
    { dish: 'Tiramisu', veg: true, price: 220 },
    { dish: 'Cheesecake', veg: true, price: 210 },
    { dish: 'Chocolate Brownie', veg: true, price: 170 },
    { dish: 'Cold Coffee', veg: true, price: 130 },
    { dish: 'Hot Chocolate', veg: true, price: 120 },
    { dish: 'Mango Shake', veg: true, price: 140 },
    { dish: 'Oreo Shake', veg: true, price: 150 },
  ],
  streetFood: [
    { dish: 'Chole Bhature', veg: true, price: 150 },
    { dish: 'Pav Bhaji', veg: true, price: 130 },
    { dish: 'Vada Pav', veg: true, price: 60 },
    { dish: 'Dahi Puri', veg: true, price: 90 },
    { dish: 'Pani Puri', veg: true, price: 70 },
    { dish: 'Bhel Puri', veg: true, price: 80 },
    { dish: 'Egg Roll', veg: false, price: 100 },
    { dish: 'Veg Roll', veg: true, price: 90 },
    { dish: 'Kathi Roll', veg: false, price: 120 },
    { dish: 'Samosa', veg: true, price: 40 },
  ],
  thali: [
    { dish: 'Veg Thali', veg: true, price: 180 },
    { dish: 'Fish Thali', veg: false, price: 260 },
    { dish: 'Chicken Thali', veg: false, price: 240 },
    { dish: 'Dal Tadka', veg: true, price: 160 },
    { dish: 'Jeera Rice', veg: true, price: 130 },
    { dish: 'Butter Naan', veg: true, price: 50 },
    { dish: 'Tandoori Roti', veg: true, price: 40 },
    { dish: 'Mixed Veg', veg: true, price: 190 },
    { dish: 'Raita', veg: true, price: 60 },
    { dish: 'Masala Chai', veg: true, price: 50 },
    { dish: 'Lassi', veg: true, price: 90 },
    { dish: 'Fresh Lime Soda', veg: true, price: 70 },
  ],
}

// ─── Pick cuisine category from restaurant name keywords ─────────────────────

function pickCategory(name: string): string {
  const n = name.toLowerCase()
  if (/biryani|dum|hyderabadi|paradise/i.test(n)) return 'biryani'
  if (/south|dosa|idli|udupi|chettinad|kerala|madurai|sagar|mysore|shree|sree|ananda/i.test(n)) return 'southIndian'
  if (/pizza|italian|pasta|slice|peri/i.test(n)) return 'pizza'
  if (/burger|roll|wrap|kfc|mcdonald|fast|quick|grill|steak/i.test(n)) return 'burgerFast'
  if (/fish|prawn|crab|sea|coastal|goa|mangalore|konkan|bengal|kollam/i.test(n)) return 'seafood'
  if (/cake|dessert|ice|sweets|bake|waffle|chocolate|shake|cafe|coffee|brew|tea/i.test(n)) return 'dessertCafe'
  if (/chinese|dragon|wok|manchurian|schezwan|hong|beijing|noodle/i.test(n)) return 'chinese'
  if (/street|chaat|puri|bhel|vada|pav|bhature/i.test(n)) return 'streetFood'
  if (/thali|punjab|dhaba|sardar|langar|highway|indian|muglai|mughal|nawab/i.test(n)) return 'thali'
  // Default: north Indian covers the broadest set
  return 'northIndian'
}

// GET /api/seed-menus — one-time seeding, requires the x-seed-secret header
export async function GET(req: NextRequest) {
  if (req.headers.get('x-seed-secret') !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    // 1. Get all restaurants
    const { data: restaurants, error: rErr } = await supabaseAdmin
      .from('restaurants')
      .select('id, name')
      .order('id')

    if (rErr || !restaurants) throw new Error(rErr?.message ?? 'Failed to fetch restaurants')

    // 2. Get already-seeded restaurant IDs
    const { data: existing } = await supabaseAdmin
      .from('menu_items')
      .select('restaurant_id')

    const seededIds = new Set((existing ?? []).map((r: any) => r.restaurant_id))

    // 3. Build menu items for unseeded restaurants
    const toInsert: { restaurant_id: number; dish: string; veg: boolean; price: number }[] = []

    for (const r of restaurants) {
      if (seededIds.has(r.id)) continue

      const category = pickCategory(r.name)
      const pool = MENUS[category]

      // Pick 6 dishes — spread across the pool deterministically
      const step = Math.floor(pool.length / 6)
      const offset = r.id % (step || 1)
      const dishes = Array.from({ length: 6 }, (_, i) => pool[(offset + i * (step || 1)) % pool.length])

      for (const d of dishes) {
        toInsert.push({ restaurant_id: r.id, dish: d.dish, veg: d.veg, price: d.price })
      }
    }

    if (toInsert.length === 0) {
      return NextResponse.json({ message: 'All restaurants already seeded', total: 0 })
    }

    // 4. Insert in batches of 200
    const BATCH = 200
    let inserted = 0
    for (let i = 0; i < toInsert.length; i += BATCH) {
      const batch = toInsert.slice(i, i + BATCH)
      const { error } = await supabaseAdmin.from('menu_items').insert(batch)
      if (error) throw new Error(`Batch ${i / BATCH + 1} failed: ${error.message}`)
      inserted += batch.length
    }

    return NextResponse.json({
      message: 'Seeding complete',
      restaurants_seeded: toInsert.length / 6,
      menu_items_inserted: inserted,
    })
  } catch (err: any) {
    console.error('[seed-menus]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
