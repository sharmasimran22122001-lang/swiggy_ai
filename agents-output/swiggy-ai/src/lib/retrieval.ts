import type { Restaurant, UserProfile, TimeSlot } from '@/types'

const SLOT_CUISINES: Record<string, Set<string>> = {
  breakfast: new Set(['South Indian', 'Bakery', 'Beverages', 'Healthy Food']),
  lunch: new Set(['North Indian', 'South Indian', 'Biryani', 'Thalis', 'Chinese', 'Healthy Food', 'Combo']),
  snacks: new Set(['Fast Food', 'Snacks', 'Beverages', 'Desserts', 'Bakery', 'Ice Cream']),
  dinner: new Set(['North Indian', 'Chinese', 'Biryani', 'Mughlai', 'Tandoor', 'Italian', 'Pizzas', 'Continental']),
  late_night: new Set(['Fast Food', 'Pizzas', 'Chinese', 'Biryani', 'Desserts']),
}

export function retrieve(
  restaurants: Restaurant[],
  profile: UserProfile,
  slot: TimeSlot,
  limit = 15
): Restaurant[] {
  const hardVeg = ['pure-veg', 'jain', 'vegan'].includes(profile.diet.declared_hard_constraint)
  const slotCuisines = SLOT_CUISINES[slot.part] || new Set()
  const favCuisines = new Set(profile.top_cuisines)

  const scored: Array<{ score: number; restaurant: Restaurant }> = []

  for (const r of restaurants) {
    if (r.city !== profile.city) continue
    if (hardVeg && !r.menu.some(d => d.veg)) continue

    let s = r.avg_rating * 2 + Math.min(r.total_ratings, 1000) / 1000
    if (r.area === profile.area) s += 3
    if (r.cuisines.some(c => slotCuisines.has(c))) s += 2
    if (r.cuisines.some(c => favCuisines.has(c))) s += 2
    s -= r.delivery_time_min / 60

    scored.push({ score: s, restaurant: r })
  }

  scored.sort((a, b) => b.score - a.score)
  const top = scored.slice(0, limit).map(x => x.restaurant)

  if (hardVeg) {
    return top.map(r => ({ ...r, menu: r.menu.filter(d => d.veg) }))
  }
  return top
}
