import { supabaseAdmin } from './supabase'
import { scoreUser, getTimeSlot, pickMood } from './scoring'
import { retrieve } from './retrieval'
import { buildPrompt, callGemini } from './gemini'
import type { User, Restaurant, HomepageJSON, UserProfile, HomepageItem } from '@/types'

// ─── DB loaders ───────────────────────────────────────────────────────────────

async function loadRestaurantsFromDB(city: string): Promise<Restaurant[]> {
  const { data: rows, error } = await supabaseAdmin
    .from('restaurants')
    .select(`
      id, name, area, city, price_for_two, avg_rating, total_ratings, delivery_time_min,
      restaurant_cuisines(cuisine),
      menu_items(dish, veg, price)
    `)
    .eq('city', city)

  if (error) throw new Error(`DB load error: ${error.message}`)

  return (rows || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    area: r.area,
    city: r.city,
    price_for_two: r.price_for_two,
    avg_rating: r.avg_rating,
    total_ratings: r.total_ratings,
    delivery_time_min: r.delivery_time_min,
    cuisines: (r.restaurant_cuisines || []).map((c: any) => c.cuisine),
    menu: (r.menu_items || []).map((m: any) => ({
      dish: m.dish,
      veg: m.veg,
      price: m.price,
    })),
  }))
}

async function loadUserFromDB(userId: string): Promise<User> {
  const { data: userRow, error: uErr } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (uErr) throw new Error(`User not found: ${userId}`)

  const { data: orderRows, error: oErr } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('user_id', userId)
  if (oErr) throw new Error(`Orders load error: ${oErr.message}`)

  return {
    user_id: userId,
    name: userRow.name,
    city: userRow.city,
    area: userRow.area,
    declared_diet: userRow.declared_diet,
    orders: (orderRows || []).map((o: any) => ({
      restaurant_id: o.restaurant_id,
      restaurant: o.restaurant_name,
      area: userRow.area,
      city: userRow.city,
      dish: o.dish,
      veg: o.veg,
      price: o.price,
      cuisine: o.cuisine,
      days_ago: o.days_ago,
    })),
  }
}

// ─── Cache ────────────────────────────────────────────────────────────────────

async function getCachedHomepage(userId: string, slot: string): Promise<HomepageJSON | null> {
  const { data } = await supabaseAdmin
    .from('homepage_cache')
    .select('homepage_json, generated_at')
    .eq('user_id', userId)
    .eq('slot', slot)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  if (!data) return null

  const age = Date.now() - new Date(data.generated_at).getTime()
  if (age > 30 * 60 * 1000) return null // 30-minute TTL

  return data.homepage_json as HomepageJSON
}

async function cacheHomepage(userId: string, slot: string, homepage: HomepageJSON) {
  // Silently ignore cache write failures — not critical
  try {
    await supabaseAdmin.from('homepage_cache').insert({ user_id: userId, slot, homepage_json: homepage })
  } catch { /* non-fatal */ }
}

// Stale-on-error: the user's most recent AI homepage regardless of age.
// Used when every Gemini model is exhausted — an old real page beats a generic one.
async function getStaleHomepage(userId: string, slot: string): Promise<HomepageJSON | null> {
  const { data: sameSlot } = await supabaseAdmin
    .from('homepage_cache')
    .select('homepage_json')
    .eq('user_id', userId)
    .eq('slot', slot)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (sameSlot) return sameSlot.homepage_json as HomepageJSON

  // Nothing for this meal slot — any previous slot's page still beats the generic one
  const { data: anySlot } = await supabaseAdmin
    .from('homepage_cache')
    .select('homepage_json')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (anySlot?.homepage_json as HomepageJSON) ?? null
}

// ─── Static fallback homepage ─────────────────────────────────────────────────
// Returned when ALL Gemini models are unavailable.
// Built from real restaurant data in DB so it always shows real places.

function buildFallback(profile: UserProfile, restaurants: Restaurant[]): HomepageJSON {
  const sorted = [...restaurants].sort((a, b) => b.avg_rating - a.avg_rating)
  const top = sorted.slice(0, 8)

  function toItem(r: Restaurant, reason: string): HomepageItem {
    return {
      name: r.name,
      restaurant: r.name,
      reason,
      veg: r.menu.some(m => m.veg),
      rating: r.avg_rating,
      delivery_min: r.delivery_time_min,
    }
  }

  const heroRestaurant = profile.favourite_restaurant
    ? (top.find(r => r.name === profile.favourite_restaurant) ?? top[0])
    : top[0]

  return {
    hero: {
      title: heroRestaurant ? `Order again from ${heroRestaurant.name}` : 'Top picks near you',
      items: top.slice(0, 5).map(r => toItem(r, 'Highly rated near you')),
    },
    slot_top_rated: {
      title: 'Top rated restaurants',
      items: top.slice(0, 6).map(r => toItem(r, `★ ${r.avg_rating} · ${r.delivery_time_min} min`)),
    },
    discovery: {
      title: 'Discover something new',
      items: top.slice(2, 6).map(r => toItem(r, 'Popular in your area')),
    },
    mood_banner: {
      mood: 'comforting',
      theme: 'Great food, always',
      title: 'Your favourite meals, delivered fast',
      items: top.slice(0, 3).map(r => toItem(r, 'Trending now')),
    },
    whats_on_your_mind: ['Biryani', 'Pizza', 'North Indian', 'Chinese', 'South Indian', 'Burgers'],
    budget_99_store: null,
  }
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export async function runPipeline(userId: string): Promise<{
  homepage: HomepageJSON
  profile: ReturnType<typeof scoreUser>
  slot: ReturnType<typeof getTimeSlot>
  fromCache: boolean
}> {
  const user = await loadUserFromDB(userId)
  const profile = scoreUser(user)
  const slot = getTimeSlot()
  const mood = pickMood(slot)

  // ① Serve from cache if fresh
  const cached = await getCachedHomepage(userId, slot.part)
  if (cached) {
    return { homepage: cached, profile, slot, fromCache: true }
  }

  // ② Load restaurants
  const allRestaurants = await loadRestaurantsFromDB(profile.city)

  // ③ RAG: top 15 candidates
  const candidates = retrieve(allRestaurants, profile, slot, 15)

  // ④ Try Gemini — fall back to static homepage if all models fail
  let homepage: HomepageJSON
  let fromCache = false

  try {
    const prompt = buildPrompt(profile, slot, mood, candidates)
    homepage = await callGemini(prompt)
  } catch (geminiErr) {
    console.error('[pipeline] Gemini unavailable:', geminiErr)

    // ① Stale-on-error: serve this user's last real AI homepage, however old.
    //    Looks identical to a fresh page — ideal when free-tier quota is exhausted.
    const stale = await getStaleHomepage(userId, slot.part)
    if (stale) {
      console.warn('[pipeline] serving stale cached homepage for', userId)
      return { homepage: stale, profile, slot, fromCache: true }
    }

    // ② User has never had a page generated — static fallback from real top-rated places.
    homepage = buildFallback(profile, allRestaurants)
    fromCache = false

    // Return immediately — don't attempt to cache the fallback
    const enriched = enrichItems(homepage, allRestaurants)
    return { homepage: enriched, profile, slot, fromCache }
  }

  // ⑤ Enrich items with DB metadata (rating, delivery_min)
  homepage = enrichItems(homepage, allRestaurants)

  // ⑥ Cache for next 30 min
  await cacheHomepage(userId, slot.part, homepage)

  return { homepage, profile, slot, fromCache }
}

// ─── Enrichment helper ────────────────────────────────────────────────────────

function enrichItems(homepage: HomepageJSON, restaurants: Restaurant[]): HomepageJSON {
  const map = new Map(restaurants.map(r => [r.name, r]))

  const enrich = (items: HomepageItem[]): HomepageItem[] =>
    items.map(item => {
      const r = map.get(item.restaurant)
      return {
        ...item,
        rating: item.rating ?? r?.avg_rating,
        delivery_min: item.delivery_min ?? r?.delivery_time_min,
      }
    })

  return {
    ...homepage,
    hero: { ...homepage.hero, items: enrich(homepage.hero.items) },
    slot_top_rated: { ...homepage.slot_top_rated, items: enrich(homepage.slot_top_rated.items) },
    discovery: { ...homepage.discovery, items: enrich(homepage.discovery.items) },
    mood_banner: { ...homepage.mood_banner, items: enrich(homepage.mood_banner.items) },
    budget_99_store: homepage.budget_99_store
      ? { ...homepage.budget_99_store, items: enrich(homepage.budget_99_store.items) }
      : null,
  }
}
