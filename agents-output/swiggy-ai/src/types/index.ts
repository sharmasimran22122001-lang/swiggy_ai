export interface MenuItem {
  dish: string
  veg: boolean
  price: number
}

export interface Restaurant {
  id: number
  name: string
  area: string
  city: string
  cuisines: string[]
  price_for_two: number
  avg_rating: number
  total_ratings: number
  delivery_time_min: number
  menu: MenuItem[]
}

export interface Order {
  restaurant_id: number
  restaurant: string
  area: string
  city: string
  dish: string
  veg: boolean
  price: number
  cuisine: string
  days_ago: number
}

export interface User {
  user_id: string
  name: string
  city: string
  area: string
  declared_diet: string
  orders: Order[]
}

export interface DietInfo {
  inferred: string
  declared_hard_constraint: string
}

export interface BehaviorScores {
  repeat: number
  restaurant_loyal_variety: number
  exploration: number
}

export type PersonaLabel = '2A_loyalist' | '2B_restaurant_loyal_explorer' | '2C_variety_seeker'

export interface UserProfile {
  user_id: string
  name: string
  label: PersonaLabel
  behavior_scores: BehaviorScores
  total_orders: number
  distinct_restaurants: number
  favourite_restaurant: string
  usual_dish: string
  dishes_already_tried_at_fav: string[]
  top_cuisines: string[]
  diet: DietInfo
  avg_order_value: number
  price_band: 'low' | 'mid' | 'high'
  city: string
  area: string
}

export interface TimeSlot {
  part: 'breakfast' | 'lunch' | 'snacks' | 'dinner' | 'late_night'
  weekend: boolean
  hour: number
}

export type MoodType = 'spicy' | 'cold_sweet' | 'comforting'

export interface HomepageItem {
  name: string
  restaurant: string
  reason: string
  veg?: boolean
  price?: number
  rating?: number
  delivery_min?: number
  image_hint?: string
}

export interface HomepageBlock {
  title: string
  items: HomepageItem[]
}

export interface TrendingItem {
  name: string
  cuisine: string
  why_trending: string
  search_signal: 'high' | 'medium' | 'low'
}

export interface TrendMatch {
  trending_name: string
  cuisine: string
  why_trending: string
  search_signal: string
  dish: string
  veg: boolean
  price: number
  restaurant: string
  area: string
  rating: number
  delivery_min: number
}

export interface HomepageJSON {
  hero: HomepageBlock
  slot_top_rated: HomepageBlock
  discovery: HomepageBlock
  mood_banner: {
    mood: MoodType
    theme: string
    title: string
    items: HomepageItem[]
  }
  whats_on_your_mind: string[]
  budget_99_store: HomepageBlock | null
}
