import type { User, UserProfile, PersonaLabel, BehaviorScores } from '@/types'

export function scoreUser(u: User): UserProfile {
  const orders = u.orders
  const n = orders.length

  // Repeat score: fraction of orders repeating a (restaurant, dish) already seen
  const seen = new Set<string>()
  let rep = 0
  for (const o of orders) {
    const k = `${o.restaurant}|${o.dish}`
    if (seen.has(k)) rep++
    seen.add(k)
  }
  const repeat = rep / n

  // Exploration score: distinct restaurants / total orders (capped at 1)
  const distinctRestaurants = new Set(orders.map(o => o.restaurant)).size
  const explore = Math.min(distinctRestaurants / n, 1.0)

  // Variety-at-place: among restaurants visited ≥2 times, avg(distinct dishes / visits)
  const byRestaurant: Record<string, string[]> = {}
  for (const o of orders) {
    if (!byRestaurant[o.restaurant]) byRestaurant[o.restaurant] = []
    byRestaurant[o.restaurant].push(o.dish)
  }
  const ratios = Object.values(byRestaurant)
    .filter(dishes => dishes.length >= 2)
    .map(dishes => new Set(dishes).size / dishes.length)
  const variety = ratios.length > 0 ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0

  const tot = (repeat + variety + explore) || 1
  const scores: BehaviorScores = {
    repeat: Math.round((repeat / tot) * 100) / 100,
    restaurant_loyal_variety: Math.round((variety / tot) * 100) / 100,
    exploration: Math.round((explore / tot) * 100) / 100,
  }

  // Persona label = dominant dial
  const labelMap: Array<[PersonaLabel, keyof BehaviorScores]> = [
    ['2A_loyalist', 'repeat'],
    ['2B_restaurant_loyal_explorer', 'restaurant_loyal_variety'],
    ['2C_variety_seeker', 'exploration'],
  ]
  const label = labelMap.reduce((best, curr) =>
    scores[curr[1]] > scores[best[1]] ? curr : best
  )[0]

  // Favourite restaurant (most orders, recency tiebreak)
  const restaurantCounts: Record<string, number> = {}
  for (const o of orders) restaurantCounts[o.restaurant] = (restaurantCounts[o.restaurant] || 0) + 1
  const topCount = Math.max(...Object.values(restaurantCounts))
  const tied = Object.entries(restaurantCounts).filter(([, c]) => c === topCount).map(([r]) => r)
  const fav = tied.length === 1
    ? tied[0]
    : tied.reduce((best, r) => {
        const minDaysAgo = Math.min(...orders.filter(o => o.restaurant === r).map(o => o.days_ago))
        const bestMinDaysAgo = Math.min(...orders.filter(o => o.restaurant === best).map(o => o.days_ago))
        return minDaysAgo < bestMinDaysAgo ? r : best
      })

  // Usual dish at favourite restaurant
  const dishCounts: Record<string, number> = {}
  for (const o of orders.filter(o => o.restaurant === fav)) {
    dishCounts[o.dish] = (dishCounts[o.dish] || 0) + 1
  }
  const usual = Object.entries(dishCounts).reduce((a, b) => b[1] > a[1] ? b : a)[0]

  // Already-tried dishes at favourite (for hero exclusion)
  const dishesAlreadyTried = [...new Set(orders.filter(o => o.restaurant === fav).map(o => o.dish))]

  // Top 3 cuisines
  const cuisineCounts: Record<string, number> = {}
  for (const o of orders) cuisineCounts[o.cuisine] = (cuisineCounts[o.cuisine] || 0) + 1
  const topCuisines = Object.entries(cuisineCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c]) => c)

  // Diet inference
  const vegFrac = orders.filter(o => o.veg).length / n
  const inferred =
    vegFrac === 1 ? 'veg-only' :
    vegFrac >= 0.7 ? 'veg-leaning' :
    vegFrac <= 0.1 ? 'mostly non-veg' : 'mixed'

  const avgOrderValue = Math.round(orders.reduce((s, o) => s + o.price, 0) / n)
  const priceBand = avgOrderValue < 200 ? 'low' : avgOrderValue < 450 ? 'mid' : 'high'

  return {
    user_id: u.user_id,
    name: u.name,
    label,
    behavior_scores: scores,
    total_orders: n,
    distinct_restaurants: distinctRestaurants,
    favourite_restaurant: fav,
    usual_dish: usual,
    dishes_already_tried_at_fav: dishesAlreadyTried,
    top_cuisines: topCuisines,
    diet: {
      inferred,
      declared_hard_constraint: u.declared_diet || 'none',
    },
    avg_order_value: avgOrderValue,
    price_band: priceBand as 'low' | 'mid' | 'high',
    city: u.city,
    area: u.area,
  }
}

export function getTimeSlot(now?: Date) {
  const d = now || new Date()
  const h = d.getHours()
  const part =
    h >= 5 && h < 11 ? 'breakfast' :
    h >= 11 && h < 15 ? 'lunch' :
    h >= 15 && h < 18 ? 'snacks' :
    h >= 18 && h < 23 ? 'dinner' : 'late_night'
  return {
    part: part as 'breakfast' | 'lunch' | 'snacks' | 'dinner' | 'late_night',
    weekend: d.getDay() >= 5,
    hour: h,
  }
}

export function pickMood(slot: ReturnType<typeof getTimeSlot>, season = 'summer') {
  if (season === 'summer' && (slot.part === 'lunch' || slot.part === 'snacks')) return 'cold_sweet'
  if (slot.part === 'dinner' || slot.part === 'late_night') return season === 'winter' ? 'comforting' : 'spicy'
  if (slot.part === 'breakfast') return 'comforting'
  return 'spicy'
}
